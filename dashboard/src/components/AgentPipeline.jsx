import AgentCard from './AgentCard'

const AGENTS = ['intake', 'vulnerability', 'resource', 'routing', 'pattern', 'handoff']

export default function AgentPipeline({ outputs }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Agent Pipeline
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {AGENTS.map((key, i) => (
          <AgentCard
            key={key}
            agentKey={key}
            data={outputs?.[key] ?? null}
            animationDelay={i * 120}
          />
        ))}
      </div>
    </div>
  )
}
