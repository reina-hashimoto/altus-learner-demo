/**
 * Chat thread model + store for the Altus panel.
 *
 * Behaviour implemented (matches the approved 1b design):
 *  - list all threads, newest first
 *  - switch / create / rename / delete
 *  - sessions expire 90 days after last activity; expired threads are
 *    filtered out of the list automatically. Threads within
 *    WARN_WITHIN_DAYS of expiry surface an "Expires in Nd" badge.
 *  - state is persisted to localStorage so it survives reloads (prototype).
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AltusMessage } from './AltusPanel'

export const EXPIRE_AFTER_DAYS = 90
export const WARN_WITHIN_DAYS = 14
const DAY = 24 * 60 * 60 * 1000
const STORE_KEY_DEFAULT = 'altus.threads.v1'

export interface ChatThread {
  id: string
  title: string
  messages: AltusMessage[]
  createdAt: number
  /** Last activity — drives sort order and the 90-day expiry clock. */
  updatedAt: number
}

/** View model handed to the UI — adds derived, display-ready fields. */
export interface ChatThreadVM extends ChatThread {
  daysLeft: number
  expiresSoon: boolean
  expiryLabel: string
  lastActiveLabel: string
  snippet: string
}

const now = () => Date.now()
const daysLeftOf = (t: ChatThread) =>
  EXPIRE_AFTER_DAYS - Math.floor((now() - t.updatedAt) / DAY)

function relativeLabel(ts: number): string {
  const diff = now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function toVM(t: ChatThread): ChatThreadVM {
  const daysLeft = daysLeftOf(t)
  const last = t.messages[t.messages.length - 1]
  return {
    ...t,
    daysLeft,
    expiresSoon: daysLeft <= WARN_WITHIN_DAYS,
    expiryLabel: `Expires in ${daysLeft}d`,
    lastActiveLabel: relativeLabel(t.updatedAt),
    snippet: last?.text ?? '',
  }
}

const GREETING =
  "Hi, I'm Altus. What would you like to work on or improve today?"

function newThread(): ChatThread {
  const id = 't' + now()
  return {
    id,
    title: 'New chat', // the agent renames this after the first exchange
    messages: [{ id: id + 'g', role: 'assistant', text: GREETING }],
    createdAt: now(),
    updatedAt: now(),
  }
}

function load(seed: () => ChatThread[], storageKey: string): ChatThread[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return seed()
}

/**
 * Generic filler threads shown alongside the flow's own conversation, so the
 * history overlay has more than one row to demo switch/rename/delete/expiry.
 * One is fresh; the other sits inside the 14-day expiry window on purpose so
 * the "Expires in Nd" badge has something to show.
 */
export function makeSampleThreads(): ChatThread[] {
  return [
    {
      id: 'sample-sql',
      title: 'Learn SQL basics',
      messages: [
        { id: 'sample-sql-1', role: 'user', text: 'Can you help me learn SQL joins?' },
        {
          id: 'sample-sql-2',
          role: 'assistant',
          text: "Sure — let's start with INNER JOIN and work up to LEFT/RIGHT JOIN with some practice queries.",
        },
      ],
      createdAt: now() - 6 * DAY,
      updatedAt: now() - 5 * DAY,
    },
    {
      id: 'sample-design-review',
      title: 'Prep for a design review',
      messages: [
        {
          id: 'sample-dr-1',
          role: 'user',
          text: 'I have a design review on Friday — can we run through my talking points?',
        },
        { id: 'sample-dr-2', role: 'assistant', text: 'Of course! Walk me through the key tradeoffs you want feedback on.' },
      ],
      createdAt: now() - 86 * DAY,
      updatedAt: now() - 85 * DAY,
    },
  ]
}

export interface UseChatThreads {
  threads: ChatThreadVM[]
  activeId: string | null
  activeThread: ChatThreadVM | null
  select: (id: string) => void
  create: () => string
  rename: (id: string, title: string) => void
  remove: (id: string) => void
  /** Append a single message onto the currently active thread. */
  appendToActive: (msg: AltusMessage) => void
  /** Bulk-replace a given thread's messages (used to write-through a live,
   *  externally-driven conversation — e.g. the scripted flow's own state —
   *  into the store so it persists/sorts/expires like any other thread). */
  setThreadMessages: (id: string, messages: AltusMessage[]) => void
}

/**
 * @param seed factory for the initial threads (only used when nothing is
 *             persisted). Pass your demo data here.
 * @param storageKey localStorage key — namespace per flow/scenario so each
 *             goal's thread list is independent (defaults to a shared key).
 */
export function useChatThreads(seed: () => ChatThread[], storageKey: string = STORE_KEY_DEFAULT): UseChatThreads {
  const [threads, setThreads] = useState<ChatThread[]>(() => load(seed, storageKey))
  const [activeId, setActiveId] = useState<string | null>(
    () => threads[0]?.id ?? null,
  )

  // Persist.
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(threads))
    } catch {
      /* ignore */
    }
  }, [threads, storageKey])

  // Drop expired sessions, newest-first. Recomputed on every render so a
  // thread silently disappears once it crosses 90 days.
  const visible = useMemo(
    () =>
      threads
        .filter((t) => daysLeftOf(t) > 0)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(toVM),
    [threads],
  )

  // Keep the active id valid (default to the most recent thread).
  useEffect(() => {
    if (!visible.length) {
      if (activeId !== null) setActiveId(null)
      return
    }
    if (!activeId || !visible.some((t) => t.id === activeId)) {
      setActiveId(visible[0].id)
    }
  }, [visible, activeId])

  const select = useCallback((id: string) => setActiveId(id), [])

  const create = useCallback(() => {
    const t = newThread()
    setThreads((prev) => [t, ...prev])
    setActiveId(t.id)
    return t.id
  }, [])

  const rename = useCallback((id: string, title: string) => {
    const clean = title.trim()
    if (!clean) return
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: clean } : t)),
    )
  }, [])

  const remove = useCallback((id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const appendToActive = useCallback(
    (msg: AltusMessage) => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, messages: [...t.messages, msg], updatedAt: now() } : t,
        ),
      )
    },
    [activeId],
  )

  const setThreadMessages = useCallback((id: string, messages: AltusMessage[]) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, messages, updatedAt: now() } : t)),
    )
  }, [])

  const activeThread = visible.find((t) => t.id === activeId) ?? null

  return {
    threads: visible,
    activeId,
    activeThread,
    select,
    create,
    rename,
    remove,
    appendToActive,
    setThreadMessages,
  }
}
