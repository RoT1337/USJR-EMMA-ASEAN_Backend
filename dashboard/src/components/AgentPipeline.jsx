import AgentCard from './AgentCard'

const AGENTS = ['intake', 'vulnerability', 'resource', 'routing', 'pattern', 'handoff']

export default function AgentPipeline({ outputs }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--muted)',
        marginBottom: 12,
      }}>
        Agent Pipeline
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 10,
      }}>
        {AGENTS.map((key, i) => (
          <AgentCard
            key={key}
            agentKey={key}
            data={outputs?.[key] ?? null}
            animationDelay={i * 100}
          />
        ))}
      </div>
    </div>
  )
}
