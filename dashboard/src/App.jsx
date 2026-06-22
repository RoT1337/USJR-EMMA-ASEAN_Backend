import { useEffect, useState } from 'react'
import { checkHealth, createSituationReport, processReport, logDecision } from './api'
import HealthBanner from './components/HealthBanner'
import SituationReportForm from './components/SituationReportForm'
import AgentPipeline from './components/AgentPipeline'
import HumanGate from './components/HumanGate'

// Phases: idle | submitting | processing | awaiting_decision | logging | done | error
const INITIAL = { phase: 'idle', reportId: null, agentOutputs: null, error: null }

function App() {
  const [health, setHealth] = useState(null)
  const [healthError, setHealthError] = useState(false)
  const [state, setState] = useState(INITIAL)
  const [decisionResult, setDecisionResult] = useState(null)

  useEffect(() => {
    checkHealth()
      .then(d => setHealth(d))
      .catch(() => setHealthError(true))
  }, [])

  async function handleSubmit(form) {
    setState({ phase: 'submitting', reportId: null, agentOutputs: null, error: null })
    try {
      const now = new Date().toISOString()
      const { report_id } = await createSituationReport({
        report_text:  form.report_text,
        lgu_id:       form.lgu_id,
        submitted_by: form.submitted_by,
        timestamp:    now,
      })

      setState(s => ({ ...s, phase: 'processing', reportId: report_id }))

      const outputs = await processReport({
        report_id,
        report_text: form.report_text,
        lgu_id:      form.lgu_id,
        timestamp:   now,
      })

      setState(s => ({ ...s, phase: 'awaiting_decision', agentOutputs: outputs }))
    } catch (err) {
      setState(s => ({
        ...s,
        phase: 'error',
        error: err?.response?.data?.message ?? err.message,
      }))
    }
  }

  async function handleDecide(decision, auditNote) {
    setState(s => ({ ...s, phase: 'logging' }))
    try {
      await logDecision({
        report_id:         state.reportId,
        agent_outputs:     state.agentOutputs,
        operator_decision: decision,
        operator_id:       'operator-1',
        decided_at:        new Date().toISOString(),
        audit_note:        auditNote,
      })
      setDecisionResult({ decision, auditNote })
      setState(s => ({ ...s, phase: 'done' }))
    } catch (err) {
      setState(s => ({
        ...s,
        phase: 'error',
        error: err?.response?.data?.message ?? err.message,
      }))
    }
  }

  function reset() {
    setState(INITIAL)
    setDecisionResult(null)
  }

  const isLoading   = state.phase === 'submitting' || state.phase === 'processing'
  const showPipeline = ['processing', 'awaiting_decision', 'logging', 'done'].includes(state.phase)
  const showGate     = state.phase === 'awaiting_decision' || state.phase === 'logging'

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-blue-600 font-black text-xl tracking-tight">EMMA</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 text-sm font-medium">DRRMO Operator Dashboard</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Emergency Management &amp; Monitoring Assistants · AAIH 2026
          </p>
        </div>
        {state.phase !== 'idle' && (
          <button
            onClick={reset}
            className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer"
          >
            New Report
          </button>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        <HealthBanner health={health} error={healthError} />

        {state.phase === 'submitting' && (
          <StatusBanner color="blue" message="Registering report with Laravel…" />
        )}
        {state.phase === 'processing' && (
          <StatusBanner color="blue" message={`Running 5-agent pipeline for report ${state.reportId}…`} />
        )}
        {state.phase === 'logging' && (
          <StatusBanner color="amber" message="Logging operator decision to audit trail…" />
        )}

        {state.phase === 'error' && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <strong>Error:</strong> {state.error}
            <button onClick={reset} className="ml-3 underline cursor-pointer">Try again</button>
          </div>
        )}

        {state.phase === 'done' && decisionResult && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
            <strong>Decision logged —</strong>{' '}
            <span className="capitalize font-semibold">{decisionResult.decision}</span>
            {': '}&quot;{decisionResult.auditNote}&quot;. Audit trail saved.{' '}
            <button onClick={reset} className="underline cursor-pointer">Submit new report</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left col: input form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Situation Report Input
              </h2>
              <SituationReportForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Right col: pipeline + gate */}
          <div className="lg:col-span-3 space-y-4">
            {showPipeline ? (
              <>
                <AgentPipeline outputs={state.agentOutputs} />
                {showGate && state.agentOutputs?.handoff && (
                  <HumanGate
                    handoff={state.agentOutputs.handoff}
                    onDecide={handleDecide}
                    isLogging={state.phase === 'logging'}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm text-center rounded-xl border-2 border-dashed border-slate-200 bg-white/50">
                <span className="text-3xl mb-2">🤖</span>
                Submit a situation report to activate the 5-agent pipeline
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatusBanner({ color, message }) {
  const cls = color === 'blue'
    ? 'bg-blue-50 border-blue-200 text-blue-700'
    : 'bg-amber-50 border-amber-200 text-amber-700'
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${cls}`}>
      <span className="h-2 w-2 rounded-full bg-current animate-pulse shrink-0" />
      {message}
    </div>
  )
}

export default App
