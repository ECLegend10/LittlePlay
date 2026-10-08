# Implementation Change Log

## Responsive modules and administrator Slide Manager

### Behaviour added

- Removed the administrator Music Library. Players still have four fixed, original Web Audio choices plus an independent music mute control.
- Added `/admin/slides`, where the owner can create image or PDF decks, localize titles, reorder image pages, and select the single deck presented publicly.
- Replaced hard-coded Slide Room samples with the active saved deck. Image decks support arrows, dots, keyboard navigation, and fullscreen; PDF decks use a responsive inline viewer with a separate-open fallback.
- Added responsive safeguards across all games and admin editors, including compact Coin Flip, Wheel, cards, quiz, timer, RPS, Spy Game, and slide layouts for 320 px and short landscape viewports.
- Kept protected slide-library data revisioned and returned only the active deck from the public API.

### Modified source files

| File | Change |
|---|---|
| `public/app.js` | Adds Slide Room loading/playback, the Slide Manager, fixed music choices, and responsive-state behaviour. |
| `public/style.css` | Adds slide viewers/editors and phone, tablet, and short-viewport layouts. |
| `app/[[...path]]/page.tsx` | Replaces `/admin/music` with `/admin/slides`. |
| `app/api/slides/route.ts` | Returns only the active public deck. |
| `app/api/admin/slides/route.ts` | Adds owner-only revisioned slide-library read/save operations and removed-media cleanup. |
| `app/api/admin/upload/route.ts` | Adds validated Slide Room image and PDF uploads. |
| `app/api/files/[key]/route.ts` | Streams stored PDFs inline with immutable caching and byte-range support. |
| `lib/slides.ts` | Defines slide types, validation, persistence reads, and stored-key tracking. |
| `db/schema.ts`, `drizzle/0005_broad_maginty.sql`, and migration metadata | Add `slide_libraries` persistence. |
| `app/api/music/route.ts`, `app/api/admin/music/route.ts`, and `lib/music.ts` | Removed because music choices are no longer editable. |
| `README.md` and `docs/*.md` | Document the responsive and Slide Manager contracts. |

### Verification

- `pnpm db:generate` confirms the migration history matches the six-table schema.
- `pnpm exec tsc --noEmit`, `node --check public/app.js`, and `git diff --check` pass.
- `pnpm lint` completes with no errors; the existing manual-stylesheet warning remains.
- `pnpm build` completes and includes the new public/admin slide and PDF routes.

## Mobile startup and lazy loading

### Behaviour added

- Shows a lightweight LittlePlay shell immediately instead of leaving a blank page while JavaScript initializes.
- Preloads the main gameplay script so it downloads alongside the framework bundle instead of after hydration.
- Restores validated public settings from a one-day local bootstrap cache, then refreshes them during browser idle time.
- Skips public settings requests on routes that do not use them, including the focused wheel-only page.
- Defers Google Fonts until after meaningful content is displayed; system fallbacks preserve usability when the font service is slow or blocked.
- Lazy-loads and asynchronously decodes quiz and quiz-editor images.
- Defers layout and paint work for below-the-fold activity and admin cards with CSS content visibility.
- Updates the public settings bootstrap cache immediately after an administrator saves game settings.

### Modified source files

| File | Change |
|---|---|
| `app/layout.tsx` | Preloads the gameplay script. |
| `app/play.tsx` | Adds the server-rendered startup shell. |
| `public/app.js` | Adds validated bootstrap caching, idle refreshes, route-aware requests, deferred fonts, and lazy image attributes. |
| `public/style.css` | Removes the render-blocking font import and styles the startup shell. |
| `docs/CHANGELOG.md`, `docs/DEVELOPMENT.md`, and `docs/REQUIREMENTS.md` | Document the performance contract and implementation. |

## Wheel-only presentation and generated music library (historical, later superseded)

### Behaviour added

- Removed the explanatory odds text below the private wheel display.
- Added a one-click admin presentation mode that hides the editor and all application chrome.
- Added `/wheel-only`, a focused saved-wheel page with no navigation or settings.
- Added public read/spin endpoints that expose option names but keep weights and fair/weighted mode on the server.
- Added an owner-only Music Library module for adding, removing, renaming, enabling, disabling, and selecting the default music type.
- Added four original Web Audio arrangements and a player-side Music Type selector saved under `lp-music-type`.

### Modified source files

| File | Change |
|---|---|
| `app/[[...path]]/page.tsx` | Allows `/wheel-only` and `/admin/music`. |
| `app/api/secret-wheel/route.ts` | Returns names only and selects weighted/fair winners server-side. |
| `app/api/music/route.ts` | Returns enabled music types and the default. |
| `app/api/admin/music/route.ts` | Adds protected music-library read/save operations. |
| `lib/music.ts` | Defines presets, defaults, public projection, and strict validation. |
| `db/schema.ts` and `drizzle/0004_cuddly_diamondback.sql` | Add `music_settings` persistence. |
| `public/app.js` | Adds wheel presentation modes, safe server spinning, music synthesis presets, admin music editing, and player selection. |
| `public/style.css` | Adds focused wheel and responsive music-editor layouts. |
| `public/icons.svg` and `scripts/generate-icons.mjs` | Add presentation/share icons. |
| `README.md` and `docs/*.md` | Update rebuild and security documentation. |

### Privacy boundary

The wheel-only page must know the visible option names in order to draw them. It never receives weights, calculated odds, or the fair/weighted setting. Its winner is selected by the server. Repeated spins can still reveal statistical patterns, so this remains an entertainment feature rather than a secure or consequential selection system.

## Admin-only Wheel Spinner and background music

This release adds an owner-only Wheel Spinner that can select fairly or by hidden option weights, plus a separate generated chill-music preference available throughout LittlePlay.

### Behaviour added

- The visitor-facing Wheel Spinner is unchanged.
- The private spinner appears only in owner navigation and at `/admin/wheel`.
- Owners can add, remove, and rename options, assign integer weights, inspect calculated odds, and choose weighted or fair mode.
- The canvas always renders equal-size slices and option names only. Odds are visible only in the owner editor.
- The private wheel is explicitly limited to casual entertainment, not wagers, prizes, or consequential decisions.
- Sound effects and chill music use separate mute controls and separate saved preferences.
- The soundtrack is an original Web Audio arrangement generated by the app, so no third-party recording or external music licence is required.

### Modified source files

| File | Change |
|---|---|
| `app/[[...path]]/page.tsx` | Allows the owner-only wheel route. |
| `app/api/admin/secret-wheel/route.ts` | Adds protected read/save handlers with validation, same-origin checks, size limits, and revision conflicts. |
| `db/schema.ts` | Adds the private-wheel database table. |
| `drizzle/0003_outgoing_bug.sql` | Creates the `secret_wheels` table. |
| `drizzle/meta/_journal.json` and `drizzle/meta/0003_snapshot.json` | Records the generated schema migration. |
| `lib/secret-wheel.ts` | Defines default data, server-side types, reading, and validation. |
| `public/app.js` | Adds localized UI, private-wheel state and selection logic, and generated music controls. |
| `public/style.css` | Styles the private editor and the expanded preferences control group. |
| `public/icons.svg` and `scripts/generate-icons.mjs` | Adds and generates the music icon. |
| `README.md` and `docs/*.md` | Documents the new requirements, design, setup, development, and verification rules. |

### Persistence contract

The `secret_wheels` record stores JSON data, a revision number, and the updating owner's email. It is accessible only through the protected admin endpoint. Public endpoints and page data must not include its options, weights, calculated odds, or weighted-mode setting.
