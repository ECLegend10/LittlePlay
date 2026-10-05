# LittlePlay

A multilingual activity room with nine games, light/dark themes, sound effects, quiz sharing and owner-only administration.

## Branch workflow

`develop -> release-X.Y.Z -> transition -> master`

- **develop**: Sites/Cloudflare development and source sync.
- **release-X.Y.Z**: frozen source snapshot.
- **transition**: persistent Vercel migration/validation branch.
- **master**: validated native Next.js production-target code.

This branch uses native Next.js on Node 24.x with Neon Postgres, Vercel Blob and verified Google authentication. Cloud accounts and live data are configured separately; nothing is deployed merely by this repository migration.

Read [branch policy](docs/BRANCHING_AND_RELEASE.md), [Vercel setup](docs/VERCEL_SETUP.md), [migration status](docs/MIGRATION_STATUS.md) and [AGENTS.md](AGENTS.md).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Copy .env.example to .env.local and configure services for backend functionality. Without credentials public games can render, but database APIs report unavailable and admin access stays closed.

The original [Sites publication](https://little-play-win.elwinchankw.chatgpt.site) remains separate. Its existing design specification is in [docs/DESIGN_AND_MODULE_SPEC.md](docs/DESIGN_AND_MODULE_SPEC.md). Other existing rebuild documents are historical guidance; VERCEL_SETUP.md is authoritative for setup on transition/master.
