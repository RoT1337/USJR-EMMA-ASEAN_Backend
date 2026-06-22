const AGENT_META = {
  intake:        { label: 'Intake',        sub: 'Language & Triage',    cls: 'agent-intake' },
  vulnerability: { label: 'Vulnerability', sub: 'Population Risk',      cls: 'agent-vulnerability' },
  resource:      { label: 'Resource',      sub: 'Supply & Gaps',        cls: 'agent-resource' },
  routing:       { label: 'Routing',       sub: 'Evacuation Paths',     cls: 'agent-routing' },
  pattern:       { label: 'Pattern',       sub: 'Historical Context',   cls: 'agent-pattern' },
  handoff:       { label: 'Handoff',       sub: 'Final Recommendation', cls: 'agent-handoff' },
}

function FieldRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  const display = Array.isArray(value)
    ? value.length === 0 ? '—' : value.join(', ')
    : String(value)
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 12, lineHeight: 1.55, marginBottom: 3 }}>
      <span style={{ color: 'var(--muted)', flexShrink: 0, width: 105 }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{display || '—'}</span>
    </div>
  )
}

function AgentFields({ agentKey, data }) {
  if (agentKey === 'intake') return <>
    <FieldRow label="Language"   value={data.language_detected} />
    <FieldRow label="Location"   value={data.location} />
    <FieldRow label="Hazard"     value={data.hazard_type} />
    <FieldRow label="Population" value={data.population_affected} />
    <FieldRow label="Urgency"    value={data.urgency} />
    <FieldRow label="Flags"      value={data.key_flags} />
  </>
  if (agentKey === 'vulnerability') return <>
    <FieldRow label="Tier 1"         value={data.tier1} />
    <FieldRow label="Tier 2"         value={data.tier2} />
    <FieldRow label="Recommendation" value={data.recommendation} />
  </>
  if (agentKey === 'resource') return <>
    <FieldRow label="Gaps"           value={data.gaps} />
    <FieldRow label="Available"      value={data.available} />
    <FieldRow label="Recommendation" value={data.recommendation} />
  </>
  if (agentKey === 'routing') return <>
    <FieldRow label="Primary"        value={data.primary_status} />
    <FieldRow label="Alternative"    value={data.alternative} />
    <FieldRow label="ETA"            value={data.eta_minutes != null ? `${data.eta_minutes} min` : null} />
    <FieldRow label="Risk"           value={data.risk} />
    <FieldRow label="Recommendation" value={data.recommendation} />
  </>
  if (agentKey === 'pattern') return <>
    <FieldRow label="Prior event"  value={data.prior_event} />
    <FieldRow label="Insight"      value={data.insight} />
    <FieldRow label="Cross-border" value={data.cross_border} />
  </>
  if (agentKey === 'handoff') return <>
    <FieldRow label="Action"    value={data.action} />
    <FieldRow label="Reasoning" value={data.reasoning} />
  </>
  return null
}

export default function AgentCard({ agentKey, data, animationDelay = 0 }) {
  const meta = AGENT_META[agentKey]
  const pct = data ? Math.round((data.confidence ?? 0) * 100) : 0

  if (!data) {
    return (
      <div
        className={meta.cls}
        style={{
          background: 'var(--surface)',
          borderRadius: 8,
          border: '1.5px solid var(--rim)',
          borderLeft: '3px solid var(--rim)',
          padding: '14px 16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {meta.label}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1, opacity: 0.7 }}>{meta.sub}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace" }}>—%</div>
        </div>
        <div style={{ height: 3, background: 'var(--rim)', borderRadius: 2 }} />
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ height: 9, background: 'var(--rim-soft)', borderRadius: 3, width: '68%' }} />
          <div style={{ height: 9, background: 'var(--rim-soft)', borderRadius: 3, width: '42%' }} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={meta.cls}
      style={{
        background: 'var(--card-bg, var(--surface))',
        borderRadius: 8,
        border: '1.5px solid var(--rim)',
        borderLeft: '3px solid var(--card-accent)',
        padding: '14px 16px',
        animation: `fadeSlide 0.3s ease ${animationDelay}ms both`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: 'var(--card-accent)',
          }}>
            {meta.label}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>{meta.sub}</div>
        </div>
        <div style={{
          fontSize: 13, fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--card-accent)',
        }}>
          {pct}%
        </div>
      </div>

      <div className="conf-bar-track">
        <div className="conf-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div style={{ marginTop: 10 }}>
        <AgentFields agentKey={agentKey} data={data} />
      </div>
    </div>
  )
}
