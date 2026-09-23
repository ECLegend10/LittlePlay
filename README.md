# Little Play

An activity room with coin flips, cards, slides, a wheel, choices, and an editable quiz.

The app runs on **Next.js / Node.js 22** and is configured for **Vercel**. Quiz data uses Cloudflare D1 over HTTPS; images use R2's S3 API. Admin access uses Google sign-in restricted to an allowed email address.

See [Vercel setup](VERCEL_SETUP.md) for backend credentials, local setup, and deployment. Copy `.env.example` to `.env.local`, fill in the values, then run:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Use `pnpm test` and `pnpm build` to validate changes. Visit `/login` to sign in to the quiz editor. For GitHub instructions see [GITHUB_SETUP.md](GITHUB_SETUP.md).

[Original Sites documentation](SITES_REFERENCE.md) is retained as a historical reference; its build and authentication instructions do not apply to the Vercel app.
