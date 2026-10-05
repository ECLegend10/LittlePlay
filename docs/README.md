# LittlePlay Next.js Rebuild Documentation

This folder defines how to reproduce the existing LittlePlay application as a maintainable Next.js application.

## Recommended reading order

1. [`REQUIREMENTS.md`](REQUIREMENTS.md) — product scope, routes, data, security, and acceptance criteria.
2. [`DESIGN_AND_MODULE_SPEC.md`](DESIGN_AND_MODULE_SPEC.md) — exact layout, visual tokens, responsive behaviour, and game rules.
3. [`PREREQUISITES.md`](PREREQUISITES.md) — accounts, tools, services, and decisions needed before development.
4. [`SETUP.md`](SETUP.md) — initialize the application, environment, database, storage, and authentication.
5. [`DEVELOPMENT.md`](DEVELOPMENT.md) — implementation architecture, work phases, validation, and release checklist.

## Rebuild objective

The objective is behavioural and visual parity with the existing production application, not a loose reinterpretation.

- Preserve all public and admin routes.
- Preserve EN, CN, and BM content behaviour.
- Preserve light and dark neumorphic styling.
- Preserve the collapsible application chrome.
- Preserve every game rule, quiz flow, and admin control.
- Refactor the large browser script into typed React components, hooks, services, and route handlers.

## Recommended target stack

| Area | Recommended implementation |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript with strict mode |
| UI | React 19, semantic HTML, global design tokens, CSS Modules |
| Icons | Lucide React, consistent `1.8` stroke width |
| Persistence | Drizzle ORM with PostgreSQL, SQLite, or Cloudflare D1 adapter |
| Images | S3-compatible object storage, Vercel Blob, or Cloudflare R2 |
| Authentication | Auth.js/NextAuth or a hosting identity adapter |
| Validation | Zod at every server boundary |
| Tests | Vitest + Testing Library + Playwright |
| Package manager | pnpm |

The current Sites deployment uses Cloudflare D1, R2, and identity headers. The rebuild should place authentication, database, and storage behind adapters so it can run on Vercel, Cloudflare, or another Next.js-compatible host without rewriting gameplay code.

