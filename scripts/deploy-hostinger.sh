#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${HOSTINGER_ENV_FILE:-$PROJECT_DIR/.env.hostinger}"
DRY_RUN=false
SKIP_SUPABASE=false

usage() {
  cat <<'HELP'
Usage: bash scripts/deploy-hostinger.sh [--dry-run] [--skip-supabase]

  --dry-run         Build and preview remote file changes without deploying.
  --skip-supabase   Deploy Angular only; do not push Supabase migrations/config.
  --help            Show this help.
HELP
}

for argument in "$@"; do
  case "$argument" in
    --dry-run) DRY_RUN=true ;;
    --skip-supabase) SKIP_SUPABASE=true ;;
    --help|-h) usage; exit 0 ;;
    *) echo "Unknown option: $argument" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Missing $CONFIG_FILE. Copy .env.hostinger.example and fill in its values." >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$CONFIG_FILE"

required=(
  HOSTINGER_SSH_TARGET
  HOSTINGER_SSH_PORT
  HOSTINGER_REMOTE_DIR
  HOSTINGER_PRODUCTION_URL
  HOSTINGER_KEEP_DEPLOYMENTS
  NODE_BINARY
)

for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required setting: $name" >&2
    exit 1
  fi
done

HOSTINGER_DEPLOY_SUPABASE="${HOSTINGER_DEPLOY_SUPABASE:-true}"
HOSTINGER_SSH_KEY="${HOSTINGER_SSH_KEY:-}"

if [[ ! "$HOSTINGER_SSH_TARGET" =~ ^[A-Za-z0-9._-]+@[A-Za-z0-9.:-]+$ ]]; then
  echo "HOSTINGER_SSH_TARGET has an unsafe or invalid format." >&2
  exit 1
fi
if [[ ! "$HOSTINGER_SSH_PORT" =~ ^[0-9]+$ ]]; then
  echo "HOSTINGER_SSH_PORT must be numeric." >&2
  exit 1
fi
if [[ ! "$HOSTINGER_REMOTE_DIR" =~ ^/home/[A-Za-z0-9._-]+/domains/[A-Za-z0-9.-]+/public_html$ ]]; then
  echo "Refusing to deploy: HOSTINGER_REMOTE_DIR is not an exact Hostinger public_html path." >&2
  exit 1
fi
if [[ ! "$HOSTINGER_KEEP_DEPLOYMENTS" =~ ^[1-9][0-9]?$ ]]; then
  echo "HOSTINGER_KEEP_DEPLOYMENTS must be between 1 and 99." >&2
  exit 1
