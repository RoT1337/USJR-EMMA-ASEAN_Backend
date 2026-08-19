import { Menu, Bell, MapPinned, UserPlus, HeartHandshake, PackagePlus, HandHeart, ChevronRight, TriangleAlert } from 'lucide-react'
import { FAMILY, TAKE_ACTION, STORM_ADVISORY } from '../data/mobile-data'

/* Screen 3 — Citizen Home Hub. The everyday face: who is linked, and the three
   things a citizen can actually do. */

const ACTION_ICON = {
  donate: HeartHandshake,
  needs: PackagePlus,
  volunteer: HandHeart,
}

export default function HomeScreen({ onNavigate, onMenu }) {
  return (
    <div className="screen screen-scroll">
      <header className="home-header">
        <button className="icon-tap" onClick={onMenu} aria-label="Open menu">
          <Menu size={20} strokeWidth={2} />
        </button>
        <span className="home-title">Home</span>
        <button className="icon-tap bell" onClick={() => onNavigate('chat')} aria-label="Alerts">
          <Bell size={19} strokeWidth={2} />
          <span className="bell-dot" />
        </button>
      </header>

      <section className="family-card">
        <div className="family-card-label">Tracking</div>
        <h2 className="family-card-title">Keep your family together</h2>
        <p className="family-card-sub">
          {FAMILY.linked} members linked · last sync {FAMILY.lastSync}
        </p>

        <button className="family-btn family-btn-solid" onClick={() => onNavigate('family')}>
          <MapPinned size={15} strokeWidth={2.5} />
          Track Family Member
        </button>
        <button className="family-btn family-btn-ghost" onClick={() => onNavigate('family')}>
          <UserPlus size={15} strokeWidth={2.5} />
          Join Family
        </button>
      </section>

      <div className="section-label">Take action</div>
      <div className="action-list">
        {TAKE_ACTION.map(a => {
          const Icon = ACTION_ICON[a.id]
          return (
            <button
              key={a.id}
              className="action-row-item"
              onClick={() => a.id === 'volunteer' && onNavigate('volunteer')}
            >
              <span className="action-icon"><Icon size={17} strokeWidth={2} /></span>
              <span className="action-body">
                <span className="action-label">{a.label}</span>
                <span className="action-sub">{a.sub}</span>
              </span>
              <ChevronRight size={16} strokeWidth={2.5} className="action-chev" />
            </button>
          )
        })}
      </div>

      <div className="advisory advisory-storm">
        <TriangleAlert size={14} strokeWidth={2.5} className="advisory-icon" />
        <p className="advisory-text">
          <strong>{STORM_ADVISORY.title}</strong><br />
          {STORM_ADVISORY.body}
        </p>
      </div>
    </div>
  )
}
