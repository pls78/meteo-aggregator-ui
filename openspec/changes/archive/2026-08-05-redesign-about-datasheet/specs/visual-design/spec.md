# visual-design Specification (delta)

## ADDED Requirements

### Requirement: One grammar across surfaces

Every surface, including dense reading surfaces such as the info dialog, SHALL compose from the current visual world's vocabulary (ruled sections, annotation labels, token colors, the shared panel material). No surface SHALL retain a prior visual world's composition after a world change.

#### Scenario: Reading surface follows the world

- **WHEN** the info dialog renders after a visual-world change
- **THEN** its sections, tables, and labels use the current world's grammar and tokens, with no leftover composition from the previous world
