/**
 * Full-screen celebration confetti. Piece design matches the Thesis
 * design-system Confetti (@udemy-v2/react-notice-components): three orange
 * shades and three shapes — circle, rectangle, triangle. The fall animation is
 * unchanged (pieces rain from above the viewport via the CSS `confettiFall`
 * keyframes), fixed overlay, pointer-events-none.
 */

// Orange-dominant festive palette. Based on the Thesis Confetti (orange shades)
// but with the near-white orange-100 swapped for visible tones and a few brand
// accents (purple / teal / coral / green) mixed in. Orange repeats to stay the
// base (~60% of pieces); accents add the pop.
const COLORS = [
  'var(--color-orange-300)', // vivid orange (base)
  'var(--color-orange-250)', // warm amber
  'var(--color-orange-350)', // deep orange
  'var(--color-purple-300)', // brand purple accent
  'var(--color-orange-300)',
  'var(--color-teal-300)', // teal accent
  'var(--color-orange-250)',
  'var(--color-red-300)', // coral accent
  'var(--color-orange-350)',
  'var(--color-green-300)', // green accent
]

// Deterministic pseudo-random so render is stable (no Math.random needed).
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const N = 130

// shape: 0 = circle, 1 = rectangle, 2 = triangle (mirrors the DS drawShape switch).
const PIECES = Array.from({ length: N }, (_, i) => ({
  left: rand(i + 1) * 100,
  drift: Math.round((rand(i + 4) - 0.5) * 160), // horizontal sway px
  rot: 360 + Math.round(rand(i + 5) * 720),
  dur: 1.8 + rand(i + 3) * 1.2, // 1.8–3s fall (snappy)
  delay: rand(i + 7) * 0.9, // 0–0.9s stagger
  color: COLORS[i % COLORS.length],
  shape: i % 3,
}))

/** Shape-specific box styling, matching the DS canvas shapes (circle/rect/triangle). */
function shapeStyle(shape: number, color: string): React.CSSProperties {
  if (shape === 0) return { width: 8, height: 8, borderRadius: '9999px', background: color }
  if (shape === 1) return { width: 12, height: 6, borderRadius: '1px', background: color }
  // Triangle via borders (~12px wide, 12px tall); the box background stays transparent.
  return {
    width: 0,
    height: 0,
    borderRadius: 0,
    background: 'transparent',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderBottom: `12px solid ${color}`,
  }
}

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
              ...shapeStyle(p.shape, p.color),
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
