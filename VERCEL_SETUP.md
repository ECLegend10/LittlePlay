# Deploy Little Play to Vercel

Little Play now runs as a Next.js app on Node.js 22. Quiz data stays in Cloudflare D1 and images stay in R2, accessed from the server over HTTPS. Admin sign-in uses Google, an allowed email address, and an eight-hour signed, HttpOnly session cookie.

## 1. Configure the backend

You need access to the Cloudflare account that owns your D1 database and R2 bucket. The old `.openai/hosting.json` contains binding names, not credentials or resource IDs. If those resources belong to a managed hosting account you cannot access, create your own D1 database and R2 bucket and arrange an export/import of existing data and images. Merely changing the host does not copy them.

- Find the Cloudflare account ID and D1 database ID.
- Create a Cloudflare API token scoped to that account with **Account / D1 / Edit** permission (the quiz editor needs writes).
- For a new database, run the SQL in `drizzle/0000_ancient_blackheart.sql` once using the D1 console. Do not replay it against an existing `quizzes` table.
- Create R2 S3 credentials with **Object Read & Write** access to the selected bucket. Copy its S3 endpoint, bucket name, access key ID, and secret access key. Jurisdiction-specific buckets must use the endpoint shown by Cloudflare.
- The bucket can remain private. The app serves images through `/api/images/[key]` and preserves existing image keys.

D1's REST API shares Cloudflare's API rate limits. This is a simple path for a small activity site; higher traffic may require a dedicated Worker API or a different database connection.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values. Generate `ADMIN_SESSION_SECRET` (at least 32 characters):

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

In Google Cloud / Google Auth Platform:

1. Configure your OAuth consent screen. If the app is in Testing, add your admin Google account as a test user.
2. Create an OAuth client with application type **Web application**.
3. Add these **Authorized redirect URIs**, replacing the production domain:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR-DOMAIN/api/auth/callback/google`
4. Put the client ID and client secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. Set `ADMIN_EMAIL` to the Google email allowed to edit quizzes. The example uses the previous site owner's email. Only that verified Google email can receive an admin session.
6. Set `APP_URL` to `http://localhost:3000` locally and your exact HTTPS origin in Vercel, without a path. OAuth requires an exact registered callback URL; use a stable preview domain with its own registered callback if enabling Preview sign-in.

Visit `/login` to sign in with Google. The flow validates Google's ID-token signature, issuer, audience, expiry, nonce, and verified email, with OAuth state and PKCE protection. Tokens are exchanged server-side and are not retained. The old hosting platform's sign-in headers are no longer trusted. The editor has a Sign out button.

Changing `ADMIN_SESSION_SECRET` or `ADMIN_EMAIL` invalidates existing sessions. Keep credentials in server-only environment variables; do not add a `NEXT_PUBLIC_` prefix.

## 3. Verify locally

Install Node.js 22.13 or newer within the 22.x release line, then:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm start
```

Use `pnpm dev` for development. Builds do not need service credentials; quiz requests and admin sign-in do. Test signing in, saving a draft, publishing, a conflicting save from a second tab, uploading an image, and signing out with your actual services before production use.

Images are limited to **4 MB**, below Vercel's 4.5 MB function payload limit. PNG, JPEG, and WebP signatures are validated on upload.

## 4. Import into Vercel

1. Commit the source, `pnpm-lock.yaml`, and `vercel.json` and push to GitHub. Never commit `.env.local`.
2. Import the repository in Vercel. Select **Next.js**, the directory containing `package.json`, and **Node.js 22.x**.
3. Add **ENABLE_EXPERIMENTAL_COREPACK=1** so Vercel uses the pnpm version pinned in `package.json`. Leave the install command at its default and the output directory at the Next.js default. `vercel.json` sets the build command to `pnpm build`.
4. Add every variable from `.env.example` to the appropriate Vercel environments. Use separate database/bucket resources and OAuth settings and session secrets for Preview if previews should not edit production data.
5. Deploy, then verify the homepage, `/quiz`, `/login`, and the complete admin workflow.

The old Vite/Workers tooling remains in the repository as migration reference; it is excluded from Next.js type checking and is not used by the Vercel build. The application backend now requires the environment variables above, including in local development.

References: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build), [function limits](https://vercel.com/docs/functions/limitations), [D1 query API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/), [R2 credentials](https://developers.cloudflare.com/r2/api/tokens/).
