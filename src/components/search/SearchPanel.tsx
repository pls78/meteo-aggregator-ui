// Stacks the location search bars: the primary bar always, plus a color-coded
// comparison bar when a comparison location exists. A "+" control adds the
// comparison (initialized to the primary location); the comparison bar's "×"
// removes it.

import { useAppStore } from '../../store/appStore'
import { SearchBox } from './SearchBox'

const PRIMARY_ACCENT = 'rgb(37, 99, 235)'
const COMPARISON_ACCENT = 'rgb(245, 158, 11)'

export function SearchPanel() {
  const { primary, comparison, selectLocation, clearLocation } = useAppStore()

  function addComparison() {
    if (!primary) return
    selectLocation({ ...primary }, 'comparison')
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <SearchBox slot="primary" accent={PRIMARY_ACCENT} />
        {!comparison && (
          <button
            type="button"
            aria-label="Add comparison location"
            title={primary ? 'Add comparison location' : 'Select a location first'}
            onClick={addComparison}
            disabled={!primary}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white/80 text-xl leading-none text-slate-600 shadow-lg backdrop-blur hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        )}
      </div>

      {comparison && (
        <SearchBox
          slot="comparison"
          accent={COMPARISON_ACCENT}
          onRemove={() => clearLocation('comparison')}
        />
      )}
    </div>
  )
}
