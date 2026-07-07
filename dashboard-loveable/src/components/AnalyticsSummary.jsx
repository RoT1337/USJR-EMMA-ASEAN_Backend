const URGENCY_STYLES = {
  CRITICAL: { color: 'var(--fail)',  bg: 'var(--fail-bg)' },
  HIGH:     { color: 'var(--alert)', bg: 'var(--alert-bg)' },
  MEDIUM:   { color: 'var(--amber)', bg: 'var(--amber-bg)' },
  LOW:      { color: 'var(--pass)',  bg: 'var(--pass-bg)' },
}

// Real-data only: every field here comes straight from the Intake agent's
// output. No fabricated numbers -- if the API doesn't return it, it isn't shown.
export default function AnalyticsSummary({ intake }) {
  if (!intake) {
    return (
      <div className="analytics-summary panel-enter" style={{ borderLeftColor: 'var(--rim)' }}>
        <span className="mono-caps">Awaiting intake analysis…</span>
      </div>
    )
  }

  const urgency = intake.urgency ? String(intake.urgency).toUpperCase() : null
  const style = URGENCY_STYLES[urgency] ?? { color: 'var(--text-dim)', bg: 'var(--surface-2)' }
  const flags = Array.isArray(intake.key_flags) ? intake.key_flags.join(', ') : intake.key_flags

  return (
    <div className="analytics-summary panel-enter" style={{ borderLeftColor: style.color }}>
      <div className="analytics-top">
        <div>
          <div className="analytics-tags">
            {urgency && (
              <span className="badge-dot" style={{ background: style.bg, color: style.color }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.color, flexShrink: 0 }} />
                {urgency} URGENCY
              </span>
            )}
          </div>
          <h2 className="analytics-headline">
            {intake.hazard_type || 'Incident'}{intake.location ? ` · ${intake.location}` : ''}
          </h2>
          {intake.language_detected && (
            <p className="analytics-sub">Detected language · {intake.language_detected}</p>
          )}
        </div>

        {intake.population_affected != null && intake.population_affected !== '' && (
          <div className="analytics-pop-label">
            <span className="mono-caps">Population affected</span>
            <p className="analytics-pop-value">{intake.population_affected}</p>
          </div>
        )}
      </div>

      {flags ? (
        <div className="analytics-stats">
          <div>
            <div className="analytics-stat-label">Key flags</div>
            <div className="analytics-stat-value" style={{ fontWeight: 500, fontSize: 13 }}>{flags}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
