import { useEffect, useState } from 'react'
import { checkHealth, createSituationReport, processReport, logDecision } from '../api'
import HealthBanner from '../components/HealthBanner'
import SituationReportForm from '../components/SituationReportForm'
import AgentPipeline from '../components/AgentPipeline'
import AgentCard from '../components/AgentCard'
import AgentNav from '../components/AgentNav'
import HumanGate from '../components/HumanGate'
import { RoleChip } from '../components/shared/RoleHeader'
import EscalationStrip from '../components/shared/EscalationStrip'
import Sidebar from '../components/shared/Sidebar'
import { INCIDENT_ID } from '../data/escalation'
import SitrepQueue from '../components/asean/SitrepQueue'
import { getSitrepQueue } from '../data/dataSource'

const INITIAL = { phase: 'idle', reportId: null, agentOutputs: null, error: null }

/* The live five-agent pipeline. Lifted from App.jsx unchanged — only the import
   paths, the intro gate (now the login screen), the header chrome and the Phase 4
   escalation wiring differ. */
export default function AseanView({ role, onSwitchRole, escalation, visited }) {
  const [health, setHealth] = useState(null)
  const [healthError, setHealthError] = useState(false)
  const [state, setState] = useState(INITIAL)
  const [decisionResult, setDecisionResult] = useState(null)
  const [lastReportText, setLastReportText] = useState('')
  const [showSitrep, setShowSitrep] = useState(true)
  const [queue, setQueue] = useState([])
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    checkHealth()
      .then(d => setHealth(d))
      .catch(() => setHealthError(true))
  }, [])

  /* The queue gains the Alcoy row once the municipality has submitted and the
     relay has carried it up. Before that the AHA Centre has received nothing. */
  useEffect(() => {
    let cancelled = false
    getSitrepQueue(escalation).then(rows => { if (!cancelled) setQueue(rows) })
    return () => { cancelled = true }
  }, [escalation])

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

  /* Triaging a row runs the same pipeline the form always ran — the queue is a
     new way in, not a new pipeline. */
  function handleQueueSelect(row) {
    handleSubmit({
      report_text:  row.reportText,
      lgu_id:       row.lguId ?? 'cebu-alcoy',
      submitted_by: role.user,
    })
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
            <span className="app-title">{role.dashboard}</span>
          </div>
          <div className="app-subtitle">{role.org} · Emergency Management &amp; Monitoring Assistants</div>
        </div>

        <div className="app-header-center">
          <HealthBanner health={health} error={healthError} />
        </div>

        <div className="app-header-right">
          <span className="app-report-id">{INCIDENT_ID}</span>
          {state.reportId && (
            <span className="app-report-id">{state.reportId}</span>
          )}
          {state.phase !== 'idle' && (
            <button className="app-new-btn" onClick={reset}>New Report</button>
          )}
          <RoleChip role={role} onSwitchRole={onSwitchRole} />
        </div>
      </header>

      <EscalationStrip roleId="asean" hasEscalated={Boolean(escalation)} visited={visited} />

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

      {/* ── Idle layout: the queue is the job ───────────────── */}
      {!showPipeline && (
        <div className="asean-idle-body">
          <Sidebar role={role} />
          <div className="asean-intake">
          <SitrepQueue rows={queue} onSelect={handleQueueSelect} isLoading={isLoading} />

          {/* The pipeline standing by. Shows the shape of what triage will do
              before it does it, and fills the frame that used to sit empty. */}
          <div className="idle-pipeline">
            <div className="idle-pipeline-head">
              <span className="pipeline-legend-label">Triage pipeline</span>
              <span className="idle-pipeline-note">awaiting a report from the queue</span>
            </div>
            <div className="idle-pipeline-grid">
              {['intake', 'vulnerability', 'resource', 'routing', 'pattern', 'handoff'].map(k => (
                <AgentCard key={k} agentKey={k} idle />
              ))}
            </div>
          </div>

          {/* Manual entry is demoted, not removed. Real coordination desks do
              take phone-in reports and handle countries not yet integrated —
              it was never wrong, only wrongly prominent. */}
          <div className="manual-entry">
            <button
              type="button"
              className="manual-entry-toggle"
              onClick={() => setShowManual(v => !v)}
              aria-expanded={showManual}
            >
              <span className="manual-entry-label">Manual entry</span>
              <span className="manual-entry-hint">phone-in report · non-integrated member state</span>
              <span className="manual-entry-chevron">{showManual ? '−' : '+'}</span>
            </button>
            {showManual && (
              <div className="manual-entry-body">
                <SituationReportForm onSubmit={handleSubmit} isLoading={isLoading} escalation={escalation} />
              </div>
            )}
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
