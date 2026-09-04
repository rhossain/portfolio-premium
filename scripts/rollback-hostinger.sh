#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${HOSTINGER_ENV_FILE:-$PROJECT_DIR/.env.hostinger}"
[[ -f "$CONFIG_FILE" ]] || { echo "Missing $CONFIG_FILE" >&2; exit 1; }

# shellcheck disable=SC1090
source "$CONFIG_FILE"

release_id="${1:-latest}"
SSH_ARGS=( -p "$HOSTINGER_SSH_PORT" -o StrictHostKeyChecking=yes )
[[ -n "${HOSTINGER_SSH_KEY:-}" ]] && SSH_ARGS+=( -i "$HOSTINGER_SSH_KEY" )

REMOTE_PARENT="${HOSTINGER_REMOTE_DIR%/public_html}"
DEPLOY_ROOT="${REMOTE_PARENT}/.portfolio-deploy"
PROTECTED_DIRECTORIES=(demo diginews diginewswp ngcommerce ngwcommerce wp .well-known)

if [[ "$release_id" == latest ]]; then
  release_id="$(ssh "${SSH_ARGS[@]}" "$HOSTINGER_SSH_TARGET" \
    "find '$DEPLOY_ROOT/backups' -mindepth 1 -maxdepth 1 -type d -name '20????????????' -exec basename {} \; | sort -r | head -1")"
fi

[[ "$release_id" =~ ^20[0-9]{12}$ ]] || { echo "No valid backup release was found." >&2; exit 1; }

if [[ "${CONFIRM_ROLLBACK:-}" != "$release_id" ]]; then
  echo "Rollback will replace the current Angular website with backup $release_id."
  echo "The protected subdirectories will not be changed."
  read -r -p "Type $release_id to continue: " confirmation
  [[ "$confirmation" == "$release_id" ]] || { echo "Rollback cancelled."; exit 1; }
fi

ssh "${SSH_ARGS[@]}" "$HOSTINGER_SSH_TARGET" bash -s -- \
  "$HOSTINGER_REMOTE_DIR" "$DEPLOY_ROOT" "$release_id" \
  "${PROTECTED_DIRECTORIES[@]}" <<'REMOTE_ROLLBACK'
set -Eeuo pipefail
remote_dir="$1"
deploy_root="$2"
release_id="$3"
shift 3
backup_dir="$deploy_root/backups/$release_id"

[[ "$remote_dir" == /home/*/domains/*/public_html ]] || exit 60
[[ "$deploy_root" == /home/*/domains/*/.portfolio-deploy ]] || exit 61
[[ "$release_id" =~ ^20[0-9]{12}$ ]] || exit 62
[[ -d "$backup_dir" ]] || { echo "Backup not found: $release_id" >&2; exit 63; }

excludes=()
for directory in "$@"; do
  excludes+=( --exclude="/$directory/" )
done
rsync -a --delete-after "${excludes[@]}" "$backup_dir/" "$remote_dir/"
REMOTE_ROLLBACK

echo "Rollback complete: $release_id"
