/**
 * Altus brain — the pluggable conversation engine for the Personal goal flow.
 *
 * The flow component does NOT hard-code the conversation. It holds page state
 * (skeleton flags, skills, courses, goal meta) and drives the dialogue by
 * calling `brain.send(userText)`. Each call returns an ordered list of
 * `AltusTurn`s; the flow renders the assistant text / embedded components and
 * APPLIES the `actions` to mutate the left panel.
 *
 * This seam is intentionally provider-agnostic. Today it is backed by
 * `createScriptedBrain()` (a deterministic, stage-by-stage script). Later it
 * will be swapped for a server-backed brain that streams from OpenAI — see the
 * `createServerBrain()` TODO at the bottom of this file. The flow imports a
 * single `brain` and never needs to change when the implementation does.
 */

/** A side effect the flow should apply to the left panel / page state. */
export type AltusAction =
  | { type: 'populateSkills' } // fill the "Skills to develop" chart
  | { type: 'buildPath' } // build the initial 3-course learning path
  | { type: 'swapCourse'; index: number; courseId: string } // replace a course in the path
  | { type: 'setGoalConfirmed' } // mark the goal as confirmed (header populates)

/** Embedded interactive cards Altus can render inside its panel. */
export type AltusComponent = 'proficiency' | 'review' | 'courseRecs'

/** One assistant turn: optional copy, an optional embedded card, side effects. */
export interface AltusTurn {
  /** Assistant copy. Supports `\n` newlines, `1.`/`2.` numbered lists, **bold**. */
  assistant?: string
  /** An embedded interactive component to render after the copy. */
  component?: AltusComponent
  /** Page-state mutations the flow should apply when this turn lands. */
  actions?: AltusAction[]
  /**
   * When true the flow waits for the embedded component to resolve (proficiency
   * "Save and continue", review "Confirm") before requesting the next turns,
   * instead of waiting for free-typed composer input.
   */
  awaitComponent?: boolean
}

export interface AltusBrain {
  /**
   * Advance the conversation. `userText` is whatever the learner typed (or a
   * synthetic token like the chosen course number / "save" / "confirm"). The
   * scripted brain ignores the exact text and advances one stage per call.
   */
  send(userText: string): Promise<AltusTurn[]>
}

// ── Scripted brain ─────────────────────────────────────────────────────────

/**
 * The exact, ordered conversation for the Personal goal prototype. Each entry
 * is the set of turns Altus emits in response to the Nth `send()`. The brain is
 * stateful only in its stage counter; it ignores the user's exact words.
 */
const SCRIPT: AltusTurn[][] = [
  // send #1 (after the seeded first user message "I want to upskill in generative AI")
  [
    {
      assistant:
        'Let’s make sure the plan fits your role and current proficiency. What is your role?',
    },
  ],
  // send #2 — U: "Senior Product Designer"
  [
    {
      assistant:
        'What would success look like for you here: using gen AI better in your current job, building gen AI applications, or moving toward a more AI-focused role?',
    },
  ],
  // send #3 — U: "Using gen AI better in your current job as Senior Product Designer"
  [
    {
      assistant:
        'One quick question so I can make this realistic and specific: what timeframe and weekly time can you commit — for example, 3 months at 3 hours/week?',
    },
  ],
  // send #4 — U: "End of the June and 2 hours per week"
  [
    {
      assistant:
        'By “using gen AI better” as a Senior Product Designer, is your main focus more on:\n1. Prompt-to-UI Prototyping\n2. AI-powered Design Thinking\n3. AI/ML Foundations\nLet me know if you’d like to refine your goal further.',
    },
  ],
  // send #5 — U: "Looks good"
  [
    {
      assistant:
        'Great — I have the focus areas. One last thing: would you like the goal title to be something like “Apply Generative AI in Product Design Work” and save it now?',
    },
  ],
  // send #6 — U: "Yes makes sense" → render the proficiency card and wait for it
  [
    {
      assistant:
        'There are 2 skills where we need your input to determine your current proficiency.\nPlease self-report your level for each skill. If you’re unsure, check the level definitions — or skip for now.',
      component: 'proficiency',
      awaitComponent: true,
    },
  ],
  // send #7 — proficiency saved → "Review your goal" card, wait for Confirm
  [
    {
      component: 'review',
      awaitComponent: true,
    },
  ],
  // send #8 — Confirm → populate the left panel + Altus wrap-up copy
  [
    {
      actions: [{ type: 'setGoalConfirmed' }, { type: 'populateSkills' }, { type: 'buildPath' }],
      assistant:
        'Here is your personalized learning path designed to help close your skill gaps and reach your goal',
    },
    {
      assistant:
        'If you need to make any changes, you can update these anytime, so just let me know. You can update the following:\n• Edit goal\n• Change timeline\n• Update role\n• Update proficiency\n• Refine learning path',
    },
  ],
  // send #9 — U: "Refine learning path"
  [
    {
      assistant: 'How you would like to refine it?',
    },
  ],
  // send #10 — U: "The 2nd course seems a bit off. Can you suggest other courses?"
  [
    {
      assistant: 'Here are a few courses that could be a better fit:',
      component: 'courseRecs',
    },
    {
      assistant:
        '1. ChatGPT for Marketing: Data Analysis & Customer Insights\n2. AI for Business Analytics: Turning Data into Insights\n3. Market Research with AI: Analyze Trends and Customer Needs\nPlease type the number you’d like to choose.',
    },
  ],
  // send #11 — U types "1" → swap the 2nd course in the path
  [
    {
      actions: [{ type: 'swapCourse', index: 1, courseId: 'chatgpt-marketing' }],
      assistant:
        'Done — I’ve updated your learning path. The second course is now “ChatGPT for Marketing: Data Analysis & Customer Insights”. Let me know if you’d like any other changes.',
    },
  ],
]

export function createScriptedBrain(): AltusBrain {
  let stage = 0
  return {
    async send(_userText: string): Promise<AltusTurn[]> {
      void _userText // the script advances on each send, regardless of content
      const turns = SCRIPT[stage] ?? []
      if (stage < SCRIPT.length) stage += 1
      return turns
    },
  }
}

// ── Server brain (OpenAI via /api/altus) ─────────────────────────────────────

/**
 * Server-backed brain. Keeps the running message history client-side, POSTs it
 * to `/api/altus` (which calls OpenAI), and maps the structured turn back to
 * `AltusTurn[]`. Falls back to the scripted brain on any error (missing key,
 * offline, local dev without `vercel dev`) so the prototype always works.
 */
export function createServerBrain(opts: { endpoint?: string } = {}): AltusBrain {
  const endpoint = opts.endpoint ?? '/api/altus'
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []
  const fallback = createScriptedBrain()

  return {
    async send(userText: string): Promise<AltusTurn[]> {
      messages.push({ role: 'user', content: userText })
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        })
        if (!res.ok) throw new Error(`altus ${res.status}`)
        const data = (await res.json()) as { turns: AltusTurn[] }
        const turns = data.turns ?? []
        const assistantText = turns.map((t) => t.assistant).filter(Boolean).join('\n\n')
        if (assistantText) messages.push({ role: 'assistant', content: assistantText })
        return turns
      } catch {
        // Graceful degradation → deterministic script.
        return fallback.send(userText)
      }
    },
  }
}

/**
 * The single brain the flow imports. Uses the OpenAI-backed server brain, which
 * transparently falls back to the scripted conversation if the API is
 * unavailable. Swap to `createScriptedBrain()` to force the offline script.
 */
export const brain: AltusBrain = createServerBrain()
