/* StatCard — a number, a label, an optional trend indicator.
   Card treatment matches .agent-card: 8px radius, rim border, 3px accent edge. */

const ACCENTS = {
  neutral: '#0284C7',
  alert:   '#EA580C',
  amber:   '#D97706',
  pass:    '#059669',
  fail:    '#DC2626',
  violet:  '#7C3AED',
}

export default function StatCard({
  label,
  value,
  unit,
  sub,
  trend,          // e.g. '+12 since 06:00'
  trendDir,       // 'up' | 'down' | 'flat'
  accent = 'neutral',
}) {
  const color = ACCENTS[accent] ?? accent
  const arrow = trendDir === 'up' ? '▲' : trendDir === 'down' ? '▼' : '—'

  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value" style={{ color }}>
        {value}
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>
      {sub && <div className="stat-card-sub">{sub}</div>}
      {trend && (
        <div className={`stat-card-trend stat-trend-${trendDir ?? 'flat'}`}>
          <span className="stat-card-arrow">{arrow}</span>
          {trend}
        </div>
      )}
    </div>
  )
}

export function StatRow({ children }) {
  return <div className="stat-row">{children}</div>
}
