// Info button that opens the "how it works" dialog (see AboutDialog). Placement is
// the caller's job via `className`; both layouts reuse this trigger.

import { useAppStore } from '../../store/appStore'

export function AboutButton({ className = '' }: { className?: string }) {
  const { setAboutOpen } = useAppStore()
  return (
    <button
      type="button"
      aria-label="About this app"
      title="About / how it works"
      onClick={() => setAboutOpen(true)}
      className={`grid place-items-center rounded-full bg-white/85 text-slate-600 shadow-xl ring-1 ring-black/5 backdrop-blur hover:text-slate-900 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </svg>
    </button>
  )
}
