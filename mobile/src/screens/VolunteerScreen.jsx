import { useState } from 'react'
import { ChevronLeft, Search, ChevronDown, MapPin, CalendarDays, Star } from 'lucide-react'
import { VOLUNTEER_TABS, VOLUNTEER_TASKS, VOLUNTEER_FILTERS } from '../data/mobile-data'

/* Screen 5 — Volunteer & Training Hub. Task discovery, sign-up and progress. */

export default function VolunteerScreen({ onBack }) {
  const [tab, setTab] = useState('Available')
  const [query, setQuery] = useState('')
  const [loc, setLoc] = useState(0)
  const [type, setType] = useState(0)
  const [openId, setOpenId] = useState(null)

  const inTab = VOLUNTEER_TASKS.filter(t => t.tab === tab)
  const tasks = query
    ? inTab.filter(t =>
        (t.title + t.org + t.location).toLowerCase().includes(query.toLowerCase()))
    : inTab

  return (
    <div className="screen screen-scroll">
      <header className="sub-header">
        <button className="icon-tap" onClick={onBack} aria-label="Back">
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <span className="sub-title">Volunteer Tasks</span>
      </header>

      <div className="search-wrap">
        <Search size={15} strokeWidth={2.5} className="search-icon" />
        <input
          className="search-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tasks, barangays, orgs..."
        />
      </div>

      <div className="select-row">
        {/* Cycle rather than open a native select — a dropdown that renders
            outside the phone frame would break the illusion on a projector. */}
        <button className="select-box" onClick={() => setLoc(i => (i + 1) % VOLUNTEER_FILTERS.locations.length)}>
          {VOLUNTEER_FILTERS.locations[loc]}
          <ChevronDown size={13} strokeWidth={2.5} />
        </button>
        <button className="select-box" onClick={() => setType(i => (i + 1) % VOLUNTEER_FILTERS.types.length)}>
          {VOLUNTEER_FILTERS.types[type]}
          <ChevronDown size={13} strokeWidth={2.5} />
        </button>
      </div>

      <div className="vol-tabs">
        {VOLUNTEER_TABS.map(t => (
          <button
            key={t}
            className={`vol-tab ${tab === t ? 'vol-tab-on' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="showing">
        <strong>{tab}</strong> · {tasks.length} task{tasks.length === 1 ? '' : 's'}
        {query && <> matching "{query}"</>}
      </div>

      <div className="task-list">
        {tasks.length === 0 && (
          <div className="empty-note">
            Nothing here yet. Available tasks appear as barangays post them.
          </div>
        )}

        {tasks.map(t => (
          <article className="task-card" key={t.id}>
            <div className="task-head">
              <span className="task-title">{t.title}</span>
              <span className={`task-badge ${t.status === 'Joined' ? 'task-badge-joined' : ''}`}>
                {t.status}
              </span>
            </div>
            <div className="task-org">{t.org}</div>

            <div className="task-meta">
              <span className="task-meta-row">
                <MapPin size={12} strokeWidth={2.5} />
                {t.location}
              </span>
              <span className="task-meta-row">
                <CalendarDays size={12} strokeWidth={2.5} />
                {t.date} · {t.time}
              </span>
            </div>

            <div className="task-foot">
              <span className="task-rating">
                <Star size={12} strokeWidth={2.5} className="task-star" />
                <strong>{t.rating}</strong> ({t.reviews})
              </span>
              <button className="task-btn" onClick={() => setOpenId(id => id === t.id ? null : t.id)}>
                {openId === t.id ? 'Hide' : 'View Details'}
              </button>
            </div>

            {openId === t.id && (
              <p className="task-detail">
                Report to the {t.location} desk 15 minutes before start. Bring a valid ID.
                Coordinated by {t.org} under the Alcoy MDRRMO volunteer register.
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
