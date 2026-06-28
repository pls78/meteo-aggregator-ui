## 1. Generalize SearchBox to a slot

- [x] 1.1 Add props `slot: Slot` and `accent: string`; write results to that slot via `selectLocation(loc, slot)`
- [x] 1.2 Render an accent dot (matching the weather-card bullet) at the left of the input
- [x] 1.3 Sync the input text to the slot's location label (`name` ?? `"lat, lng"`) when the input is not focused
- [x] 1.4 For the comparison bar, render a remove "×" that calls `clearLocation('comparison')`

## 2. SearchPanel with the "+" control

- [x] 2.1 Create `src/components/search/SearchPanel.tsx`: always render the primary bar (blue `#2563eb`)
- [x] 2.2 Render the comparison bar (amber `#f59e0b`) when `comparison !== null`
- [x] 2.3 When `comparison === null`, render a "+" button that calls `selectLocation({ ...primary }, 'comparison')`; disable it when `primary === null`

## 3. Wire into the app

- [x] 3.1 Replace `<SearchBox />` with `<SearchPanel />` in `src/App.tsx`

## 4. Verify

- [x] 4.1 `npm run build` and `npm run lint` pass
- [x] 4.2 Live check: search primary; click "+" → second amber bar + second card (same place); search a different place in the second bar → comparison updates; remove "×" → back to one bar/card; Shift+click still shows the second bar — verified by the user
