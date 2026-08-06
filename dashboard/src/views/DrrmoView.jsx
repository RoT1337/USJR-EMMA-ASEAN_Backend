import DashboardShell from '../components/shared/DashboardShell'
import { PendingRegion } from '../components/shared/PendingRegion'

/* EMMA-Warn — The Sentinel.
   Phase 1 scaffold: layout only. Phase 3 fills these regions from mockData.js.
   Build this view last — it carries the Leaflet + OpenWeatherMap dependency. */
export default function DrrmoView({ role, onSwitchRole }) {
  return (
    <DashboardShell
      role={role}
      onSwitchRole={onSwitchRole}
      aside={<PendingRegion label={`${role.agent.name} panel`} hint="AgentPanel — hazard assessment, PAGASA feed" />}
    >
      <PendingRegion
        label="Stat row — 6 cards"
        hint="active advisories · barangays at risk · incidents today · teams deployed · residents affected (340) · PWD/senior assisted"
      />
      <PendingRegion label="Weather forecast strip" hint="7-day outlook — sits above the map, per screenshot" />
      <PendingRegion label="Weather map" hint="Leaflet + OpenWeatherMap precipitation overlay + evacuation center pins" />
      <PendingRegion label="Barangay risk levels" hint="DataTable — colour-coded risk pills" />
      <PendingRegion label="Active incident reports" hint="DataTable" />
    </DashboardShell>
  )
}
