// The clickable confidence label in a day row. Carries an info cue so it reads
// as its own control (not part of the row), and rings when its confidence detail
// is the open view. Shared by the desktop card and the mobile sheet so the two
// stay in sync.

const STYLE: Record<string, string> = {
  high: 'text-conf-high',
  medium: 'text-conf-medium',
  low: 'text-conf-low',
}

// Short display label so the tag (with its info cue) doesn't wrap the row.
const SHORT: Record<string, string> = { high: 'high', medium: 'med', low: 'low' }

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3 w-3 opacity-70">
      <path
        fillRule="evenodd"
        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function ConfidenceTag({
  level,
  active,
  onClick,
}: {
  level: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Why ${level} confidence?`}
      title="Why this confidence?"
      className={`flex shrink-0 cursor-pointer items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-medium transition-shadow focus-visible:outline-2 focus-visible:outline-accent hover:ring-1 hover:ring-current/40 ${
        STYLE[level] ?? ''
      } ${active ? 'ring-2 ring-current/60' : ''}`}
    >
      <InfoIcon />
      {SHORT[level] ?? level}
    </button>
  )
}
