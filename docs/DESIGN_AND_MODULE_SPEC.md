# Design, Layout, and Module Parity Specification

This specification prevents the Next.js rebuild from gradually turning into a different application wearing LittlePlay's name tag.

## 1. Visual direction

LittlePlay uses a soft neumorphic interface: a cool grey page, paired raised/recessed shadows, pastel module illustrations, rounded surfaces, restrained typography, and lime-green actions. Dark mode uses the same depth system on charcoal surfaces.

Do not replace this with glassmorphism, gradients, Tailwind defaults, sharp cards, or a generic dashboard theme.

## 2. Core design tokens

```css
:root {
  color-scheme: light;
  --bg: #e8ebed;
  --ink: #2c3238;
  --muted: #56616b;
  --line: #cbd2d7;
  --accent: #c4ed83;
  --accent-ink: #2c3c20;
  --green: #426925;
  --red: #a92743;
  --success-bg: #dceccc;
  --wrong-bg: #f2dce2;
  --shadow: 9px 9px 22px #cbd0d4, -9px -9px 22px #ffffff;
  --inset: inset 5px 5px 11px #ced3d7, inset -5px -5px 11px #ffffff;
  --control-radius: 14px;
  --panel-radius: 24px;
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #292e34;
  --ink: #f0f2f4;
  --muted: #bac3cc;
  --line: #414953;
  --accent: #c4ed83;
  --accent-ink: #28351e;
  --green: #c4ed83;
  --red: #ffafbd;
  --success-bg: #33452c;
  --wrong-bg: #4d303b;
  --shadow: 9px 9px 22px #1c2025, -9px -9px 22px #363d45;
  --inset: inset 5px 5px 11px #1c2025, inset -5px -5px 11px #363d45;
}
```

## 3. Typography and icons

- Body: DM Sans, fallback Arial, Microsoft YaHei, sans-serif.
- Headings/display: Manrope.
- Base font size: 16 px.
- Page heading: responsive 32–48 px, weight 600, slightly negative letter spacing.
- Activity heading: approximately 24 px desktop and 20 px mobile.
- Use Lucide outline icons only.
- Standard icon stroke: `1.8`.
- Standard inline icon: 22 × 22 px.
- Activity icon: 42 × 42 px inside an 80 × 80 px rounded square.
- Icons inherit design-token colors; do not mix filled emoji with outline icons.

## 4. Shell layout

### Desktop

- Application root is a horizontal flex layout.
- Sidebar width: approximately 264 px, sticky, full viewport height, independently scrollable.
- Workspace uses fluid horizontal padding from 24–64 px.
- Top bar height: 96 px.
- Main content width: maximum 1160 px.
- Footer minimum height: 88 px.
- Fixed menu toggle appears at the top-right.

### Tablet and phone

- Below 800 px the sidebar becomes a full-width top section when expanded.
- Navigation uses two columns; below 370 px it becomes one column.
- Activity grid uses two columns at tablet widths and one column below 560 px.
- On small phones, activity cards use a compact icon-left/text-right layout.
- Form grids, admin cards, and translated pair editors collapse to one column.

### Collapsed game focus

- Hide sidebar, top bar, and footer.
- Keep the fixed Menu button.
- Increase top padding enough to prevent the fixed button overlapping content.
- Use a maximum content width around 1080 px.

## 5. Shared component dimensions

- Buttons and form controls: minimum 44 px touch height; primary controls typically 48 px.
- Primary button: lime background, dark green text, raised shadow, 14 px radius.
- Soft button: page background, raised shadow, 14 px radius.
- Panels/cards: 24 px radius, 24–32 px padding.
- Visible focus ring: 3 px using `--green`, with 4 px offset.
- Disabled controls remain legible and use reduced opacity.
- Images use `object-fit: contain`, rounded corners, and constrained height.

## 6. Activity homepage

- Page heading and description at the top.
- Section label shows the count of enabled activities using two digits.
- Desktop grid: three equal columns.
- Each activity tile contains index, centered pastel icon, title, description, and bottom action row.
- Cards lift by about 3 px on hover.
- Disabled activities are absent rather than displayed as disabled cards.
- Keep the recessed “more activities” strip below the grid.

## 7. Module-specific layout notes

- Coin: large centered circular coin, result heading, primary flip button, counters separated by a top border.
- Cards: five-card row, responsive card sizes, purple facedown treatment, red hearts/diamonds.
- Slides: 16:9 pastel slide inside a raised viewer, dots and arrow controls below.
- Wheel: two-column desktop layout with canvas left and textarea right; one column on mobile.
- This or That: two large equal choice panels; stack only on very narrow screens.
- Quiz: centered maximum 850 px card, two-column answers where space allows, green/red feedback blocks.
- RPS: three equal move controls, private handover stage, two-column result reveal.
- Spy: centered maximum 800 px panel, private-role card, name/vote grids, no hidden secret left in the DOM.
- Hit the Mark: centered maximum 680 px panel; target above a large tabular stopwatch.
- Admin: three dashboard cards; settings use raised editor sections and sticky action rows where practical.

## 8. Motion and audio

- Motion communicates state rather than decorating every control.
- Coin animation duration: approximately 850 ms.
- Wheel uses a multi-turn ease-out spin.
- Card/activity hover transitions: approximately 200–250 ms.
- Disable non-essential animation under `prefers-reduced-motion: reduce`.
- Audio categories: tap, reveal, spin, success, loss.
- Never play audio when muted, and never require audio to understand a result.

## 9. Parity review matrix

| Viewport | Purpose |
|---:|---|
| 360 × 800 | Small Android phone |
| 390 × 844 | Common modern phone |
| 768 × 1024 | Tablet portrait |
| 1024 × 768 | Tablet landscape/small laptop |
| 1440 × 900 | Desktop |

For each viewport, review home, one simple game, wheel, quiz, spy setup, timer, admin dashboard, settings, and quiz editor in both themes. Text expansion must also be reviewed in EN, CN, and BM.

