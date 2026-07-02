import { useEffect, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'
import { SKILL_SCALE_MAX, type Skill } from '@/data/goal'
import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/utils'

const GRID_TICKS = [0, 50, 100, 150, 200]
const BANDS = ['Foundational', 'Intermediate', 'Established', 'Advanced']

const pct = (v: number) => `${(v / SKILL_SCALE_MAX) * 100}%`

// Snap estimated/self-reported values to the centre of their proficiency band.
// Udemy-verified scores bypass snapping and show the exact position.
const snapToBandCenter = (v: number) => Math.min(Math.floor(v / 50), 3) * 50 + 25

const ESTIMATED_COLOR = 'var(--color-orange-150)'
const SELF_REPORTED_COLOR = 'var(--color-purple-150)'

interface SkillChartProps {
  skills: Skill[]
  /** Global fallback mode when no per-skill override is set. */
  mode: 'estimated' | 'selfReported'
  /** Per-skill mode overrides. Skills with an entry use their own mode; others fall back to `mode`. */
  perSkillMode?: Record<string, 'estimated' | 'selfReported'>
  /** Show the per-row "Assess" buttons (main page only). */
  showAssess?: boolean
  onAssess?: (skillId: string) => void
  /** When true, bars animate from 0 → their value on mount (custom scenario reveal). */
  animateBars?: boolean
  /** Skill ids whose Assess button becomes primary (reached target — verify via assessment). */
  primaryAssessIds?: Set<string>
  /** Skill ids verified via assessment — dark-green exact-score bar + "Retake" button. */
  verifiedSkillIds?: Set<string>
  /** Skill id to briefly celebrate near its chart row. */
  celebrateSkillId?: string | null
  /** Show the one-time onboarding tooltip anchored to the first primary Assess button. */
  assessOnboardingOpen?: boolean
  onDismissAssessOnboarding?: () => void
  /** Per-skill verified score (0–200) from the assessment; falls back to the default. */
  verifiedScores?: Record<string, number>
  /** How the target proficiency is drawn: a centre dot, or a shaded target-band range. */
  targetStyle?: 'dot' | 'range'
}

/** Default score shown for a verified skill when no per-skill score is given. */
const VERIFIED_SCORE = 148
const VERIFIED_COLOR = '#0e8a5f'
/** Diagonal-hatch fill marking the target proficiency band, with a solid purple-150 outline. */
const TARGET_RANGE_BG =
  'repeating-linear-gradient(45deg, rgba(109,40,210,0.22) 0, rgba(109,40,210,0.22) 3px, rgba(109,40,210,0.04) 3px, rgba(109,40,210,0.04) 7px)'
const TARGET_RANGE_BORDER = 'var(--color-purple-150)'

/** Start (inclusive) of the 50-wide proficiency band containing `v`. */
const bandStart = (v: number) => Math.min(Math.floor(v / 50), 3) * 50

export function SkillChart({ skills, mode, perSkillMode, showAssess = false, onAssess, animateBars, primaryAssessIds, verifiedSkillIds, celebrateSkillId, assessOnboardingOpen, onDismissAssessOnboarding, verifiedScores, targetStyle = 'dot' }: SkillChartProps) {
  // Start bars at 0-width when animating, then transition to real values after mount.
  const [barsVisible, setBarsVisible] = useState(!animateBars)
  useEffect(() => {
    if (!animateBars) return
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setBarsVisible(true)))
    return () => cancelAnimationFrame(id)
  }, [animateBars])
  // Hide the proficiency-band labels once the axis is too narrow — right before
  // any band label would collide with a score number. Score numbers stay.
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

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const effectiveModes = skills.map((s) => perSkillMode?.[s.id] ?? mode)
  const hasSelfReported = effectiveModes.some((m) => m === 'selfReported')
  const hasEstimated = effectiveModes.some((m) => m === 'estimated')

  const cols = showAssess
    ? 'grid-cols-[132px_1fr_92px]'
    : 'grid-cols-[132px_1fr]'

  return (
    <div className="flex flex-col gap-xs-mid">
      {/* axis */}
      <div className={`grid ${cols} items-end gap-sm`}>
        <div />
        <div ref={axisRef} className="relative h-5 text-xxs text-ink-subdued">
          {GRID_TICKS.map((t) => (
            <span
              key={t}
              data-tick
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap tabular-nums"
              style={{ left: pct(t) }}
            >
              {t}
            </span>
          ))}
          {BANDS.map((b, i) => (
            <span
              key={b}
              data-band
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap transition-opacity"
              style={{ left: pct(25 + i * 50), visibility: showBands ? 'visible' : 'hidden' }}
            >
              {b}
            </span>
          ))}
        </div>
        {showAssess && <div />}
      </div>

      {/* chart body — columns are single containers so gridlines are continuous */}
      <div className={`grid ${cols} items-start gap-sm`}>
        {/* Column 1: all skill names */}
        <div className="flex flex-col gap-xs-mid">
          {skills.map((s) => (
            <div
              key={s.id}
              className="flex h-9 items-center justify-end text-right text-xs font-bold leading-tight text-ink"
            >
              {s.name}
            </div>
          ))}
        </div>

        {/* Column 2: single relative container → gridlines span all rows */}
        <div className="relative flex flex-col gap-xs-mid">
          {GRID_TICKS.map((t) => (
            <span
              key={t}
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-line-subdued"
              style={{ left: pct(t) }}
            />
          ))}
          {skills.map((s, i) => {
            const em = effectiveModes[i]
            const verified = !!verifiedSkillIds?.has(s.id)
            const score = verifiedScores?.[s.id] ?? VERIFIED_SCORE
            // Verified: exact assessment score in dark green. Otherwise snapped band centre.
            const barValue = verified ? score : snapToBandCenter(s[em])
            const barColor = verified ? VERIFIED_COLOR : em === 'estimated' ? ESTIMATED_COLOR : SELF_REPORTED_COLOR
            const band = Math.min(Math.floor((verified ? score : s[em]) / 50), 3)
            const level = BANDS[band]
            const tipTitle = verified
              ? `${score} • ${level}`
              : em === 'selfReported'
                ? `${level} (Self-reported)`
                : `${level} (Estimated)`
            const tipDate = verified ? 'Jul 2026' : 'Jun 2026'
            const tBandStart = bandStart(s.target)
            return (
              <div
                key={s.id}
                className="relative h-9"
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId((h) => (h === s.id ? null : h))}
              >
                {/* target proficiency RANGE — shaded band across the target proficiency level */}
                {targetStyle === 'range' && (
                  <span
                    className="pointer-events-none absolute top-1/2 h-6 -translate-y-1/2 rounded-none border border-solid"
                    style={{ left: pct(tBandStart), width: pct(50), background: TARGET_RANGE_BG, borderColor: TARGET_RANGE_BORDER }}
                  />
                )}
                {/* bar */}
                <div
                  className="absolute top-1/2 left-0 h-3 -translate-y-1/2 rounded-sm transition-[width,background-color] duration-700 ease-out"
                  style={{
                    width: barsVisible ? pct(barValue) : '0%',
                    background: barColor,
                  }}
                />
                {/* target proficiency dot (default style) — snapped to band centre. */}
                {targetStyle === 'dot' && (
                  <span
                    className={cn(
                      'absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-round',
                      verified ? 'bg-white shadow-sm' : 'bg-brand',
                    )}
                    style={{ left: pct(snapToBandCenter(s.target)) }}
                  />
                )}
                {/* celebration burst near the bar once the skill is verified */}
                {celebrateSkillId === s.id && <SkillCelebration value={barValue} />}
                {/* hover tooltip — score/level + date, positioned above the bar end */}
                {hoveredId === s.id && <SkillTooltip pct={(barValue / SKILL_SCALE_MAX) * 100} title={tipTitle} date={tipDate} />}
              </div>
            )
          })}
        </div>

        {/* Column 3: assess buttons — primary once a skill has reached target (verify via assessment) */}
        {showAssess && (() => {
          const primaryIdx = skills.findIndex((s) => primaryAssessIds?.has(s.id))
          // Anchor the onboarding tooltip to the first primary Assess button, or the
          // first skill's button when the tooltip is opened without a primary skill.
          const firstPrimaryIdx = primaryIdx >= 0 ? primaryIdx : assessOnboardingOpen ? 0 : -1
          return (
            <div className="flex flex-col gap-xs-mid">
              {skills.map((s, i) => {
                const verified = !!verifiedSkillIds?.has(s.id)
                const isPrimary = !verified && !!primaryAssessIds?.has(s.id)
                return (
                  <div key={s.id} className="relative flex h-9 items-center">
                    <span className="transition-all duration-500">
                      <Button
                        udStyle={verified ? 'ghost' : isPrimary ? 'primary' : 'secondary'}
                        size="xsmall"
                        onClick={() => onAssess?.(s.id)}
                      >
                        {verified ? (
                          <>
                            Retake
                            <RotateCw className="size-3.5" strokeWidth={2.25} />
                          </>
                        ) : (
                          'Assess'
                        )}
                      </Button>
                    </span>
                    {/* One-time onboarding tooltip anchored to the first primary Assess button */}
                    {i === firstPrimaryIdx && assessOnboardingOpen && (
                      <AssessOnboarding onDismiss={onDismissAssessOnboarding} />
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>

      {/* legend — centred across full card width */}
      <div className="flex items-center justify-center gap-md text-xs text-ink-subdued">
        {hasEstimated && (
          <span className="flex items-center gap-xs">
            <span className="size-3 rounded-sm" style={{ background: ESTIMATED_COLOR }} />
            Estimated
          </span>
        )}
        {hasSelfReported && (
          <span className="flex items-center gap-xs">
            <span className="size-3 rounded-sm" style={{ background: SELF_REPORTED_COLOR }} />
            Self-reported
          </span>
        )}
        {targetStyle === 'range' ? (
          <span className="flex items-center gap-xs">
            <span
              className="inline-block h-3 w-6 rounded-none border border-solid"
              style={{ background: TARGET_RANGE_BG, borderColor: TARGET_RANGE_BORDER }}
            />
            Target proficiency
          </span>
        ) : (
          <span className="flex items-center gap-xs">
            <span className="size-2.5 rounded-round bg-brand" />
            Target proficiency
          </span>
        )}
        {skills.some((s) => verifiedSkillIds?.has(s.id)) && (
          <span className="flex items-center gap-xs">
            <span className="size-3 rounded-sm" style={{ background: VERIFIED_COLOR }} />
            Complete
          </span>
        )}
      </div>
    </div>
  )
}

/** Hover tooltip (Figma popover): score/level line + date, above the bar end. */
function SkillTooltip({ pct, title, date }: { pct: number; title: string; date: string }) {
  return (
    <div className="pointer-events-none absolute bottom-full z-50 mb-2 -translate-x-1/2" style={{ left: `${pct}%` }}>
      <div className="relative whitespace-nowrap rounded-md border border-line-subdued bg-surface px-sm py-xs text-left shadow-[0_4px_16px_rgba(140,134,147,0.24)]">
        <p className="text-xs font-bold leading-tight text-ink">{title}</p>
        <p className="text-xs leading-tight text-ink-subdued">{date}</p>
        <span className="absolute left-1/2 top-full size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-line-subdued bg-surface" />
      </div>
    </div>
  )
}

/** Small, tasteful celebration burst positioned at the verified skill's bar end. */
function SkillCelebration({ value }: { value: number }) {
  return (
    <span
      className="pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(value / 200) * 100}%` }}
    >
      <span
        className="celebrate-ring absolute left-1/2 top-1/2 size-6 rounded-round"
        style={{ border: `2px solid ${VERIFIED_COLOR}` }}
      />
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="celebrate-spark absolute left-1/2 top-1/2 leading-none"
          style={{
            ['--a' as string]: `${i * 36}deg`,
            ['--d' as string]: `${i % 2 === 0 ? 40 : 28}px`,
            color: VERIFIED_COLOR,
            fontSize: i % 2 === 0 ? 15 : 11,
          } as React.CSSProperties}
        >
          ✦
        </span>
      ))}
    </span>
  )
}

/** One-time nudge: reached-target skills should be verified with a Udemy assessment. */
function AssessOnboarding({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="animate-altus-fadein absolute right-0 top-full z-50 mt-sm w-[260px] rounded-md border border-line-subdued bg-surface p-sm text-left shadow-[0_4px_16px_rgba(140,134,147,0.2)]">
      {/* arrow pointing up to the Assess button */}
      <span className="absolute -top-1.5 right-7 size-3 rotate-45 border-l border-t border-line-subdued bg-surface" />
      <p className="relative text-xs leading-relaxed text-ink">
        Ready to make it official? Take a quick Udemy assessment to verify a skill and earn official
        certification — your profile and learning path update automatically.
      </p>
      <div className="relative mt-sm flex justify-end">
        <Button udStyle="primary" size="xsmall" onClick={onDismiss}>
          Got it
        </Button>
      </div>
    </div>
  )
}
