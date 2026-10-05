# Vercel setup and launch checklist

## Repository setup

The Vercel-target implementation uses native Next.js App Router, Node 24.x, pnpm 11.25.0, Postgres via Neon/Drizzle, public Vercel Blob, and Auth.js with Google JWT sessions. Auth.js 5.0.0-beta.32 is explicitly pinned; validate upgrades rather than floating beta versions.

The existing game UI and public/app.js remain in place. The backend keeps its response shapes and optimistic revisions. There are no local authentication bypasses or production mock data stores.

## Local installation

```sh
nvm use
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm check:vercel
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Browser tests start a local production server and use fixture responses only inside the browser tests for services that are not provisioned. API denial tests exercise the real local route handlers. They do not prove live Google, Neon or Blob integration.

## Services (not provisioned by this migration)

1. Create a Vercel Hobby project only when deployment is approved. Choose this repository, root directory `.`, framework Next.js, Node 24.x. Explicitly set Production branch tracking to master; main still exists and otherwise takes precedence.
2. Provision Neon Free, preferably through the Vercel Marketplace. Set DATABASE_URL in the correct environments. Use separate development/preview and production data.
3. Create a **public** Vercel Blob store and set BLOB_READ_WRITE_TOKEN. Quiz images are public visitor content.
4. Create a Google OAuth web client. Register exact redirect URIs: `http://localhost:3000/api/auth/callback/google` for local work and `https://YOUR-PRODUCTION-HOST/api/auth/callback/google` for production. Preview domains need their own approved callbacks; a wildcard is not supported. Add your owner account as a test user if the consent app is in testing.
5. Configure AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, ADMIN_EMAIL, and a generated AUTH_SECRET of at least 32 characters (for example `openssl rand -base64 32`). These are server-only values.
6. Trust only your actual host proxy. On Vercel Auth.js recognizes VERCEL automatically. For local login use AUTH_TRUST_HOST=true. Do not enable host trust on an untrusted reverse proxy.
7. Run `pnpm check:env` without printing values. This checks presence, not connectivity.
8. Run `pnpm db:migrate` against the intended database. It creates three Postgres tables transactionally and preserves existing rows. Never point preview migration scripts at production by accident.
9. Finish data transfer below, then verify live flows before publication.

## Existing data transfer

No D1/R2 data is included in a Git sync. Export quizzes, spy_vault and site_settings from the existing Site with their id, data, revision and updated_by. Validate each JSON document using the current validators. Import data as Postgres JSONB, preserve revisions and updated_by, and avoid overwriting newer rows. This migration does not read or change live Sites data.

Copy each referenced R2 image into the public Blob store under `quiz/<original-key>`, keeping keys such as `<uuid>.png`. Saved `/api/images/<key>` URLs then continue to work. The image endpoint looks up that key and redirects to the Blob URL. Verify all referenced images before publishing.

Do not silently seed empty content over the existing Site. Empty-database defaults are the original behavior: the quiz is unpublished, the spy vault and settings start with the existing defaults only when their tables have no records.

## Upload limit

Server uploads are capped at 4,000,000 bytes (4 MB) to remain below Vercel's 4.5 MB function payload limit. Frontend hints and validation match. PNG/JPEG/WebP signatures are checked before storage. Larger future uploads need an authenticated direct-to-Blob flow.

## Deployment behavior

vercel.json allows Git deployments only for transition (preview) and master (production after selecting master in settings). develop, release-*, main and other branches are excluded. develop has its own config disabling all Git deployments. Never replace it during Sites sync.

No Vercel project was created, connected or deployed by this migration. To keep production deployment manual even after connection, set git.deploymentEnabled to false and use an explicitly authorized manual deployment.

## Required live verification

- Google login succeeds for the configured owner, using a verified email. Other Google accounts are rejected.
- Anonymous requests and forged Sites identity headers cannot edit any admin API.
- Quiz draft/save/publish, settings and word vault edits survive reloads. Stale revisions return 409.
- A valid small image uploads, renders and remains available. Invalid signatures and oversized files are rejected.
- All nine modules, themes, sounds, languages and quiz-only share URLs work on mobile and desktop.
- Existing data and images match the old Site.

Hobby is for personal non-commercial use within its allowances. Configure usage notifications and review service quotas before launch.
