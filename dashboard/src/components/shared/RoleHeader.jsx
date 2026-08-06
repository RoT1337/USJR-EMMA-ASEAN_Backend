/* RoleHeader — shared app header for the three local dashboards.
   The role chip doubles as the role switcher: clicking it returns to login. */

export default function RoleHeader({ role, onSwitchRole, right }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <div className="app-brand">
          <span className="app-logo">EMMA</span>
          <span className="app-pipe">|</span>
          <span className="app-title">{role.dashboard}</span>
        </div>
        <div className="app-subtitle">
          {role.org} · Evacuation Management &amp; Monitoring Assistants
        </div>
      </div>

      <div className="app-header-right">
        {right}
        <RoleChip role={role} onSwitchRole={onSwitchRole} />
      </div>
    </header>
  )
}

export function RoleChip({ role, onSwitchRole }) {
  return (
    <button
      className="role-chip"
      onClick={onSwitchRole}
      title="Switch role"
      style={{ borderColor: role.agent.accent, background: role.agent.accentBg }}
    >
      <span className="role-chip-icon">{role.agent.icon}</span>
      <span className="role-chip-body">
        <span className="role-chip-name" style={{ color: role.agent.accent }}>{role.name}</span>
        <span className="role-chip-user">{role.user}</span>
      </span>
      <span className="role-chip-switch">Switch</span>
    </button>
  )
}
