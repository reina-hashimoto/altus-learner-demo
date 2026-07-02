/**
 * Horizontal skills chart for the Skills profile page. Mirrors the goal-page
 * SkillChart patterns (band-snapped bars, target-range hatch, hover tooltip,
 * verified celebration) but with Skills-profile semantics:
 *  - estimated → orange, self-reported → light purple
 *  - verified & score ≥ target → green + sparkle
 *  - verified & score < target → Udemy-Verified dark purple (animation only)
 */
import { useEffect, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SCALE_MAX, TICKS, BANDS, type ProfileSkill, type SkillSource } from './data'

/** Resolved per-skill state (base or updated via assessment / self-report). */
export interface SkillView {
  source: SkillSource
  value: number
  /** Verified score met/exceeded the target → render green + celebrate. */
  exceeded?: boolean
}

const ESTIMATED = 'var(--color-orange-150)'
const SELF_REPORTED = 'var(--color-purple-150)'
const VERIFIED_PURPLE = 'var(--color-purple-400)'
const VERIFIED_GREEN = '#0e8a5f'
const TARGET_RANGE_BG =
  'repeating-linear-gradient(45deg, rgba(109,40,210,0.22) 0, rgba(109,40,210,0.22) 3px, rgba(109,40,210,0.04) 3px, rgba(109,40,210,0.04) 7px)'
const TARGET_RANGE_BORDER = 'var(--color-purple-150)'

const pct = (v: number) => `${(v / SCALE_MAX) * 100}%`
const snap = (v: number) => Math.min(Math.floor(v / 50), 3) * 50 + 25
const bandStart = (v: number) => Math.min(Math.floor(v / 50), 3) * 50
const bandOf = (v: number) => Math.min(Math.floor(v / 50), 3)

interface SkillsProfileChartProps {
  skills: ProfileSkill[]
  state: Record<string, SkillView>
  celebrateId: string | null
  onAssess: (skill: ProfileSkill) => void
}

