// Shared chrome icons, drawn in one stroke vocabulary (round caps, 2px) so every
// control carries the same hand. Size via className (h-* w-*).

interface IconProps {
  className?: string
}

export function XIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function PlusIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ChevronRightIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

/** Native-search-style clear glyph: filled circle with a knocked-out cross —
 *  deliberately heavier than XIcon so "clear text" never reads as "remove". */
export function ClearIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-2.7-10.7a.75.75 0 0 1 1.06 0L10 8.94l1.64-1.64a.75.75 0 1 1 1.06 1.06L11.06 10l1.64 1.64a.75.75 0 1 1-1.06 1.06L10 11.06l-1.64 1.64a.75.75 0 0 1-1.06-1.06L8.94 10 7.3 8.36a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
