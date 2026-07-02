/**
 * Video player page for the Personal goal E2E flow — opened in a NEW TAB when a
 * course card in the learning path is clicked. The content is synced to the
 * clicked card via URL query params (title, instructor, tag, lectures, kind).
 *
 * Layout mirrors the Figma player (node 8291:521994): a top lecture bar, a dark
 * video stage with a "playing" animation (pulsing watermark + moving progress +
 * equalizer), the standard control row, and a Curriculum sidebar whose items are
 * generated from the course's lecture count with a mix of video / role-play /
 * lab item types.
 */
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  Captions,
  Settings,
  Maximize,
  X,
  Play,
  Users,
  FlaskConical,
  Check,
  ChevronUp,
  Video,
  Sparkles,
  ListChecks,
  MessageSquare,
} from 'lucide-react'
import altusLogo from '@/assets/altus-logo.png'
import illusGenAi from '@/assets/illus-gen-ai.png'
import videoDesign from '@/assets/course-video-design.mp4'
import videoProgramming from '@/assets/course-video-programming.mp4'

type ItemKind = 'video' | 'roleplay' | 'lab'

interface CurriculumItem {
  n: number
  title: string
  kind: ItemKind
  completed: boolean
  minutes?: number
  current?: boolean
}

/** Build a plausible curriculum from the course lecture count + kind. */
function buildCurriculum(lectures: number, topic: string, courseKind: string): CurriculumItem[] {
  const base: CurriculumItem[] = []
  const total = Math.max(6, Math.min(lectures || 12, 14))
  const currentIdx = 3
  for (let i = 1; i <= total; i++) {
    // Sprinkle a role play and a lab into the section.
    const kind: ItemKind = i === 4 ? 'roleplay' : i === 7 ? 'lab' : 'video'
    const titles: Record<ItemKind, string> = {
      video:
        i === 1
          ? `Introduction to ${topic}`
          : i === 2
            ? `Core concepts and terminology`
            : `Lecture ${i}: Applying ${topic}`,
      roleplay: `Role Play: Practice ${topic} in a live scenario`,
      lab: `Lab: Build a hands-on ${topic} exercise`,
    }
    base.push({
      n: i,
      title: titles[kind],
      kind,
      completed: i < currentIdx,
      current: i === currentIdx,
      minutes: kind === 'video' ? 3 + (i % 4) : undefined,
    })
  }
  // If the opened card is itself a role play / lab, mark the current item to match.
  if (courseKind === 'roleplay') base[currentIdx - 1].kind = 'roleplay'
  if (courseKind === 'lab') base[currentIdx - 1].kind = 'lab'
  return base
}

const KIND_ICON: Record<ItemKind, typeof Play> = {
  video: Play,
  roleplay: Users,
  lab: FlaskConical,
}

export default function PlayerPage() {
  const [params] = useSearchParams()
  const title = params.get('title') ?? 'AI Design Thinking : the fundamentals'
  const instructor = params.get('instructor') ?? 'Morten Rand-Hendriksen'
  const tag = params.get('tag') ?? 'AI-powered Design Thinking'
  const lectures = parseInt(params.get('lectures') ?? '14', 10)
  const kind = params.get('kind') ?? 'course'
  const topic = tag.trim() || 'this topic'

  const curriculum = useMemo(() => buildCurriculum(lectures, topic, kind), [lectures, topic, kind])
  const current = curriculum.find((c) => c.current) ?? curriculum[0]
  const completedCount = curriculum.filter((c) => c.completed).length
  const pct = Math.round((completedCount / curriculum.length) * 100)

  const lectureLabel =
    kind === 'roleplay' ? 'Role Play' : kind === 'lab' ? 'Hands-on Lab' : `${current.n}. ${current.title}`

  // Explicit `video` param wins (set per course, incl. swapped-in replacements);
  // otherwise fall back to a topic-based choice.
  const videoParam = params.get('video')
  const isDesign = /design|prototyp|ux|ui/i.test(`${tag} ${title}`)
  const videoSrc = videoParam === 'programming' ? videoProgramming : videoParam === 'design' ? videoDesign : isDesign ? videoDesign : videoProgramming

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#1c1d1f] text-white">
      {/* Top lecture bar */}
      <header className="flex h-14 shrink-0 items-center gap-md border-b border-white/10 px-md">
        <img src={altusLogo} alt="Udemy" className="size-7 object-contain" />
        <span className="text-sm font-medium text-white/90">{lectureLabel}</span>
        <button aria-label="Next lecture" className="ml-xs text-white/70 hover:text-white">
          <SkipForward className="size-4" strokeWidth={2} fill="currentColor" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Video stage */}
        <div className="relative flex min-w-0 flex-1 flex-col bg-black">
          <VideoStage src={videoSrc} />
          {/* Controls */}
          <ControlBar />
        </div>

        {/* Curriculum sidebar */}
        <aside className="flex w-[360px] shrink-0 flex-col border-l border-white/10 bg-[#1c1d1f]">
          {/* panel toggle icons */}
          <div className="flex items-center justify-between px-md py-sm">
            <div className="flex items-center gap-xs rounded-round bg-white/10 p-1">
              {[Video, Sparkles, ListChecks, MessageSquare].map((Icon, i) => (
                <span
                  key={i}
                  className={`flex size-8 items-center justify-center rounded-round ${i === 0 ? 'bg-white text-[#1c1d1f]' : 'text-white/70'}`}
                >
                  <Icon className="size-4" strokeWidth={2} />
                </span>
              ))}
            </div>
            <button aria-label="Close" onClick={() => window.close()} className="text-white/70 hover:text-white">
              <X className="size-5" strokeWidth={2} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-md pb-md">
            <h2 className="py-sm text-lg font-bold">Curriculum</h2>

            {/* Section header */}
            <div className="mb-sm flex items-center gap-sm rounded-lg bg-white/5 p-sm">
              <SectionRing pct={pct} />
              <div className="flex-1">
                <p className="text-xs text-white/60">Section 1</p>
                <p className="text-sm font-bold">{topic}</p>
                <p className="mt-xxs text-xs text-white/50">
                  {curriculum.length} items · {curriculum.length * 4} mins
                </p>
              </div>
              <ChevronUp className="size-4 text-white/60" strokeWidth={2} />
            </div>

            {/* Items */}
            <div className="flex flex-col gap-xs">
              {curriculum.map((it) => (
                <CurriculumRow key={it.n} item={it} />
              ))}
            </div>
          </div>

          {/* Course overview footer */}
          <div className="border-t border-white/10 px-md py-sm">
            <button className="mb-sm flex items-center gap-xs text-xs font-bold text-white/70 hover:text-white">
              <ChevronUp className="size-3.5 rotate-[-90deg]" strokeWidth={2} /> View course overview
            </button>
            <div className="flex items-center gap-sm">
              <img src={illusGenAi} alt="" className="size-10 shrink-0 rounded-md object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{title}</p>
                <p className="truncate text-xs text-white/60">{instructor}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ── Video stage — loops the attached course clip ──────────────────────────────

