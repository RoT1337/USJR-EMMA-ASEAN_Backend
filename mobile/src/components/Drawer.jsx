import { X, MessageSquareWarning, Accessibility, House, Users, HandHeart, ChevronRight } from 'lucide-react'
import { FAMILY, SCENARIO } from '../data/mobile-data'

/* In-phone navigation drawer.

   The screen switcher used to sit outside the handset, which made this read as a
   prototype viewer rather than a phone. Navigation belongs inside the device —
   this is what the hamburger on the Home header opens. */

const ITEMS = [
  { id: 'chat',      label: 'Chat with EMMA',    sub: 'Report an emergency',      Icon: MessageSquareWarning },
  { id: 'evac',      label: 'Evacuation Centers', sub: 'Accessible routing',      Icon: Accessibility },
  { id: 'home',      label: 'Home',               sub: 'Your hub',                Icon: House },
  { id: 'family',    label: 'Family Tracking',    sub: `${FAMILY.linked} members linked`, Icon: Users },
  { id: 'volunteer', label: 'Volunteer Tasks',    sub: 'Find work near you',      Icon: HandHeart },
]

export default function Drawer({ open, current, onNavigate, onClose }) {
  return (
    <>
      <div
        className={`scrim ${open ? 'scrim-open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside className={`drawer ${open ? 'drawer-open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <div>
            <div className="drawer-brand">EMMA</div>
            <div className="drawer-sub">{SCENARIO.barangay}, {SCENARIO.municipality}</div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close menu">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="drawer-user">
          <span className="drawer-avatar">R</span>
          <span className="drawer-user-body">
            <span className="drawer-user-name">Rosalinda Cabahug</span>
            <span className="drawer-user-meta">{FAMILY.familyId} · registered resident</span>
          </span>
        </div>

        <nav className="drawer-nav">
          {ITEMS.map(({ id, label, sub, Icon }) => (
            <button
              key={id}
              className={`drawer-item ${current === id ? 'drawer-item-on' : ''}`}
              onClick={() => { onNavigate(id); onClose() }}
            >
              <span className="drawer-item-icon"><Icon size={17} strokeWidth={2} /></span>
              <span className="drawer-item-body">
                <span className="drawer-item-label">{label}</span>
                <span className="drawer-item-sub">{sub}</span>
              </span>
              <ChevronRight size={15} strokeWidth={2.5} className="drawer-item-chev" />
            </button>
          ))}
        </nav>

        <div className="drawer-foot">
          {SCENARIO.signal} · {SCENARIO.hazard}
          <span className="drawer-foot-note">Demonstration build</span>
        </div>
      </aside>
    </>
  )
}
