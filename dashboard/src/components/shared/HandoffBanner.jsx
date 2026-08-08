/* Inbound handoff banner — names what arrived at this tier and from whom, so each
   view opens on evidence that it is one seat in a chain rather than a standalone
   screen. */

export default function HandoffBanner({ inbound, accent }) {
  if (!inbound) return null

  return (
    <div className="handoff-banner" style={accent ? { borderLeftColor: accent } : undefined}>
      <span className="handoff-arrow" style={accent ? { color: accent } : undefined}>⬆</span>
      <span className="handoff-body">
        <span className="handoff-from">{inbound.from}</span>
        <span className="handoff-detail">{inbound.detail}</span>
      </span>
      <span className="handoff-meta">{inbound.at} · {inbound.by}</span>
    </div>
  )
}
