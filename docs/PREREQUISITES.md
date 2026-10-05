# Prerequisites

## Required local tools

| Tool | Minimum | Check |
|---|---:|---|
| Node.js | `22.13.0` | `node --version` |
| pnpm | `11.x` | `pnpm --version` |
| Git | Current stable | `git --version` |
| Browser | Current Chrome, Edge, Firefox, or Safari | Manual |

Use an active Node release supported by the chosen Next.js version. Pin the exact version in `.nvmrc` or `.node-version` once the project begins.

## Required knowledge

- Next.js App Router, Server Components, Client Components, route handlers, and middleware.
- React state and effects.
- TypeScript strict mode.
- Accessible HTML and keyboard interaction.
- Relational database migrations.
- Object-storage uploads and content-type validation.
- OAuth authentication and server-side authorization.

## Required accounts and services

The local UI can be developed without cloud accounts. A complete production deployment needs:

1. A hosting provider capable of running Next.js.
2. A relational database.
3. Object storage for quiz images.
4. An authentication provider supporting the site owner's email.
5. A production domain or provider URL with HTTPS.

### Suggested service combinations

| Deployment | Database | Image storage | Authentication |
|---|---|---|---|
| Vercel | Neon/Postgres | Vercel Blob or S3/R2 | Auth.js with Google |
| Cloudflare | D1 | R2 | Auth.js or platform identity |
| Self-hosted Node | Postgres | S3-compatible storage | Auth.js with Google |

Do not tie admin authorization to a client-side flag. The server must validate the signed-in email on every protected request.

## Decisions to make before coding

- Deployment target: Vercel, Cloudflare, or self-hosted Node.
- Database provider.
- Image-storage provider.
- Authentication provider.
- Production administrator email. Set the intended owner in server-only `ADMIN_EMAIL`.
- Whether quiz and game settings require audit history beyond the current optimistic revision number.

## Required assets

- DM Sans: body and control typography.
- Manrope: headings, scores, timer, and display values.
- Lucide icons listed in `scripts/generate-icons.mjs` or their React equivalents.
- Existing localized interface copy from EN, CN, and BM.
- Existing quiz images and future five-question content supplied by the administrator.

## Environment variables

Use only the variables required by the selected adapters. A provider-neutral example:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=

DATABASE_URL=

AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

STORAGE_ENDPOINT=
STORAGE_REGION=auto
STORAGE_BUCKET=littleplay
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
```

Rules:

- Never expose `ADMIN_EMAIL`, database credentials, OAuth secrets, or storage credentials through `NEXT_PUBLIC_*` variables.
- Commit `.env.example`, never `.env.local`.
- Use separate development and production databases/buckets.
- Limit upload credentials to the specific bucket and operations required by the app.

