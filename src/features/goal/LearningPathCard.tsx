import { Lock } from 'lucide-react'
import type { Course } from '@/data/goal'

function CourseRow({
  course,
  isFirst,
  isLast,
  animating,
  justUpdated,
  removing,
  suppressLoad,
}: {
  course: Course
  isFirst: boolean
  isLast: boolean
  /** True while the lecture count is being re-optimized (glow + number loading). */
  animating?: boolean
  /** True for ~2s right after the count updates — bolds the meta to spotlight the change. */
  justUpdated?: boolean
  /** True while collapsing/fading out of the path (skill already met the target). */
  removing?: boolean
  /** Glow but keep the number (no loading bar) — used for cards about to be removed. */
  suppressLoad?: boolean
}) {
  const kind = course.kind ?? 'course'
  const isCourse = kind === 'course'
  const showProgress = kind === 'course' || kind === 'assessment'
  const showLoadingBar = animating && !suppressLoad

  return (
    // Grid-rows collapse gives a smooth height animation on exit, regardless of content height.
    <div
      className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${
        removing ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
      }`}
    >
      <div className="overflow-hidden">
        <div className="flex gap-sm">
          {/* Continuous timeline rail: line segments fill the full row height (incl.
              the card's bottom margin) so the line never breaks between cards. */}
          <div className="flex w-[10px] shrink-0 flex-col items-center">
            <span className={`w-px flex-1 ${isFirst ? '' : 'bg-line'}`} />
            <span className="size-[10px] shrink-0 rounded-round border border-line bg-surface" />
            <span className={`w-px flex-1 ${isLast ? '' : 'bg-line'}`} />
          </div>

          <div
            className={`relative flex flex-1 gap-sm rounded-lg border border-line-subdued bg-surface p-sm ${
              isLast ? '' : 'mb-xs-mid'
            }`}
          >
            {animating && <span aria-hidden className="course-glow-ring" />}
            <img src={course.image} alt="" className="size-12 shrink-0 rounded-md object-cover" />
            <div className="flex flex-1 flex-col gap-sm">
              <div className="flex flex-col gap-xxs">
                <h3 className="text-lg font-medium leading-tight text-ink">{course.title}</h3>
                {isCourse ? (
                  showLoadingBar ? (
                    <p className="flex items-center gap-xs text-xs text-ink-subdued">
                      Course •
                      <span className="skeleton inline-block h-3 w-[104px] rounded-round align-middle" />
                    </p>
                  ) : (
                    <p className="truncate text-xs text-ink-subdued">
                      Course •{' '}
                      <span
                        className={`transition-colors duration-500 ${justUpdated ? 'font-bold text-ink' : 'font-normal'}`}
                      >
                        {course.lectures} lectures • {course.duration}
                      </span>
                    </p>
                  )
                ) : (
                  <p className="truncate text-xs text-ink-subdued">{course.metaText}</p>
                )}
              </div>
              <span className="inline-flex w-fit items-center rounded-sm bg-[var(--color-purple-150)] px-xs py-xxs text-xs font-bold text-ink">
                {course.skillTag}
              </span>
              {showProgress && (
                <div className="flex items-center gap-[10px]">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-round bg-ink/20">
                    <div className="h-full rounded-round bg-ink" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-xs text-ink tabular-nums">{course.progress}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Circular progress ring (track + arc) showing completed/total courses. */
function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const size = 56
  const stroke = 3
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = total ? completed / total : 0
  return (
    <span className="relative flex size-14 shrink-0 items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-gray-200)" strokeWidth={stroke} />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-purple-400)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
          />
        )}
      </svg>
      <span className="text-xs font-medium text-ink tabular-nums">
        {completed}/{total}
      </span>
    </span>
  )
}

function SkeletonRow({ static: isStatic }: { static?: boolean }) {
  const cls = isStatic ? 'skeleton-static' : 'skeleton'
  return (
    <div className="flex gap-sm" aria-hidden>
      <div className={`${cls} size-[88px] shrink-0 rounded-md`} />
      <div className="flex flex-1 flex-col justify-center gap-xs">
        {['100%', '92%', '96%', '55%'].map((w, i) => (
          <div key={i} className={`${cls} h-3 rounded-round`} style={{ width: w }} />
        ))}
      </div>
    </div>
  )
}

interface LearningPathCardProps {
  courses: Course[]
  /** Path not built yet — render skeleton placeholders (Open / Custom flows). */
  skeleton?: boolean
  /** When true with skeleton, suppresses the shimmer animation (static placeholder). */
  staticSkeleton?: boolean
  /** Show the org-curated lock label (Fixed flow). */
  curated?: boolean
  /** Course ids currently re-optimizing (glow border + lecture-count loading). */
  animatingIds?: Set<string>
  /** Course ids that just updated — briefly bold their meta to highlight the change. */
  justUpdatedIds?: Set<string>
  /** Course ids collapsing out of the path (skill already met the target). */
  removingIds?: Set<string>
  /** Course ids being removed — glow but keep the number (no lecture loading bar). */
  reachedIds?: Set<string>
  /** Total shown next to "Learning path"; defaults to the course count. */
  countLabel?: string
}

export function LearningPathCard({ courses, skeleton, staticSkeleton, curated, animatingIds, justUpdatedIds, removingIds, reachedIds, countLabel }: LearningPathCardProps) {
  // Ring + "N courses" count only video courses; role play / labs are extras.
  const courseCount = courses.filter((c) => (c.kind ?? 'course') === 'course').length
  return (
    <section className="flex flex-col gap-lg rounded-lg bg-surface p-lg">
      <div className="flex items-start justify-between gap-sm">
        <div className="flex items-center gap-sm">
          {!skeleton && <ProgressRing completed={0} total={courseCount} />}
          <div className="flex flex-col gap-xxs">
            <h2 className="text-lg font-medium leading-tight text-ink">Learning path</h2>
            {!skeleton && <p className="text-sm text-ink-subdued">{countLabel ?? `${courseCount} courses`}</p>}
          </div>
        </div>
        {!skeleton && curated && (
          <span className="flex shrink-0 items-center gap-xs text-xs text-ink-subdued">
            <Lock className="size-3.5" strokeWidth={1.75} />
            Curated by your organization
          </span>
        )}
      </div>

      <div className={`flex flex-col pl-xs ${skeleton ? 'gap-md' : ''}`}>
        {skeleton
          ? [0, 1, 2].map((i) => <SkeletonRow key={i} static={staticSkeleton} />)
          : courses.map((c, i) => (
              <CourseRow
                key={c.id}
                course={c}
                isFirst={i === 0}
                isLast={i === courses.length - 1}
                animating={animatingIds?.has(c.id)}
                justUpdated={justUpdatedIds?.has(c.id)}
                removing={removingIds?.has(c.id)}
                suppressLoad={reachedIds?.has(c.id)}
              />
            ))}
      </div>
    </section>
  )
}
