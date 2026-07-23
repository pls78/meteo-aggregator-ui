## ADDED Requirements

### Requirement: Confidence label is a distinct, discoverable control

Within a day row, the confidence label (high/medium/low) SHALL be its own
click/tap target, visually distinct from the rest of the row and carrying an
affordance that it is actionable (so it reads as tappable on touch as well as
hover). Activating the label SHALL NOT trigger the day's hourly view, and
activating the rest of the row SHALL NOT trigger the confidence detail. This
SHALL hold in both the desktop and mobile layouts.

#### Scenario: Label is separately actionable

- **WHEN** the user activates a day's confidence label
- **THEN** the day's confidence detail opens and its hourly view does not

#### Scenario: Rest of the row keeps hourly behaviour

- **WHEN** the user activates any part of the day row other than the confidence
  label
- **THEN** the day's hourly view opens, unchanged

#### Scenario: Label is keyboard operable

- **WHEN** the user focuses the confidence label and activates it via keyboard
- **THEN** the confidence detail for that day opens

### Requirement: Per-day confidence detail

The system SHALL present, for a day whose confidence label is activated, a
confidence detail in place of that day's hourly view. The detail SHALL list each
model present in the day's `breakdown` with its day-high temperature and its
blend weight for that day (renormalized over the models present, matching how the
consensus is blended), show the consensus day-high, and give a plain-language
explanation of how the confidence level was derived — that it reflects how much
the models disagree on the day's high (and ensemble spread when available), the
resulting spread, and the thresholds that map spread to high/medium/low. All
values SHALL come from the existing `/forecast` response; no extra request SHALL
be required. Only one of the hourly view and the confidence detail SHALL be
visible for the selected day at a time.

#### Scenario: Show the per-model breakdown and explanation

- **WHEN** the confidence detail is shown for a day
- **THEN** it lists each contributing model with its day-high temperature and
  blend weight, shows the consensus, and explains how the confidence level was
  computed, consistent with the label shown

#### Scenario: Detail takes the hourly slot

- **WHEN** the confidence detail is shown for a day
- **THEN** it occupies the same area the hourly view uses and that day's hourly
  chart is not shown

#### Scenario: Switch back to hourly

- **WHEN** the confidence detail is shown and the user then activates the rest of
  the same day row
- **THEN** the view switches to that day's hourly forecast

#### Scenario: Missing model is omitted

- **WHEN** a model provides no value for the selected day
- **THEN** that model is omitted from the detail rather than shown empty
