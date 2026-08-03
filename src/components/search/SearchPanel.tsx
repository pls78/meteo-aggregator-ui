// Stacks the location search bars: the primary bar always, plus a color-coded
// comparison bar when a comparison location exists. A "+" control adds the
// comparison (initialized to the primary location); the comparison bar's "×"
// removes it.

import { useAppStore } from '../../store/appStore'
import { SearchBox } from './SearchBox'
import { PlusIcon } from '../icons'
import { LOC_A, LOC_B } from '../../lib/accents'

export function SearchPanel() {
  const { primary, comparison, selectLocation, clearLocation } = useAppStore()

  function addComparison() {
    if (!primary) return
    selectLocation({ ...primary }, 'comparison')
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <SearchBox slot="primary" accent={LOC_A} />
        {!comparison && (
          <button
            type="button"
            aria-label="Add comparison location"
            title={primary ? 'Add comparison location' : 'Select a location first'}
            onClick={addComparison}
            disabled={!primary}
            className="panel flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-600 transition-colors hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlusIcon />
          </button>
        )}
      </div>

      {comparison && (
        <SearchBox
          slot="comparison"
          accent={LOC_B}
          onRemove={() => clearLocation('comparison')}
        />
      )}
    </div>
  )
}
