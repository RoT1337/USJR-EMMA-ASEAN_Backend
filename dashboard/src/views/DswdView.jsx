import DashboardShell from '../components/shared/DashboardShell'
import StatCard, { StatRow } from '../components/shared/StatCard'
import DataTable from '../components/shared/DataTable'
import AgentPanel from '../components/shared/AgentPanel'
import useDashboardData from '../data/useDashboardData'

/* EMMA-Care — The Welfare Manager.
   Layout follows oldEMMA_LGUMSWD.jpg: six stat cards over one hero beneficiary
   table. Aid programs and inventory sit below/aside. */

const yesNo = v => (v ? 'Yes' : 'No')

const BENEFICIARY_COLUMNS = [
  { key: 'id', label: 'Family ID', mono: true, width: '92px' },
  {
    key: 'name',
    label: 'Beneficiary',
    render: row => (
      <div className="cell-stack">
        <span className="cell-primary">{row.name}</span>
        {row.note !== '—' && <span className="cell-sub">{row.note}</span>}
      </div>
    ),
  },
  { key: 'age', label: 'Age', align: 'right', width: '48px', render: row => (row.age === 0 ? '<1' : row.age) },
  { key: 'sex', label: 'Sex', width: '48px' },
  { key: 'senior', label: 'Senior', width: '58px', render: row => yesNo(row.senior) },
  { key: 'pwd', label: 'PWD', width: '52px', render: row => yesNo(row.pwd) },
  { key: 'status', label: 'Validation', pill: true, width: '116px' },
]

const PROGRAM_COLUMNS = [
  { key: 'name', label: 'Program' },
  { key: 'unit', label: 'Entitlement' },
  { key: 'households', label: 'HH', align: 'right', width: '52px', mono: true },
  {
    key: 'released',
    label: 'Released',
    width: '128px',
    render: row => (
      <div className="cell-progress">
        <div className="cell-progress-track">
          <div
            className="cell-progress-fill"
            style={{
              width: `${row.packages ? (row.released / row.packages) * 100 : 0}%`,
              background: row.released === row.packages && row.packages > 0 ? 'var(--pass)' : 'var(--amber)',
            }}
          />
        </div>
        <span className="cell-progress-text">{row.released}/{row.packages}</span>
      </div>
    ),
  },
  { key: 'status', label: 'Status', pill: true, width: '104px' },
]

const INVENTORY_COLUMNS = [
  { key: 'item', label: 'Item' },
  {
    key: 'onHand',
    label: 'Stock',
    align: 'right',
    width: '76px',
    render: row => (
      <span className={row.onHand < row.required ? 'cell-short' : 'cell-ok'}>
        {row.onHand} / {row.required}
      </span>
    ),
  },
  { key: 'status', label: '', pill: true, width: '92px' },
]

export default function DswdView({ role, onSwitchRole }) {
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

  const { stats, beneficiaries, registry, programs, inventory, agent } = data

  return (
    <DashboardShell
      role={role}
      onSwitchRole={onSwitchRole}
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
            footer="Assessed from the DSWD beneficiary registry · 08:54"
          />
          <DataTable
            title="Relief Inventory"
            caption={`${inventory.filter(i => i.onHand < i.required).length} short`}
            columns={INVENTORY_COLUMNS}
            rows={inventory}
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
        title="List of Beneficiaries"
        caption={`showing ${beneficiaries.length} of ${registry.submitted} records · ${registry.validated} validated · ${registry.duplicates} duplicates · ${registry.pending} pending`}
        columns={BENEFICIARY_COLUMNS}
        rows={beneficiaries}
      />

      <DataTable
        title="Aid Programs"
        caption={`${programs.filter(p => p.status === 'ACTIVE').length} active`}
        columns={PROGRAM_COLUMNS}
        rows={programs}
      />
    </DashboardShell>
  )
}
