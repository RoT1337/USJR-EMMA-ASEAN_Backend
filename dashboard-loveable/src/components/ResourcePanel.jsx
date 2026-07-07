import { RESOURCES } from '../lib/mock-data'

// Placeholder until the Laravel `resources` table is seeded with real
// Alcoy stockpile data (feature tracker: CRITICAL, "Resource Inventory Seeded").
export default function ResourcePanel() {
  return (
    <div className="panel rail-panel panel-enter">
      <div className="rail-panel-heading">
        <span className="mono-caps">Resource stockpile · placeholder</span>
      </div>
      {RESOURCES.map(r => {
        const color = r.status === 'crit' ? 'var(--fail)' : r.status === 'warn' ? 'var(--amber)' : 'var(--pass)'
        const label = r.status === 'crit' ? 'Critical' : r.status === 'warn' ? 'Low' : 'Sufficient'
        return (
          <div className="resource-item" key={r.key}>
            <div className="resource-row">
              <span className="resource-label">{r.label}</span>
              <span style={{ color, fontWeight: 700 }}>{r.pct}% · {label}</span>
            </div>
            <div className="resource-track">
              <div className="resource-fill" style={{ width: `${r.pct}%`, background: color }} />
            </div>
            <div className="resource-stock">{r.stock} {r.unit}</div>
          </div>
        )
      })}
    </div>
  )
}
