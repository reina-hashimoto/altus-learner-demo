import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import avatar from '@/assets/avatar.png'
import udemyBusinessLogo from '@/assets/udemy-business-logo.png'

/**
 * Lightweight Udemy Business top chrome. Per scope, this is only a static hint
 * of the surrounding shell — not a working nav.
 */
export function UBHeader() {
  return (
    <header className="flex h-[72px] shrink-0 items-center gap-md border-b border-line-subdued bg-surface px-md">
      <Link to="/" aria-label="Udemy Business">
        <img src={udemyBusinessLogo} alt="Udemy Business" className="h-[34px] w-auto" />
      </Link>

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
        <img
          src={avatar}
          alt="Your profile"
          className="size-9 rounded-round object-cover"
        />
        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-round border-2 border-surface bg-brand" />
      </div>
    </header>
  )
}
