// The clickable confidence label in a day row. Carries an info cue so it reads
// as its own control (not part of the row), and rings when its confidence detail
// is the open view. Shared by the desktop card and the mobile sheet so the two
// stay in sync.

const STYLE: Record<string, string> = {
  high: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-rose-100 text-rose-700',
}

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
      className={`flex cursor-pointer items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium hover:ring-1 hover:ring-slate-300 ${
        STYLE[level] ?? ''
      } ${active ? 'ring-2 ring-slate-400' : ''}`}
    >
      <InfoIcon />
      {level}
    </button>
  )
}
