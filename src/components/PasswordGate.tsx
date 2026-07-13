import { useEffect, useState } from 'react'

/**
 * Lightweight client-side access gate for the public demo host.
 * GitHub Pages has no native auth, so this keeps the prototype limited to people
 * who know the shared passphrase. It's obfuscation-grade (not real security):
 * the entered value is SHA-256 hashed and compared to the embedded digest.
 */
const PASSCODE_SHA256 = '27a17988f56ffebd4f4665e19b5f4f77d77c0b4b5d10bbe289c3c70709f95d91'
const STORAGE_KEY = 'altus-demo-unlocked'
/** URL param carried on links opened from an already-unlocked tab (e.g. the
 *  video player, which opens in a new tab and can't see this tab's sessionStorage). */
export const UNLOCK_PARAM = 'demoUnlocked'

/** Append the unlock token to a URL opened from within the (already-unlocked) app. */
export function withUnlockToken(url: string): string {
  const u = new URL(url, window.location.origin)
  u.searchParams.set(UNLOCK_PARAM, '1')
  return u.toString()
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  // Bypass the gate entirely on localhost (dev / preview).
  useEffect(() => {
    if (/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) setUnlocked(true)
  }, [])

  // The video player opens in a new tab (window.open with noopener), which
  // doesn't inherit sessionStorage — so links out to it from an already-
  // unlocked tab carry a one-time unlock token in the URL. Direct/bookmarked
  // access without that token still hits the passcode screen below.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get(UNLOCK_PARAM) !== '1') return
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setUnlocked(true)
    url.searchParams.delete(UNLOCK_PARAM)
    window.history.replaceState(null, '', url.toString())
  }, [])

  if (unlocked) return <>{children}</>

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    setError(false)
    const ok = (await sha256Hex(value.trim())) === PASSCODE_SHA256
    setChecking(false)
    if (ok) {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
      setUnlocked(true)
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-6">
      <form onSubmit={submit} className="w-full max-w-[380px] rounded-2xl bg-white p-8 shadow-[0_8px_32px_rgba(42,43,63,0.12)]">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-[#2a2b3f]">
            udemy <span className="text-[#6d28d2]">business</span>
          </span>
        </div>
        <h1 className="text-lg font-bold text-[#2a2b3f]">Private preview</h1>
        <p className="mt-1 text-sm text-[#6b6b7b]">
          This prototype is shared with a limited group. Enter the passcode to continue.
        </p>
        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Passcode"
          className="mt-5 w-full rounded-lg border border-[#d1d0db] bg-white px-3 py-2.5 text-sm text-[#2a2b3f] outline-none focus:border-[#6d28d2] focus:ring-2 focus:ring-[#6d28d2]/20"
        />
        {error && <p className="mt-2 text-xs font-medium text-[#d9534f]">Incorrect passcode. Try again.</p>}
        <button
          type="submit"
          disabled={checking || !value.trim()}
          className="mt-4 w-full rounded-lg bg-[#6d28d2] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#5a1fb0] disabled:opacity-40"
        >
          {checking ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
