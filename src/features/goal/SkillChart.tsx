import { SKILL_SCALE_MAX, type Skill } from '@/data/goal'
import { Button } from '@/components/ui/button'

const GRID_TICKS = [0, 50, 100, 150, 200]
const BANDS = ['Foundational', 'Intermediate', 'Established', 'Advanced']

const pct = (v: number) => `${(v / SKILL_SCALE_MAX) * 100}%`

interface SkillChartProps {
  skills: Skill[]
  /** Which series the bars represent. */
  mode: 'estimated' | 'selfReported'
  /** Show the per-row "Assess" buttons (main page only). */
  showAssess?: boolean
  onAssess?: (skillId: string) => void
}

export function SkillChart({ skills, mode, showAssess = false, onAssess }: SkillChartProps) {
  const barColor =
    mode === 'estimated' ? 'var(--color-orange-150)' : 'var(--color-purple-150)'
  const cols = showAssess
    ? 'grid-cols-[132px_1fr_92px]'
    : 'grid-cols-[132px_1fr]'

  return (
    <div className="flex flex-col gap-xs-mid">
      {/* axis */}
      <div className={`grid ${cols} items-end gap-sm`}>
        <div />
        <div className="relative h-5 text-xxs text-ink-subdued">
          {GRID_TICKS.map((t) => (
            <span
              key={t}
              className="absolute top-0 -translate-x-1/2 tabular-nums"
              style={{ left: pct(t) }}
            >
              {t}
            </span>
          ))}
          {BANDS.map((b, i) => (
            <span
              key={b}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: pct(25 + i * 50) }}
            >
              {b}
            </span>
          ))}
        </div>
        {showAssess && <div />}
      </div>

      {/* rows */}
      {skills.map((s) => (
        <div key={s.id} className={`grid ${cols} items-center gap-sm`}>
          <div className="text-right text-xs font-bold leading-tight text-ink">
            {s.name}
          </div>

          <div className="relative h-9">
            {/* gridlines */}
            {GRID_TICKS.map((t) => (
              <span
                key={t}
                className="absolute top-0 bottom-0 w-px bg-line-subdued"
                style={{ left: pct(t) }}
              />
            ))}
            {/* bar */}
            <div
              className="absolute top-1/2 left-0 h-3 -translate-y-1/2 rounded-sm"
              style={{ width: pct(s[mode]), background: barColor }}
            />
            {/* target proficiency dot */}
            <span
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-round bg-brand"
              style={{ left: pct(s.target) }}
            />
          </div>

          {showAssess && (
            <Button udStyle="secondary" size="xsmall" onClick={() => onAssess?.(s.id)}>
              Assess
            </Button>
          )}
        </div>
      ))}

      {/* legend */}
      <div className={`grid ${cols} gap-sm`}>
        <div />
        <div className="flex items-center gap-md text-xs text-ink-subdued">
          <span className="flex items-center gap-xs">
            <span className="size-3 rounded-sm" style={{ background: barColor }} />
            {mode === 'estimated' ? 'Estimated' : 'Self-reported'}
          </span>
          <span className="flex items-center gap-xs">
            <span className="size-2.5 rounded-round bg-brand" />
            Target proficiency
          </span>
        </div>
        {showAssess && <div />}
      </div>
    </div>
  )
}
