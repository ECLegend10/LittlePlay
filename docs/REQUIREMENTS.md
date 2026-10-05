# LittlePlay Requirements

## 1. Product purpose

LittlePlay is a mobile-first collection of lightweight social games. Visitors can immediately play from a shared URL without creating an account. The owner signs in to control content and module availability.

## 2. User roles

### Visitor

- Can access every enabled public module.
- Does not need an account.
- Can change language, theme, and sound preference.
- Can copy a quiz-only link.
- Cannot access or mutate administrator data.

### Administrator

- Must be authenticated.
- Must match the server-side email allowlist; only the configured `ADMIN_EMAIL` owner.
- Has a distinct admin navigation and dashboard.
- Can enable or disable modules.
- Can edit the This or That pool in all three languages.
- Can set the Hit the Mark target.
- Can create, edit, save, and publish the quiz.
- Can manage the Spy Game word vault.

Authentication answers “who are you?” Authorization must separately answer “are you the configured owner?”

## 3. Supported languages

| Code | Language | HTML language |
|---|---|---|
| `en` | English | `en` |
| `cn` | Simplified Chinese | `zh-Hans` |
| `bm` | Bahasa Melayu | `ms-MY` |

Requirements:

- All interface copy must exist in all three languages.
- Quiz title, introduction, questions, options, and explanations must exist in all three languages before publication.
- Spy words and This or That choices must store all three translations.
- Changing the interface language changes current game content without losing progress where practical.
- Selected language persists under `lp-lang`.
- A `?lang=en|cn|bm` query parameter can initialize the quiz-only view.
- Automatic machine translation is not required. Admin-managed translations are authoritative.

## 4. Themes and sound

- Provide light and dark themes.
- Persist theme under `lp-theme`.
- Respect device color-scheme preference only when no saved preference exists.
- Apply the theme before meaningful paint to avoid a light-mode flash.
- Provide synthesized or bundled sound feedback for taps, reveals, spins, success, and loss.
- Provide a sidebar Sound On/Mute control.
- Persist sound preference under `lp-audio`.
- The app must remain fully usable when sound is muted or unavailable.

## 5. Application chrome

- Homepage and admin pages show the sidebar, top bar, and footer by default.
- Individual public game pages hide the sidebar, top bar, and footer by default.
- A fixed Menu button expands or collapses the chrome.
- `/quiz/play` is a focused quiz-only experience: no activity navigation and no path to other modules.
- Player navigation contains enabled activities and one Admin entry.
- Admin navigation contains Dashboard, Game Settings, Quiz Editor, Word Vault, and Back to Player Site.
- Disabled modules disappear from public home/navigation. Direct access displays an unavailable message.

## 6. Route requirements

### Public routes

| Route | Module |
|---|---|
| `/` | Activity homepage |
| `/coin-flip` | Coin Flip |
| `/pick-a-card` | Pick a Card |
| `/slides` | Slide Room |
| `/wheel` | Wheel Spinner |
| `/this-or-that` | This or That |
| `/quiz` | Quiz with share control |
| `/quiz/play` | Quiz-only focused view |
| `/rock-paper-scissors` | Two-player RPS |
| `/spy-game` | Secret-word Spy Game |
| `/hit-the-mark` | Timing minigame |

### Admin routes

| Route | Purpose |
|---|---|
| `/admin` | Owner dashboard |
| `/admin/settings` | Module availability, This or That pool, timer target |
| `/admin/quiz` | Quiz editor and publishing |
| `/admin/words` | Spy Game word vault |

## 7. Module requirements

### Coin Flip

- Generate a cryptographically fair heads/tails result.
- Animate the flip and play feedback audio.
- Count heads and tails for the current session.
- Allow resetting both counters.

### Pick a Card

- Shuffle a standard 52-card deck using an unbiased algorithm.
- Deal five unique facedown cards.
- Reveal each card independently.
- Display localized suit names.
- Shuffle and deal a fresh hand.

### Slide Room

- Include the same four localized sample slides.
- Support previous/next buttons, dot navigation, and left/right arrow keys.
- Disable navigation past either end.
- Support browser fullscreen where available.

### Wheel Spinner

- Accept 2–50 newline-separated entries, each 1–40 characters.
- Render equal-sized canvas segments.
- Choose the winner before animating so the visual result matches the selected value.
- Every valid entry has equal probability.
- Allow removing the winner and spinning again.
- Prevent concurrent spins.

### This or That

- Load enabled pairs from administrator settings.
- Shuffle pair order every new game.
- Independently randomize A/B orientation for each pair.
- Require one selection before continuing.
- Show a localized summary at the end.
- “Play again” produces a new shuffle.

### Quiz

- Contain exactly five questions.
- Support 2–4 options per question.
- Support an opening title, optional introduction, and optional image.
- Support one optional image per question.
- Show the correct answer immediately after submission.
- Show an optional explanation after submission.
- Do not use points beyond counting correct answers.
- Calculate and show the final correct-answer count and answer review.
- Only published quiz content is visible publicly.
- Copy a quiz-only URL including the selected language.

