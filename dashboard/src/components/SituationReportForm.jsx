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

export default function SituationReportForm({ onSubmit, isLoading }) {
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
      <div>
        <Label>LGU / Location</Label>
        <input name="lgu_id" type="text" defaultValue="cebu-city-lgu" className="ops-input" />
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
        <textarea
          name="report_text"
          required
          rows={9}
          placeholder="Describe the emergency — location, hazard type, affected population, road conditions, known obstacles…"
          className="ops-input"
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
