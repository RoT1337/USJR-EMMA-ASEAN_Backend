import DashboardShell from '../components/shared/DashboardShell'
import { PendingRegion } from '../components/shared/PendingRegion'

/* EMMA-Plan — The Planner.
   Phase 1 scaffold: layout only. Phase 3 fills these regions from mockData.js. */
export default function LguView({ role, onSwitchRole }) {
  return (
    <DashboardShell
      role={role}
      onSwitchRole={onSwitchRole}
      aside={<PendingRegion label={`${role.agent.name} panel`} hint="AgentPanel — PDRA draft from DRRMO + DSWD inputs" />}
    >
      <PendingRegion
        label="Stat row — 6 cards"
        hint="occupied evac centers · affected families (87) · total evacuees (340) · barangays affected · supplies left · PWD/senior assisted"
      />
      <PendingRegion label="Evacuation Centers" hint="DataTable — name, address, capacity, occupancy, status pill, contact" />
      <PendingRegion label="Pending approvals queue" hint="DataTable — fund requests" />
    </DashboardShell>
  )
}
