import { Link } from 'react-router-dom'
import { ArrowLeft, Flag, Lightbulb, FolderClosed, AlarmClock } from 'lucide-react'

const ICON_ITEMS = [
  { Icon: Flag, label: 'Learning goals', to: '/learning-goals' },
  { Icon: Lightbulb, label: 'Skills profile', to: null },
  { Icon: FolderClosed, label: 'Library', to: null },
  { Icon: AlarmClock, label: 'Reminders', to: null },
]

/** Thin collapsed icon rail shown on the left of the GoalPage. */
export function LeftRail() {
  return (
    <aside className="flex w-[60px] shrink-0 flex-col items-center gap-md border-r border-line-subdued bg-surface py-md">
      <Link
        to="/learning-goals"
        className="flex size-9 items-center justify-center rounded-md text-ink hover:bg-surface-pale"
        aria-label="Learning goals"
        title="Learning goals"
      >
        <ArrowLeft className="size-5" strokeWidth={2} />
      </Link>
      <div className="h-px w-6 bg-line-subdued" />
      {ICON_ITEMS.map(({ Icon, label, to }) =>
        to ? (
          <Link
            key={label}
            to={to}
            className="flex size-9 items-center justify-center rounded-md text-ink-subdued hover:bg-surface-pale hover:text-ink"
            title={label}
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </Link>
        ) : (
          <button
            key={label}
            className="flex size-9 items-center justify-center rounded-md text-ink-subdued hover:bg-surface-pale hover:text-ink"
            title={label}
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </button>
        ),
      )}
    </aside>
  )
}
