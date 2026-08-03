# visual-design Specification (delta)

## ADDED Requirements

### Requirement: Single token vocabulary

All UI chrome SHALL derive its colors, typography sizes, radii, and shadows from a single design-token vocabulary defined once in the global stylesheet (Tailwind `@theme`). Components SHALL NOT introduce ad-hoc hex values or palette classes outside the token set.

#### Scenario: Component colors come from tokens

- **WHEN** any component in the desktop or mobile layout renders a surface, text, accent, or state color
- **THEN** the value resolves to a defined design token, and no raw palette utility (e.g. `slate-*`) or literal hex remains in component code

### Requirement: Shared panel material

Every floating UI element over the map (location cards, search, layer panel, hourly sheet, dialogs, mobile sheets and FABs) SHALL use one shared panel recipe: translucent light surface with blur, hairline border, defined corner radius, and a shadow from the shadow vocabulary.

#### Scenario: Panels are visually uniform

- **WHEN** two different floating elements are visible at once
- **THEN** they share the same surface material, border, radius vocabulary, and shadow tier system

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
