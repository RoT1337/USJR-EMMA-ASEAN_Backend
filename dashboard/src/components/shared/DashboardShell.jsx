/* DashboardShell — the common chrome for the three local role views.

   Layout mirrors the old EMMA screenshots: brand header, left nav tree, breadcrumb
   strip, then a six-card stat row over one or two content panels, with the agent
   panel in a right rail. Each view supplies only its content.

   Phase 4 adds the escalation strip under the breadcrumb and an optional inbound
   handoff banner above the content, so every view reads as one seat in a chain.

   The top header is identical to AseanView's so all four views read as siblings. */

import RoleHeader from './RoleHeader'
import Sidebar from './Sidebar'
import EscalationStrip from './EscalationStrip'
import HandoffBanner from './HandoffBanner'
import { INCIDENT_ID, INBOUND } from '../../data/escalation'

export default function DashboardShell({ role, onSwitchRole, children, aside, headerRight, visited }) {
  return (
    <div className="app-root">
      <RoleHeader role={role} onSwitchRole={onSwitchRole} right={headerRight} />

      <div className="shell-body">
        <Sidebar role={role} />

        <div className="shell-content">
          <div className="breadcrumb">
            <span className="breadcrumb-home">Home</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{role.breadcrumb}</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-incident">{INCIDENT_ID}</span>
          </div>

          <EscalationStrip roleId={role.id} visited={visited} />

          <div className="dash-body">
            <div className="dash-main">
              <HandoffBanner inbound={INBOUND[role.id]} accent={role.agent.accent} />
              {children}
            </div>
            {aside && <aside className="dash-aside">{aside}</aside>}
          </div>
        </div>
      </div>
    </div>
  )
}
