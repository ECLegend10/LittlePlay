# Development Guide

## 1. Architecture principles

- Use Server Components for shells and initial data where appropriate.
- Use Client Components only for interactive game state and browser APIs.
- Keep each game in its own component folder.
- Keep localized strings and game data typed.
- Put authorization and validation on the server.
- Keep database and storage access out of React components.
- Preserve the existing interface while improving internals.

## 2. Suggested component structure

```text
components/
  shell/
    AppShell.tsx
    Sidebar.tsx
    TopBar.tsx
    Footer.tsx
    Preferences.tsx
    MenuToggle.tsx
  games/
    coin/CoinFlip.tsx
    cards/PickACard.tsx
    slides/SlideRoom.tsx
    wheel/WheelSpinner.tsx
    wheel/WheelOnly.tsx
    either/ThisOrThat.tsx
    quiz/QuizPlayer.tsx
    rps/RockPaperScissors.tsx
    spy/SpyGame.tsx
    timer/HitTheMark.tsx
  admin/
    AdminDashboard.tsx
    SettingsEditor.tsx
    PrivateWheelSpinner.tsx
    PrivateWheelEditor.tsx
    SlideManager.tsx
    QuizEditor.tsx
    WordVaultEditor.tsx
  ui/
    Button.tsx
    Panel.tsx
    ActivityCard.tsx
    Icon.tsx
    LocalizedFields.tsx
    StatusMessage.tsx
```

Do not create one universal `Game.tsx` packed with conditionals. Shared presentation is reusable; game state machines are not the same thing.

## 3. Shared providers and hooks

- `ThemeProvider`: `light | dark`, pre-paint bootstrap, `lp-theme` persistence.
- `LocaleProvider`: `en | cn | bm`, typed translator, `lp-lang` persistence.
- `AudioProvider`: one lazily created `AudioContext`, independent effect and music channels, `lp-audio`, `lp-music`, and `lp-music-type` persistence, plus selectable original arrangements.
- `useCollapsibleShell`: homepage/admin default open; public feature pages default closed.
- `useUnsavedChanges`: admin editors only.
- `useOptimisticRevision`: shared conflict handling for admin resources.

## 4. Data-fetching strategy

- Read public settings near the public layout so navigation and route availability agree.
- Render from validated bootstrap defaults or a one-day local cache, then refresh nonessential public settings during browser idle time.
- Update the matching bootstrap cache immediately after a successful admin save so the next navigation does not show stale controls.
- Do not request public settings from admin-only routes or `/wheel-only`.
- Keep quiz and game-settings requests independent.
- Request `/api/slides` only on the Slide Room route; request the full library only from `/admin/slides`.
- Admin pages must fetch draft data with `cache: "no-store"`.
- The wheel editor uses `/api/admin/secret-wheel`. `/api/secret-wheel` may return option IDs/names for presentation, but winner selection happens server-side and no public response may contain weights or mode.
- Route handlers return structured errors: `invalid`, `forbidden`, `origin`, `conflict`, `unavailable`.

### Startup and media loading

- Keep an HTML-rendered loading shell inside `#app`; the gameplay renderer replaces it when ready.
- Preload the main gameplay script from the document head so download is not delayed until React hydration.
- Never make third-party fonts a prerequisite for first paint. Load them after meaningful content and keep compatible system fallbacks.
- Add `loading="lazy"` and `decoding="async"` to quiz content and admin preview images unless an image is deliberately selected as the page's critical visual.
- Use `content-visibility: auto` with an intrinsic fallback size on repeatable below-the-fold cards so mobile browsers can defer their layout and paint work.
- Do not defer route-critical requests such as the current quiz, private admin editor data, or the wheel-only options.
- Any cached public data must be validated, bounded by an expiry, and refreshed in the background; protected admin data must never enter the public bootstrap cache.

## 5. Game state implementation

Use explicit state types instead of loosely related booleans:

```ts
type Move = "rock" | "paper" | "scissors";

type RpsState =
  | { stage: "player1" }
  | { stage: "handover"; player1: Move }
  | { stage: "player2"; player1: Move }
  | { stage: "result"; player1: Move; player2: Move };
```

Apply the same approach to Quiz, Spy Game, and Hit the Mark. Reducers are recommended for multi-stage flows.

## 6. Randomness

Implement rejection sampling on top of Web Crypto for unbiased integers:

```ts
export function randomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError("maxExclusive must be a positive integer");
  }
  const range = 2 ** 32;
  const limit = Math.floor(range / maxExclusive) * maxExclusive;
  const value = new Uint32Array(1);
  do crypto.getRandomValues(value);
  while (value[0] >= limit);
  return value[0] % maxExclusive;
}
```

Use Fisher–Yates for decks and question pools. Do not use `array.sort(() => Math.random() - 0.5)`.

For the owner-configured wheel, keep visible slices equal in size. Weighted mode affects only winner selection, using a Web Crypto integer in the sum of configured weights. Fair mode ignores stored weights and chooses uniformly. Never encode the weights in slice size, labels, DOM attributes, public responses, or animation duration. The shareable wheel must request its result from the server.

## 7. Audio implementation

- Generate the chill soundtrack in-app with Web Audio oscillators; do not download or bundle a third-party song.
- Keep all four arrangement presets and their localized names code-defined; there is no admin music editor and no uploaded audio or external URLs.
- Start music only after a user gesture to comply with browser autoplay rules.
- Keep sound effects and music independently mutable.
- Fade and disconnect the music gain when muted or when the document is unloaded.
- Use a quiet gain level so music remains background ambience.
- If Web Audio is unavailable, games must remain fully playable without music.

