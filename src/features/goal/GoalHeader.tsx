import { Flag, CalendarDays, Clock, User } from 'lucide-react'
import { GOAL_META } from '@/data/goal'

export function GoalHeader({ title, fromLabel }: { title: string; fromLabel?: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="inline-flex w-fit items-center gap-xs rounded-sm bg-surface-positive px-xs py-0.5 text-xs font-bold text-positive">
        <Flag className="size-3.5" strokeWidth={2} />
        {GOAL_META.tag}
      </span>

      <h1 className="text-xxl font-medium leading-tight text-ink">{title}</h1>

      <div className="mt-xxs flex flex-wrap items-center gap-md text-sm text-ink-subdued">
        <span className="flex items-center gap-xs">
          <CalendarDays className="size-4" strokeWidth={1.75} />
          <span className="font-bold text-ink">{GOAL_META.daysLeft}</span>
          <span>·</span>
          <span>{GOAL_META.dueDate}</span>
        </span>
        <span className="flex items-center gap-xs">
          <Clock className="size-4" strokeWidth={1.75} />
          <span className="font-bold text-ink">{GOAL_META.commitment}</span>
          <span>{GOAL_META.commitmentUnit}</span>
        </span>
        {fromLabel && (() => {
          const fromMatch = fromLabel.match(/^(From\s+)(.+)$/)
          return (
            <span className="flex items-center gap-xs">
              <User className="size-4" strokeWidth={1.75} />
              {fromMatch ? (
                <>
                  <span>{fromMatch[1]}</span>
                  <span className="font-bold text-ink">{fromMatch[2]}</span>
                </>
              ) : (
                <span className="font-bold text-ink">{fromLabel}</span>
              )}
            </span>
          )
        })()}
      </div>
    </div>
  )
}
