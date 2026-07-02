import { History, ChevronDown, Check } from 'lucide-react'
import type { Course } from '@/data/goal'
import { cn } from '@/components/ui/utils'

/**
 * Collapsible archive of courses removed from the active path (e.g. once their
 * skill reaches target). Default closed; sits below the path / congrats card.
 */
export function ArchiveSection({
  courses,
  open,
  onToggle,
  onCourseClick,
  badgeLabel = 'Verified',
}: {
  courses: Course[]
  open: boolean
  onToggle: () => void
  onCourseClick: (course: Course) => void
  /** Right-hand status pill on each archived item. Personal = "Verified"
   *  (assessment-passed); flex = "Reached target" (met via self-report). */
  badgeLabel?: string
}) {
  return (
    <div className="-mt-sm flex flex-col items-end gap-xs">
      <button
        onClick={onToggle}
        className="flex items-center gap-xs px-xs py-xxs text-sm font-medium text-ink-subdued transition-colors hover:text-ink"
      >
        <History className="size-4" strokeWidth={1.75} />
        Show previously studied courses ({courses.length})
        <ChevronDown className={cn('size-4 transition-transform', open ? 'rotate-180' : '')} strokeWidth={2} />
      </button>

      {open && (
        <section className="w-full animate-altus-fadein rounded-lg bg-surface p-lg">
          <h2 className="mb-md text-lg font-medium text-ink">Previously studied</h2>
          <div className="flex flex-col gap-sm">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => onCourseClick(c)}
                className="flex items-center gap-sm rounded-lg border border-line-subdued p-sm text-left transition-shadow hover:shadow-[var(--box-shadow-100)]"
              >
                <img src={c.image} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                <div className="flex min-w-0 flex-1 flex-col gap-xxs">
                  <h3 className="truncate text-md font-medium leading-tight text-ink">{c.title}</h3>
                  <p className="truncate text-xs text-ink-subdued">
                    {c.metaText ?? `Course • ${c.lectures} lectures • ${c.duration}${c.instructor ? ` • ${c.instructor}` : ''}`}
                  </p>
                  <span className="inline-flex w-fit items-center rounded-sm bg-[var(--color-purple-150)] px-xs py-xxs text-xs font-bold text-ink">
                    {c.skillTag}
                  </span>
                </div>
                <span
                  className="flex shrink-0 items-center gap-xxs rounded-sm px-xs py-xxs text-xs font-bold text-white"
                  style={{ background: '#0e8a5f' }}
                >
                  <Check className="size-3" strokeWidth={3} /> {badgeLabel}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
