import { Lock } from 'lucide-react'
import type { Course } from '@/data/goal'

function CourseRow({
  course,
  isFirst,
  isLast,
  isCurrent,
}: {
  course: Course
  isFirst: boolean
  isLast: boolean
  isCurrent: boolean
}) {
  return (
    <div className="flex gap-xs-mid">
      {/* Timeline connector: circle vertically centered on the card, with line
          segments above/below that join consecutive circle centers only. */}
      <div className="flex w-[10px] shrink-0 flex-col items-center">
        <span className={`w-px flex-1 ${isFirst ? '' : 'bg-line'}`} />
        <span className="size-[10px] shrink-0 rounded-round border border-line bg-surface" />
        <span className={`w-px flex-1 ${isLast ? '' : 'bg-line'}`} />
      </div>

      <div
        className={`flex flex-1 gap-sm rounded-lg border p-sm ${
          isCurrent ? 'border-2 border-[var(--color-purple-250)]' : 'border-line-subdued'
        }`}
      >
        <img src={course.image} alt="" className="size-12 shrink-0 rounded-md object-cover" />
        <div className="flex flex-1 flex-col gap-sm">
          <div className="flex flex-col gap-xxs">
            <h3 className="text-lg font-medium leading-tight text-ink">{course.title}</h3>
            <p className="truncate text-xs text-ink-subdued">
              Course • {course.lectures} lectures • {course.duration}
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-sm bg-[var(--color-purple-150)] px-xs py-xxs text-xs font-bold text-ink">
            {course.skillTag}
          </span>
          <div className="flex items-center gap-[10px]">
            <div className="h-1.5 flex-1 overflow-hidden rounded-round bg-ink/20">
              <div className="h-full rounded-round bg-ink" style={{ width: `${course.progress}%` }} />
            </div>
            <span className="text-xs text-ink tabular-nums">{course.progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex gap-sm" aria-hidden>
      <div className="skeleton size-[88px] shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col justify-center gap-xs">
        {['100%', '92%', '96%', '55%'].map((w, i) => (
          <div key={i} className="skeleton h-3 rounded-round" style={{ width: w }} />
        ))}
      </div>
    </div>
  )
}

interface LearningPathCardProps {
  courses: Course[]
  /** Path not built yet — render skeleton placeholders (Open / Custom flows). */
  skeleton?: boolean
  /** Show the org-curated lock label (Fixed flow). */
  curated?: boolean
}

export function LearningPathCard({ courses, skeleton, curated }: LearningPathCardProps) {
  const total = courses.length
  return (
    <section className="flex flex-col gap-lg rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
      <div className="flex items-start justify-between gap-sm">
        <div className="flex items-center gap-sm">
          {!skeleton && (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-round border-2 border-line text-xs text-ink">
              0/{total}
            </span>
          )}
          <div className="flex flex-col gap-xxs">
            <h2 className="text-lg font-medium leading-tight text-ink">Learning path</h2>
            {!skeleton && <p className="text-sm text-ink-subdued">{total} courses</p>}
          </div>
        </div>
        {!skeleton && curated && (
          <span className="flex shrink-0 items-center gap-xs text-xs text-ink-subdued">
            <Lock className="size-3.5" strokeWidth={1.75} />
            Curated by your organization
          </span>
        )}
      </div>

      <div className="flex flex-col gap-xs-mid pl-xs">
        {skeleton
          ? [0, 1, 2].map((i) => <SkeletonRow key={i} />)
          : courses.map((c, i) => (
              <CourseRow
                key={c.id}
                course={c}
                isFirst={i === 0}
                isLast={i === courses.length - 1}
                isCurrent={i === 0}
              />
            ))}
      </div>
    </section>
  )
}
