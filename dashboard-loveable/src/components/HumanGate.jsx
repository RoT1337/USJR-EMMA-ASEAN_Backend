import { useState } from 'react'
import ConfidenceBadge from './ConfidenceBadge'

export default function HumanGate({ handoff, onDecide, isLogging }) {
  const [note, setNote] = useState('')

  function submit(decision) {
    if (!note.trim()) {
      alert('Please add an audit note before submitting your decision.')
      return
    }
    onDecide(decision, note)
  }

  return (
    <div className="humangate panel-enter">
      <div className="humangate-header">
        <span className="humangate-dot" />
        <span className="humangate-title">Human Gate — Decision Required</span>
      </div>

      {handoff && (
        <div className="humangate-rec">
          <div className="humangate-rec-header">
            <span className="mono-caps" style={{ color: 'var(--alert)' }}>Recommendation</span>
            <ConfidenceBadge value={handoff.confidence} />
          </div>
          {handoff.action && <p className="humangate-action">{handoff.action}</p>}
          {handoff.reasoning && <p className="humangate-reasoning">{handoff.reasoning}</p>}
        </div>
      )}

      <div className="humangate-note">
        <label className="humangate-label">
          Audit Note <span className="humangate-required">*</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder="Explain your decision for the audit trail…"
          className="ops-input"
          style={{ resize: 'none' }}
        />
      </div>

      <div className="humangate-buttons">
        <button
          onClick={() => submit('approved')}
          disabled={isLogging}
          className="gate-btn gate-btn-approve"
        >
          <span>✓</span> Approve
        </button>
        <button
          onClick={() => submit('modified')}
          disabled={isLogging}
          className="gate-btn gate-btn-modify"
        >
          <span>✎</span> Modify
        </button>
        <button
          onClick={() => submit('rejected')}
          disabled={isLogging}
          className="gate-btn gate-btn-reject"
        >
          <span>✕</span> Reject
        </button>
      </div>
    </div>
  )
}
