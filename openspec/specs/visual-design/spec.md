# visual-design Specification

## Purpose

The durable visual system all surfaces share: token vocabulary, panel material,
location accents, basemap tone, and the accessibility floor. Established by redesign-ui-category-standard and replaced by
redesign-ui-meteogram (The Meteogram world — consensus drawn over model spread;
Windy.com craft bar; see DESIGN.md for the built system).

## Requirements

### Requirement: Single token vocabulary

All UI chrome SHALL derive its colors, typography sizes, radii, and shadows from a single design-token vocabulary defined once in the global stylesheet (Tailwind `@theme`). Components SHALL NOT introduce ad-hoc hex values or palette classes outside the token set.

#### Scenario: Component colors come from tokens

- **WHEN** any component in the desktop or mobile layout renders a surface, text, accent, or state color
- **THEN** the value resolves to a defined design token, and no raw palette utility (e.g. `slate-*`) or literal hex remains in component code

### Requirement: Shared panel material

Every floating UI element over the map (location cards, search, layer panel, hourly sheet, dialogs, mobile sheets and FABs) SHALL use one shared panel recipe: a near-opaque paper-white data ground with hairline border rules, defined corner radius, and a shadow from the shadow vocabulary — figures on paper rather than glass.

#### Scenario: Panels are visually uniform

- **WHEN** two different floating elements are visible at once
- **THEN** they share the same paper surface material, hairline border, radius vocabulary, and shadow tier system

#### Scenario: Panels stay legible over imagery

- **WHEN** a panel overlaps an active satellite overlay
- **THEN** the near-opaque ground keeps all panel text at its required contrast

### Requirement: Location accent pair

The primary and comparison locations SHALL each own one accent color, distinguishable by colorblind users, applied consistently to their map markers, card indicators, search-bar bullets, A/B controls, and chart series.

#### Scenario: One color per location everywhere

- **WHEN** two locations are selected
- **THEN** every UI element referring to the primary location uses the primary accent and every element referring to the comparison uses the comparison accent, with no third variant

### Requirement: Quiet basemap under data

The basemap style SHALL be visually muted (near-grayscale ground, low-chroma features) so that weather overlays, markers, and UI chrome read as the foreground, while remaining a vector style with intact attribution.

#### Scenario: Map recedes, data leads

- **WHEN** the map is displayed with markers or satellite overlays active
- **THEN** the basemap renders in muted tones that keep place labels legible without competing with the data layers

### Requirement: Accessibility floor

Text over panels SHALL meet WCAG AA contrast; every interactive element SHALL show a visible keyboard-focus indicator; interactive elements SHALL present hover, active/selected, and disabled states from the shared state vocabulary.

#### Scenario: Keyboard focus is visible

- **WHEN** a user tabs through the UI
- **THEN** each focused control shows a visible focus ring in the accent color

#### Scenario: Text meets AA

- **WHEN** text renders on the panel surface at its assigned token color
- **THEN** its contrast ratio against that surface is at least 4.5:1 (3:1 for large display text)

### Requirement: Loading as skeletons

Data placeholders in weather panels SHALL render as skeleton shapes matching the eventual content layout rather than bare loading text.

#### Scenario: Card loads with skeletons

- **WHEN** a location card is fetching forecast data
- **THEN** shimmer/skeleton rows appear where current conditions and day rows will render

### Requirement: Uncertainty is drawn

Wherever a daily consensus value is shown with per-model data available, the model spread SHALL be drawn as marks (faint per-model ticks with a bold consensus tick on a shared local scale), so confidence is visible as width, with the textual confidence tag as its label. Day rows in both layouts carry a spread strip; the confidence detail carries a larger dot-strip figure.

#### Scenario: Day rows show the spread

- **WHEN** a day row renders and at least two models report that day's high temperature
- **THEN** the row includes a spread strip with one faint tick per model and a bold tick at the consensus value

#### Scenario: Strip degrades quietly

- **WHEN** fewer than two models report that day
- **THEN** the strip renders nothing and the row otherwise reads normally

### Requirement: Drawn weather glyphs

Weather-condition icons SHALL be drawn glyphs from a single shared set rendered by the application (one stroke vocabulary, consistent across platforms), not platform emoji or system glyph fonts. Mark colors SHALL come from the token vocabulary: ink for structure, the precipitation token for water marks, the sun token for solar marks.

#### Scenario: Same glyph everywhere

- **WHEN** the same weather code renders in the desktop card, the mobile sheet, and the hourly chart on any operating system
- **THEN** the same drawn glyph appears, differing only in size

#### Scenario: Unknown code degrades quietly

- **WHEN** a weather code outside the known set is received
- **THEN** a neutral placeholder glyph renders with an "Unknown" label, with no emoji fallback

### Requirement: One grammar across surfaces

Every surface, including dense reading surfaces such as the info dialog, SHALL compose from the current visual world's vocabulary (ruled sections, annotation labels, token colors, the shared panel material). No surface SHALL retain a prior visual world's composition after a world change.

#### Scenario: Reading surface follows the world

- **WHEN** the info dialog renders after a visual-world change
- **THEN** its sections, tables, and labels use the current world's grammar and tokens, with no leftover composition from the previous world
