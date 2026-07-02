import { useEffect, useState } from 'react'
import AgentGlyph from './AgentGlyph'
import ConfidenceBadge from './ConfidenceBadge'

const AGENTS = ['intake', 'vulnerability', 'resource', 'routing', 'pattern', 'handoff']

const AGENT_META = {
  intake:        { label: 'Intake' },
  vulnerability: { label: 'Vulnerability' },
  resource:      { label: 'Resource' },
  routing:       { label: 'Routing' },
  pattern:       { label: 'Pattern' },
  handoff:       { label: 'Handoff' },
}

const AGENT_ACCENT = {
  intake:        { border: '#0284C7', bg: '#F0F7FF', badge: '#0284C7' },
  vulnerability: { border: '#D97706', bg: '#FFFBEB', badge: '#D97706' },
  resource:      { border: '#7C3AED', bg: '#F5F3FF', badge: '#7C3AED' },
  routing:       { border: '#059669', bg: '#ECFDF5', badge: '#059669' },
  pattern:       { border: '#EA580C', bg: '#FFF4EE', badge: '#EA580C' },
  handoff:       { border: '#DC2626', bg: '#FEF2F2', badge: '#DC2626' },
}

function getStatLabel(agentKey, data) {
  if (!data) return null
  if (agentKey === 'intake') return data.urgency ?? null
  if (agentKey === 'vulnerability') return data.risk ?? (data.tier1 ? 'RISK' : null)
  if (agentKey === 'routing') return data.risk ?? null
  return null
}

const URGENCY_COLORS = {
  CRITICAL: '#DC2626',
  HIGH:     '#EA580C',
  MEDIUM:   '#D97706',
  LOW:      '#059669',
}

function IncidentSummary({ intake }) {
  if (!intake) return (
    <div className="agent-nav-summary agent-nav-summary-empty">
      <span className="nav-summary-waiting">Awaiting intake…</span>
    </div>
  )

  const urgency = intake.urgency ? String(intake.urgency).toUpperCase() : null
  const urgencyColor = urgency ? (URGENCY_COLORS[urgency] ?? '#8FA3BA') : '#8FA3BA'

  return (
    <div className="agent-nav-summary">
      <div className="nav-summary-heading">INCIDENT</div>
      {urgency && (
        <div className="nav-summary-urgency" style={{ color: urgencyColor }}>
          ● {urgency}
        </div>
      )}
      {intake.location && (
        <div className="nav-summary-row">
          <span className="nav-summary-label">Location</span>
          <span className="nav-summary-val">{intake.location}</span>
        </div>
      )}
      {intake.hazard_type && (
        <div className="nav-summary-row">
          <span className="nav-summary-label">Hazard</span>
          <span className="nav-summary-val">{intake.hazard_type}</span>
        </div>
      )}
      {intake.population_affected && (
        <div className="nav-summary-row">
          <span className="nav-summary-label">Population</span>
          <span className="nav-summary-val">{intake.population_affected}</span>
        </div>
      )}
    </div>
  )
}

export default function AgentNav({ outputs }) {
  const [activeKey, setActiveKey] = useState(null)

  useEffect(() => {
    const observers = []
    AGENTS.forEach(key => {
      const el = document.getElementById(`doc-section-${key}`)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveKey(key) },
        { rootMargin: '-10% 0px -60% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [outputs])

  function scrollTo(key) {
    const el = document.getElementById(`doc-section-${key}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="agent-nav">
      <div className="agent-nav-heading">AGENTS</div>
      {AGENTS.map(key => {
        const meta = AGENT_META[key]
        const accent = AGENT_ACCENT[key]
        const data = outputs?.[key] ?? null
        const pct = data ? Math.round((data.confidence ?? 0) * 100) : 0
        const stat = getStatLabel(key, data)
        const isActive = activeKey === key

        return (
          <button
            key={key}
            className={`agent-nav-row${isActive ? ' agent-nav-row-active' : ''}`}
            onClick={() => scrollTo(key)}
          >
            <div className="agent-nav-top">
              <AgentGlyph agentKey={key} size={26} />
              <span className="agent-nav-label">{meta.label}</span>
              {data ? <ConfidenceBadge value={data.confidence} size="sm" /> : <span className="agent-nav-pct">—</span>}
            </div>
            <div className="agent-nav-track">
              <div className="agent-nav-fill"
                style={{ width: `${pct}%`, background: accent.badge }} />
            </div>
            {stat && (
              <span className="agent-nav-stat" style={{ color: accent.badge }}>
                {String(stat).toUpperCase()}
              </span>
            )}
          </button>
        )
      })}

      <IncidentSummary intake={outputs?.intake ?? null} />
    </nav>
  )
}
