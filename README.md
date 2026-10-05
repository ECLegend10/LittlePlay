# LittlePlay

LittlePlay is a responsive, multilingual party-game hub with nine playable modules, light/dark themes, optional sound effects, a quiz-only sharing mode, and an owner-only administration area.

The current hosted implementation uses Next.js through Vinext and Cloudflare. The documents in [`docs/`](docs/) are the source of truth for rebuilding the same product as a clean, native Next.js App Router application while preserving its visual design, routes, modules, and behaviour.

## Documentation

- [Documentation index](docs/README.md)
- [Product and technical requirements](docs/REQUIREMENTS.md)
- [Prerequisites](docs/PREREQUISITES.md)
- [Setup guide](docs/SETUP.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Design, layout, and module parity specification](docs/DESIGN_AND_MODULE_SPEC.md)

## Current production site

<https://little-play-win.elwinchankw.chatgpt.site>

## Non-negotiable rebuild rule

The rebuild may improve the internal component architecture, typing, testing, and deployment portability. It must not redesign the interface or change user-facing behaviour unless a separate change request explicitly approves it.


## Branching and release

Workflow: `develop → release-X.Y.Z → transition → master`.

This branch remains the Sites / Cloudflare development and synchronization target. Preserve GitHub-owned policy/configuration files during source sync. See [branching and release policy](docs/BRANCHING_AND_RELEASE.md) and [repository instructions](AGENTS.md). Vercel Git deployments are disabled on this branch.
