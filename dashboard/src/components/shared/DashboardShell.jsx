/* DashboardShell — the common chrome for the three local role views.

   Layout mirrors the old EMMA screenshots: brand header, left nav tree, breadcrumb
   strip, then a six-card stat row over one or two content panels, with the agent
   panel in a right rail. Each view supplies only its content.

   The top header is identical to AseanView's so all four views read as siblings. */

import RoleHeader from './RoleHeader'
import Sidebar from './Sidebar'

export default function DashboardShell({ role, onSwitchRole, children, aside }) {
  return (
    <div className="app-root">
      <RoleHeader role={role} onSwitchRole={onSwitchRole} />

      <div className="shell-body">
        <Sidebar role={role} />

        <div className="shell-content">
          <div className="breadcrumb">
            <span className="breadcrumb-home">Home</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{role.breadcrumb}</span>
          </div>

          <div className="dash-body">
            <div className="dash-main">{children}</div>
            {aside && <aside className="dash-aside">{aside}</aside>}
          </div>
        </div>
      </div>
    </div>
  )
}
