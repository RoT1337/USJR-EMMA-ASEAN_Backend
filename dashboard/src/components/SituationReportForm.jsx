const LANGUAGES = [
  { value: 'filipino',   label: 'Filipino' },
  { value: 'bahasa',     label: 'Bahasa Indonesia' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'thai',       label: 'Thai' },
  { value: 'english',    label: 'English' },
]

function Label({ children }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
      color: 'var(--text-dim)',
      marginBottom: 5,
    }}>
      {children}
    </div>
  )
}

/* `escalation` prefills the form when a SITREP arrives from the LGU tier. The
   fields stay editable and manual entry still works — prefill changes the demo
   path, it does not replace the form. */
export default function SituationReportForm({ onSubmit, isLoading, escalation }) {
  function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    onSubmit({
      report_text:  fd.get('report_text'),
      lgu_id:       fd.get('lgu_id') || 'demo-lgu',
      language:     fd.get('language'),
      submitted_by: fd.get('submitted_by') || 'operator-1',
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {escalation && (
        <div className="provenance-banner">
          <div className="provenance-head">
            <span className="provenance-arrow">⬆</span>
            <span className="provenance-title">
              {escalation.sitrepId} · {escalation.at} · {escalation.by}
            </span>
          </div>

          {/* The route matters: a municipality cannot submit to the AHA Centre
              directly. Showing the relay is what makes this read as a document
              that travelled rather than one that teleported. */}
          <div className="provenance-path">
            {escalation.relayPath.map((hop, i) => (
              <span key={hop} className="provenance-hop">
                {i > 0 && <span className="provenance-sep">→</span>}
                {hop}
              </span>
            ))}
          </div>

          <div className="provenance-relay">
            relayed via {escalation.relayAgents.join(' · ')}
          </div>
        </div>
      )}

      <div>
        <Label>LGU / Location</Label>
        <input
          name="lgu_id"
          type="text"
          defaultValue={escalation?.lguId ?? 'cebu-city-lgu'}
          className="ops-input"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <Label>Operator ID</Label>
          <input name="submitted_by" type="text" defaultValue="operator-1" className="ops-input" />
        </div>
        <div>
          <Label>Language</Label>
          <select name="language" defaultValue="english" className="ops-input ops-select">
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>Situation Report</Label>
        {/* Taller when escalated — the composed SITREP is the thing to look at,
            and at 6 rows only its first four lines are visible. */}
        <textarea
          name="report_text"
          required
          rows={escalation ? 18 : 6}
          defaultValue={escalation?.reportText ?? ''}
          placeholder="Describe the emergency — location, hazard type, affected population, road conditions, known obstacles…"
          className="ops-input ops-report-textarea"
          style={{ resize: 'none', lineHeight: 1.65 }}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '11px 0',
          background: isLoading ? 'var(--rim)' : 'var(--alert)',
          color: isLoading ? 'var(--muted)' : '#fff',
          border: 'none',
          borderRadius: 7,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: '0.02em',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.15s',
        }}
      >
        {isLoading ? 'Processing…' : 'Submit Situation Report →'}
      </button>
    </form>
  )
}
