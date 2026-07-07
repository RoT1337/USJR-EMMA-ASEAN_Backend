// value: confidence as a 0-1 float, exactly what the pipeline API returns per agent.
export default function ConfidenceBadge({ value, size = 'md' }) {
  const pct = Math.round((value ?? 0) * 100)
  const tone = pct >= 80 ? 'ok' : pct >= 60 ? 'warn' : 'crit'
  return (
    <span className={`confidence-badge size-${size} tone-${tone}`} aria-label={`Confidence ${pct} percent`}>
      <span className="confidence-badge-dot" />
      {pct}%
    </span>
  )
}
