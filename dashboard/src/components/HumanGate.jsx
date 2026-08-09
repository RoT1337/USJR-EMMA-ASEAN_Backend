import { useState } from 'react'
import { UI_ICONS } from './shared/icons'

/* No `handoff` prop: the Handoff agent card renders directly above this gate and
   already shows the same action and reasoning in full. Restating it here would
   duplicate what is on screen and cost vertical space in a view that is already
   long (NOTES B3, resolved in Phase 4e). */
export default function HumanGate({ onDecide, isLogging }) {
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
          <UI_ICONS.check size={14} strokeWidth={2.5} /> Approve
        </button>
        <button
          onClick={() => submit('modified')}
          disabled={isLogging}
          className="gate-btn gate-btn-modify"
        >
          <UI_ICONS.edit size={14} strokeWidth={2.5} /> Modify
        </button>
        <button
          onClick={() => submit('rejected')}
          disabled={isLogging}
          className="gate-btn gate-btn-reject"
        >
          <UI_ICONS.reject size={14} strokeWidth={2.5} /> Reject
        </button>
      </div>
    </div>
  )
}
