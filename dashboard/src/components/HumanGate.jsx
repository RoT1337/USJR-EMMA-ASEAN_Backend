import { useState } from 'react'

export default function HumanGate({ handoff, onDecide, isLogging }) {
  const [note, setNote] = useState('')

  function submit(decision) {
    if (!note.trim()) {
      alert('Add an audit note before submitting.')
      return
    }
    onDecide(decision, note)
  }

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 8,
      border: '1.5px solid var(--rim)',
      borderTop: '3px solid var(--fail)',
      padding: '18px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--fail)',
          animation: 'blink 1.5s ease infinite',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.09em',
          textTransform: 'uppercase', color: 'var(--fail)',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Human Gate — Decision Required
        </span>
      </div>

      {handoff && (
        <div style={{
          background: 'var(--fail-bg)',
          borderRadius: 6,
          padding: '12px 14px',
          marginBottom: 14,
          borderLeft: '3px solid var(--fail)',
        }}>
          {handoff.action && (
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 5 }}>
              {handoff.action}
            </div>
          )}
          {handoff.reasoning && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 8 }}>
              "{handoff.reasoning}"
            </div>
          )}
          {handoff.confidence != null && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--fail)',
            }}>
              {Math.round(handoff.confidence * 100)}% confidence
            </span>
          )}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.09em',
          textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5,
        }}>
          Audit Note <span style={{ color: 'var(--fail)' }}>*</span>
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder="Explain your decision for the audit trail…"
          className="ops-input"
          style={{ resize: 'none' }}
        />
      </div>

      <div className="gate-buttons">
        {[
          { label: '✓ Approve', decision: 'approved', bg: 'var(--pass)',  text: '#fff' },
          { label: '✎ Modify',  decision: 'modified',  bg: 'var(--amber)', text: '#fff' },
          { label: '✕ Reject',  decision: 'rejected',  bg: 'var(--fail)',  text: '#fff' },
        ].map(({ label, decision, bg, text }) => (
          <button
            key={decision}
            onClick={() => submit(decision)}
            disabled={isLogging}
            style={{
              padding: '10px 0',
              background: bg,
              color: text,
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: isLogging ? 'not-allowed' : 'pointer',
              opacity: isLogging ? 0.5 : 1,
              transition: 'opacity 0.15s, filter 0.15s',
            }}
            onMouseEnter={e => { if (!isLogging) e.target.style.filter = 'brightness(0.88)' }}
            onMouseLeave={e => { e.target.style.filter = 'none' }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
