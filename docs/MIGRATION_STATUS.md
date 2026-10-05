# Migration status

- Input release: release-1.0.0
- Input develop/source commit: 06f64aa3e6cfd96ec6d7e7cbb586fc77008df514
- Persistent migration branch: transition
- Production-target branch: master, created only from validated transition
- Status: repository migration validated locally; not deployed

## Implemented

Native Next.js scripts; removal of Sites/Cloudflare runtime integrations; Postgres JSONB persistence with conditional revisions; public Blob uploads using existing image URLs; owner-only verified Google sessions; environment/setup instructions; branch policy and CI.

## Pending external configuration

GitHub master/transition/release rulesets; Vercel project and production branch selection; Neon database; Blob store; Google OAuth client; secrets; live D1/R2 content transfer; real-service integration checks. These steps were not performed. main and release-1.0.0 remain unchanged.

## Validation

Passed: frozen-lockfile installation, check:vercel, lint, TypeScript, 12 unit tests, native Next.js production build, and 7 Playwright tests against the production server. All nine activities load at desktop and mobile widths without page errors or horizontal overflow. Browser checks also exercise hidden RPS moves, timer retry, language/theme/mute persistence, sign-in navigation, anonymous/forged-identity rejection, and explicit unavailable responses without cloud credentials.

Database tests execute Drizzle queries against a local Postgres emulator; Blob calls are mocked and browser settings/quiz responses use fixtures. Live-service behavior is still pending. The environment checker correctly rejects missing cloud credentials. This environment's Playwright download host was unavailable, so the browser run used a temporary npm-packaged Chromium 153 binary, outside the repository. CI uses Playwright's standard Chromium installation.

Build success without secrets proves code readiness only, not live-service readiness.
