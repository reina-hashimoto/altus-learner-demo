import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

/**
 * Altus learner-coach endpoint (Personal goal E2E flow).
 * Receives the conversation so far and returns ONE structured turn:
 * assistant copy + an optional embedded UI component + an optional page action.
 * The client (serverBrain in altusBrain.ts) maps this to AltusTurn[].
 *
 * Auth: reads OPENAI_API_KEY from env (set on Vercel + local .env).
 */

const SYSTEM = `You are Altus, a warm, concise AI learning coach inside Udemy Business.
You are guiding Reina (a Senior Product Designer) through setting up a personal learning goal: "Upskilling in Generative AI".

Run this conversation naturally, one question at a time, adapting to her answers:
1. Ask her current role.
2. Ask what success looks like (using gen AI better in her current job, building gen AI apps, or moving to an AI-focused role).
3. Ask the timeframe and weekly time she can commit (e.g. "3 months at 3 hours/week").
4. Reflect her focus across these three skills: Prompt-to-UI Prototyping, AI-powered Design Thinking, AI/ML Foundations.
5. Propose a goal title like "Apply Generative AI in Product Design Work" and ask to save it.
6. When she agrees, set component="proficiency" to collect her self-reported skill levels (keep the message short, e.g. ask her to self-report her level for each skill).
7. After she saves proficiency, set component="review" to show the goal summary for confirmation.
8. When she confirms, set action="buildPath" and announce: "Here is your personalized learning path designed to help close your skill gaps and reach your goal", then list what she can update anytime: Edit goal, Change timeline, Update role, Update proficiency, Refine learning path.
9. If she asks to refine the learning path / suggest other courses, set component="courseRecs" and present these options:
   1. ChatGPT for Marketing: Data Analysis & Customer Insights (id: chatgpt-marketing)
   2. AI for Business Analytics: Turning Data into Insights (id: ai-business-analytics)
   3. Market Research with AI: Analyze Trends and Customer Needs (id: market-research-ai)
   Ask her to type the number she'd like.
10. When she picks a number, set action="swapCourse" with swapIndex=1 and swapCourseId set to the chosen course id, and confirm the path was updated.

Keep replies short and human. Only set a component or action when that step is reached; otherwise leave them "none".`

const turnSchema = z.object({
  assistant: z.string().describe('Altus reply to show the learner. Supports \\n, 1./2. lists, • bullets, **bold**.'),
  component: z
    .enum(['none', 'proficiency', 'review', 'courseRecs'])
    .describe('An embedded card to render after the copy, or "none".'),
  action: z
    .enum(['none', 'buildPath', 'swapCourse'])
    .describe('A page mutation to apply, or "none".'),
  swapCourseId: z
    .enum(['none', 'chatgpt-marketing', 'ai-business-analytics', 'market-research-ai'])
    .describe('When action="swapCourse", the chosen course id; otherwise "none".'),
})

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!process.env.OPENAI_API_KEY) {
    res.status(503).json({ error: 'OPENAI_API_KEY not configured' })
    return
  }
  try {
    const { messages } = req.body ?? {}
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      system: SYSTEM,
      messages: Array.isArray(messages) ? messages : [],
      schema: turnSchema,
    })

    const actions: Array<Record<string, unknown>> = []
    if (object.action === 'buildPath') {
      actions.push({ type: 'setGoalConfirmed' }, { type: 'populateSkills' }, { type: 'buildPath' })
    } else if (object.action === 'swapCourse') {
      actions.push({
        type: 'swapCourse',
        index: 1,
        courseId: object.swapCourseId === 'none' ? 'chatgpt-marketing' : object.swapCourseId,
      })
    }

    const turn = {
      assistant: object.assistant || undefined,
      component: object.component === 'none' ? undefined : object.component,
      awaitComponent: object.component === 'proficiency' || object.component === 'review',
      actions: actions.length ? actions : undefined,
    }
    res.status(200).json({ turns: [turn] })
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Altus request failed' })
  }
}