### Rock Paper Scissors

- Use one device for two players.
- Player 1 chooses while Player 2 looks away.
- Hide Player 1's selection before handover.
- Player 2 confirms readiness, chooses, then sees the result.
- Correctly handle all wins and ties.

### Spy Game

- Support 3–20 players.
- Accept optional player names.
- Pick one enabled word not recently used in the same browser where possible.
- Randomly assign exactly one spy an empty card.
- Reveal one private role at a time and remove it from the DOM after hiding.
- Hide a revealed role when the tab becomes hidden or page navigation begins.
- Select a random clue starter.
- Allow group voting and reveal whether the spy was caught.
- Support a new word/round without changing players.

### Hit the Mark

- Display the administrator-defined target from 1.00 to 60.00 seconds.
- Show a stopwatch to two decimal places.
- Start and stop with one primary button.
- Win only when the rounded displayed time exactly equals the displayed target.
- Show win/loss feedback and allow immediate retry.
- Use `performance.now()` and `requestAnimationFrame()`, not interval counting.

## 8. Admin content rules

### Game settings

- Store enabled state for all nine modules.
- Store Hit the Mark target with at most two decimal places.
- Store 1–100 This or That pairs.
- An enabled pair requires both choices in EN, CN, and BM.
- Disabled unfinished pairs may be saved.

### Quiz editor

- Always maintain five questions.
- Images: PNG, JPEG, or WebP; maximum 5 MB.
- Validate file signature in addition to MIME type.
- Use one shared image across languages; recommend text-free artwork.
- A draft is not publicly visible.
- Publishing requires complete EN, CN, and BM titles, question text, and options.

### Word vault

- Store up to 300 words.
- Each enabled word requires EN, CN, and BM values, maximum 80 characters each.
- Disabled words remain stored but are excluded from play.

### Concurrency

- Quiz, settings, and word vault use an integer revision.
- Updates must include the last-read revision.
- Reject stale updates with HTTP `409 Conflict` instead of overwriting newer work.

## 9. Data model

```ts
type Locale = "en" | "cn" | "bm";
type LocalText = Record<Locale, string>;

type Quiz = {
  published: boolean;
  title: LocalText;
  intro: LocalText;
  image: string;
  questions: Array<{
    id: string;
    text: LocalText;
    image: string;
    options: LocalText[];
    correct: number;
    explanation: LocalText;
  }>;
};

type EitherPair = {
  id: string;
  enabled: boolean;
  options: [LocalText, LocalText];
};

type SiteSettings = {
  modules: Record<
    "coin" | "cards" | "slides" | "wheel" | "either" |
    "quiz" | "rps" | "spy" | "timer",
    boolean
  >;
  timerTarget: number;
  eitherPairs: EitherPair[];
};

type SpyWord = {
  id: string;
  enabled: boolean;
  text: LocalText;
};
```

The current persistence uses three single-record documents: `quizzes`, `site_settings`, and `spy_vault`, each with `id`, serialized `data`, `revision`, and `updated_by`.

## 10. API requirements

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/settings` | Public | Enabled modules, timer target, pair pool |
| `GET` | `/api/quiz` | Public | Published quiz only |
| `POST` | `/api/spy-word` | Public, same-origin | Random enabled word excluding recent IDs |
| `GET` | `/api/session` | Public | Returns admin boolean only |
| `GET/PUT` | `/api/admin/settings` | Admin | Read/update game settings |
| `GET/PUT` | `/api/admin/quiz` | Admin | Read/update quiz |
| `GET/PUT` | `/api/admin/spy-vault` | Admin | Read/update word vault |
| `POST` | `/api/admin/upload` | Admin | Validate and store quiz image |
| `GET` | `/api/images/:key` | Public | Stream a stored quiz image |

All mutation endpoints must validate authentication, admin authorization, origin/CSRF protection, request size, schema, and optimistic revision.

## 11. Non-functional requirements

- Responsive from 320 px phones through wide desktop screens.
- Touch targets at least 44 × 44 px.
- Keyboard-operable controls with visible focus states.
- Semantic status announcements for results and errors.
- Respect `prefers-reduced-motion`.
- No user-supplied string may be inserted as raw HTML.
- Random selections use Web Crypto or server cryptographic randomness.
- Public gameplay remains available if authentication is unavailable.
- No external audio files are required; Web Audio synthesis is acceptable.
- No scoreboards, multiplayer networking, chat, or visitor accounts are in scope.

## 12. Definition of done

- Every route and module works in EN, CN, and BM.
- Layout and styling pass parity review against production at phone, tablet, and desktop widths.
- Light/dark switching has no flash and survives reload.
- Sound preference survives reload.
- Feature-page chrome is collapsed by default.
- Quiz-only URLs cannot navigate to other activities.
- Anonymous and non-owner users receive `403` from every admin API.
- The owner can save and reload all admin content.
- Stale admin writes produce `409`.
- Unit, component, and end-to-end checks pass.
- Production build completes with no errors.

