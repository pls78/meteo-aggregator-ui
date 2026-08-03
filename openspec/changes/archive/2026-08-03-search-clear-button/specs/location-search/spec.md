# location-search Specification (delta)

## ADDED Requirements

### Requirement: Clear the search text

While a location search field contains text and is being edited, it SHALL show a clear control at its end that empties the field in one activation, keeps focus in the field, and does not change the selected location. The control SHALL be visually distinct from the comparison bar's remove-location control and SHALL be operable by keyboard.

#### Scenario: One tap clears the text

- **WHEN** the user activates the clear control in a field containing text
- **THEN** the field becomes empty, keeps focus ready for typing, and the selected location and its marker remain unchanged

#### Scenario: Idle fields stay clean

- **WHEN** a search field is not being edited
- **THEN** no clear control is shown and the field reflects the selected location's label as before

#### Scenario: Abandoning the edit restores the label

- **WHEN** the user clears the field and then leaves it without choosing a result
- **THEN** the field returns to showing the selected location's label
