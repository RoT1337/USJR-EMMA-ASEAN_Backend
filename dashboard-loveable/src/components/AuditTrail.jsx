import { useMemo } from 'react'

const AGENT_LABEL = {
  intake: 'Intake Agent',
  vulnerability: 'Vulnerability Analyst',
  resource: 'Resource Allocator',
  routing: 'Routing Logistics',
  pattern: 'Pattern Recognition',
  handoff: 'Handoff Finalizer',
}
const ORDER = ['intake', 'vulnerability', 'resource', 'routing', 'pattern', 'handoff']

// Derived entirely from the live pipeline (report id, real per-agent
// confidence scores, real operator decision) -- nothing fabricated.
export default function AuditTrail({ reportId, outputs, decisionResult }) {
  const entries = useMemo(() => {
    if (!reportId) return []
    const list = [
      { text: `SITREP received · ${reportId}` },
      { text: 'Pipeline dispatched · 6 agents' },
    ]
    ORDER.forEach(key => {
      if (outputs?.[key]) {
        const pct = Math.round((outputs[key].confidence ?? 0) * 100)
        list.push({ text: `${AGENT_LABEL[key]} · confidence ${pct}%` })
      }
    })
    if (decisionResult) {
      list.push({ text: `Decision logged · ${decisionResult.decision}` })
    }
    return list
  }, [reportId, outputs, decisionResult])

  return (
    <div className="panel rail-panel panel-enter">
      <div className="rail-panel-heading">
        <span className="mono-caps">Audit trail</span>
      </div>
      <div className="audit-list">
        {entries.length === 0 && <span className="nav-summary-waiting">No activity yet…</span>}
        {entries.map((e, i) => (
          <div className="audit-row" key={i}>
            <span className="audit-text">{e.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
