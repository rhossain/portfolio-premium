# Portfolio and admin CMS

An Angular portfolio backed by Supabase Postgres, Auth, and Storage. Public visitors read only the published document. An allow-listed administrator can edit a draft, upload media, and publish changes from `/admin`.

## First administrator sign-in

1. Start the app with `npm start` and open `http://localhost:4700/admin`.
2. Keep `rshossain.bd@gmail.com` in the email field and click **Email me a sign-in link**.
3. Open the email on the same computer and follow the link. The confirmed address is registered as the administrator automatically.
4. Future sign-ins can use another magic link. A password can also be set through Supabase Auth if desired.

Only the exact allow-listed email can be created or receive an Auth access token. Supabase enforces this with Before User Created and Custom Access Token hooks; the Angular check is only an additional usability guard. Other accounts cannot sign in, read drafts, or change content.

## Local development

Use Node.js 22.22.3 or newer, then run:

```bash
npm install
npm start
```

The portfolio is at `http://localhost:4700/`; the CMS is at `http://localhost:4700/admin`.

Build for production with:

```bash
npm run build
```

Before deploying, replace the localhost Auth `site_url` and redirect URLs in `supabase/config.toml` with the production domain, then run `npx supabase config push`.

## Supabase workflow

The linked project reference is `czmpwatylyfhsjggdsiu`. Database changes live in `supabase/migrations`; the starter content is in `supabase/seed.sql`.

```bash
npx supabase migration list
npx supabase db push --include-seed
npx supabase config push
```

The Angular app contains only the project URL and publishable key. Never add a service-role or secret key to `src/`, browser code, or the Git repository.

## Content and storage policy

- Structured content is one small versioned JSONB document in Postgres. This keeps the editor simple while retaining database transactions, access control, and revision history.
- Images live in the public `portfolio-media` Storage bucket, not inside JSON or the Git bundle. Uploads are converted client-side to WebP, capped at 2400px, limited to 5 MB, and stored under immutable UUID filenames.
- Draft content is private. Public visitors can call only `get_public_portfolio()`. Publishing is an authenticated database function that snapshots the previous publication before replacing it.
- The CMS can export/import a portable JSON draft. Export before a major content restructure. Database backups and Storage backups should also be enabled in Supabase as the site grows.
- Do not overwrite an image at the same path. Upload a new immutable file, publish the new reference, and remove the old object only after confirming it is unused.

## Main admin areas

- Profile and About
- Experience history
- Projects, case studies, and project media
- Skills and capability groups
- Navigation, social links, and marquee
- Draft JSON export/import

## Deploying to Hostinger

Hostinger settings are stored locally in `.env.hostinger`, which is excluded from Git. The checked-in `.env.hostinger.example` documents every available setting. The current deployment preserves these root-level directories:

- `demo`
- `diginews`
- `diginewswp`
- `ngcommerce`
- `ngwcommerce`
- `wp`
- `.well-known` (Hostinger/SSL verification)

Before the first deployment, connect with the SSH command from hPanel and verify the server fingerprint. Without an SSH key, the deployment command asks for your Hostinger SSH password once and reuses that secure connection. For fully password-free deployment, add a dedicated SSH public key in Hostinger and set `HOSTINGER_SSH_KEY` in `.env.hostinger`. Deployment installs and builds inside a temporary isolated workspace, so a running local development server is not interrupted.

Preview exactly which files would change without modifying production:

```bash
npm run deploy:dry-run
```

Deploy Angular, pending Supabase migrations, and Supabase configuration:

```bash
npm run deploy
```

Deploy only the Angular site:

```bash
npm run deploy:frontend
```

Each real deployment snapshots the replaceable contents of `public_html` before uploading. The latest three snapshots are kept outside the public directory. If the homepage or `/admin` smoke check fails, the website files are restored automatically. Supabase migrations are never reversed automatically.

To restore the newest retained website snapshot manually:

```bash
npm run rollback
```

The rollback command displays the chosen snapshot and requires typing its timestamp before it modifies the live site.
