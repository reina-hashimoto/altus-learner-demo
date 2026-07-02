/**
 * Modals for the Skills profile page:
 *  - SetProficiencyModal — self-report a proficiency for an estimated skill.
 *    The current estimate shows in yellow; picking a level turns it purple and
 *    enables Update. Update applies a self-reported level with a bar animation.
 *  - UpdateRoleModal — change the current role, with light gibberish validation.
 */
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/utils'
import { BANDS, type ProfileSkill } from './data'

const ESTIMATED_YELLOW = 'var(--color-orange-400)'
const SELF_PURPLE = 'var(--color-purple-400)'

/** Shared centered modal shell with a grey scrim. */
function ModalShell({ onClose, children, width = 600 }: { onClose: () => void; children: React.ReactNode; width?: number }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(42,43,63,0.45)] px-lg animate-altus-fadein"
      onClick={onClose}
    >
      <div
        className="w-full rounded-lg bg-surface p-lg shadow-[0_12px_48px_rgba(42,43,63,0.28)]"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// ── Set proficiency ──────────────────────────────────────────────────────────

export function SetProficiencyModal({
  skill,
  onCancel,
  onUpdate,
}: {
  skill: ProfileSkill
  onCancel: () => void
  onUpdate: (levelIdx: number) => void
}) {
  const estimateIdx = Math.min(Math.floor(skill.current / 50), 3)
  const [picked, setPicked] = useState<number | null>(null)
  const selectedIdx = picked ?? estimateIdx
  const dirty = picked !== null

  return (
    <ModalShell onClose={onCancel}>
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-medium text-ink">Set your proficiency</h2>
        <button onClick={onCancel} aria-label="Close" className="text-ink-subdued hover:text-ink">
          <X className="size-5" strokeWidth={2} />
        </button>
      </div>
      <p className="mt-sm text-sm leading-relaxed text-ink-subdued">
        The current proficiency <span className="font-bold text-ink">{BANDS[estimateIdx]}</span> is an estimate based on your
        role and learning activities. Update your proficiency to get a more accurate learning path.
      </p>

      <div className="mt-md rounded-md bg-surface-pale p-md">
        <p className="text-md font-bold text-ink">{skill.name}</p>
        <p className="mt-xxs text-xs text-ink-subdued">{skill.description}</p>
        <div className="mt-sm grid grid-cols-4 gap-xs">
          {BANDS.map((level, idx) => {
            const isSel = selectedIdx === idx
            const bg = !isSel ? undefined : dirty ? SELF_PURPLE : ESTIMATED_YELLOW
            return (
              <button
                key={level}
                onClick={() => setPicked(idx)}
                className={cn(
                  'rounded-round px-xs py-xs text-xs font-bold transition-colors',
                  isSel ? 'text-white' : 'border border-line bg-surface text-ink hover:bg-surface-midtone',
                )}
                style={isSel ? { background: bg } : undefined}
              >
                {level}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-md flex items-center justify-end gap-md">
        <button onClick={onCancel} className="text-sm font-bold text-brand hover:underline">
          Cancel
        </button>
        <Button udStyle="primary" size="large" disabled={!dirty} onClick={() => picked !== null && onUpdate(picked)}>
          Update
        </Button>
      </div>
    </ModalShell>
  )
}

// ── Update role ──────────────────────────────────────────────────────────────

/** Light heuristic: looks like a job title (letters, no long consonant runs). */
function isValidRole(input: string): boolean {
  const t = input.trim()
  if (t.length < 2 || t.length > 50) return false
  if (!/[a-zA-Z]/.test(t)) return false
  if (!/[aeiou]/i.test(t)) return false
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(t)) return false // gibberish run
  return /^[a-zA-Z][a-zA-Z .,&/'-]*$/.test(t)
}

export function UpdateRoleModal({
  currentRole,
  onCancel,
  onUpdate,
}: {
  currentRole: string
  onCancel: () => void
  onUpdate: (role: string) => void
}) {
  const [value, setValue] = useState(currentRole)
  const [error, setError] = useState(false)

  const submit = () => {
    const t = value.trim()
    if (!isValidRole(t)) {
      setError(true)
      return
    }
    onUpdate(t)
  }

  return (
    <ModalShell onClose={onCancel}>
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-medium text-ink">Update your current role</h2>
        <button onClick={onCancel} aria-label="Close" className="text-ink-subdued hover:text-ink">
          <X className="size-5" strokeWidth={2} />
        </button>
      </div>
      <p className="mt-sm text-sm leading-relaxed text-ink-subdued">
        If your responsibilities or level have changed, enter your new role below. Your active goals, target proficiency,
        and recommended learning path will automatically update to reflect this change.
      </p>

      <div className="mt-md flex flex-col gap-xxs">
        <label className="text-sm font-bold text-ink">Current role</label>
        <input
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(false)
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={cn(
            'h-11 rounded-md border bg-surface px-sm text-sm text-ink outline-none',
            error ? 'border-[var(--color-red-400)]' : 'border-line focus:border-brand',
          )}
        />
        {error && (
          <p className="text-xs font-medium text-[var(--color-red-400)]">
            That doesn't look like a role. Please enter a valid job title, e.g. “Account Executive”.
          </p>
        )}
      </div>

      <div className="mt-md flex items-center justify-end gap-md">
        <button onClick={onCancel} className="text-sm font-bold text-brand hover:underline">
          Cancel
        </button>
        <Button udStyle="primary" size="large" disabled={value.trim() === currentRole} onClick={submit}>
          Update
        </Button>
      </div>
    </ModalShell>
  )
}
