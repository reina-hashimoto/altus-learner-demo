/** Small Altus identity mark — a faceted purple gem. */
export function AltusMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.5 20 7v10l-8 4.5L4 17V7l8-4.5Z"
        fill="var(--color-purple-500)"
      />
      <path d="M12 2.5 20 7l-8 4.5L4 7l8-4.5Z" fill="var(--color-purple-400)" />
      <path d="M9.6 9.3l1 2.1 2.1 1-2.1 1-1 2.1-1-2.1-2.1-1 2.1-1 1-2.1Z" fill="#fff" />
    </svg>
  )
}
