import { useState } from 'react'
import { List, Plus, Search, X, MoreVertical, Pencil, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/utils'
import type { ChatThreadVM } from './chatThreads'

/**
 * Approved 1b design — slide-in chat history for the Altus panel.
 *
 * Files to add:
 *   src/features/goal/altus/ChatHistory.tsx   ← this file
 *   src/features/goal/altus/chatThreads.ts    ← the store/hook
 *
 * All colours/spacing come from the existing Udemy semantic Tailwind tokens
 * (bg-surface, text-ink, border-line, rounded-md, gap-sm, …) — no raw hex.
 */

/* ── Thread-bar buttons (live in the AltusPanel top bar) ─────────────────── */
/* Udemy IconButton, size "small" (h-8), udStyle "secondary" (1px brand border,
   brand icon). If you have the real DS IconButton, swap these for
   <IconButton udStyle="secondary" size="small" …/>. */

export function HistoryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Chat history"
      title="Chat history"
      className="flex size-8 shrink-0 items-center justify-center rounded-md border border-brand bg-surface text-brand transition-colors hover:bg-surface-accent"
    >
      <List className="size-[18px]" strokeWidth={2} />
    </button>
  )
}

export function NewChatButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="New chat"
      title="New chat"
      className="flex size-8 shrink-0 items-center justify-center rounded-md border border-brand bg-surface text-brand transition-colors hover:bg-surface-accent"
    >
      <Plus className="size-[18px]" strokeWidth={2} />
    </button>
  )
}

/* ── History overlay ─────────────────────────────────────────────────────── */

interface ChatHistoryProps {
  open: boolean
  threads: ChatThreadVM[]
  activeId: string | null
  onClose: () => void
  onSelect: (id: string) => void
  onCreate: () => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}

