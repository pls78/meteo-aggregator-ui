## 1. Copy

- [x] 1.1 Extend the "Point anywhere" entry in `FEATURES` (`src/components/about/aboutContent.ts`)
      to cover returning to your current position on demand, alongside the on-load seed
- [x] 1.2 Add one sentence for the blocked case: the app says so, and the remedy is the browser's
      own site settings
- [x] 1.3 Keep the card to three sentences, and keep its vocabulary consistent with the message
      `LocateButton` shows ("Location is blocked. Allow it for this site in your browser's
      settings.")
- [x] 1.4 Leave the rest of the file alone — the backend-transcribed figures and the per-layer
      copy are out of scope

## 2. Verify

- [x] 2.1 Open the info page in both layouts and confirm the card still reads well and does not
      unbalance the feature list at mobile width
- [x] 2.2 Confirm the info page's wording and the locate control's message describe the blocked
      state in recognisably the same terms
- [x] 2.3 Run `npm run lint` and `npm run build`
