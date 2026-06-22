const AGENT_META = {
  intake:        { label: 'Intake Agent',        color: 'blue',   icon: '📥' },
  vulnerability: { label: 'Vulnerability Agent', color: 'amber',  icon: '⚠️' },
  resource:      { label: 'Resource Agent',      color: 'violet', icon: '📦' },
  routing:       { label: 'Routing Agent',       color: 'teal',   icon: '🗺️' },
  pattern:       { label: 'Pattern Agent',       color: 'orange', icon: '📊' },
  handoff:       { label: 'Handoff Coordinator', color: 'rose',   icon: '🤝' },
}

const COLOR_CLASSES = {
  blue:   { border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   title: 'text-blue-700' },
  amber:  { border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700', title: 'text-amber-700' },
  violet: { border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', title: 'text-violet-700' },
  teal:   { border: 'border-teal-200',   badge: 'bg-teal-100 text-teal-700',   title: 'text-teal-700' },
  orange: { border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', title: 'text-orange-700' },
  rose:   { border: 'border-rose-200',   badge: 'bg-rose-100 text-rose-700',   title: 'text-rose-700' },
}

function ConfidenceBadge({ score, colorClass }) {
  const pct = Math.round((score ?? 0) * 100)
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
      {pct}% confidence
    </span>
  )
}

function FieldRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  const display = Array.isArray(value)
    ? value.length === 0 ? '—' : value.join(', ')
    : String(value)
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-400 shrink-0 w-36">{label}</span>
      <span className="text-slate-700">{display || '—'}</span>
    </div>
  )
}

function AgentFields({ agentKey, data }) {
  if (agentKey === 'intake') return (
    <div className="space-y-1">
      <FieldRow label="Language detected" value={data.language_detected} />
      <FieldRow label="Location"          value={data.location} />
      <FieldRow label="Hazard type"       value={data.hazard_type} />
      <FieldRow label="Population"        value={data.population_affected} />
      <FieldRow label="Urgency"           value={data.urgency} />
      <FieldRow label="Key flags"         value={data.key_flags} />
    </div>
  )
  if (agentKey === 'vulnerability') return (
    <div className="space-y-1">
      <FieldRow label="Tier 1 groups"   value={data.tier1} />
      <FieldRow label="Tier 2 groups"   value={data.tier2} />
      <FieldRow label="Recommendation" value={data.recommendation} />
    </div>
  )
  if (agentKey === 'resource') return (
    <div className="space-y-1">
      <FieldRow label="Gaps"           value={data.gaps} />
      <FieldRow label="Available"      value={data.available} />
      <FieldRow label="Recommendation" value={data.recommendation} />
    </div>
  )
  if (agentKey === 'routing') return (
    <div className="space-y-1">
      <FieldRow label="Primary route"  value={data.primary_status} />
      <FieldRow label="Alternative"    value={data.alternative} />
      <FieldRow label="ETA"            value={data.eta_minutes != null ? `${data.eta_minutes} min` : null} />
      <FieldRow label="Risk"           value={data.risk} />
      <FieldRow label="Recommendation" value={data.recommendation} />
    </div>
  )
  if (agentKey === 'pattern') return (
    <div className="space-y-1">
      <FieldRow label="Prior event"    value={data.prior_event} />
      <FieldRow label="Insight"        value={data.insight} />
      <FieldRow label="Cross-border"   value={data.cross_border} />
    </div>
  )
  if (agentKey === 'handoff') return (
    <div className="space-y-1">
      <FieldRow label="Recommended action" value={data.action} />
      <FieldRow label="Reasoning"          value={data.reasoning} />
    </div>
  )
  return null
}

export default function AgentCard({ agentKey, data, animationDelay = 0 }) {
  const meta = AGENT_META[agentKey]
  const colors = COLOR_CLASSES[meta.color]

  if (!data) {
    return (
      <div
        className={`rounded-xl border-2 border-dashed ${colors.border} bg-white/50 p-4 animate-pulse`}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{meta.icon}</span>
          <span className={`font-semibold text-sm ${colors.title} opacity-50`}>{meta.label}</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border-2 ${colors.border} bg-white p-4 shadow-sm`}
      style={{ animation: `fadeIn 0.4s ease ${animationDelay}ms both` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.icon}</span>
          <span className={`font-semibold text-sm ${colors.title}`}>{meta.label}</span>
        </div>
        <ConfidenceBadge score={data.confidence} colorClass={colors.badge} />
      </div>
      <AgentFields agentKey={agentKey} data={data} />
    </div>
  )
}
