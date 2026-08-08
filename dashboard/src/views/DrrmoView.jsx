import DashboardShell from '../components/shared/DashboardShell'
import StatCard, { StatRow } from '../components/shared/StatCard'
import DataTable from '../components/shared/DataTable'
import AgentPanel from '../components/shared/AgentPanel'
import ForecastStrip from '../components/drrmo/ForecastStrip'
import WeatherMap from '../components/drrmo/WeatherMap'
import useDashboardData from '../data/useDashboardData'

/* EMMA-Warn — The Sentinel.
   Layout follows oldEMMA_DRRMO.jpg: six stat cards, then the weather panel
   (forecast strip above the map), then barangay risk and incident tables. */

const RISK_COLUMNS = [
  { key: 'barangay', label: 'Barangay', render: row => <span className="cell-primary">{row.barangay}</span> },
  { key: 'risk', label: 'Risk', pill: true, width: '104px' },
  { key: 'hazard', label: 'Hazard' },
  { key: 'population', label: 'Pop.', align: 'right', width: '58px', mono: true },
  {
    key: 'affected',
    label: 'Affected',
    align: 'right',
    width: '76px',
    render: row => (
      <span className={row.affected > 0 ? 'cell-short' : 'cell-ok'}>
        {row.affected > 0 ? row.affected : '—'}
      </span>
    ),
  },
  {
    key: 'families',
    label: 'Families',
    align: 'right',
    width: '68px',
    render: row => <span className="cell-ok">{row.families > 0 ? row.families : '—'}</span>,
  },
  { key: 'advisory', label: 'Advisory', width: '128px' },
]

const INCIDENT_COLUMNS = [
  { key: 'id', label: 'Ref', mono: true, width: '78px' },
  { key: 'time', label: 'Time', mono: true, width: '54px' },
  { key: 'barangay', label: 'Barangay', width: '88px' },
  {
    key: 'type',
    label: 'Incident',
    render: row => (
      <div className="cell-stack">
        <span className="cell-primary">{row.type}</span>
        <span className="cell-sub">{row.detail}</span>
      </div>
    ),
  },
  { key: 'team', label: 'Assigned', width: '132px' },
  { key: 'status', label: 'Status', pill: true, width: '112px' },
]

const ADVISORY_COLUMNS = [
  {
    key: 'title',
    label: 'Advisory',
    render: row => (
      <div className="cell-stack">
        <span className="cell-primary">{row.title}</span>
        <span className="cell-sub">{row.issued} · {row.scope}</span>
      </div>
    ),
  },
]

export default function DrrmoView({ role, onSwitchRole, visited }) {
  const { data, loading, error } = useDashboardData(role.id)

  if (error) {
    return (
      <DashboardShell role={role} onSwitchRole={onSwitchRole}>
        <div className="app-strip app-strip-error"><strong>Data error:</strong> {error}</div>
      </DashboardShell>
    )
  }
  if (loading || !data) {
    return <DashboardShell role={role} onSwitchRole={onSwitchRole}><div className="dash-loading">Loading…</div></DashboardShell>
  }

  const { stats, barangayRisk, incidents, advisories, forecast, centers, agent } = data

  return (
    <DashboardShell
      role={role}
      onSwitchRole={onSwitchRole}
      visited={visited}
      aside={
        <>
          <AgentPanel
            name={role.agent.name}
            tagline={role.agent.tagline}
            icon={role.agent.icon}
            accent={role.agent.accent}
            accentBg={role.agent.accentBg}
            confidence={agent.confidence}
            headline={agent.headline}
            detail={agent.detail}
            fields={agent.fields}
            footer="Derived from the PAGASA feed · 08:54"
          />
          <DataTable
            title="Active Advisories"
            caption={`${advisories.length} issued`}
            columns={ADVISORY_COLUMNS}
            rows={advisories}
          />
        </>
      }
    >
      <StatRow>
        {stats.map(s => (
          <StatCard
            key={s.key}
            label={s.label}
            value={s.value}
            unit={s.unit}
            sub={s.sub}
            accent={s.accent}
          />
        ))}
      </StatRow>

      <ForecastStrip forecast={forecast} location="Alcoy, Cebu" />

      <WeatherMap centers={centers} height={300} />

      <DataTable
        title="Barangay Risk Levels"
        caption={`${barangayRisk.filter(b => b.risk === 'HIGH' || b.risk === 'CRITICAL').length} at high risk`}
        columns={RISK_COLUMNS}
        rows={barangayRisk}
      />

      <DataTable
        title="Active Incident Reports"
        caption={`${incidents.filter(i => i.status !== 'CLEARED').length} open of ${incidents.length} today`}
        columns={INCIDENT_COLUMNS}
        rows={incidents}
      />
    </DashboardShell>
  )
}
