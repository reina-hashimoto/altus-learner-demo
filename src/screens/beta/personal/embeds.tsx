/**
 * Embedded Altus-panel pieces for the Personal goal flow: the typing indicator,
 * assistant-copy renderer (newlines + numbered lists + **bold**), the
 * skill-proficiency card, the review-goal card, and the course-recommendation
 * cards. All local to this directory.
 */
import { Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/utils'
import altusLogo from '@/assets/altus-logo.png'
import {
  PROFICIENCY_LEVELS,
  PROFICIENCY_SKILLS,
  COURSE_RECS,
  type ProficiencySkill,
} from './data'

// ── "Altus is thinking" typing indicator ────────────────────────────────────

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-xs py-xxs animate-altus-fadein" role="status" aria-live="polite">
      <img
        src={altusLogo}
        alt="Altus"
        className="size-[56px] shrink-0 object-contain"
        style={{ animation: 'foxPulse 1s ease-in-out infinite' }}
      />
      <span className="-ml-[14px] text-sm font-medium text-ink-subdued">Altus is thinking</span>
      <span className="flex items-center gap-xxs" aria-hidden>
        {[
          { bg: 'var(--color-purple-400)', delay: '0ms' },
          { bg: 'var(--color-purple-200)', delay: '120ms' },
          { bg: 'var(--color-purple-200)', delay: '240ms' },
        ].map((d, i) => (
          <span
            key={i}
            className="size-2 rounded-round"
            style={{ background: d.bg, animation: `altusFadeIn 500ms ease-in-out ${d.delay} infinite alternate` }}
          />
        ))}
      </span>
    </div>
  )
}

// ── Assistant copy renderer (newlines + numbered/bulleted lists + **bold**) ──

