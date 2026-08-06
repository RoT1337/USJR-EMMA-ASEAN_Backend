/* Phase 1 placeholder. Marks where Phase 3 drops StatCard / DataTable /
   AgentPanel content once mockData.js exists. Delete once all views are filled. */

export function PendingRegion({ label, hint }) {
  return (
    <div className="pending-region">
      <div className="pending-region-label">{label}</div>
      {hint && <div className="pending-region-hint">{hint}</div>}
    </div>
  )
}

export default PendingRegion
