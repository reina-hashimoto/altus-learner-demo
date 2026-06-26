import { Search } from 'lucide-react'
import avatar from '@/assets/avatar.png'
import udemyBusinessLogo from '@/assets/udemy-business-logo.png'

/**
 * Self-contained Udemy Business marketplace top chrome for the admin-goal flow.
 * Mirrors the shared UBHeader but adds the avatar "9+" notification badge and a
 * sibling category nav strip (screens A & B). Kept local so the flow has no
 * dependency on the shared shell — and so the shared UBHeader stays untouched.
 */
export function AdminHeader() {
  return (
    <header className="flex h-[72px] shrink-0 items-center gap-md border-b border-line-subdued bg-surface px-md">
      <a href="#" aria-label="Udemy Business">
        <img src={udemyBusinessLogo} alt="Udemy Business" className="h-[34px] w-auto" />
      </a>

      <nav className="ml-sm flex items-center gap-md text-sm text-ink">
        <a className="hover:text-brand" href="#">Explore</a>
        <a className="hover:text-brand" href="#">Learning paths</a>
      </nav>

      <div className="relative mx-sm flex h-12 flex-1 items-center rounded-round border border-ink bg-surface px-sm">
        <Search className="size-5 text-ink-subdued" strokeWidth={2} />
        <input
          className="ml-xs h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-subdued"
          placeholder="Search for anything"
        />
      </div>

      <nav className="flex items-center gap-md text-sm text-ink">
        <a className="hover:text-brand" href="#">Teach</a>
        <a className="hover:text-brand" href="#">My learning</a>
      </nav>

      <div className="relative ml-xs">
        <img src={avatar} alt="Your profile" className="size-9 rounded-round object-cover" />
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-round border-2 border-surface bg-brand px-0.5 text-[10px] font-bold leading-none text-on-brand">
          9+
        </span>
      </div>
    </header>
  )
}

const CATEGORIES = [
  'Development',
  'Business',
  'IT & software',
  'Office productivity',
  'Personal development',
  'Design',
  'Marketing',
  'Health and fitness',
]

/** Secondary category nav strip shown on the marketplace home screens (A & B). */
export function CategoryNav() {
  return (
    <nav className="flex shrink-0 items-center gap-lg overflow-x-auto border-b border-line-subdued bg-surface px-xl py-xs-mid text-sm text-ink">
      {CATEGORIES.map((c) => (
        <a key={c} href="#" className="whitespace-nowrap hover:text-brand">
          {c}
        </a>
      ))}
    </nav>
  )
}
