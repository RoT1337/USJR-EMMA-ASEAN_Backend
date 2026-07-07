const GLYPH = {
  intake:        { code: 'IN', color: '#0284C7', bg: '#F0F7FF' },
  vulnerability: { code: 'VU', color: '#D97706', bg: '#FFFBEB' },
  resource:      { code: 'RS', color: '#7C3AED', bg: '#F5F3FF' },
  routing:       { code: 'RT', color: '#059669', bg: '#ECFDF5' },
  pattern:       { code: 'PT', color: '#EA580C', bg: '#FFF4EE' },
  handoff:       { code: 'HO', color: '#DC2626', bg: '#FEF2F2' },
}

export default function AgentGlyph({ agentKey, size = 40, thinking = false }) {
  const g = GLYPH[agentKey] ?? { code: '--', color: '#8FA3BA', bg: '#EDF1F6' }
  return (
    <div
      className="agent-glyph"
      style={{ width: size, height: size, fontSize: size * 0.34, color: g.color, background: g.bg }}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{g.code}</span>
      {thinking && <span className="agent-glyph-thinking-ring" />}
    </div>
  )
}