function VideoStage({ src }: { src: string }) {
  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
      <video
        key={src}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="size-full object-cover"
      />
    </div>
  )
}

function ControlBar() {
  return (
    <div className="shrink-0 bg-gradient-to-t from-black/90 to-black/40 px-md pb-sm pt-lg">
      {/* progress */}
      <div className="mb-sm h-1 w-full overflow-hidden rounded-round bg-white/25">
        <div className="player-progress h-full rounded-round bg-[var(--color-purple-400)]" />
      </div>
      <div className="flex items-center gap-md text-white/90">
        <button aria-label="Pause" className="hover:text-white">
          <Pause className="size-6" strokeWidth={2} fill="currentColor" />
        </button>
        <button aria-label="Rewind 10s" className="hover:text-white">
          <RotateCcw className="size-5" strokeWidth={2} />
        </button>
        <button aria-label="Skip 10s" className="hover:text-white">
          <SkipForward className="size-5" strokeWidth={2} />
        </button>
        <button aria-label="Volume" className="hover:text-white">
          <Volume2 className="size-5" strokeWidth={2} />
        </button>
        <span className="text-xs tabular-nums text-white/80">0:30 / 4:10</span>
        <div className="flex-1" />
        <button className="rounded-sm border border-white/30 px-xs py-0.5 text-xs font-bold hover:bg-white/10">1X</button>
        <button aria-label="Captions" className="hover:text-white">
          <Captions className="size-5" strokeWidth={2} />
        </button>
        <button aria-label="Settings" className="hover:text-white">
          <Settings className="size-5" strokeWidth={2} />
        </button>
        <button aria-label="Fullscreen" className="hover:text-white">
          <Maximize className="size-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// ── Curriculum pieces ─────────────────────────────────────────────────────────

function SectionRing({ pct }: { pct: number }) {
  const size = 40
  const stroke = 4
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-purple-400)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
          />
        )}
      </svg>
      <span className="text-[10px] font-bold tabular-nums text-white">{pct}%</span>
    </span>
  )
}

function CurriculumRow({ item }: { item: CurriculumItem }) {
  const Icon = KIND_ICON[item.kind]
  return (
    <div
      className={`flex gap-sm rounded-lg border p-sm transition-colors ${
        item.current ? 'border-[var(--color-purple-400)] bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
          item.current ? 'bg-[var(--color-purple-400)] text-white' : 'bg-white/10 text-white/70'
        }`}
      >
        <Icon className="size-4" strokeWidth={2} fill={item.kind === 'video' ? 'currentColor' : 'none'} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-white/90">
          {item.kind === 'video' ? `${item.n}. ` : ''}
          {item.title}
        </p>
        <p className="mt-xxs flex items-center gap-xs text-xs text-white/50">
          {item.completed ? (
            <>
              <Check className="size-3.5 text-[var(--color-green-300)]" strokeWidth={3} />
              Completed {item.minutes ? `· ${item.minutes} min` : ''}
            </>
          ) : item.current ? (
            <span className="font-bold text-[var(--color-purple-200)]">Now playing</span>
          ) : (
            <>{item.minutes ? `${item.minutes} min` : 'Practice activity'}</>
          )}
        </p>
      </div>
    </div>
  )
}
