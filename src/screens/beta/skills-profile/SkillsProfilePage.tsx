/**
 * Skills profile page (Sales Representative). A collapsible left nav + a
 * skills chart with per-skill Assess/Retake:
 *  - estimated skill → Set-proficiency modal (no matching assessment)
 *  - other skills → the shared Udemy assessment flow; the result either exceeds
 *    the target (green bar + sparkle) or lands below it (Udemy-Verified purple).
 * Filters (Topic / Learning goal / Assessment type) narrow the chart; the role
 * pencil opens the Update-role modal.
 */
import { useState } from 'react'
import { Lightbulb, User, Pencil, X } from 'lucide-react'
import { UBHeader } from '@/components/shell/UBHeader'
import { AssessmentModal } from '@/features/goal/AssessmentModal'
import type { Skill } from '@/data/goal'
import { CollapsibleNav } from './CollapsibleNav'
import { SkillsProfileChart, SkillsLegend, type SkillView } from './SkillsProfileChart'
import { FilterDropdown } from './FilterDropdown'
import { SetProficiencyModal, UpdateRoleModal } from './SkillsProfileModals'
import {
  SALES_SKILLS,
  TOPIC_OPTIONS,
  GOAL_OPTIONS,
  SOURCE_OPTIONS,
  PROFILE_ROLE_DEFAULT,
  roleSeniorityBump,
  clampTarget,
  type ProfileSkill,
} from './data'

const bandCenter = (levelIdx: number) => levelIdx * 50 + 25

