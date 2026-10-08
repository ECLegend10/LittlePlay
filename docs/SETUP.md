# Setup Guide

This guide creates a new, portable Next.js implementation. It does not require the existing Vinext browser-script architecture.

## 1. Create the project

```sh
pnpm create next-app@latest littleplay-next \
  --typescript \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-tailwind

cd littleplay-next
```

Choose the same Next.js major version across developer machines and CI. Commit `pnpm-lock.yaml`.

## 2. Install dependencies

```sh
pnpm add lucide-react zod drizzle-orm next-auth @aws-sdk/client-s3
pnpm add -D drizzle-kit vitest @vitest/coverage-v8 jsdom
pnpm add -D @testing-library/react @testing-library/jest-dom
pnpm add -D @playwright/test
```

Replace database or storage packages if the selected provider has an official adapter.

## 3. Create the environment template

Create `.env.example` from the contract in [`PREREQUISITES.md`](PREREQUISITES.md), then create an ignored `.env.local` with development values.

Generate a local auth secret:

```sh
openssl rand -base64 32
```

## 4. Create the source structure

```text
src/
  app/
    (public)/
      page.tsx
      coin-flip/page.tsx
      pick-a-card/page.tsx
      slides/page.tsx
      wheel/page.tsx
      wheel-only/page.tsx
      this-or-that/page.tsx
      quiz/page.tsx
      quiz/play/page.tsx
      rock-paper-scissors/page.tsx
      spy-game/page.tsx
      hit-the-mark/page.tsx
    admin/
      layout.tsx
      page.tsx
      wheel/page.tsx
      slides/page.tsx
      settings/page.tsx
      quiz/page.tsx
      words/page.tsx
    api/
      settings/route.ts
      slides/route.ts
      secret-wheel/route.ts
      quiz/route.ts
      spy-word/route.ts
      session/route.ts
      admin/settings/route.ts
      admin/quiz/route.ts
      admin/slides/route.ts
      admin/secret-wheel/route.ts
      admin/spy-vault/route.ts
      admin/upload/route.ts
      images/[key]/route.ts
      files/[key]/route.ts
    layout.tsx
    globals.css
  components/
    shell/
    games/
    admin/
    ui/
  hooks/
  lib/
    auth/
    db/
    storage/
    i18n/
    audio/
    validation/
  styles/
  types/
drizzle/
public/
tests/
```

## 5. Configure fonts and pre-paint theme

- Load DM Sans and Manrope with `next/font/google`.
- Add a small inline theme initializer in the root layout before interactive UI renders.
- Read `lp-theme`; if absent, use `prefers-color-scheme`.
- Set `data-theme` and `color-scheme` on `<html>` before hydration.
- Use `suppressHydrationWarning` on `<html>` only if required by the bootstrap.

## 6. Configure localization

- Define `Locale = "en" | "cn" | "bm"`.
- Store UI dictionaries in typed source files.
- Implement `LocaleProvider` with localStorage persistence.
- Set the document language from the mapping in `REQUIREMENTS.md`.
- Keep database content as `LocalText`; do not duplicate quiz records by locale.

## 7. Configure authentication

Create a hosting-neutral identity interface:

```ts
type AppUser = { id: string; email: string; name?: string | null };

interface IdentityProvider {
  currentUser(): Promise<AppUser | null>;
}
```

Implement Auth.js or the hosting identity adapter. Create a server-only `requireAdmin()` that reads the current user, lowercases the email, compares it with `ADMIN_EMAIL`, and returns the user or a `403` response. Call it inside every admin route handler. Hiding admin buttons is not security.

## 8. Configure database and migrations

Create the five active logical tables:

```sql
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL
);

CREATE TABLE site_settings (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL
);

CREATE TABLE spy_vault (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL
);

CREATE TABLE secret_wheels (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL
);

CREATE TABLE slide_libraries (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL
);
```

Generate and apply migrations using the selected Drizzle adapter:

```sh
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

Seed default settings and Spy Game words. Quiz may start as an unpublished five-question template. The private wheel and slide library may be created lazily on the owner's first save. The four generated music arrangements remain code-defined and need no database rows.

## 9. Configure media storage

- Implement image and PDF put/get operations behind a storage interface.
- Allow PNG, JPEG, and WebP for quiz and slide images; allow PDF only for Slide Room decks.
- Enforce 5 MB for images and 25 MB for PDFs by header and streamed byte count.
- Validate magic bytes before upload.
- Generate server-side random filenames.
- Set correct content type and caching headers when serving.
- Support HTTP byte-range responses for PDFs so embedded viewers can request only the required portions.

## 10. Add scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

## 11. Run locally

```sh
pnpm db:migrate
pnpm dev
```

Open <http://localhost:3000>. Verify the anonymous player experience, then sign in with the configured owner email and verify all admin routes.

The four chill soundtracks are generated locally with the Web Audio API. They require no media file, CDN, or music licence. Browsers block autoplay, so music begins only after the first user interaction when the music preference is enabled.

## 12. Initial verification

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Do not deploy until the parity checklist in [`REQUIREMENTS.md`](REQUIREMENTS.md) passes.

