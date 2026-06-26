import { Flag, CalendarDays, Clock } from 'lucide-react'
import { GOAL_META } from '@/data/goal'

export function GoalHeader({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="inline-flex w-fit items-center gap-xs rounded-sm bg-surface-positive px-xs py-0.5 text-xs font-bold text-positive">
        <Flag className="size-3.5" strokeWidth={2} />
        {GOAL_META.tag}
      </span>

      <h1 className="text-xxl font-medium leading-tight text-ink">{title}</h1>

      <div className="mt-xxs flex items-center gap-md text-sm text-ink-subdued">
        <span className="flex items-center gap-xs">
          <CalendarDays className="size-4" strokeWidth={1.75} />
          <span className="font-bold text-ink">{GOAL_META.daysLeft}</span>
          <span>{GOAL_META.dueDate}</span>
        </span>
        <span className="flex items-center gap-xs">
          <Clock className="size-4" strokeWidth={1.75} />
          <span className="font-bold text-ink">{GOAL_META.commitment}</span>
          <span>{GOAL_META.commitmentUnit}</span>
        </span>
      </div>
    </div>
  )
}
