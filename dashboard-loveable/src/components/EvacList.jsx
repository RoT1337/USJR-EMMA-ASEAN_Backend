import { EVAC_CENTERS } from '../lib/mock-data'

// Placeholder until this reads from GET /api/evacuation-centers/nearest
// (feature tracker: IMPORTANT, "Hazard Map with Evacuation Center Pins").
export default function EvacList() {
  return (
    <div className="panel rail-panel panel-enter">
      <div className="rail-panel-heading">
        <span className="mono-caps">Evacuation centers · placeholder</span>
      </div>
      {EVAC_CENTERS.map(c => {
        const pct = Math.round((c.filled / c.capacity) * 100)
        const color = c.status === 'crit' ? 'var(--fail)' : c.status === 'warn' ? 'var(--amber)' : 'var(--pass)'
        return (
          <div className="evac-item" key={c.id}>
            <div className="evac-top">
              <span className="evac-name">{c.name}</span>
              <span className="evac-pct" style={{ color }}>{pct}%</span>
            </div>
            <div className="evac-meta">
              <span>{c.filled.toLocaleString()} / {c.capacity.toLocaleString()}</span>
              <span>{c.distanceKm} km</span>
            </div>
            <div className="evac-track">
              <div className="evac-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
