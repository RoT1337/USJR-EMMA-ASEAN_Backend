import { RoleGlyph } from './RoleGlyph'
/* AgentPanel — thin wrapper around AgentCard's styling.
   It reuses the same class names (.agent-card, .conf-bar-track, .field-row …) so
   EMMA-Warn / Care / Plan render in the identical visual language as the five
   ASEAN agents. Content differs; chrome does not. */

/* Confidence tiers per the design system: 80+ green, 60–79 amber, below 60 red. */
function confidenceColor(pct) {
  if (pct >= 80) return '#059669'
  if (pct >= 60) return '#D97706'
  return '#DC2626'
}

export default function AgentPanel({
  name,               // 'EMMA-Warn'
  tagline,            // 'The Sentinel'
  roleId,             // which role's mark to show
  accent,             // agent accent, e.g. '#EA580C'
  accentBg,           // matching tint, e.g. '#FFF4EE'
  confidence,         // 0–100
  headline,           // one-line assessment
  detail,             // supporting sentence
  fields = [],        // [{ label, value, wide }]
  footer,             // optional node (e.g. a timestamp or action row)
  /* set false to colour the badge/bar by agent accent instead of confidence tier */
  tintByConfidence = true,
}) {
  const pct = Math.round(confidence ?? 0)
  const confColor = tintByConfidence ? confidenceColor(pct) : accent

  return (
    <div
      className="agent-card agent-card-populated"
      style={{ borderLeftColor: accent, background: accentBg }}
    >
      {/* Header — mirrors AgentCard */}
      <div className="agent-card-header">
        <div className="agent-card-title-row">
          <RoleGlyph roleId={roleId} size={15} className="agent-card-icon" style={{ color: accent }} />
          <div>
            <div className="agent-card-title" style={{ color: accent }}>{name}</div>
            <div className="agent-card-sub">{tagline}</div>
          </div>
        </div>
        <div className="agent-card-badge" style={{ background: confColor }}>{pct}%</div>
      </div>

      {/* Confidence bar */}
      <div className="conf-bar-track">
        <div className="conf-bar-fill" style={{ width: `${pct}%`, background: confColor }} />
      </div>

      {/* Assessment */}
      <div className="agent-card-fields">
        {headline && <p className="agent-panel-headline">{headline}</p>}
        {detail && <p className="agent-panel-detail">{detail}</p>}

        {fields.map(f => (
          <div key={f.label} className={`field-row ${f.wide ? 'field-wide' : ''}`}>
            <span className="field-label">{f.label}</span>
            <span className="field-value">
              {Array.isArray(f.value) ? f.value.join(', ') : f.value}
            </span>
          </div>
        ))}
      </div>

      {footer && <div className="agent-panel-footer">{footer}</div>}
    </div>
  )
}
