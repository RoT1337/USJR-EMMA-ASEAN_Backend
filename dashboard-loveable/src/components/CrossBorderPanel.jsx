import { CROSS_BORDER } from '../lib/mock-data'

// Placeholder until the Regional Pattern Agent returns real cross-border
// data (feature tracker: CRITICAL, "Cross-border PH to VN Scenario").
export default function CrossBorderPanel() {
  const { origin, projected } = CROSS_BORDER
  return (
    <div className="panel rail-panel panel-enter">
      <div className="rail-panel-heading">
        <span className="mono-caps" style={{ color: 'var(--fail)' }}>Cross-border tracking · placeholder</span>
      </div>
      <div className="crossborder-row">
        <div>
          <div className="crossborder-country">Origin</div>
          <div className="crossborder-place">{origin.flag} {origin.place}</div>
        </div>
        <span className="crossborder-eta" style={{ color: 'var(--pass)' }}>{origin.eta}</span>
      </div>
      <div className="crossborder-row is-risk">
        <div>
          <div className="crossborder-country" style={{ color: 'var(--fail)' }}>Projected</div>
          <div className="crossborder-place">{projected.flag} {projected.place}</div>
        </div>
        <span className="crossborder-eta">{projected.eta}</span>
      </div>
    </div>
  )
}
