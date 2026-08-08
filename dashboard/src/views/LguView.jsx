import DashboardShell from '../components/shared/DashboardShell'
import StatCard, { StatRow } from '../components/shared/StatCard'
import DataTable from '../components/shared/DataTable'
import AgentPanel from '../components/shared/AgentPanel'
import useDashboardData from '../data/useDashboardData'
import { buildEscalation, SITREP_ID } from '../data/escalation'

/* EMMA-Plan — The Planner.
   Layout follows oldEMMA_EvacCenters.jpg: six stat cards over one hero
   "Evacuation Centers" table, approvals queue below, agent panel + inter-LGU
   coordination in the right rail. */

/* ₱1,200,000 → ₱1.2M · ₱480,000 → ₱480K — keeps the amount column narrow. */
function peso(n) {
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 1 : 2)}M`
  if (n >= 1_000) return `₱${Math.round(n / 1_000)}K`
  return `₱${n}`
}

const CENTER_COLUMNS = [
  {
    key: 'name',
    label: 'Evacuation Center',
    render: row => (
      <div className="cell-stack">
        <span className="cell-primary">{row.name}</span>
        <span className="cell-sub">{row.address}</span>
      </div>
    ),
  },
  { key: 'barangay', label: 'Barangay', width: '96px' },
  { key: 'capacity', label: 'Cap.', align: 'right', width: '52px', mono: true },
  {
    key: 'occupied',
    label: 'Occupancy',
    width: '150px',
    render: row => {
      const pct = row.capacity ? (row.occupied / row.capacity) * 100 : 0
      const color = pct >= 90 ? 'var(--fail)' : pct >= 60 ? 'var(--amber)' : 'var(--pass)'
      return (
        <div className="cell-progress">
          <div className="cell-progress-track">
            <div className="cell-progress-fill" style={{ width: `${pct}%`, background: color }} />
          </div>
          <span className="cell-progress-text">{row.occupied}/{row.capacity}</span>
        </div>
      )
    },
  },
  { key: 'status', label: 'Status', pill: true, width: '96px' },
  {
    key: 'contact',
    label: 'Contact Person',
    render: row => (
      <div className="cell-stack">
        <span className="cell-primary">{row.contact}</span>
        <span className="cell-sub">{row.phone}</span>
      </div>
    ),
  },
]

const REQUEST_COLUMNS = [
  { key: 'id', label: 'Ref', mono: true, width: '88px' },
  { key: 'requested', label: 'Filed', mono: true, width: '60px' },
  { key: 'item', label: 'Request' },
  { key: 'source', label: 'Fund Source', width: '108px' },
  { key: 'amount', label: 'Amount', align: 'right', width: '86px', mono: true, render: row => peso(row.amount) },
  { key: 'status', label: 'Status', pill: true, width: '104px' },
]

const LGU_COLUMNS = [
  {
    key: 'name',
    label: 'LGU',
    render: row => (
      <div className="cell-stack">
        <span className="cell-primary">{row.name}</span>
        <span className="cell-sub">{row.role}</span>
      </div>
    ),
  },
  { key: 'status', label: '', pill: true, width: '88px' },
]

export default function LguView({ role, onSwitchRole, onEscalate, visited }) {
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

  const { stats, centers, fundRequests, lgus, pending, agent } = data
  const activeCenters = centers.filter(c => c.status === 'ACTIVE')

  return (
    <DashboardShell
      role={role}
      onSwitchRole={onSwitchRole}
      visited={visited}
      headerRight={
        /* "Submit SITREP", not "Escalate to AHA Centre" — Alcoy submits to the
           Cebu Provincial DRRMC. Only NDRRMC reports to the AHA Centre. */
        <button className="escalate-btn" onClick={() => onEscalate(buildEscalation())}>
          Submit SITREP
          <span className="escalate-btn-arrow">⬆</span>
        </button>
      }
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
            footer="Drafted from DRRMO and DSWD inputs · 08:54"
          />
          {/* The artifact this tier produces, named so the escalate button has
              something concrete behind it rather than firing into the void. */}
          <div className="outbound-card">
            <div className="outbound-head">
              <span className="outbound-label">Outbound · SITREP</span>
              <span className="outbound-id">{SITREP_ID}</span>
            </div>
            <p className="outbound-body">
              Composed from DRRMO hazard data and the MSWD validated list.
              Ready for submission to the Cebu Provincial DRRMC, for onward
              relay to NDRRMC and the AHA Centre.
            </p>
          </div>

          <DataTable
            title="Inter-LGU Coordination"
            caption={`${lgus.length} LGUs`}
            columns={LGU_COLUMNS}
            rows={lgus}
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

      <DataTable
        title="Evacuation Centers"
        caption={`${activeCenters.length} active · ${centers.length - activeCenters.length} on standby`}
        columns={CENTER_COLUMNS}
        rows={centers}
      />

      <DataTable
        title="Pending Approvals"
        caption={`${pending.count} awaiting decision · ${peso(pending.amount)}`}
        columns={REQUEST_COLUMNS}
        rows={fundRequests}
      />
    </DashboardShell>
  )
}
