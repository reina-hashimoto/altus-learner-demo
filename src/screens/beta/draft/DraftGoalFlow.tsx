import { useEffect, useRef, useState } from 'react'
import { Flag } from 'lucide-react'
import { UBHeader } from '@/components/shell/UBHeader'
import { LeftRail } from '@/components/shell/LeftRail'
import { UdemyIcon } from '@/components/icons/UdemyIcon'
import { SkillsCard } from '@/features/goal/SkillsCard'
import { LearningPathCard } from '@/features/goal/LearningPathCard'
import { AltusPanel, type AltusMessage, type AltusView } from '@/features/goal/altus/AltusPanel'
import { cn } from '@/components/ui/utils'

/**
 * Sample "draft" goal — a personal goal the learner started but hasn't finished
 * setting up yet (no learning path generated). Mirrors the Personal flow's intro
 * step, frozen right after Altus asks for the learner's role: only the goal title
 * shows on the left (no skills/path yet), and the chat has nothing further to do.
 */
const GOAL_TITLE = 'Improve public speaking skills'

export default function DraftGoalFlow() {
  const [messages, setMessages] = useState<AltusMessage[]>([])
  const [panelOpen, setPanelOpen] = useState(true)
  const [panelView, setPanelView] = useState<AltusView>('altus')
  const idRef = useRef(0)
  const nextId = () => `m${++idRef.current}`

  // Same intro drip as the Personal flow: entered goal → greeting → role question.
  useEffect(() => {
    const t1 = setTimeout(() => setMessages([{ id: nextId(), role: 'user', text: GOAL_TITLE, collapsible: true }]), 300)
    const t2 = setTimeout(
      () => setMessages((p) => [...p, { id: nextId(), role: 'assistant', text: 'Great goal! Let’s tailor a plan to you.' }]),
      900,
    )
    const t3 = setTimeout(
      () => setMessages((p) => [...p, { id: nextId(), role: 'assistant', text: "What's your current role?" }]),
      1700,
    )
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text },
      { id: nextId(), role: 'assistant', text: "Thanks! I'll keep building out your plan — check back soon." },
    ])
  }

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <UBHeader />
      <div className="flex flex-1 overflow-hidden">
        <LeftRail />
        <div className="flex flex-1 overflow-hidden">
          {/* Left: goal title, plus static skill/path placeholders (nothing generated yet) */}
          <div className="min-w-0 flex-1 overflow-y-auto bg-surface-pale px-lg py-md">
            <div className="mx-auto flex max-w-[860px] flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <span
                  className="inline-flex w-fit items-center gap-xs rounded-sm px-xs py-0.5 text-xs font-bold text-ink"
                  style={{ background: 'var(--color-orange-150)' }}
                >
                  <Flag className="size-3.5" strokeWidth={2} />
                  Personal goal
                </span>
                <h1 className="text-xxl font-medium leading-tight text-ink">{GOAL_TITLE}</h1>
              </div>

              <SkillsCard skills={[]} role="" mode="estimated" skeleton staticSkeleton />
              <LearningPathCard courses={[]} skeleton staticSkeleton />
            </div>
          </div>

          {/* Right: Altus chat, frozen right after asking for the learner's role */}
          <div
            className={cn('shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out')}
            style={{ width: panelOpen ? 500 : 0 }}
          >
            <div className="h-full" style={{ width: 500 }}>
              <AltusPanel
                messages={messages}
                thinking={false}
                showProficiencyForm={false}
                skills={[]}
                proficiency={{}}
                chips={[]}
                onProficiencyChange={() => {}}
                onProficiencySubmit={() => {}}
                onSend={handleSend}
                onChip={() => {}}
                view={panelView}
                onViewChange={setPanelView}
                onCollapse={() => setPanelOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating pill — visible when the panel is collapsed */}
      {!panelOpen && (
        <div className="fixed right-6 top-[96px] z-50">
          <button
            onClick={() => setPanelOpen(true)}
            aria-label="Open Altus"
            className="flex items-center justify-center rounded-round p-2 shadow-lg"
            style={{ background: 'rgba(200, 202, 225, 0.6)', backdropFilter: 'blur(8px)' }}
          >
            <UdemyIcon name="sparkles" size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
