import { useState } from 'react'
import { EVAC_CENTERS } from '../lib/mock-data'

// Placeholder visualization -- swap for Leaflet/GeoRiskPH once the real
// hazard-map feature (feature tracker: IMPORTANT) is wired up.
export default function HazardMap({ location }) {
  const [heatmap, setHeatmap] = useState(true)

  return (
    <div className="panel hazard-map panel-enter">
      <div className="hazard-map-header">
        <div>
          <span className="mono-caps">Situational map · placeholder</span>
          <h3 className="hazard-map-title">Hazard overlay &amp; evacuation pins</h3>
        </div>
        <button
          type="button"
          className="hazard-toggle-label"
          onClick={() => setHeatmap(h => !h)}
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          Heatmap
          <span className={`hazard-toggle-track ${heatmap ? 'is-on' : ''}`}>
            <span className="hazard-toggle-thumb" />
          </span>
        </button>
      </div>

      <div className="hazard-canvas">
        <div className="grid-lines" style={{ position: 'absolute', inset: 0, opacity: 0.25 }} />
        <svg
          viewBox="0 0 400 250"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="stormCore" cx="52%" cy="50%" r="45%">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#DC2626" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d="M0,180 C40,120 90,110 130,140 C170,170 220,120 260,150 C310,190 360,140 400,170 L400,250 L0,250 Z"
            fill="#0F1C2E"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          {heatmap && (
            <>
              <ellipse cx="210" cy="130" rx="180" ry="120" fill="url(#stormCore)" />
              <circle cx="210" cy="128" r="8" fill="none" stroke="#EA580C" strokeWidth="1.5" opacity="0.9" />
              <circle cx="210" cy="128" r="16" fill="none" stroke="#EA580C" strokeWidth="1" opacity="0.5" />
              <circle cx="210" cy="128" r="24" fill="none" stroke="#EA580C" strokeWidth="0.8" opacity="0.3" />
            </>
          )}
        </svg>

        {EVAC_CENTERS.map(c => {
          const pct = Math.round((c.filled / c.capacity) * 100)
          return (
            <div
              key={c.id}
              className="hazard-pin"
              style={{ left: `${c.coords[0]}%`, top: `${c.coords[1]}%` }}
              title={`${c.name} · ${pct}% capacity`}
            >
              <span className={`hazard-pin-dot pin-${c.status}`}>
                {c.status === 'crit' && <span className="hazard-pin-ping" style={{ color: 'var(--fail)' }} />}
              </span>
            </div>
          )
        })}

        <div className="hazard-corner hazard-corner-tl">{location || 'Alcoy · Sector 4-B'}</div>
        <div className="hazard-corner hazard-corner-tr">
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--alert)', display: 'inline-block' }} />
          Placeholder overlay
        </div>
        <div className="hazard-legend">
          <span className="hazard-legend-item"><span className="hazard-legend-dot" style={{ background: 'var(--pass)' }} /> Avail</span>
          <span className="hazard-legend-item"><span className="hazard-legend-dot" style={{ background: 'var(--amber)' }} /> Near cap</span>
          <span className="hazard-legend-item"><span className="hazard-legend-dot" style={{ background: 'var(--fail)' }} /> At cap</span>
        </div>
      </div>
    </div>
  )
}
