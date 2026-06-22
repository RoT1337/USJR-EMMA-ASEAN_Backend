import { useEffect, useState } from 'react'
import { checkHealth, createSituationReport, processReport, logDecision } from './api'
import HealthBanner from './components/HealthBanner'
import SituationReportForm from './components/SituationReportForm'
import AgentPipeline from './components/AgentPipeline'
import AgentNav from './components/AgentNav'
import HumanGate from './components/HumanGate'

const INITIAL = { phase: 'idle', reportId: null, agentOutputs: null, error: null }

function App() {
  const [health, setHealth] = useState(null)
  const [healthError, setHealthError] = useState(false)
  const [state, setState] = useState(INITIAL)
  const [decisionResult, setDecisionResult] = useState(null)
  const [lastReportText, setLastReportText] = useState('')
  const [showSitrep, setShowSitrep] = useState(true)

  useEffect(() => {
    checkHealth()
      .then(d => setHealth(d))
      .catch(() => setHealthError(true))
  }, [])

  async function handleSubmit(form) {
    setLastReportText(form.report_text)
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
    setLastReportText('')
  }

  const isLoading    = state.phase === 'submitting' || state.phase === 'processing'
  const showPipeline = ['submitting', 'processing', 'awaiting_decision', 'logging', 'done'].includes(state.phase)
  const showGate     = state.phase === 'awaiting_decision' || state.phase === 'logging'

  return (
    <div className="app-root">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-brand">
            <span className="app-logo">EMMA</span>
            <span className="app-pipe">|</span>
            <span className="app-title">DRRMO Operator Dashboard</span>
          </div>
          <div className="app-subtitle">Emergency Management &amp; Monitoring Assistants · AAIH 2026</div>
        </div>

        <div className="app-header-center">
          <HealthBanner health={health} error={healthError} />
        </div>

        <div className="app-header-right">
          {state.reportId && (
            <span className="app-report-id">{state.reportId}</span>
          )}
          {state.phase !== 'idle' && (
            <button className="app-new-btn" onClick={reset}>New Report</button>
          )}
        </div>
      </header>

      {/* ── Status strips ───────────────────────────────────── */}
      {state.phase === 'submitting' && (
        <div className="app-strip">
          <span className="strip-dot" />
          Registering report with Laravel…
        </div>
      )}
      {state.phase === 'processing' && (
        <div className="app-strip">
          <span className="strip-dot" />
          Running 5-agent pipeline…
        </div>
      )}
      {state.phase === 'logging' && (
        <div className="app-strip">
          <span className="strip-dot" />
          Logging operator decision to audit trail…
        </div>
      )}
      {state.phase === 'error' && (
        <div className="app-strip app-strip-error">
          <strong>Error:</strong> {state.error}
          <button onClick={reset} className="strip-link">Try again</button>
        </div>
      )}
      {state.phase === 'done' && decisionResult && (
        <div className="app-strip app-strip-done">
          <strong>Decision logged —</strong>
          <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{decisionResult.decision}</span>
          <span>· "{decisionResult.auditNote}" · Audit trail saved.</span>
          <button onClick={reset} className="strip-link">Submit new report</button>
        </div>
      )}

      {/* ── Idle layout: form + empty state ─────────────────── */}
      {!showPipeline && (
        <div className="app-body">
          <div className="app-form-section">
            <SituationReportForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
          <div className="app-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="app-empty-icon">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            <p className="app-empty-text">Submit a situation report to activate the 5-agent pipeline</p>
            <div className="app-empty-tags">
              {['Intake', 'Vulnerability', 'Resource', 'Routing', 'Pattern', 'Handoff'].map(a => (
                <span key={a} className="app-empty-tag">{a}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Doc layout: agent nav + pipeline ────────────────── */}
      {showPipeline && (
        <div className="app-body-doc">
          <AgentNav outputs={state.agentOutputs} />

          <main className="doc-main">
            {lastReportText && (
              <div className="doc-sitrep">
                <button className="doc-sitrep-toggle" onClick={() => setShowSitrep(!showSitrep)}>
                  <span className="doc-sitrep-label">Situation Report</span>
                  <span className="doc-sitrep-id">{state.reportId}</span>
                  <span className="doc-sitrep-chevron">{showSitrep ? '▼' : '▶'}</span>
                </button>
                {showSitrep && (
                  <p className="doc-sitrep-text">{lastReportText}</p>
                )}
              </div>
            )}

            <AgentPipeline
              outputs={state.agentOutputs}
              isProcessing={state.phase === 'processing' || state.phase === 'submitting'}
            />

            {showGate && state.agentOutputs?.handoff && (
              <HumanGate
                handoff={state.agentOutputs.handoff}
                onDecide={handleDecide}
                isLogging={state.phase === 'logging'}
              />
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default App
