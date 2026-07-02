import AgentGlyph from './AgentGlyph'

const AGENTS = [
  { key: 'intake',        label: 'Intake',        sub: 'Language & triage' },
  { key: 'vulnerability', label: 'Vulnerability', sub: 'Population risk' },
  { key: 'resource',      label: 'Resource',      sub: 'Supply & gaps' },
  { key: 'routing',       label: 'Routing',       sub: 'Evacuation paths' },
  { key: 'pattern',       label: 'Pattern',       sub: 'Historical context' },
  { key: 'handoff',       label: 'Handoff',       sub: 'Final recommendation' },
]

export default function IntroScreen({ onLaunch }) {
  return (
    <div className="intro-root grid-lines">
      <div className="intro-bg-glow intro-bg-glow-1" />
      <div className="intro-bg-glow intro-bg-glow-2" />

      <div className="intro-content">
        <div className="intro-badge">ASEAN EMMA · AAIH 2026</div>

        <h1 className="intro-brand">
          Mission control for the<br />
          <span className="intro-brand-accent">first sixty minutes.</span>
        </h1>
        <p className="intro-sub">
          Emergency Management &amp; Monitoring Assistants — a six-agent AI ops console for
          Local Government disaster response units across the ASEAN corridor.
        </p>

        <div className="intro-pipeline-panel panel-lift">
          <div className="intro-pipeline-heading">
            <span className="mono-caps">Intelligence pipeline</span>
            <span className="mono-caps">6 agents · human-in-the-loop</span>
          </div>
          <div className="intro-pipeline">
            {AGENTS.map((a, i) => (
              <div key={a.key} className="intro-agent" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                <AgentGlyph agentKey={a.key} size={40} />
                <span className="intro-agent-label">{a.label}</span>
                <span className="intro-agent-sub">{a.sub}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="intro-desc">
          AI-powered disaster coordination pipeline · Claude Haiku agents · real-time operator control
        </p>

        <button className="intro-cta" onClick={onLaunch}>
          Launch Dashboard
          <span className="intro-cta-arrow">→</span>
        </button>
      </div>

      <div className="intro-footer">DRRMO Operator Dashboard · Built with Claude · Vite + React</div>
    </div>
  )
}