## 8. Security rules

- Validate all external input with Zod on the server.
- Revalidate admin identity inside each protected route handler.
- Use same-origin/CSRF protection on mutation endpoints.
- Enforce request size before parsing where possible.
- Render user content as React text; never use `dangerouslySetInnerHTML`.
- Validate image/PDF signature, type, extension, and size.
- Generate storage keys; ignore uploaded filenames.
- Serve Slide Room PDFs with immutable caching, byte-range responses, and content-sniffing protection.
- Return public quiz data only when `published === true`.
- Do not expose future Spy Game roles in the DOM.
- Expose only the wheel option IDs/names required to draw `/wheel-only`; never expose weights, calculated odds, or mode.
- Use revision checks for all admin writes.

## 9. Implementation phases

### Phase 1 — foundation

- Project creation and strict TypeScript.
- Fonts, design tokens, icon wrapper, theme bootstrap.
- Locale and audio providers.
- Responsive shell and activity homepage.
- Public/admin route groups.

### Phase 2 — stateless/local games

- Coin Flip.
- Pick a Card.
- Slide Room.
- Wheel Spinner.
- Rock Paper Scissors.
- Hit the Mark.

### Phase 3 — database and public settings

- Drizzle schema and migrations.
- Public settings endpoint.
- Module enable/disable enforcement.
- Randomized This or That.

### Phase 4 — authentication and administration

- Authentication adapter.
- Owner-only server authorization.
- Admin dashboard.
- Game settings editor with conflicts.
- Private Wheel Spinner editor with fair/weighted selection and hidden odds.
- Wheel-only presentation mode and server-selected share page.
- Slide Manager with image/PDF uploads, active-deck selection, and public Slide Room playback.
- Fixed generated music presets with a public music-type selector.

### Phase 5 — quiz

- Storage adapter and secure image uploads.
- Quiz editor, draft/publish flow, and multilingual validation.
- Quiz player, immediate answers, explanations, and result review.
- Quiz-only share URL.

### Phase 6 — Spy Game

- Word vault editor.
- Random word endpoint with recent-history exclusion.
- Private role sequence, clue order, voting, and results.

### Phase 7 — parity and release

- Accessibility pass.
- Responsive and multilingual visual comparison.
- Cross-browser test.
- Production migration and deployment.

## 10. Testing strategy

### Unit tests

- Random integer boundaries and distribution sanity checks.
- Fisher–Yates produces a permutation without duplicates.
- Card deck contains 52 unique cards.
- RPS result matrix.
- Hit the Mark rounding and exact-match rule.
- Quiz score calculation.
- Validators for all localized records.
- Revision conflict behaviour.
- Private-wheel fair selection boundaries and weighted bucket selection.
- Private-wheel option and weight validation.
- Slide-library validation, active-deck rules, and revision conflicts.

### Component tests

- Theme/language/effect/music controls persist independently.
- Disabled modules do not render in navigation.
- This or That requires an answer.
- Quiz locks answers after submission.
- RPS does not reveal Player 1's choice during handover.
- Spy role disappears after hide/visibility change.
- Admin forms preserve unsaved localized fields while switching tabs.
- Private wheel renders equal slices and shows odds only inside its owner editor.
- Wheel-only views omit editor chrome, weights, odds, and mode.
- Music-type changes restart the correct generated arrangement and persist.

### End-to-end tests

- Anonymous visitor can play every enabled module.
- Admin sign-in and email allowlist.
- Non-owner receives `403` from protected APIs.
- Private wheel editor is absent from visitor navigation and its admin API returns `403` to non-owners.
- Private wheel switches correctly between fair and weighted selection without revealing odds on the canvas.
- `/wheel-only` receives names only and the server spin response matches the final visual segment.
- Admin slide changes update the active public presentation without exposing inactive decks.
- Admin saves settings and public navigation updates.
- Draft quiz is hidden; published quiz is playable.
- Quiz-only link has no cross-module navigation.
- Light/dark mode does not flash between routes.
- Mobile shell opens and closes correctly.

## 11. Development quality gate

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Run Playwright before release and whenever shared shell, authentication, routing, or admin behaviour changes.

## 12. Deployment checklist

- Production environment variables configured.
- Production database created and migrations applied once.
- Storage bucket permissions limited and CORS reviewed.
- OAuth callback URL matches the production domain.
- `ADMIN_EMAIL` is correct and normalized.
- Public access remains enabled for visitors.
- Admin APIs verified with anonymous, non-owner, and owner sessions.
- All three languages smoke-tested.
- Theme, sound-effect, and music preferences tested after reload.
- Music starts only after interaction and all games remain usable when Web Audio is unavailable.
- Private-wheel fair/weighted modes, option editing, hidden display, and revision conflicts tested.
- Wheel-only presentation and server-side winner selection tested.
- Music add/remove/enable/default controls and player selection tested.
- Quiz image upload and delivery tested.
- Error and conflict states tested.
- Monitoring captures route-handler failures without logging secrets or image bytes.

## 13. Intentional non-goals

- Real-time multiplayer.
- Accounts for ordinary visitors.
- Global leaderboards or persistent scores.
- Automatic quiz translation.
- Payments, advertising, or analytics profiling.
- Redesigning the current visual system during the rebuild.

