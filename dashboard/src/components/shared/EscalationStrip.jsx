import { CHAIN, chainStateFor, INCIDENT_ID } from '../../data/escalation'

/* The reporting chain as it actually works, rendered in all four views.

   Not a flat five-rung ladder: DRRMO, MSWD and the Mayor's Office are lateral
   peers inside one municipal tier, and there are two real tiers — Provincial
   DRRMC and NDRRMC — between Alcoy and the AHA Centre that we relay through
   rather than staff. Those render dimmed and labelled "auto-relayed", which is
   also where EMMA-Aggregate and EMMA-Report earn their place on screen. */

export default function EscalationStrip({ roleId, hasEscalated = false, visited = [] }) {
  const { done, doneSeats } = chainStateFor(roleId, { hasEscalated, visited })

  return (
    <div className="esc-strip">
      <span className="esc-strip-label">Reporting chain</span>

      <div className="esc-chain">
        {CHAIN.map((node, i) => (
          <div className="esc-node-wrap" key={node.id}>
            {i > 0 && (
              <span
                className={`esc-link ${done.has(node.id) || doneSeats.size > 0 && node.id === 'municipal' ? 'esc-link-done' : ''}`}
              />
            )}

            {node.kind === 'group' ? (
              <div className="esc-group" title={node.detail}>
                <span className="esc-group-label">{node.label}</span>
                <span className="esc-seats">
                  {node.seats.map(seat => {
                    const isDone = doneSeats.has(seat.id)
                    const isHere = seat.id === roleId
                    return (
                      <span
                        key={seat.id}
                        className={`esc-seat ${isDone ? 'esc-seat-done' : ''} ${isHere ? 'esc-seat-here' : ''}`}
                        title={seat.detail}
                      >
                        <span className="esc-dot" />
                        {seat.label}
                      </span>
                    )
                  })}
                </span>
              </div>
            ) : (
              <div
                className={`esc-node esc-node-${node.kind} ${done.has(node.id) ? 'esc-node-done' : ''} ${node.id === roleId ? 'esc-node-here' : ''}`}
                title={node.detail}
              >
                <span className="esc-dot" />
                <span className="esc-node-label">{node.label}</span>
                {node.note && <span className="esc-node-note">{node.note}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      <span className="esc-strip-id">{INCIDENT_ID}</span>
    </div>
  )
}
