/* DataTable — header row, data rows, status pills.
   Pill palette extends the URGENCY_STYLES already used by AgentCard so a
   CRITICAL row in DRRMO looks identical to a CRITICAL badge in the ASEAN view. */

const PILL_STYLES = {
  /* severity — same values AgentCard uses */
  CRITICAL:  { bg: '#FEF2F2', color: '#DC2626' },
  HIGH:      { bg: '#FFF4EE', color: '#EA580C' },
  MEDIUM:    { bg: '#FFFBEB', color: '#D97706' },
  LOW:       { bg: '#ECFDF5', color: '#059669' },

  /* workflow states */
  VALIDATED: { bg: '#ECFDF5', color: '#059669' },
  APPROVED:  { bg: '#ECFDF5', color: '#059669' },
  CLEARED:   { bg: '#ECFDF5', color: '#059669' },
  OPEN:      { bg: '#ECFDF5', color: '#059669' },
  PENDING:   { bg: '#FFFBEB', color: '#D97706' },
  REVIEW:    { bg: '#FFFBEB', color: '#D97706' },
  PARTIAL:   { bg: '#FFFBEB', color: '#D97706' },
  DUPLICATE: { bg: '#FEF2F2', color: '#DC2626' },
  FLAGGED:   { bg: '#FEF2F2', color: '#DC2626' },
  FULL:      { bg: '#FEF2F2', color: '#DC2626' },
  REJECTED:  { bg: '#FEF2F2', color: '#DC2626' },
  ACTIVE:    { bg: '#F0F7FF', color: '#0284C7' },
  DISPATCHED:{ bg: '#F0F7FF', color: '#0284C7' },
  DEFAULT:   { bg: '#EDF1F6', color: '#4E6A84' },
}

export function StatusPill({ value }) {
  if (value === undefined || value === null || value === '') return null
  const key = String(value).toUpperCase()
  const s = PILL_STYLES[key] ?? PILL_STYLES.DEFAULT
  return (
    <span className="badge-dot" style={{ background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {key}
    </span>
  )
}

/**
 * columns: [{ key, label, align?: 'left'|'right', width?: string, pill?: boolean, mono?: boolean }]
 * rows:    [{ [key]: value, ... }]  — an optional `accent` on a row tints its left edge.
 */
export default function DataTable({ title, caption, columns, rows, emptyText = 'No records' }) {
  return (
    <div className="data-table-card">
      {(title || caption) && (
        <div className="data-table-head">
          {title && <span className="data-table-title">{title}</span>}
          {caption && <span className="data-table-caption">{caption}</span>}
        </div>
      )}

      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(c => (
                <th
                  key={c.key}
                  style={{ width: c.width, textAlign: c.align ?? 'left' }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="data-table-empty" colSpan={columns.length}>{emptyText}</td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.id ?? i} style={row.accent ? { boxShadow: `inset 3px 0 0 ${row.accent}` } : undefined}>
                {columns.map(c => (
                  <td
                    key={c.key}
                    style={{ textAlign: c.align ?? 'left' }}
                    className={c.mono ? 'data-cell-mono' : undefined}
                  >
                    {c.pill ? <StatusPill value={row[c.key]} /> : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
