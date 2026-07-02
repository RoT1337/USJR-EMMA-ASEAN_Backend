const AGENTS = [
  { icon: '📋', label: 'Intake',        sub: 'Language & Triage' },
  { icon: '🛡️', label: 'Vulnerability', sub: 'Population Risk' },
  { icon: '📦', label: 'Resource',      sub: 'Supply & Gaps' },
  { icon: '🗺️', label: 'Routing',       sub: 'Evacuation Paths' },
  { icon: '📊', label: 'Pattern',       sub: 'Historical Context' },
  { icon: '🎯', label: 'Handoff',       sub: 'Final Recommendation' },
]

export default function IntroScreen({ onLaunch }) {
  return (
    <div className="intro-root">
      <div className="intro-bg-glow intro-bg-glow-1" />
      <div className="intro-bg-glow intro-bg-glow-2" />

      <div className="intro-content">
        {/* ASEAN badge */}
        <div className="intro-badge">ASEAN EMMA · AAIH 2026</div>

        {/* Brand */}
        <div className="intro-brand">EMMA</div>
        <div className="intro-sub">Emergency Management &amp; Monitoring Assistants</div>

        {/* Agent pipeline preview */}
        <div className="intro-pipeline">
          {AGENTS.map((a, i) => (
            <div
              key={a.label}
              className="intro-agent"
              style={{ animationDelay: `${0.4 + i * 0.12}s` }}
            >
              <span className="intro-agent-icon">{a.icon}</span>
              <span className="intro-agent-label">{a.label}</span>
              <span className="intro-agent-sub">{a.sub}</span>
              {i < AGENTS.length - 1 && <span className="intro-agent-arrow">→</span>}
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="intro-desc">
          AI-powered disaster coordination pipeline · Claude Haiku agents · Real-time operator control
        </p>

        {/* CTA */}
        <button className="intro-cta" onClick={onLaunch}>
          Launch Dashboard
          <span className="intro-cta-arrow">→</span>
        </button>
      </div>

      {/* Footer */}
      <div className="intro-footer">
        DRRMO Operator Dashboard · Built with Claude · Vite + React
      </div>
    </div>
  )
}