/** Render `**bold**` spans within a single line. */
function renderInline(text: string, keyBase: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${keyBase}-${i}`} className="font-bold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={`${keyBase}-${i}`}>{part}</Fragment>
    ),
  )
}

export function AssistantCopy({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="flex flex-col gap-xxs text-sm leading-relaxed text-ink">
      {lines.map((line, i) => {
        const numbered = line.match(/^(\d+)\.\s+(.*)$/)
        const bulleted = line.match(/^[•\-]\s+(.*)$/)
        if (numbered) {
          return (
            <div key={i} className="flex gap-xs">
              <span className="font-bold tabular-nums">{numbered[1]}.</span>
              <span>{renderInline(numbered[2], `l${i}`)}</span>
            </div>
          )
        }
        if (bulleted) {
          return (
            <div key={i} className="flex gap-xs">
              <span className="mt-[7px] size-1 shrink-0 rounded-round bg-ink-subdued" />
              <span>{renderInline(bulleted[1], `l${i}`)}</span>
            </div>
          )
        }
        return <p key={i}>{renderInline(line, `l${i}`)}</p>
      })}
    </div>
  )
}

// ── Skill proficiency card (step 6) ──────────────────────────────────────────

export type ProficiencySelections = Record<string, number>

function SkillRowEditor({
  skill,
  index,
  value,
  onChange,
}: {
  skill: ProficiencySkill
  index: number
  value: number | undefined
  onChange: (level: number) => void
}) {
  const locked = !!skill.locked
  const selected = locked ? skill.presetLevel : value
  return (
    <div className={cn('flex flex-col gap-xs', locked && 'opacity-60')}>
      <div className="flex items-center gap-xs">
        <span className="flex size-5 items-center justify-center rounded-round bg-surface-midtone text-xxs font-bold text-ink-subdued">
          {index + 1}
        </span>
        <span className="text-sm font-bold text-ink">{skill.name}</span>
        {locked && skill.lockedLabel && (
          <span className="rounded-sm bg-surface-accent px-xs py-xxs text-xxs font-bold text-brand">
            {skill.lockedLabel}
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-xs">
        {PROFICIENCY_LEVELS.map((level, idx) => (
          <button
            key={level}
            type="button"
            disabled={locked}
            onClick={() => onChange(idx)}
            className={cn(
              'rounded-sm px-xs py-xs text-xs font-bold transition-colors',
              selected === idx
                ? 'bg-brand text-on-brand'
                : 'bg-surface-pale text-ink hover:bg-surface-midtone',
              locked && 'cursor-not-allowed',
            )}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SkillProficiencyCard({
  values,
  onChange,
  onSave,
  done,
}: {
  values: ProficiencySelections
  onChange: (skillId: string, level: number) => void
  onSave: () => void
  done: boolean
}) {
  // Only the non-locked skills require input.
  const editable = PROFICIENCY_SKILLS.filter((s) => !s.locked)
  const complete = editable.every((s) => values[s.id] !== undefined)
  return (
    <section className="rounded-lg bg-surface p-md shadow-[var(--box-shadow-100)]">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium text-ink">Skill proficiency</h3>
        <button className="text-sm font-bold text-link hover:underline">Level definitions</button>
      </div>
      <div className="mt-md flex flex-col gap-md">
        {PROFICIENCY_SKILLS.map((skill, i) => (
          <SkillRowEditor
            key={skill.id}
            skill={skill}
            index={i}
            value={values[skill.id]}
            onChange={(level) => onChange(skill.id, level)}
          />
        ))}
        <div className="flex justify-end">
          <Button udStyle="secondary" disabled={!complete || done} onClick={onSave}>
            {done ? 'Saved' : 'Save and continue'}
          </Button>
        </div>
      </div>
    </section>
  )
}

// ── Review goal card (step 7) ────────────────────────────────────────────────

export interface GoalReview {
  role: string
  targetDate: string
  weeklyTime: string
  skills: { name: string; level: string; source: string }[]
}

export const REVIEW: GoalReview = {
  role: 'Senior Product Designer',
  targetDate: 'August 31, 2026',
  weeklyTime: '10 hours',
  skills: [
    { name: 'Prompt-to-UI Prototyping', level: 'Intermediate', source: 'Udemy Assessed' },
    { name: 'AI-powered Design Thinking', level: 'Foundational', source: 'Self-reported' },
    { name: 'AI/ML Foundations', level: 'Foundational', source: 'Estimated' },
  ],
}

export function ReviewGoalCard({
  review,
  onConfirm,
  done,
}: {
  review: GoalReview
  onConfirm: () => void
  done: boolean
}) {
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col gap-xxs">
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="text-sm text-ink-subdued">{value}</span>
    </div>
  )
  return (
    <section className="rounded-lg bg-surface p-md shadow-[var(--box-shadow-100)]">
      <h3 className="text-md font-medium text-ink">Review your goal</h3>
      <div className="mt-md flex flex-col gap-sm rounded-lg border border-line-subdued p-md">
        <Row label="Current role" value={review.role} />
        <Row label="Target date" value={review.targetDate} />
        <Row label="Weekly study time" value={review.weeklyTime} />
        <div className="flex flex-col gap-xs">
          <span className="text-sm font-bold text-ink">Target Skills ({review.skills.length})</span>
          {review.skills.map((s) => (
            <div key={s.name} className="flex flex-wrap items-center gap-xs text-xs">
              <span className="inline-flex items-center rounded-sm border border-line px-xs py-xxs font-medium text-ink">
                {s.name}
              </span>
              <span className="text-ink-subdued">{s.level}</span>
              <span className="text-ink-subdued">·</span>
              <span className="text-ink-subdued">{s.source}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-md flex justify-end">
        <Button udStyle="secondary" disabled={done} onClick={onConfirm}>
          {done ? 'Confirmed' : 'Confirm'}
        </Button>
      </div>
    </section>
  )
}

// ── Course recommendation cards (step 10) ────────────────────────────────────

export function CourseRecCards() {
  return (
    <div className="flex flex-col gap-sm">
      {COURSE_RECS.map((c) => (
        <article key={c.id} className="flex flex-col gap-sm rounded-lg bg-surface p-md shadow-[var(--box-shadow-100)]">
          <div className="flex gap-sm">
            <img src={c.image} alt="" className="size-14 shrink-0 rounded-md object-cover" />
            <div className="flex flex-1 flex-col gap-xxs">
              <h4 className="text-sm font-bold leading-tight text-ink">{c.title}</h4>
              <p className="text-xs text-ink-subdued">{c.instructor}</p>
              <div className="flex flex-wrap gap-xs">
                <span className="rounded-sm bg-surface-midtone px-xs py-xxs text-xxs font-bold text-ink-subdued">
                  {c.duration}
                </span>
                <span className="rounded-sm bg-surface-midtone px-xs py-xxs text-xxs font-bold text-ink-subdued">
                  {c.level}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-md bg-surface-pale p-sm">
            <p className="text-xs font-bold text-ink">Why it’s a good fit</p>
            <p className="mt-xxs text-xs leading-relaxed text-ink-subdued">
              {c.whyFit}{' '}
              <button className="font-bold text-link hover:underline">Read more</button>
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
