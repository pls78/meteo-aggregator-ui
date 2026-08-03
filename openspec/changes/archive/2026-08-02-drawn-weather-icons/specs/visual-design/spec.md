# visual-design Specification (delta)

## ADDED Requirements

### Requirement: Drawn weather glyphs

Weather-condition icons SHALL be drawn glyphs from a single shared set rendered by the application (one stroke vocabulary, consistent across platforms), not platform emoji or system glyph fonts. Mark colors SHALL come from the token vocabulary: ink for structure, the precipitation token for water marks, the sun token for solar marks.

#### Scenario: Same glyph everywhere

- **WHEN** the same weather code renders in the desktop card, the mobile sheet, and the hourly chart on any operating system
- **THEN** the same drawn glyph appears, differing only in size

#### Scenario: Unknown code degrades quietly

- **WHEN** a weather code outside the known set is received
- **THEN** a neutral placeholder glyph renders with an "Unknown" label, with no emoji fallback
