import { AgentGlyph } from './shared/RoleGlyph'
const AGENT_META = {
  intake:        { label: 'Intake',        sub: 'Language & Triage' },
  vulnerability: { label: 'Vulnerability', sub: 'Population Risk' },
  resource:      { label: 'Resource',      sub: 'Supply & Gaps' },
  routing:       { label: 'Routing',       sub: 'Evacuation Paths' },
  pattern:       { label: 'Pattern',       sub: 'Historical Context' },
  handoff:       { label: 'Handoff',       sub: 'Final Recommendation' },
}

const AGENT_ACCENT = {
  intake:        { border: '#0284C7', bg: '#F0F7FF', badge: '#0284C7' },
  vulnerability: { border: '#D97706', bg: '#FFFBEB', badge: '#D97706' },
  resource:      { border: '#7C3AED', bg: '#F5F3FF', badge: '#7C3AED' },
  routing:       { border: '#059669', bg: '#ECFDF5', badge: '#059669' },
  pattern:       { border: '#EA580C', bg: '#FFF4EE', badge: '#EA580C' },
  handoff:       { border: '#DC2626', bg: '#FEF2F2', badge: '#DC2626' },
}

/* One confidence rule across both tiers (Phase 4e / NOTES B1): 80+ green,
   60-79 amber, below 60 red — matching AgentPanel on the local dashboards.

   The badge previously repeated the agent accent, which the card's border, title
   colour and icon already carry three times over. Colouring it by confidence
   instead makes it say something the card does not otherwise say: on a real run
   Resource at 78% now reads amber against its neighbours' green, which is exactly
   the signal an operator needs before approving at the Human Gate. */
function confidenceColor(pct) {
  if (pct >= 80) return '#059669'
  if (pct >= 60) return '#D97706'
  return '#DC2626'
}

/* ────────────────────────────────────────────────────────────── */
/* Skeleton components — each agent has unique layout            */
/* ────────────────────────────────────────────────────────────── */

function SkeletonScanLine() {
  return (
    <div className="skeleton-scan-wrapper">
      <div className="skeleton-scan-line" />
    </div>
  )
}

function SkeletonPulseDots() {
  return (
    <div className="skeleton-dots-wrapper">
      <span className="skeleton-dot" />
      <span className="skeleton-dot dot-delay-1" />
      <span className="skeleton-dot dot-delay-2" />
    </div>
  )
}

function SkeletonInventoryBars() {
  return (
    <div className="skeleton-inventory-wrapper">
      <div className="skeleton-bar-item"><div className="skeleton-bar-fill" style={{width:'60%'}} /></div>
      <div className="skeleton-bar-item"><div className="skeleton-bar-fill" style={{width:'40%'}} /></div>
      <div className="skeleton-bar-item"><div className="skeleton-bar-fill" style={{width:'80%'}} /></div>
    </div>
  )
}

function SkeletonPathDots() {
  return (
    <div className="skeleton-path-wrapper">
      <div className="skeleton-path-line">
        <span className="skeleton-path-dot" />
        <span className="skeleton-path-dot" />
        <span className="skeleton-path-dot" />
      </div>
    </div>
  )
}

function SkeletonRadar() {
  return (
    <div className="skeleton-radar-wrapper">
      <div className="skeleton-radar-dot" />
    </div>
  )
}

function SkeletonGlow() {
  return (
    <div className="skeleton-glow-wrapper">
      <div className="skeleton-glow-bar" />
      <div className="skeleton-glow-bar" style={{width:'70%'}} />
      <div className="skeleton-glow-bar" style={{width:'90%'}} />
    </div>
  )
}

function SkeletonCard({ agentKey }) {
  const accent = AGENT_ACCENT[agentKey]

  const renderSkeleton = () => {
    switch(agentKey) {
      case 'intake':        return <SkeletonScanLine />
      case 'vulnerability': return <SkeletonPulseDots />
      case 'resource':      return <SkeletonInventoryBars />
      case 'routing':       return <SkeletonPathDots />
      case 'pattern':       return <SkeletonRadar />
      case 'handoff':       return <SkeletonGlow />
      default:               return <SkeletonScanLine />
    }
  }

  return (
    <div className="agent-card agent-card-skeleton" style={{
      borderLeftColor: accent.border,
      background: accent.bg,
    }}>
      {/* Header */}
      <div className="agent-card-header">
        <div>
          <div className="agent-card-title-placeholder" />
          <div className="agent-card-sub-placeholder" />
        </div>
        <div className="agent-card-pct-placeholder" />
      </div>

      {/* Confidence bar skeleton */}
      <div className="conf-bar-track">
        <div className="conf-bar-skeleton" />
      </div>

      {/* Agent-specific skeleton animation */}
      <div className="agent-card-skeleton-body">
        {renderSkeleton()}
      </div>
    </div>
  )
}


/* ────────────────────────────────────────────────────────────── */
/* Idle variant — the pipeline before anything has arrived        */
/*                                                                */
/* Deliberately NOT the skeleton. A skeleton means "loading, wait" */
/* and animates; this screen is idle, and the design rule is that  */
/* nothing moves on an idle screen. This is a static standby card: */
/* it shows the shape of what is about to happen without claiming  */
/* anything is happening.                                          */
/* ────────────────────────────────────────────────────────────── */

