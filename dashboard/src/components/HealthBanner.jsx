export default function HealthBanner({ health, error }) {
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
        <span>
          <strong>Agent service unreachable.</strong> Make sure Python service is running on{' '}
          {import.meta.env.VITE_PYTHON_SERVICE_URL ?? 'http://localhost:8001'}.
        </span>
      </div>
    )
  }

  if (!health) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-slate-100 border border-slate-200 px-4 py-2 text-sm text-slate-500">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-pulse shrink-0" />
        <span>Checking agent service…</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-800">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
      <span>
        Agent service <strong>online</strong> — {health.agents} agents ready · LLM:{' '}
        <code className="font-mono text-xs bg-emerald-100 px-1 py-0.5 rounded">{health.llm}</code>
      </span>
    </div>
  )
}
