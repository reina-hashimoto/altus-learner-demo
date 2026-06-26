import { Link } from 'react-router-dom'
import { ArrowLeft, Flag, Lightbulb, FolderClosed, AlarmClock } from 'lucide-react'

const items = [Flag, Lightbulb, FolderClosed, AlarmClock]

/** The thin collapsed icon rail on the far left of the learner hub. */
export function LeftRail() {
  return (
    <aside className="flex w-[60px] shrink-0 flex-col items-center gap-md border-r border-line-subdued bg-surface py-md">
      <Link
        to="/"
        className="flex size-9 items-center justify-center rounded-md text-ink hover:bg-surface-pale"
        aria-label="Back to all flows"
        title="Back to all flows"
      >
        <ArrowLeft className="size-5" strokeWidth={2} />
      </Link>
      <div className="h-px w-6 bg-line-subdued" />
      {items.map((Icon, i) => (
        <button
          key={i}
          className="flex size-9 items-center justify-center rounded-md text-ink-subdued hover:bg-surface-pale hover:text-ink"
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </button>
      ))}
    </aside>
  )
}