function IdleCard({ agentKey }) {
  const meta = AGENT_META[agentKey]
  const accent = AGENT_ACCENT[agentKey]

  return (
    <div className="agent-card agent-card-idle" style={{ borderLeftColor: accent.border }}>
      <div className="agent-card-header">
        <div className="agent-card-title-row">
          <AgentGlyph agentKey={agentKey} size={15} className="agent-card-icon" />
          <div>
            <div className="agent-card-title">{meta.label}</div>
            <div className="agent-card-sub">{meta.sub}</div>
          </div>
        </div>
        <span className="agent-card-standby">STANDBY</span>
      </div>

      <div className="conf-bar-track">
        <div className="conf-bar-fill" style={{ width: 0 }} />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/* Populated card — final state                                   */
/* ────────────────────────────────────────────────────────────── */

const URGENCY_STYLES = {
  CRITICAL: { bg: '#FEF2F2', color: '#DC2626', dot: '#DC2626' },
  HIGH:     { bg: '#FFF4EE', color: '#EA580C', dot: '#EA580C' },
  MEDIUM:   { bg: '#FFFBEB', color: '#D97706', dot: '#D97706' },
  LOW:      { bg: '#ECFDF5', color: '#059669', dot: '#059669' },
}

function Badge({ value }) {
  if (!value) return null
  const key = String(value).toUpperCase()
  const s = URGENCY_STYLES[key] || { bg: '#EDF1F6', color: '#4E6A84', dot: '#8FA3BA' }
  return (
    <span className="badge-dot" style={{ background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {key}
    </span>
  )
}

function Field({ label, value, wide }) {
  if (value === undefined || value === null || value === '' || value === '—') return null
  const display = Array.isArray(value)
    ? value.length === 0 ? null : value.join(', ')
    : String(value)
  if (!display || display === '—') return null

  const isStatus = label === 'Urgency' || label === 'Risk'

  return (
    <div className={`field-row ${wide ? 'field-wide' : ''}`}>
      <span className="field-label">{label}</span>
      {isStatus
        ? <Badge value={display} />
        : <span className="field-value">{display}</span>
      }
    </div>
  )
}

function AgentFields({ agentKey, data }) {
  if (agentKey === 'intake') return <>
    <Field label="Urgency"    value={data.urgency} wide />
    <Field label="Language"   value={data.language_detected} />
    <Field label="Location"   value={data.location} />
    <Field label="Hazard"     value={data.hazard_type} />
    <Field label="Population" value={data.population_affected} />
    <Field label="Flags"      value={data.key_flags} wide />
  </>
  if (agentKey === 'vulnerability') return <>
    <Field label="Tier 1"  value={data.tier1} wide />
    <Field label="Tier 2"  value={data.tier2} wide />
    <Field label="Recommendation" value={data.recommendation} wide />
  </>
  if (agentKey === 'resource') return <>
    <Field label="Gaps"      value={data.gaps}           wide />
    <Field label="Available" value={data.available}      wide />
    <Field label="Action"    value={data.recommendation} wide />
  </>
  if (agentKey === 'routing') return <>
    <Field label="Risk"      value={data.risk} />
    <Field label="Primary"   value={data.primary_status} wide />
    <Field label="Alt Route" value={data.alternative}    wide />
    <Field label="ETA"       value={data.eta_minutes != null ? `${data.eta_minutes} min` : null} />
    <Field label="Action"    value={data.recommendation} wide />
  </>
  if (agentKey === 'pattern') return <>
    <Field label="Prior"       value={data.prior_event}  wide />
    <Field label="Insight"     value={data.insight}      wide />
    <Field label="Cross-border" value={data.cross_border} wide />
  </>
  if (agentKey === 'handoff') return <>
    <Field label="Action"    value={data.action}    wide />
    <Field label="Reasoning" value={data.reasoning} wide />
  </>
  return null
}

export default function AgentCard({ agentKey, data, animationDelay = 0, idle = false }) {
  const meta = AGENT_META[agentKey]
  const accent = AGENT_ACCENT[agentKey]
  const pct = data ? Math.round((data.confidence ?? 0) * 100) : 0

  // Standing by — nothing submitted yet. Static, no animation.
  if (idle) {
    return <IdleCard agentKey={agentKey} />
  }

  // Skeleton while loading
  if (!data) {
    return <SkeletonCard agentKey={agentKey} />
  }

  // Populated card
  return (
    <div
      className="agent-card agent-card-populated"
      style={{
        borderLeftColor: accent.border,
        background: accent.bg,
        animation: `fadeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Header */}
      <div className="agent-card-header">
        <div className="agent-card-title-row">
          <AgentGlyph agentKey={agentKey} size={15} className="agent-card-icon" style={{ color: accent.badge }} />
          <div>
            <div className="agent-card-title" style={{ color: accent.badge }}>
              {meta.label}
            </div>
            <div className="agent-card-sub">{meta.sub}</div>
          </div>
        </div>
        <div className="agent-card-badge" style={{ background: confidenceColor(pct) }}>
          {pct}%
        </div>
      </div>

      {/* Confidence bar */}
      <div className="conf-bar-track">
        <div className="conf-bar-fill" style={{ width: `${pct}%`, background: confidenceColor(pct) }} />
      </div>

      {/* Fields */}
      <div className="agent-card-fields">
        <AgentFields agentKey={agentKey} data={data} />
      </div>
    </div>
  )
}