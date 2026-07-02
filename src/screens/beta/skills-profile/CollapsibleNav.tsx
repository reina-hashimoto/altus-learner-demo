/**
 * Collapsible "My learning" left nav. Expanded (312px) shows the company logo,
 * labelled items, and a ← to collapse; collapsed is a thin icon rail with a → to
 * expand. "Skills profile" is the active item on this page; "Learning goals"
 * links to the existing Learning goals page.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Flag, Lightbulb, FolderClosed, AlarmClock, ChevronDown } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import deltaLogo from '@/assets/delta-logo.webp'

type ItemId = 'learning-goals' | 'skills-profile' | 'library' | 'reminders'

const ITEMS: { id: ItemId; label: string; Icon: typeof Flag; to: string | null; chevron?: boolean }[] = [
  { id: 'learning-goals', label: 'Learning goals', Icon: Flag, to: '/learning-goals' },
  { id: 'skills-profile', label: 'Skills profile', Icon: Lightbulb, to: '/skills-profile' },
  { id: 'library', label: 'Library', Icon: FolderClosed, to: null, chevron: true },
  { id: 'reminders', label: 'Reminders', Icon: AlarmClock, to: null },
]

const LIBRARY_SUBITEMS = ['Courses', 'Learning paths', 'Certifications', 'Assessments', 'Labs']

export function CollapsibleNav({
  active,
  open,
  onToggle,
}: {
  active: ItemId
  open: boolean
  onToggle: () => void
}) {
  const [libraryOpen, setLibraryOpen] = useState(true)
  if (!open) {
    // Collapsed icon rail.
    return (
      <aside className="flex w-[60px] shrink-0 flex-col items-center gap-md border-r border-line-subdued bg-surface py-md">
        <button
          onClick={onToggle}
          className="flex size-9 items-center justify-center rounded-md text-ink hover:bg-surface-pale"
          aria-label="Expand navigation"
          title="Expand"
        >
          <ArrowRight className="size-5" strokeWidth={2} />
        </button>
        <img src={deltaLogo} alt="Delta" className="h-auto w-8 object-contain" />
        <div className="h-px w-6 bg-line-subdued" />
        {ITEMS.map(({ id, label, Icon, to }) => {
          const isActive = id === active
          const cls = cn(
            'flex size-9 items-center justify-center rounded-md',
            isActive ? 'bg-surface-accent text-brand' : 'text-ink-subdued hover:bg-surface-pale hover:text-ink',
          )
          return to ? (
            <Link key={id} to={to} className={cls} title={label}>
              <Icon className="size-5" strokeWidth={1.75} />
            </Link>
          ) : (
            <button key={id} className={cls} title={label}>
              <Icon className="size-5" strokeWidth={1.75} />
            </button>
          )
        })}
      </aside>
    )
  }

  // Expanded sidebar.
  return (
    <aside className="flex w-[312px] shrink-0 flex-col border-r border-line-subdued bg-surface">
      <div className="flex items-center justify-between px-lg pt-md">
        <span className="sr-only">My learning</span>
        <button
          onClick={onToggle}
          className="ml-auto flex size-8 items-center justify-center rounded-md text-ink hover:bg-surface-pale"
          aria-label="Collapse navigation"
        >
          <ArrowLeft className="size-5" strokeWidth={2} />
        </button>
      </div>
      <div className="flex items-center gap-sm px-lg pb-md">
        <img src={deltaLogo} alt="Delta" className="h-8 w-auto object-contain" />
        <span className="text-xl font-bold text-ink">My learning</span>
      </div>
      <div className="h-px w-full bg-line-subdued" />

      <nav className="flex flex-col py-xs">
        {ITEMS.map(({ id, label, Icon, to, chevron }) => {
          const isActive = id === active
          const inner = (
            <>
              {isActive && <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-sm bg-brand" />}
              <Icon className={cn('size-5', isActive ? 'text-brand' : 'text-ink-subdued')} strokeWidth={1.75} />
              <span className="flex-1">{label}</span>
              {chevron && (
                <ChevronDown
                  className={cn('size-4 text-ink-subdued transition-transform', libraryOpen ? '' : '-rotate-90')}
                  strokeWidth={2}
                />
              )}
            </>
          )
          const cls = cn(
            'relative flex items-center gap-sm py-sm pl-lg pr-lg text-sm transition-colors',
            isActive ? 'bg-surface-accent font-bold text-ink' : 'font-medium text-ink hover:bg-surface-pale',
          )
          if (id === 'library') {
            return (
              <div key={id} className="flex flex-col">
                <button className={cn(cls, 'text-left')} onClick={() => setLibraryOpen((o) => !o)}>
                  {inner}
                </button>
                {libraryOpen && (
                  <div className="flex flex-col">
                    {LIBRARY_SUBITEMS.map((sub) => (
                      <button
                        key={sub}
                        className="py-xs pl-[60px] pr-lg text-left text-sm text-ink-subdued hover:bg-surface-pale hover:text-ink"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          }
          return to ? (
            <Link key={id} to={to} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={id} className={cn(cls, 'text-left')}>
              {inner}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