export default function SkillsProfilePage() {
  const [navOpen, setNavOpen] = useState(true)
  const [role, setRole] = useState(PROFILE_ROLE_DEFAULT)

  // Per-skill dynamic state (source + value + exceeded), seeded from the data.
  const [state, setState] = useState<Record<string, SkillView>>(() =>
    Object.fromEntries(SALES_SKILLS.map((s) => [s.id, { source: s.source, value: s.current }])),
  )
  const [celebrateId, setCelebrateId] = useState<string | null>(null)

  // Modals.
  const [assessSkill, setAssessSkill] = useState<ProfileSkill | null>(null)
  const [proficiencySkill, setProficiencySkill] = useState<ProfileSkill | null>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  // "Make it official" assessment nudge — dismissed once via "Got it".
  const [assessTipDismissed, setAssessTipDismissed] = useState(false)

  // Filters.
  const [topics, setTopics] = useState<Set<string>>(new Set())
  const [goals, setGoals] = useState<Set<string>>(new Set())
  const [sources, setSources] = useState<Set<string>>(new Set()) // stores SkillSource values
  const [openFilter, setOpenFilter] = useState<'topic' | 'goal' | 'type' | null>(null)

  // Target proficiency rises with role seniority (Senior/Staff/Principal/…).
  const targetBump = roleSeniorityBump(role)
  const skills = SALES_SKILLS.map((s) => ({ ...s, target: clampTarget(s.target + targetBump) }))

  const anyExceeded = skills.some((s) => state[s.id]?.exceeded)

  // Filter: AND across facets, OR within. Assessment-type filters by CURRENT source.
  const visibleSkills = skills.filter((s) => {
    if (topics.size && !topics.has(s.topic)) return false
    if (goals.size && !goals.has(s.goal)) return false
    if (sources.size && !sources.has(state[s.id]?.source ?? s.source)) return false
    return true
  })

  // Skills that reached target via self-report (not yet verified) → Assess button
  // turns primary + a one-time "make it official" tooltip until acknowledged.
  const bandIdx = (v: number) => Math.min(Math.floor(v / 50), 3)
  const primaryAssessIds = new Set(
    skills
      .filter((s) => {
        const view = state[s.id] ?? { source: s.source, value: s.current }
        return view.source === 'self-reported' && bandIdx(view.value) >= bandIdx(s.target)
      })
      .map((s) => s.id),
  )
  const visiblePrimaryExists = visibleSkills.some((s) => primaryAssessIds.has(s.id))

  // ── Assess / Retake ──
  const onAssess = (skill: ProfileSkill) => {
    const cur = state[skill.id] ?? { source: skill.source, value: skill.current }
    if (cur.source === 'estimated') {
      setProficiencySkill(skill) // no matching assessment → self-report modal
    } else {
      setAssessSkill(skill) // matching assessment → assessment flow
    }
  }

  const completeAssessment = () => {
    const skill = assessSkill
    setAssessSkill(null)
    if (!skill) return
    const score = skill.assessScore ?? 148
    const exceeded = score >= skill.target
    setState((prev) => ({ ...prev, [skill.id]: { source: 'verified', value: score, exceeded } }))
    // Sparkle only when the score exceeds the target (green). Below-target verified
    // just animates to the purple Udemy-Verified bar.
    if (exceeded) {
      window.setTimeout(() => {
        setCelebrateId(skill.id)
        window.setTimeout(() => setCelebrateId(null), 1500)
      }, 700)
    }
  }

  const applyProficiency = (levelIdx: number) => {
    const skill = proficiencySkill
    setProficiencySkill(null)
    if (!skill) return
    setState((prev) => ({ ...prev, [skill.id]: { source: 'self-reported', value: bandCenter(levelIdx) } }))
  }

  // Minimal Skill for the shared AssessmentModal (reads name + target).
  const assessSkillForModal: Skill | null = assessSkill
    ? { id: assessSkill.id, name: assessSkill.name, description: assessSkill.description, estimated: assessSkill.current, selfReported: assessSkill.current, target: assessSkill.target }
    : null

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <UBHeader />
      <div className="flex flex-1 overflow-hidden">
        <CollapsibleNav active="skills-profile" open={navOpen} onToggle={() => setNavOpen((o) => !o)} />

        <main className="flex-1 overflow-y-auto bg-surface px-xl py-lg">
          <div className="mx-auto flex max-w-[1080px] flex-col gap-lg">
            {/* Title + role */}
            <div className="flex items-start justify-between gap-md">
              <h1 className="text-2xl font-bold text-ink">Skills profile</h1>
              <div className="flex items-center gap-xs text-sm">
                <User className="size-4 text-ink-subdued" strokeWidth={1.75} />
                <span className="font-medium text-ink">{role}</span>
                <button
                  onClick={() => setRoleModalOpen(true)}
                  aria-label="Update role"
                  className="ml-xxs cursor-pointer text-ink-subdued hover:text-brand"
                >
                  <Pencil className="size-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Take a skills assessment banner */}
            <div className="flex items-start gap-sm rounded-lg bg-surface-accent px-md py-md">
              <Lightbulb className="mt-xxs size-6 shrink-0 text-brand" strokeWidth={2} />
              <div>
                <p className="text-md font-bold text-ink">Take a skills assessment</p>
                <p className="text-sm text-ink-subdued">
                  Refine your skills profile and receive a more personalized learning path to reach your goals faster.
                </p>
              </div>
            </div>

            {/* Filters + legend */}
            <div className="flex flex-wrap items-center justify-between gap-md">
              <div className="flex flex-wrap items-center gap-sm">
                <FilterDropdown
                  label="Topic"
                  options={TOPIC_OPTIONS}
                  selected={topics}
                  onToggleOption={(o) => setTopics((s) => toggle(s, o))}
                  onSelectAll={() => setTopics((s) => (s.size === TOPIC_OPTIONS.length ? new Set() : new Set(TOPIC_OPTIONS)))}
                  onClear={() => setTopics(new Set())}
                  open={openFilter === 'topic'}
                  onOpenChange={(o) => setOpenFilter(o ? 'topic' : null)}
                />
                <FilterDropdown
                  label="Learning goal"
                  options={GOAL_OPTIONS}
                  selected={goals}
                  onToggleOption={(o) => setGoals((s) => toggle(s, o))}
                  onSelectAll={() => setGoals((s) => (s.size === GOAL_OPTIONS.length ? new Set() : new Set(GOAL_OPTIONS)))}
                  onClear={() => setGoals(new Set())}
                  open={openFilter === 'goal'}
                  onOpenChange={(o) => setOpenFilter(o ? 'goal' : null)}
                />
                <FilterDropdown
                  label="Assessment type"
                  options={SOURCE_OPTIONS.map((o) => o.label)}
                  selected={new Set([...sources].map((v) => SOURCE_OPTIONS.find((o) => o.value === v)?.label ?? v))}
                  onToggleOption={(label) => {
                    const val = SOURCE_OPTIONS.find((o) => o.label === label)?.value ?? label
                    setSources((s) => toggle(s, val))
                  }}
                  onSelectAll={() =>
                    setSources((s) => (s.size === SOURCE_OPTIONS.length ? new Set() : new Set(SOURCE_OPTIONS.map((o) => o.value))))
                  }
                  onClear={() => setSources(new Set())}
                  open={openFilter === 'type'}
                  onOpenChange={(o) => setOpenFilter(o ? 'type' : null)}
                />
              </div>
              <SkillsLegend anyExceeded={anyExceeded} />
            </div>

            {/* Chart */}
            {visibleSkills.length > 0 ? (
              <SkillsProfileChart
                skills={visibleSkills}
                state={state}
                celebrateId={celebrateId}
                onAssess={onAssess}
                primaryIds={primaryAssessIds}
                onboardingOpen={visiblePrimaryExists && !assessTipDismissed}
                onDismissOnboarding={() => setAssessTipDismissed(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-xs rounded-lg border border-line-subdued py-2xl text-center">
                <p className="text-md font-bold text-ink">No skills match your filters</p>
                <button
                  onClick={() => {
                    setTopics(new Set())
                    setGoals(new Set())
                    setSources(new Set())
                  }}
                  className="flex items-center gap-xxs text-sm font-bold text-brand hover:underline"
                >
                  <X className="size-3.5" strokeWidth={2.5} /> Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {assessSkillForModal && (
        <AssessmentModal
          skill={assessSkillForModal}
          score={assessSkill?.assessScore ?? 148}
          goal={{
            title: assessSkill?.name ?? '',
            deadline: '',
            skills: [assessSkill?.name ?? ''],
            isOrg: false,
            completed: 1,
            total: 1,
          }}
          onClose={() => setAssessSkill(null)}
          onComplete={completeAssessment}
        />
      )}

      {proficiencySkill && (
        <SetProficiencyModal skill={proficiencySkill} onCancel={() => setProficiencySkill(null)} onUpdate={applyProficiency} />
      )}

      {roleModalOpen && (
        <UpdateRoleModal
          currentRole={role}
          onCancel={() => setRoleModalOpen(false)}
          onUpdate={(r) => {
            setRole(r)
            setRoleModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}
