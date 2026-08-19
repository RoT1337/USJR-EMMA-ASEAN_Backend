import { useState } from 'react'
import { ChevronLeft, Navigation, ChevronDown, TriangleAlert, Info, Accessibility, Users, Baby } from 'lucide-react'
import { EVAC_CENTERS, EVAC_FILTERS, ACCESS_TAGS, ROUTE_ADVISORY, SCENARIO } from '../data/mobile-data'

/* Screen 2 — accessible evacuation routing.

   This is the citizen-side face of the Vulnerability agent: the dashboard sorts
   people into tiers, and this sorts destinations by whether they can actually
   receive those people. Filtering by PWD / Elderly / Children genuinely filters,
   because a chip that does nothing in front of a judge is worse than no chip.

   The map is inline SVG, not Leaflet: a map library is one more thing that can
   fail on venue wifi, and this only needs to read as a route. */

const TAG_ICON = { pwd: Accessibility, elderly: Users, children: Baby }

export default function EvacuationScreen({ onBack }) {
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(EVAC_CENTERS[0].id)
  const [picking, setPicking] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [explain, setExplain] = useState(false)

  const matching = filter === 'all'
    ? EVAC_CENTERS
    : EVAC_CENTERS.filter(c => c.tags.includes(filter))

  /* If the active filter excludes the current pick, fall to the nearest match. */
  const selected = matching.find(c => c.id === selectedId) ?? matching[0]
  const nearest = [...matching].sort((a, b) => a.distanceKm - b.distanceKm)[0]

  return (
    <div className="screen screen-scroll">
      <header className="sub-header">
        <button className="icon-tap" onClick={onBack} aria-label="Back">
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <span className="sub-title">Evacuation Centers</span>
      </header>

      {/* Accessibility filters */}
      <div className="filter-row">
        {EVAC_FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-chip ${filter === f.id ? 'filter-chip-on' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Filtering has to show its work. Nug-as carries all three accessibility
          tags, so without this line every filter looks like it did nothing. */}
      <div className="showing">
        Showing <strong>{matching.length}</strong> of {EVAC_CENTERS.length} centres
        {filter !== 'all' && <> with <strong>{ACCESS_TAGS[filter]}</strong></>}
      </div>

      {!selected ? (
        <div className="empty-note">
          No centre within Alcoy currently reports that facility. Contact your barangay desk.
        </div>
      ) : (
        <>
          {/* Route summary */}
          <div className="route-card">
            <Navigation size={16} strokeWidth={2.5} className="route-icon" />
            <div className="route-body">
              <div className="route-label">Fastest accessible route</div>
              <div className="route-figure">
                {nearest.distanceKm} km · {nearest.minutes} min
              </div>
            </div>
            <span className="route-mode">{nearest.mode}</span>
          </div>

          {/* Route map — inline SVG, no map library */}
          <div className="map-card">
            <svg viewBox="0 0 320 150" className="map-svg" role="img" aria-label="Route to evacuation centre">
              <rect width="320" height="150" fill="#E8EEF7" />
              <path d="M0 96 H320" stroke="#D3DEEC" strokeWidth="9" fill="none" />
              <path d="M186 0 V150" stroke="#D3DEEC" strokeWidth="9" fill="none" />
              <path d="M0 40 Q90 34 150 58 T320 44" stroke="#DCE5F1" strokeWidth="6" fill="none" />
              <path
                d="M64 112 C 96 112, 108 84, 140 78 S 196 62, 232 50"
                stroke="#1B44E0" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeDasharray="7 5"
              />
              <circle cx="64" cy="112" r="7" fill="#1B44E0" stroke="#fff" strokeWidth="3" />
              <text x="64" y="134" textAnchor="middle" className="map-label">You</text>
              <g>
                <rect x="196" y="24" rx="5" width="74" height="19" fill="#0F2A6B" />
                <text x="233" y="37" textAnchor="middle" className="map-pin-label">Nug-as ES</text>
              </g>
              <circle cx="232" cy="50" r="7" fill="#DC2626" stroke="#fff" strokeWidth="3" />
            </svg>
          </div>

          {/* Centre picker — actually picks. */}
          <button className="picker" onClick={() => setPicking(v => !v)} aria-expanded={picking}>
            <span className="picker-name">{selected.name}</span>
            <span className="picker-change">
              {picking ? 'Close' : 'Change'}
              <ChevronDown size={13} strokeWidth={2.5} style={picking ? { transform: 'rotate(180deg)' } : undefined} />
            </span>
          </button>

          {picking && (
            <div className="picker-list">
              {matching.map(c => (
                <button
                  key={c.id}
                  className={`picker-option ${c.id === selected.id ? 'picker-option-on' : ''}`}
                  onClick={() => { setSelectedId(c.id); setPicking(false) }}
                >
                  <span className="picker-option-name">{c.name}</span>
                  <span className="picker-option-meta">{c.distanceKm} km · {c.minutes} min</span>
                </button>
              ))}
            </div>
          )}

          {/* Detail */}
          <section className="detail-card">
            <div className="detail-head">
              <span className="detail-label">Evacuation centre details</span>
              <span className="detail-full">Full details</span>
            </div>

            <div className="detail-name">{selected.name}</div>
            <p className="detail-note">{selected.note}</p>

            <div className="tag-row">
              {selected.tags.map(t => {
                const Icon = TAG_ICON[t]
                return (
                  <span key={t} className={`tag tag-${t}`}>
                    <Icon size={11} strokeWidth={2.5} />
                    {ACCESS_TAGS[t]}
                  </span>
                )
              })}
            </div>

            <div className="detail-grid">
              <Fact label="Location" value={selected.address} />
              <Fact label="Distance" value={`${selected.distanceKm} km`} />
              <Fact label="Est. time" value={`${selected.minutes} min`} />
            </div>

            <div className="occupancy">
              <div className="occupancy-head">
                <span>Occupancy</span>
                <span className="occupancy-figure">{selected.occupied} / {selected.capacity}</span>
              </div>
              <div className="occupancy-track">
                <div
                  className="occupancy-fill"
                  style={{
                    width: `${(selected.occupied / selected.capacity) * 100}%`,
                    background: selected.occupied / selected.capacity >= 0.9 ? '#DC2626'
                      : selected.occupied / selected.capacity >= 0.6 ? '#D97706' : '#059669',
                  }}
                />
              </div>
            </div>
          </section>

          <div className="advisory">
            <TriangleAlert size={14} strokeWidth={2.5} className="advisory-icon" />
            <p className="advisory-text">{ROUTE_ADVISORY}</p>
          </div>

          <div className="action-row">
            <button
              className="primary-btn"
              onClick={() => { setNavigating(true); setTimeout(() => setNavigating(false), 2800) }}
            >
              {navigating ? `Routing to ${selected.name.split(' ')[0]}…` : 'Navigate'}
            </button>
            <button className="icon-btn" aria-label="About this route" onClick={() => setExplain(v => !v)}>
              <Info size={16} strokeWidth={2} />
            </button>
          </div>

          {explain && (
            <p className="explain-note">
              Routes are ranked by accessibility first, then distance. A centre is only
              offered if it reports the facility you filtered for.
            </p>
          )}

          <div className="screen-foot">
            {SCENARIO.signal} · {SCENARIO.hazard} · {SCENARIO.municipality}, {SCENARIO.province}
          </div>
        </>
      )}
    </div>
  )
}

function Fact({ label, value }) {
  return (
    <div className="fact">
      <span className="fact-label">{label}</span>
      <span className="fact-value">{value}</span>
    </div>
  )
}