export function SkillsProfileChart({ skills, state, celebrateId, onAssess }: SkillsProfileChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Hide the proficiency-band labels once the axis is too narrow — right before
  // any band label would collide with a score number. Score numbers stay.
  // (Same behaviour as the goal-page "Skills to develop" chart.)
  const axisRef = useRef<HTMLDivElement>(null)
  const [showBands, setShowBands] = useState(true)
  useEffect(() => {
    const el = axisRef.current
    if (!el) return
    const check = () => {
      const ticks = [...el.querySelectorAll<HTMLElement>('[data-tick]')]
      const bands = [...el.querySelectorAll<HTMLElement>('[data-band]')]
      if (!ticks.length || !bands.length) return
      const PAD = 4 // px breathing room before a real overlap
      const overlap = bands.some((b) => {
        const br = b.getBoundingClientRect()
        return ticks.some((t) => {
          const tr = t.getBoundingClientRect()
          return br.left < tr.right + PAD && br.right + PAD > tr.left
        })
      })
      setShowBands(!overlap)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [skills.length])

  return (
    <div className="flex flex-col gap-md">
      {/* Filters + legend row are rendered by the page; here we render axis + rows */}
      {/* axis */}
      <div className="grid grid-cols-[220px_1fr_120px] items-end gap-sm">
        <div />
        <div ref={axisRef} className="relative h-5 text-xxs text-ink-subdued">
          {TICKS.map((t) => (
            <span key={t} data-tick className="absolute top-0 -translate-x-1/2 tabular-nums" style={{ left: pct(t) }}>
              {t}
            </span>
          ))}
          {BANDS.map((b, i) => (
            <span
              key={b}
              data-band
              className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap transition-opacity"
              style={{ left: pct(25 + i * 50), visibility: showBands ? 'visible' : 'hidden' }}
            >
              {b}
            </span>
          ))}
        </div>
        <div />
      </div>

      {/* chart body — single relative column so gridlines are continuous */}
      <div className="grid grid-cols-[220px_1fr_120px] items-start gap-sm">
        {/* Column 1: skill names */}
        <div className="flex flex-col gap-md">
          {skills.map((s) => (
            <div key={s.id} className="flex h-9 items-center justify-end text-right text-xs font-bold leading-tight text-ink">
              {s.name}
            </div>
          ))}
        </div>

        {/* Column 2: gridlines + bars */}
        <div className="relative flex flex-col gap-md">
          {TICKS.map((t) => (
            <span key={t} className="pointer-events-none absolute top-0 bottom-0 w-px bg-line-subdued" style={{ left: pct(t) }} />
          ))}
          {skills.map((s) => {
            const view = state[s.id] ?? { source: s.source, value: s.current }
            const verified = view.source === 'verified'
            const barValue = verified ? view.value : snap(view.value)
            const barColor = verified ? (view.exceeded ? VERIFIED_GREEN : VERIFIED_PURPLE) : view.source === 'estimated' ? ESTIMATED : SELF_REPORTED
            const band = bandOf(verified ? view.value : view.value)
            const level = BANDS[band]
            const tipTitle = verified
              ? `${view.value} • ${level}`
              : view.source === 'self-reported'
                ? `${level} (Self-reported)`
                : `${level} (Estimated)`
            const tipDate = verified ? 'Apr 2026' : 'Mar 2026'
            return (
              <div
                key={s.id}
                className="relative h-9"
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId((h) => (h === s.id ? null : h))}
              >
                {/* target range — dashed hatch band + purple-150 solid outline */}
                <span
                  className="pointer-events-none absolute top-1/2 h-6 -translate-y-1/2 rounded-none border border-solid"
                  style={{ left: pct(bandStart(s.target)), width: pct(50), background: TARGET_RANGE_BG, borderColor: TARGET_RANGE_BORDER }}
                />
                {/* bar */}
                <div
                  className="absolute top-1/2 left-0 h-3 -translate-y-1/2 rounded-sm transition-[width,background-color] duration-700 ease-out"
                  style={{ width: pct(barValue), background: barColor }}
                />
                {celebrateId === s.id && <Celebration value={barValue} />}
                {hoveredId === s.id && <Tooltip pct={(barValue / SCALE_MAX) * 100} title={tipTitle} date={tipDate} />}
              </div>
            )
          })}
        </div>

        {/* Column 3: Assess / Retake */}
        <div className="flex flex-col gap-md">
          {skills.map((s) => {
            const view = state[s.id] ?? { source: s.source, value: s.current }
            const verified = view.source === 'verified'
            return (
              <div key={s.id} className="flex h-9 items-center justify-center">
                {verified ? (
                  <Button udStyle="ghost" size="xsmall" onClick={() => onAssess(s)} className="w-24 justify-center gap-xs">
                    Retake
                    <RotateCw className="size-3.5" strokeWidth={2} />
                  </Button>
                ) : (
                  <Button udStyle="secondary" size="xsmall" onClick={() => onAssess(s)} className="w-24 justify-center">
                    Assess
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

/** Legend rendered by the page (top-right of the filter row). */
export function SkillsLegend({ anyExceeded }: { anyExceeded: boolean }) {
  const Swatch = ({ color, label }: { color: string; label: string }) => (
    <span className="flex items-center gap-xs">
      <span className="size-3 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  )
  return (
    <div className="flex flex-wrap items-center gap-md text-xs text-ink-subdued">
      <Swatch color={ESTIMATED} label="Estimated" />
      <Swatch color={SELF_REPORTED} label="Self-reported" />
      <Swatch color={VERIFIED_PURPLE} label="Udemy Verified" />
      {anyExceeded && <Swatch color={VERIFIED_GREEN} label="Complete" />}
      <span className="flex items-center gap-xs">
        <span
          className="inline-block h-3 w-6 rounded-none border border-solid"
          style={{ background: TARGET_RANGE_BG, borderColor: TARGET_RANGE_BORDER }}
        />
        Target proficiency
      </span>
    </div>
  )
}

function Tooltip({ pct: p, title, date }: { pct: number; title: string; date: string }) {
  return (
    <div className="pointer-events-none absolute bottom-full z-50 mb-2 -translate-x-1/2" style={{ left: `${p}%` }}>
      <div className="relative whitespace-nowrap rounded-md border border-line-subdued bg-surface px-sm py-xs text-left shadow-[0_4px_16px_rgba(140,134,147,0.24)]">
        <p className="text-xs font-bold leading-tight text-ink">{title}</p>
        <p className="text-xs leading-tight text-ink-subdued">{date}</p>
        <span className="absolute left-1/2 top-full size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-line-subdued bg-surface" />
      </div>
    </div>
  )
}

function Celebration({ value }: { value: number }) {
  return (
    <span className="pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: pct(value) }}>
      <span className="celebrate-ring absolute left-1/2 top-1/2 size-6 rounded-round" style={{ border: `2px solid ${VERIFIED_GREEN}` }} />
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="celebrate-spark absolute left-1/2 top-1/2 leading-none"
          style={
            {
              ['--a']: `${i * 36}deg`,
              ['--d']: `${i % 2 === 0 ? 40 : 28}px`,
              color: VERIFIED_GREEN,
              fontSize: i % 2 === 0 ? 15 : 11,
            } as React.CSSProperties
          }
        >
          ✦
        </span>
      ))}
    </span>
  )
}
