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
    either/ThisOrThat.tsx
    quiz/QuizPlayer.tsx
    rps/RockPaperScissors.tsx
    spy/SpyGame.tsx
    timer/HitTheMark.tsx
  admin/
    AdminDashboard.tsx
    SettingsEditor.tsx
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
- `AudioProvider`: one lazily created `AudioContext`, mute state, `lp-audio` persistence.
- `useCollapsibleShell`: homepage/admin default open; public feature pages default closed.
- `useUnsavedChanges`: admin editors only.
- `useOptimisticRevision`: shared conflict handling for admin resources.

## 4. Data-fetching strategy

- Read public settings near the public layout so navigation and route availability agree.
- Cache public settings briefly only if invalidation occurs after admin saves.
- Keep quiz and game-settings requests independent.
- Admin pages must fetch draft data with `cache: "no-store"`.
- Route handlers return structured errors: `invalid`, `forbidden`, `origin`, `conflict`, `unavailable`.

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

## 7. Security rules

- Validate all external input with Zod on the server.
- Revalidate admin identity inside each protected route handler.
- Use same-origin/CSRF protection on mutation endpoints.
- Enforce request size before parsing where possible.
- Render user content as React text; never use `dangerouslySetInnerHTML`.
- Validate image signature, type, extension, and size.
- Generate storage keys; ignore uploaded filenames.
- Return public quiz data only when `published === true`.
- Do not expose future Spy Game roles in the DOM.
- Use revision checks for all admin writes.

## 8. Implementation phases

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

## 9. Testing strategy

### Unit tests

- Random integer boundaries and distribution sanity checks.
- Fisher–Yates produces a permutation without duplicates.
- Card deck contains 52 unique cards.
- RPS result matrix.
- Hit the Mark rounding and exact-match rule.
- Quiz score calculation.
- Validators for all localized records.
- Revision conflict behaviour.

### Component tests

- Theme/language/audio controls persist.
- Disabled modules do not render in navigation.
- This or That requires an answer.
- Quiz locks answers after submission.
- RPS does not reveal Player 1's choice during handover.
- Spy role disappears after hide/visibility change.
- Admin forms preserve unsaved localized fields while switching tabs.

### End-to-end tests

- Anonymous visitor can play every enabled module.
- Admin sign-in and email allowlist.
- Non-owner receives `403` from protected APIs.
- Admin saves settings and public navigation updates.
- Draft quiz is hidden; published quiz is playable.
- Quiz-only link has no cross-module navigation.
- Light/dark mode does not flash between routes.
- Mobile shell opens and closes correctly.

## 10. Development quality gate

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Run Playwright before release and whenever shared shell, authentication, routing, or admin behaviour changes.

## 11. Deployment checklist

- Production environment variables configured.
- Production database created and migrations applied once.
- Storage bucket permissions limited and CORS reviewed.
- OAuth callback URL matches the production domain.
- `ADMIN_EMAIL` is correct and normalized.
- Public access remains enabled for visitors.
- Admin APIs verified with anonymous, non-owner, and owner sessions.
- All three languages smoke-tested.
- Theme and sound preferences tested after reload.
- Quiz image upload and delivery tested.
- Error and conflict states tested.
- Monitoring captures route-handler failures without logging secrets or image bytes.

## 12. Intentional non-goals

- Real-time multiplayer.
- Accounts for ordinary visitors.
- Global leaderboards or persistent scores.
- Automatic quiz translation.
- Payments, advertising, or analytics profiling.
- Redesigning the current visual system during the rebuild.

