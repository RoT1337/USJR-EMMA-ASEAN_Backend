import { Inbox } from 'lucide-react'

/* The hero of the ASEAN view — what a coordinator actually does is triage
   inbound reports from member states, not compose them.

   Rows carry the originating NDMO in a `via` column, which is how the AADMER
   pathway gets stated as data rather than as a caption. Only a NEW row is
   actionable; processed rows are history and say so. */

const fmt = n => n.toLocaleString('en-US')

export default function SitrepQueue({ rows, onSelect, isLoading }) {
  const newCount = rows.filter(r => r.status === 'NEW').length

  return (
    <div className="queue-card">
      <div className="queue-head">
        <Inbox size={14} strokeWidth={2} className="queue-head-icon" />
        <span className="queue-title">Incoming SITREPs</span>
        <span className="queue-scope">AADMER Operations</span>
        <span className="queue-count">
          {newCount > 0 ? `${newCount} awaiting triage` : 'queue clear'}
        </span>
      </div>

      <div className="queue-rows">
        {rows.length === 0 && (
          <div className="queue-empty">
            No inbound reports. Member-state NDMOs submit through the AADMER channel.
          </div>
        )}

        {rows.map(row => {
          const isNew = row.status === 'NEW'
          return (
            <button
              key={row.id}
              type="button"
              className={`queue-row ${isNew ? 'queue-row-new' : 'queue-row-done'}`}
              onClick={isNew ? () => onSelect(row) : undefined}
              disabled={!isNew || isLoading}
              aria-label={isNew ? `Process ${row.id}` : `${row.id} already processed`}
            >
              <span className={`queue-status ${isNew ? 'queue-status-new' : ''}`}>
                {isNew && <span className="queue-dot" />}
                {row.status}
              </span>

              <span className="queue-id">{row.id}</span>

              <span className="queue-country">
                <span className="queue-flag">{row.countryCode}</span>
                {row.country}
              </span>

              <span className="queue-hazard">{row.hazard}</span>
              <span className="queue-at">{row.at}</span>

              <span className="queue-sub">
                {row.locality}
                <span className="queue-sep">·</span>
                <span className="queue-via">via {row.via}</span>
                <span className="queue-sep">·</span>
                {fmt(row.affected)} affected
              </span>

              {isNew && (
                <span className="queue-action">
                  {isLoading ? 'Processing…' : 'Process →'}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
