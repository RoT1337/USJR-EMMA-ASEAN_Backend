import { useState } from 'react'

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
    <div className="humangate">
      <div className="humangate-header">
        <span className="humangate-dot" />
        <span className="humangate-title">Human Gate — Decision Required</span>
      </div>

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
