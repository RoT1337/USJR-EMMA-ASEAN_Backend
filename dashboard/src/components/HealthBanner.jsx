export default function HealthBanner({ health, error }) {
  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--fail)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'var(--fail)', fontFamily: "'JetBrains Mono', monospace" }}>
          agent service unreachable · :8001
        </span>
      </div>
    )
  }

  if (!health) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--muted)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace" }}>
          connecting…
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span className="health-dot-live" style={{
        width: 7, height: 7, borderRadius: '50%',
        background: 'var(--pass)', flexShrink: 0,
        boxShadow: '0 0 5px rgba(5,150,105,0.5)',
      }} />
      <span style={{ fontSize: 12, color: 'var(--pass)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
        {health.agents} agents online
      </span>
      <span style={{ color: 'var(--rim)', fontSize: 12 }}>·</span>
      <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace" }}>
        {health.llm}
      </span>
    </div>
  )
}