fi
if [[ ! "$HOSTINGER_PRODUCTION_URL" =~ ^https://[A-Za-z0-9.-]+/?$ ]]; then
  echo "HOSTINGER_PRODUCTION_URL must be an HTTPS origin without a path." >&2
  exit 1
fi
if [[ ! -x "$NODE_BINARY" ]]; then
  echo "NODE_BINARY is not executable: $NODE_BINARY" >&2
  exit 1
fi
if [[ -n "$HOSTINGER_SSH_KEY" && ! -f "$HOSTINGER_SSH_KEY" ]]; then
  echo "HOSTINGER_SSH_KEY does not exist: $HOSTINGER_SSH_KEY" >&2
  exit 1
fi

for command_name in ssh rsync curl npm; do
  command -v "$command_name" >/dev/null || {
    echo "Required command is unavailable: $command_name" >&2
    exit 1
  }
done

"$NODE_BINARY" -e '
const [major, minor, patch] = process.versions.node.split(".").map(Number);
const valid = major >= 26 || (major === 24 && (minor > 15 || (minor === 15 && patch >= 0))) || (major === 22 && (minor > 22 || (minor === 22 && patch >= 3)));
if (!valid) {
  console.error(`Angular requires Node 22.22.3+, 24.15+, or 26+. Found ${process.versions.node}.`);
  process.exit(1);
}
'

SSH_ARGS=(
  -p "$HOSTINGER_SSH_PORT"
  -o StrictHostKeyChecking=yes
  -o ServerAliveInterval=15
  -o ServerAliveCountMax=4
)
RSYNC_SHELL="ssh -p $HOSTINGER_SSH_PORT -o StrictHostKeyChecking=yes -o ServerAliveInterval=15 -o ServerAliveCountMax=4"

if [[ -n "$HOSTINGER_SSH_KEY" ]]; then
  SSH_ARGS+=( -i "$HOSTINGER_SSH_KEY" )
  printf -v QUOTED_KEY '%q' "$HOSTINGER_SSH_KEY"
  RSYNC_SHELL="$RSYNC_SHELL -i $QUOTED_KEY"
fi

# Keep one SSH connection alive so password-based deployments prompt only once.
CONTROL_PATH="${TMPDIR:-/tmp}/portfolio-hostinger-$$"
SSH_ARGS+=( -o ControlMaster=auto -o ControlPersist=5m -o ControlPath="$CONTROL_PATH" )
RSYNC_SHELL="$RSYNC_SHELL -o ControlMaster=auto -o ControlPersist=5m -o ControlPath=$CONTROL_PATH"

# Build from an isolated copy so npm ci never removes dependencies used by a
# running local development server.
BUILD_WORKSPACE="$(mktemp -d "${TMPDIR:-/tmp}/portfolio-deploy-build.XXXXXX")"
BUILD_DIST_DIR="$BUILD_WORKSPACE/dist"

cleanup() {
  ssh "${SSH_ARGS[@]}" -O exit "$HOSTINGER_SSH_TARGET" >/dev/null 2>&1 || true
  rm -f -- "$CONTROL_PATH"
  rm -rf -- "$BUILD_WORKSPACE"
}
trap cleanup EXIT

PROTECTED_DIRECTORIES=(demo diginews diginewswp ngcommerce ngwcommerce wp .well-known)
RSYNC_EXCLUDES=()
for directory in "${PROTECTED_DIRECTORIES[@]}"; do
  RSYNC_EXCLUDES+=( --exclude="/$directory/" )
done

REMOTE_PARENT="${HOSTINGER_REMOTE_DIR%/public_html}"
DEPLOY_ROOT="${REMOTE_PARENT}/.portfolio-deploy"
RELEASE_ID="$(date -u +%Y%m%d%H%M%S)"
STAGING_DIR="$DEPLOY_ROOT/staging/$RELEASE_ID"
BACKUP_DIR="$DEPLOY_ROOT/backups/$RELEASE_ID"
NPM_CLI="$(command -v npm)"
SUPABASE_CLI="$BUILD_WORKSPACE/node_modules/supabase/dist/supabase.js"

echo "Checking Hostinger connection and deployment target..."
echo "If no SSH key is configured, Hostinger will request your SSH password once."
if ! ssh "${SSH_ARGS[@]}" "$HOSTINGER_SSH_TARGET" bash -s -- "$HOSTINGER_REMOTE_DIR" <<'REMOTE_CHECK'
set -Eeuo pipefail
remote_dir="$1"
[[ "$remote_dir" == /home/*/domains/*/public_html ]] || exit 20
[[ -d "$remote_dir" ]] || { echo "Remote directory does not exist: $remote_dir" >&2; exit 21; }
command -v rsync >/dev/null || { echo "rsync is unavailable on the Hostinger account." >&2; exit 22; }
REMOTE_CHECK
then
  cat >&2 <<'HELP'
SSH verification failed. Connect once using the SSH command from hPanel and verify the host fingerprint.
For password-free deployment, add a dedicated public SSH key in Hostinger and set HOSTINGER_SSH_KEY.
HELP
  exit 1
fi

echo "Preparing an isolated deployment workspace..."
rsync -a \
  --exclude='/.git/' \
  --exclude='/.angular/' \
  --exclude='/node_modules/' \
  --exclude='/dist/' \
  --exclude='/.env.hostinger' \
  "$PROJECT_DIR/" \
  "$BUILD_WORKSPACE/"

cd "$BUILD_WORKSPACE"
echo "Installing locked dependencies..."
"$NODE_BINARY" "$NPM_CLI" ci

echo "Building Angular for production..."
"$NODE_BINARY" node_modules/@angular/cli/bin/ng.js build

[[ -f "$BUILD_DIST_DIR/index.html" ]] || {
  echo "Build validation failed: dist/index.html is missing." >&2
  exit 1
}
[[ -f "$BUILD_DIST_DIR/.htaccess" ]] || {
  echo "Build validation failed: dist/.htaccess is missing." >&2
  exit 1
}

if [[ "$DRY_RUN" == true ]]; then
  if [[ "$HOSTINGER_DEPLOY_SUPABASE" == true && "$SKIP_SUPABASE" == false ]]; then
    echo "Previewing pending Supabase migrations..."
    (cd "$PROJECT_DIR" && "$NODE_BINARY" "$SUPABASE_CLI" db push --dry-run)
    echo "Supabase config is not pushed during a dry run."
  fi

  echo "Previewing Hostinger file changes; protected directories will be retained..."
  rsync -azn --delete-after --itemize-changes \
    "${RSYNC_EXCLUDES[@]}" \
    -e "$RSYNC_SHELL" \
    "$BUILD_DIST_DIR/" \
    "$HOSTINGER_SSH_TARGET:$HOSTINGER_REMOTE_DIR/"
  echo "Dry run complete. No production files or Supabase settings were changed."
  exit 0
fi

if [[ "$HOSTINGER_DEPLOY_SUPABASE" == true && "$SKIP_SUPABASE" == false ]]; then
  echo "Applying Supabase migrations..."
  (cd "$PROJECT_DIR" && "$NODE_BINARY" "$SUPABASE_CLI" db push --yes)
  echo "Applying Supabase Auth and project configuration..."
  (cd "$PROJECT_DIR" && "$NODE_BINARY" "$SUPABASE_CLI" config push --yes)
fi

echo "Uploading release $RELEASE_ID to Hostinger staging..."
ssh "${SSH_ARGS[@]}" "$HOSTINGER_SSH_TARGET" \
  "mkdir -p '$STAGING_DIR' '$DEPLOY_ROOT/backups'"
rsync -az --delete \
  -e "$RSYNC_SHELL" \
  "$BUILD_DIST_DIR/" \
  "$HOSTINGER_SSH_TARGET:$STAGING_DIR/"

echo "Backing up the current website and promoting the release..."
ssh "${SSH_ARGS[@]}" "$HOSTINGER_SSH_TARGET" bash -s -- \
  "$HOSTINGER_REMOTE_DIR" "$DEPLOY_ROOT" "$STAGING_DIR" "$BACKUP_DIR" \
  "${PROTECTED_DIRECTORIES[@]}" <<'REMOTE_DEPLOY'
set -Eeuo pipefail
remote_dir="$1"
deploy_root="$2"
staging_dir="$3"
backup_dir="$4"
shift 4

[[ "$remote_dir" == /home/*/domains/*/public_html ]] || exit 30
[[ "$deploy_root" == /home/*/domains/*/.portfolio-deploy ]] || exit 31
[[ "$staging_dir" == "$deploy_root"/staging/[0-9]* ]] || exit 32
[[ "$backup_dir" == "$deploy_root"/backups/[0-9]* ]] || exit 33
[[ -f "$staging_dir/index.html" ]] || { echo "Staged index.html is missing." >&2; exit 34; }

excludes=()
for directory in "$@"; do
  excludes+=( --exclude="/$directory/" )
done

mkdir -p "$backup_dir"
rsync -a "${excludes[@]}" "$remote_dir/" "$backup_dir/"
rsync -a --delete-after "${excludes[@]}" "$staging_dir/" "$remote_dir/"
rm -rf -- "$staging_dir"
REMOTE_DEPLOY

verify_site() {
  curl --fail --silent --show-error --location --max-time 30 "$HOSTINGER_PRODUCTION_URL/" | grep -qi '<app-root' &&
    curl --fail --silent --show-error --location --max-time 30 "$HOSTINGER_PRODUCTION_URL/admin" | grep -qi '<app-root'
}

if ! verify_site; then
  echo "Production verification failed. Restoring website files from $RELEASE_ID..." >&2
  ssh "${SSH_ARGS[@]}" "$HOSTINGER_SSH_TARGET" bash -s -- \
    "$HOSTINGER_REMOTE_DIR" "$DEPLOY_ROOT" "$BACKUP_DIR" \
    "${PROTECTED_DIRECTORIES[@]}" <<'REMOTE_ROLLBACK'
set -Eeuo pipefail
remote_dir="$1"
deploy_root="$2"
backup_dir="$3"
shift 3

[[ "$remote_dir" == /home/*/domains/*/public_html ]] || exit 40
[[ "$deploy_root" == /home/*/domains/*/.portfolio-deploy ]] || exit 41
[[ "$backup_dir" == "$deploy_root"/backups/[0-9]* ]] || exit 42
[[ -d "$backup_dir" ]] || exit 43

excludes=()
for directory in "$@"; do
  excludes+=( --exclude="/$directory/" )
done
rsync -a --delete-after "${excludes[@]}" "$backup_dir/" "$remote_dir/"
REMOTE_ROLLBACK
  echo "The previous website files were restored. Supabase migrations are not automatically reversed." >&2
  exit 1
fi

echo "Removing backups older than the newest $HOSTINGER_KEEP_DEPLOYMENTS..."
ssh "${SSH_ARGS[@]}" "$HOSTINGER_SSH_TARGET" bash -s -- \
  "$DEPLOY_ROOT" "$HOSTINGER_KEEP_DEPLOYMENTS" <<'REMOTE_CLEANUP'
set -Eeuo pipefail
deploy_root="$1"
keep="$2"
backup_root="$deploy_root/backups"

[[ "$deploy_root" == /home/*/domains/*/.portfolio-deploy ]] || exit 50
[[ "$keep" =~ ^[1-9][0-9]?$ ]] || exit 51

find "$backup_root" -mindepth 1 -maxdepth 1 -type d -name '20????????????' -print |
  sort -r |
  awk -v keep="$keep" 'NR > keep' |
  while IFS= read -r backup; do
    [[ "$backup" == "$backup_root"/[0-9]* ]] || exit 52
    rm -rf -- "$backup"
  done
REMOTE_CLEANUP

echo "Deployment successful: $HOSTINGER_PRODUCTION_URL"
echo "Release: $RELEASE_ID | Backups retained: $HOSTINGER_KEEP_DEPLOYMENTS"
