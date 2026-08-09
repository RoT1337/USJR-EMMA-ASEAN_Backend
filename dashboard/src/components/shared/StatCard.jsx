import { useEffect, useState } from 'react'
import { UI_ICONS } from './icons'

/* StatCard — a figure, a label, an optional trend.

   Two rules from the V1.2 design direction shape this component:

   COLOUR ENCODES STATE, NEVER IDENTITY. Cards used to carry a decorative accent
   per card (violet here, amber there) which told an operator nothing. A card is
   now neutral unless its value means something is wrong — `warn` and `critical`
   are the only colours, and they are earned by the data.

   FIGURES ARE MONOSPACE. Anything a coordinator would read aloud over radio sets
   in JetBrains Mono with tabular figures, so digits align down a row and a
   changing value does not reflow its neighbours. */

const TONES = {
  neutral:  { rail: 'var(--rim)',   value: 'var(--text)'  },
  ok:       { rail: 'var(--pass)',  value: 'var(--text)'  },
  warn:     { rail: 'var(--amber)', value: 'var(--amber)' },
  critical: { rail: 'var(--fail)',  value: 'var(--fail)'  },
}

/* Count-up on load. Motion encodes a state change — data arriving — and lands
   well inside the 500ms budget. Skipped entirely under reduced motion, and for
   non-numeric values. */
const COUNT_MS = 420

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

function useCountUp(target) {
  const numeric = typeof target === 'number' && Number.isFinite(target)
  const animate = numeric && !prefersReducedMotion()

  const [shown, setShown] = useState(animate ? 0 : target)

  useEffect(() => {
    if (!animate) return

    let raf
    const started = performance.now()
    const tick = now => {
      const t = Math.min((now - started) / COUNT_MS, 1)
      const eased = 1 - Math.pow(1 - t, 3)          // ease-out
      setShown(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, animate])

  /* Non-animating cases read straight through, so the effect never has to set
     state synchronously just to pass a value along. */
  return animate ? shown : target
}

export default function StatCard({
  label,
  value,
  unit,
  sub,
  trend,
  trendDir,        // 'up' | 'down' | 'flat'
  tone = 'neutral',
}) {
  const t = TONES[tone] ?? TONES.neutral
  const shown = useCountUp(value)
  const TrendIcon = trendDir === 'up' ? UI_ICONS.trendUp
    : trendDir === 'down' ? UI_ICONS.trendDown
    : UI_ICONS.trendFlat

  return (
    <div className={`stat-card stat-tone-${tone}`} style={{ borderLeftColor: t.rail }}>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value" style={{ color: t.value }}>
        {shown}
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>
      {sub && <div className="stat-card-sub">{sub}</div>}
      {trend && (
        <div className={`stat-card-trend stat-trend-${trendDir ?? 'flat'}`}>
          <TrendIcon size={11} strokeWidth={2.5} />
          {trend}
        </div>
      )}
    </div>
  )
}

export function StatRow({ children }) {
  return <div className="stat-row">{children}</div>
}
