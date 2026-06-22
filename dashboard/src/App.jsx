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
    <div className="emma-root" style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--ground)' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--rim)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--alert)',
                letterSpacing: '-0.02em',
              }}>
                EMMA
              </span>
              <span style={{ color: 'var(--rim)', fontSize: 14 }}>|</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>
                DRRMO Operator Dashboard
              </span>
            </div>
            <div className="emma-header-subtitle">
              Emergency Management &amp; Monitoring Assistants · AAIH 2026
            </div>
          </div>
          <div className="emma-header-sep" />
          <HealthBanner health={health} error={healthError} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {state.reportId && (
            <span style={{
              fontSize: 11, color: 'var(--muted)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {state.reportId}
            </span>
          )}
          {state.phase !== 'idle' && (
            <button
              onClick={reset}
              style={{
                fontSize: 12, fontWeight: 500,
                color: 'var(--text-dim)',
                background: 'var(--ground)',
                border: '1px solid var(--rim)',
                borderRadius: 6,
                padding: '5px 12px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              New Report
            </button>
          )}
        </div>
      </header>

      {/* ── Status strip ─────────────────────────────────────── */}
      {(state.phase === 'submitting' || state.phase === 'processing' || state.phase === 'logging') && (
        <div className="emma-status-strip">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--alert)', animation: 'blink 1s ease infinite', flexShrink: 0 }} />
          {state.phase === 'submitting' && 'Registering report with Laravel…'}
          {state.phase === 'processing' && `Running 5-agent pipeline…`}
          {state.phase === 'logging'    && 'Logging operator decision to audit trail…'}
        </div>
      )}

      {state.phase === 'error' && (
        <div style={{
          background: 'var(--fail-bg)', borderBottom: '1px solid #FECACA',
          padding: '7px 24px', display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'var(--fail)',
        }}>
          <strong>Error:</strong> {state.error}
          <button onClick={reset} style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', color: 'var(--fail)', cursor: 'pointer', fontSize: 12 }}>
            Try again
          </button>
        </div>
      )}

      {state.phase === 'done' && decisionResult && (
        <div style={{
          background: 'var(--pass-bg)', borderBottom: '1px solid #A7F3D0',
          padding: '7px 24px', display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'var(--pass)',
        }}>
          <strong>Decision logged —</strong>
          <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{decisionResult.decision}</span>
          <span>· "{decisionResult.auditNote}" · Audit trail saved.</span>
          <button onClick={reset} style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', color: 'var(--pass)', cursor: 'pointer', fontSize: 12 }}>
            Submit new report
          </button>
        </div>
      )}

      {/* ── Body: sidebar + main ─────────────────────────────── */}
      <div className="emma-body">

        {/* Sidebar */}
        <aside className="emma-sidebar">
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--muted)',
          }}>
            Situation Report Input
          </div>
          <SituationReportForm onSubmit={handleSubmit} isLoading={isLoading} />
        </aside>

        {/* Main area */}
        <main className="emma-main">
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
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              color: 'var(--muted)',
              minHeight: 300,
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
                Submit a situation report to activate the 5-agent pipeline
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                {['Intake', 'Vulnerability', 'Resource', 'Routing', 'Pattern', 'Handoff'].map((a, i) => (
                  <span key={a} style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--muted)',
                    background: 'var(--surface)',
                    border: '1px solid var(--rim)',
                    borderRadius: 4,
                    padding: '3px 8px',
                  }}>{a}</span>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
