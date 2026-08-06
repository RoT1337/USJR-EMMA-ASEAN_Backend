/* Sidebar — per-role nav tree, transcribed from the old EMMA screenshots.

   Cosmetic by design: nothing is clickable, one item renders active. It exists to
   reproduce the original information architecture, not to navigate.

   Styling deliberately mirrors AgentNav (200px, --surface, right --rim border,
   uppercase --muted headings) so the local views and the ASEAN view share one
   shell rather than looking like two products. */

export default function Sidebar({ role }) {
  return (
    <nav className="side-nav" aria-label={`${role.name} navigation`}>
      {/* Operator identity */}
      <div className="side-user">
        <span className="side-user-avatar" style={{ background: role.agent.accent }}>
          {role.displayName.charAt(0)}
        </span>
        <span className="side-user-body">
          <span className="side-user-name">{role.displayName}</span>
          <span className="side-user-role">{role.name}</span>
        </span>
      </div>

      {/* Nav tree */}
      <div className="side-groups">
        {role.nav?.map(group => (
          <div className="side-group" key={group.label}>
            <div className="side-group-label">
              {group.label}
              {!group.items && <span className="side-group-chevron">›</span>}
            </div>

            {group.items?.map(item => {
              const active = item === role.activeNav
              return (
                <div
                  key={item}
                  className={`side-item ${active ? 'side-item-active' : ''}`}
                  style={active ? { color: role.agent.accent, borderLeftColor: role.agent.accent, background: role.agent.accentBg } : undefined}
                >
                  {item}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="side-foot">EMMA · v2 · Mock environment</div>
    </nav>
  )
}
