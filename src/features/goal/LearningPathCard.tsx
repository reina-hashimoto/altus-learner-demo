import { Lock } from 'lucide-react'
import { COURSES } from '@/data/goal'

function CourseRow({
  course,
  isLast,
}: {
  course: (typeof COURSES)[number]
  isLast: boolean
}) {
  return (
    <div className="flex gap-sm">
      {/* timeline rail */}
      <div className="flex flex-col items-center pt-md">
        <span className="size-3 rounded-round border-2 border-line bg-surface" />
        {!isLast && <span className="w-px flex-1 bg-line" />}
      </div>

      {/* course card */}
      <div className="mb-sm flex flex-1 gap-sm rounded-md border border-line-subdued p-sm">
        <img
          src={course.image}
          alt=""
          className="size-11 shrink-0 rounded-sm object-cover"
        />
        <div className="flex-1">
          <h3 className="text-sm font-bold leading-snug text-ink">{course.title}</h3>
          <p className="mt-0.5 text-xs text-ink-subdued">
            Course • {course.lectures} lectures • {course.duration}
          </p>
          <span className="mt-xs inline-block rounded-sm bg-surface-accent px-xs py-0.5 text-xs font-medium text-brand-strong">
            {course.skillTag}
          </span>
          <div className="mt-sm flex items-center gap-xs">
            <div className="h-1 flex-1 overflow-hidden rounded-round bg-surface-midtone">
              <div
                className="h-full rounded-round bg-brand"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <span className="text-xs text-ink-subdued tabular-nums">{course.progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LearningPathCard() {
  const total = COURSES.length
  return (
    <section className="rounded-lg border border-line-subdued bg-surface p-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-md flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <span className="flex size-12 items-center justify-center rounded-round border-2 border-line text-xs font-bold text-ink-subdued">
            0/{total}
          </span>
          <div>
            <h2 className="text-lg font-medium text-ink">Learning path</h2>
            <p className="text-xs text-ink-subdued">{total} courses</p>
          </div>
        </div>
        <span className="flex items-center gap-xs text-xs text-ink-subdued">
          <Lock className="size-3.5" strokeWidth={1.75} />
          Curated by your organization
        </span>
      </div>

      <div>
        {COURSES.map((c, i) => (
          <CourseRow key={c.id} course={c} isLast={i === COURSES.length - 1} />
        ))}
      </div>
    </section>
  )
}
