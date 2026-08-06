import DashboardShell from '../components/shared/DashboardShell'
import { PendingRegion } from '../components/shared/PendingRegion'

/* EMMA-Care — The Welfare Manager.
   Phase 1 scaffold: layout only. Phase 3 fills these regions from mockData.js. */
export default function DswdView({ role, onSwitchRole }) {
  return (
    <DashboardShell
      role={role}
      onSwitchRole={onSwitchRole}
      aside={<PendingRegion label={`${role.agent.name} panel`} hint="AgentPanel — welfare assessment, duplicate flags" />}
    >
      <PendingRegion
        label="Stat row — 6 cards"
        hint="households validated · duplicates flagged · aid packages ready · pending disbursements · total beneficiaries · PWD/senior assisted"
      />
      <PendingRegion label="List of Beneficiaries" hint="DataTable — family ID, name, age, sex, senior?, PWD?, validation status pill" />
      <PendingRegion label="Aid programs" hint="AICS · cash aid · food packs" />
    </DashboardShell>
  )
}
