import { useState } from 'react'
import { ChevronLeft, Plus, Minus, UserPlus, ShieldAlert } from 'lucide-react'
import { FAMILY, FAMILY_MEMBERS, FAMILY_FILTERS, SCENARIO } from '../data/mobile-data'

/* Screen 4 — Family Tracking.

   The household is the Cabahugs: Rosalinda is the patient from Screen 1 and from
   dashboard incident INC-2044, and Nena is offline in Sitio Cansuje, which is
   where the landslide cut the road. This is the citizen-side view of facts the
   operators are already looking at. */

/* Rosalinda and Liam are at the same evacuation centre, so their pins sit close —
   but not so close that the labels collide, which they did at first. */
const PIN_POS = {
  'm-rosalinda': { x: 56, y: 36 },
  'm-liam':      { x: 78, y: 60 },
  'm-danilo':    { x: 24, y: 24 },
  'm-nena':      { x: 20, y: 78 },
}

export default function FamilyScreen({ onBack }) {
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(FAMILY_MEMBERS[0].id)
  const [zoom, setZoom] = useState(1)
  const [adding, setAdding] = useState(false)

  const shown = filter === 'all'
    ? FAMILY_MEMBERS
    : FAMILY_MEMBERS.filter(m => m.status === filter)

  const selected = shown.find(m => m.id === selectedId) ?? shown[0]

  return (
    <div className="screen screen-scroll">
      <header className="sub-header">
        <button className="icon-tap" onClick={onBack} aria-label="Back">
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <span className="sub-title">Family Tracking</span>
      </header>

      <div className="map-card map-card-family">
        <svg viewBox="0 0 320 170" className="map-svg" role="img" aria-label="Family member locations">
          <rect width="320" height="170" fill="#E8EEF7" />
          <g transform={`translate(160 85) scale(${zoom}) translate(-160 -85)`}>
          <path d="M0 110 H320" stroke="#D3DEEC" strokeWidth="10" fill="none" />
          <path d="M210 0 V170" stroke="#D3DEEC" strokeWidth="10" fill="none" />
          <path d="M0 52 Q80 44 148 68 T320 56" stroke="#DCE5F1" strokeWidth="6" fill="none" />

          {FAMILY_MEMBERS.map(m => {
            const p = PIN_POS[m.id]
            const x = (p.x / 100) * 320
            const y = (p.y / 100) * 170
            const on = m.status === 'online'
            const isSel = selected && m.id === selected.id
            return (
              <g key={m.id}>
                {isSel && <circle cx={x} cy={y} r="15" fill="#1B44E0" opacity="0.14" />}
                <circle cx={x} cy={y} r={isSel ? 8 : 6.5} fill={on ? '#1B44E0' : '#94A3B8'} stroke="#fff" strokeWidth="2.5" />
                <rect x={x - 27} y={y - 28} rx="4" width="54" height="15" fill={on ? '#0F2A6B' : '#64748B'} />
                <text x={x} y={y - 17.5} textAnchor="middle" className="map-pin-label">
                  {m.name.split(' ')[0]}
                </text>
              </g>
            )
          })}
          </g>
        </svg>

        <div className="map-zoom">
          <button className="map-zoom-btn" aria-label="Zoom in"
            onClick={() => setZoom(z => Math.min(z + 0.5, 2.5))}>
            <Plus size={13} strokeWidth={3} />
          </button>
          <button className="map-zoom-btn" aria-label="Zoom out"
            onClick={() => setZoom(z => Math.max(z - 0.5, 1))}>
            <Minus size={13} strokeWidth={3} />
          </button>
        </div>
        <div className="map-scale">Zoom {zoom}x · {SCENARIO.municipality}, {SCENARIO.province}</div>
      </div>

      <div className="family-bar">
        <span className="family-bar-title">Family Members</span>
        <div className="family-tabs">
          {FAMILY_FILTERS.map(f => (
            <button
              key={f.id}
              className={`family-tab ${filter === f.id ? 'family-tab-on' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="showing">
        Showing <strong>{shown.length}</strong> of {FAMILY_MEMBERS.length} members · {FAMILY.familyId}
      </div>

      {selected && (
        <section className="selected-card">
          <div className="selected-head">
            <span className="detail-label">Selected member</span>
            <StatusDot status={selected.status} />
          </div>
          <div className="selected-name">{selected.name}</div>
          {selected.tag === 'tier1' && (
            <span className="tier-badge">
              <ShieldAlert size={11} strokeWidth={2.5} />
              Tier 1 vulnerable
            </span>
          )}
          <div className="detail-grid selected-grid">
            <Fact label="Last updated" value={selected.updated} />
            <Fact label="Location" value={selected.location} />
          </div>
        </section>
      )}

      <div className="member-list">
        {shown.map(m => (
          <button
            key={m.id}
            className={`member ${selected && m.id === selected.id ? 'member-on' : ''}`}
            onClick={() => setSelectedId(m.id)}
          >
            <span className={`member-avatar ${m.status === 'online' ? '' : 'member-avatar-off'}`}>
              {m.initial}
            </span>
            <span className="member-body">
              <span className="member-name">{m.name}</span>
              <span className="member-role">{m.role} · {m.detail}</span>
            </span>
            <StatusDot status={m.status} />
          </button>
        ))}
      </div>

      <div className="action-row">
        <button className="primary-btn" onClick={() => { setAdding(true); setTimeout(() => setAdding(false), 2800) }}>
          {adding ? 'Invite link copied' : 'Add Family Member'}
        </button>
      </div>
    </div>
  )
}

function StatusDot({ status }) {
  const on = status === 'online'
  return (
    <span className={`status-pill ${on ? 'status-on' : 'status-off'}`}>
      <span className="status-dot" />
      {on ? 'Online' : 'Offline'}
    </span>
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
