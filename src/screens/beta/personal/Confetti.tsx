/**
 * Tasteful full-screen celebration — confetti raining from the top (pure CSS).
 * Pieces start above the viewport and invisible, so none pile up at the top
 * while waiting for their stagger; they fade in as they enter and fall past the
 * bottom. Fixed overlay, pointer-events-none.
 */
const COLORS = [
  'var(--color-purple-400)',
  'var(--color-purple-200)',
  'var(--color-teal-400)',
  'var(--color-orange-400)',
  'var(--color-green-300)',
  '#f2c200',
]

// Deterministic pseudo-random so render is stable (no Math.random needed).
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const N = 130

const PIECES = Array.from({ length: N }, (_, i) => ({
  left: rand(i + 1) * 100,
  drift: Math.round((rand(i + 4) - 0.5) * 160), // horizontal sway px
  rot: 360 + Math.round(rand(i + 5) * 720),
  dur: 1.8 + rand(i + 3) * 1.2, // 1.8–3s fall (snappy)
  delay: rand(i + 7) * 0.9, // 0–0.9s stagger
  color: COLORS[i % COLORS.length],
  round: i % 4 === 0,
  w: i % 3 === 0 ? 8 : 11,
}))

export function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[300] overflow-hidden" aria-hidden>
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              width: p.w,
              height: p.round ? p.w : 14,
              borderRadius: p.round ? '9999px' : '2px',
              ['--drift']: `${p.drift}px`,
              ['--rot']: `${p.rot}deg`,
              ['--dur']: `${p.dur}s`,
              ['--delay']: `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