export function ChatHistory(props: ChatHistoryProps) {
  const { open, threads, activeId } = props
  const [query, setQuery] = useState('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  if (!open) return null

  const q = query.trim().toLowerCase()
  const list = threads.filter((t) => !q || t.title.toLowerCase().includes(q))
  const confirmTitle = threads.find((t) => t.id === confirmId)?.title ?? ''

  const select = (id: string) => {
    props.onSelect(id)
    props.onClose()
  }
  const startRename = (id: string) => {
    setMenuId(null)
    setRenameId(id)
  }
  const commitRename = (id: string, value: string) => {
    props.onRename(id, value)
    setRenameId(null) // ← returns to the list view
  }

  return (
    <div className="animate-altus-fadein absolute inset-0 z-20 flex flex-col bg-surface">
      {/* header */}
      <div className="flex shrink-0 items-center gap-xs border-b border-line-subdued p-sm">
        <button
          onClick={props.onClose}
          aria-label="Close"
          className="flex size-8 items-center justify-center rounded-md text-ink-subdued transition-colors hover:bg-surface-pale"
        >
          <X className="size-5" strokeWidth={2} />
        </button>
        <span className="flex-1 text-md font-bold text-ink">Your chats</span>
        <Button udStyle="secondary" size="small" onClick={props.onCreate}>
          <Plus className="size-4" strokeWidth={2.2} /> New
        </Button>
      </div>

      {/* search */}
      <div className="shrink-0 px-sm pb-xs pt-xs-mid">
        <div className="flex items-center gap-xs rounded-md border border-line bg-surface px-sm py-xs">
          <Search className="size-4 text-ink-subdued" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-subdued"
          />
        </div>
      </div>

      {/* scrollable list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-xs pb-xs-mid pt-xxs">
        {list.map((t) => (
          <ThreadRow
            key={t.id}
            thread={t}
            active={t.id === activeId}
            menuOpen={menuId === t.id}
            renaming={renameId === t.id}
            onClickSelect={() => select(t.id)}
            onStartRename={() => startRename(t.id)}
            onCommitRename={(v) => commitRename(t.id, v)}
            onToggleMenu={() => setMenuId((m) => (m === t.id ? null : t.id))}
            onAskDelete={() => {
              setMenuId(null)
              setConfirmId(t.id)
            }}
          />
        ))}
      </div>

      {/* footer — pinned to the bottom edge, always visible */}
      <div className="shrink-0 border-t border-line-subdued bg-surface px-sm py-xs-mid text-xs text-ink-subdued">
        Chats are saved for 90 days, then removed automatically.
      </div>

      {/* delete confirmation */}
      {confirmId && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-md">
          <div className="flex w-full max-w-[320px] flex-col gap-xs-mid rounded-lg bg-surface p-md shadow-lg">
            <h3 className="text-lg font-bold text-ink">Delete this chat?</h3>
            <p className="text-sm text-ink-subdued">
              “{confirmTitle}” will be permanently deleted. This can’t be undone.
            </p>
            <div className="mt-xxs flex justify-end gap-xs">
              <Button udStyle="secondary" size="medium" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button
                udStyle="destructive"
                size="medium"
                onClick={() => {
                  props.onDelete(confirmId)
                  setConfirmId(null)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── One thread row ──────────────────────────────────────────────────────── */

function ThreadRow({
  thread,
  active,
  menuOpen,
  renaming,
  onClickSelect,
  onStartRename,
  onCommitRename,
  onToggleMenu,
  onAskDelete,
}: {
  thread: ChatThreadVM
  active: boolean
  menuOpen: boolean
  renaming: boolean
  onClickSelect: () => void
  onStartRename: () => void
  onCommitRename: (value: string) => void
  onToggleMenu: () => void
  onAskDelete: () => void
}) {
  const [draft, setDraft] = useState(thread.title)

  return (
    <div
      className={cn(
        'group relative flex items-start gap-sm rounded-md p-xs transition-colors',
        active ? 'bg-surface-pale' : 'hover:bg-surface-accent',
      )}
    >
      {/* single click = open thread · double click = rename */}
      {!renaming && (
        <button
          className="absolute inset-0 rounded-md"
          onClick={onClickSelect}
          onDoubleClick={onStartRename}
          aria-label={`Open ${thread.title}`}
        />
      )}

      <div className="pointer-events-none relative min-w-0 flex-1">
        {renaming ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename(draft)
              else if (e.key === 'Escape') onCommitRename(thread.title)
            }}
            onBlur={() => onCommitRename(draft)}
            className="pointer-events-auto w-full rounded-sm border border-brand px-xs py-[3px] text-sm text-ink outline-none"
          />
        ) : (
          <>
            <div className="truncate text-sm text-ink">{thread.title}</div>
            <div className="truncate text-xs text-ink-subdued">{thread.snippet}</div>
            <div className="mt-xxs flex items-center gap-xs">
              <span className="text-xs text-ink-subdued">{thread.lastActiveLabel}</span>
              {thread.expiresSoon && (
                <span className="inline-flex items-center gap-[3px] rounded-round bg-surface-warning px-xs py-[1px] text-xxs font-bold text-warning">
                  <Clock className="size-3" strokeWidth={2.4} />
                  {thread.expiryLabel}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* ⋮ actions */}
      <button
        onClick={onToggleMenu}
        aria-label="More actions"
        className="relative mt-[2px] flex size-[26px] shrink-0 items-center justify-center rounded-sm text-ink-subdued transition-colors hover:bg-surface-midtone"
      >
        <MoreVertical className="size-[18px]" strokeWidth={2} />
      </button>

      {menuOpen && (
        <div className="absolute right-[6px] top-[34px] z-30 flex w-[150px] flex-col rounded-md border border-line bg-surface p-xxs shadow-md">
          <button
            onClick={onStartRename}
            className="flex items-center gap-xs-mid rounded-sm p-xs text-left text-sm text-ink hover:bg-surface-pale"
          >
            <Pencil className="size-4" strokeWidth={2} /> Rename
          </button>
          <button
            onClick={onAskDelete}
            className="flex items-center gap-xs-mid rounded-sm p-xs text-left text-sm text-negative hover:bg-surface-negative"
          >
            <Trash2 className="size-4" strokeWidth={2} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
