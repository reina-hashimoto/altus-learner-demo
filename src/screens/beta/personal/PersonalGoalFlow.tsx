import { useCallback, useRef, useState } from 'react'
import { SetupScreen } from './SetupScreen'
import { GoalDetailScreen } from './GoalDetailScreen'
import type { ChatItem } from './AltusPanel'
import type { ProficiencySelections } from './embeds'
import { brain, type AltusAction, type AltusTurn } from './altusBrain'
import {
  POPULATED_SKILLS,
  INITIAL_PATH,
  SWAP_COURSE,
  type SkillRow,
  type PathCourse,
} from './data'

/**
 * Personal goal E2E prototype flow.
 *
 * SCREEN 1 (Setup) → learner types a goal and submits → SCREEN 2 (Goal Detail),
 * a two-column page whose LEFT panel starts as a skeleton and the RIGHT Altus
 * panel runs a scripted conversation. As the conversation advances, the brain
 * returns AltusActions that this component applies to the left-panel state
 * (populate skills, build path, swap a course, confirm the goal).
 *
 * The conversation engine is the pluggable `brain` from `./altusBrain` — today
 * scripted, later server/OpenAI-backed with no changes here.
 */

const SEED_USER_MESSAGE = 'I want to upskill in generative AI'
const THINK_MS = 900

let idSeq = 0
const nextId = () => `m${++idSeq}`

export default function PersonalGoalFlow() {
  const [screen, setScreen] = useState<'setup' | 'detail'>('setup')

  // ── Left-panel (page) state ──
  const [populated, setPopulated] = useState(false)
  const [skills, setSkills] = useState<SkillRow[]>([])
  const [courses, setCourses] = useState<PathCourse[]>([])

  // ── Conversation state ──
  const [items, setItems] = useState<ChatItem[]>([])
  const [thinking, setThinking] = useState(false)

  // ── Embedded-card state ──
  const [proficiency, setProficiency] = useState<ProficiencySelections>({})
  const [proficiencyDone, setProficiencyDone] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)

  // Guard so overlapping sends can't interleave turns.
  const busy = useRef(false)

  /** Apply a single AltusAction to the left-panel state. */
  const applyAction = useCallback((action: AltusAction) => {
    switch (action.type) {
      case 'populateSkills':
        setSkills(POPULATED_SKILLS)
        break
      case 'buildPath':
        setCourses(INITIAL_PATH)
        setPopulated(true)
        break
      case 'setGoalConfirmed':
        setPopulated(true)
        break
      case 'swapCourse':
        setCourses((prev) => {
          const next = [...prev]
          if (next[action.index] && action.courseId === SWAP_COURSE.id) {
            next[action.index] = SWAP_COURSE
          }
          return next
        })
        break
    }
  }, [])

  /** Render one assistant turn: copy + embedded component, applying its actions. */
  const renderTurn = useCallback(
    (turn: AltusTurn) => {
      turn.actions?.forEach(applyAction)
      if (turn.assistant || turn.component) {
        setItems((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', text: turn.assistant, component: turn.component },
        ])
      }
    },
    [applyAction],
  )

  /**
   * Advance the conversation: ask the brain for the next turns and play them
   * with a short "thinking" pause before each. `userText` is the raw composer
   * input (or a synthetic token for embedded-card actions).
   */
  const advance = useCallback(
    async (userText: string) => {
      if (busy.current) return
      busy.current = true
      try {
        const turns = await brain.send(userText)
        for (const turn of turns) {
          setThinking(true)
          await new Promise((r) => setTimeout(r, THINK_MS))
          setThinking(false)
          renderTurn(turn)
        }
      } finally {
        busy.current = false
      }
    },
    [renderTurn],
  )

  /** Composer submit — free typing. Pushes the user bubble, then advances. */
  const onSend = useCallback(
    (text: string) => {
      setItems((prev) => [...prev, { id: nextId(), role: 'user', text }])
      void advance(text)
    },
    [advance],
  )

  /** Setup screen submit → seed first user message and kick off the brain. */
  const onSetupSubmit = useCallback(
    (_goal: string) => {
      void _goal // free-typed goal; the scripted brain ignores the exact text
      setScreen('detail')
      setItems([{ id: nextId(), role: 'user', text: SEED_USER_MESSAGE }])
      void advance(SEED_USER_MESSAGE)
    },
    [advance],
  )

  // ── Embedded-card handlers (act as synthetic sends) ──
  const onProficiencyChange = useCallback((skillId: string, level: number) => {
    setProficiency((prev) => ({ ...prev, [skillId]: level }))
  }, [])

  const onProficiencySave = useCallback(() => {
    setProficiencyDone(true)
    void advance('save proficiency')
  }, [advance])

  const onConfirm = useCallback(() => {
    setReviewDone(true)
    void advance('confirm goal')
  }, [advance])

  if (screen === 'setup') {
    return <SetupScreen onSubmit={onSetupSubmit} />
  }

  return (
    <GoalDetailScreen
      populated={populated}
      skills={skills}
      courses={courses}
      items={items}
      thinking={thinking}
      onSend={onSend}
      proficiency={proficiency}
      proficiencyDone={proficiencyDone}
      onProficiencyChange={onProficiencyChange}
      onProficiencySave={onProficiencySave}
      reviewDone={reviewDone}
      onConfirm={onConfirm}
    />
  )
}
