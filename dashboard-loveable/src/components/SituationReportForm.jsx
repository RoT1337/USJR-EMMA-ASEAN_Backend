import { useRef } from 'react'
import { DEMO_REPORT } from '../lib/mock-data'

const LANGUAGES = [
  { value: 'filipino',   label: 'Filipino' },
  { value: 'bahasa',     label: 'Bahasa Indonesia' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'thai',       label: 'Thai' },
  { value: 'english',    label: 'English' },
]

function Label({ children }) {
  return <div className="mono-caps" style={{ marginBottom: 5 }}>{children}</div>
}

export default function SituationReportForm({ onSubmit, isLoading }) {
  const lguRef = useRef(null)
  const reportRef = useRef(null)

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

  function loadDemo() {
    if (lguRef.current) lguRef.current.value = DEMO_REPORT.lgu_id
    if (reportRef.current) reportRef.current.value = DEMO_REPORT.report_text
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <span className="mono-caps app-form-eyebrow">Situation report</span>
      <h2 className="app-form-heading">New intake</h2>
      <p className="app-form-lede">
        Submit a plain-language SITREP. Agents run in sequence and return structured reasoning.
      </p>

      <button type="button" className="demo-scenario-btn" onClick={loadDemo}>
        <span className="demo-scenario-text">
          <span className="mono-caps" style={{ color: 'var(--alert)' }}>Demo scenario</span>
          <span className="demo-scenario-title">Load Typhoon Kalmaegi · Alcoy</span>
        </span>
        <span className="demo-scenario-icon">⟳</span>
      </button>

      <div>
        <Label>LGU / Location</Label>
        <input ref={lguRef} name="lgu_id" type="text" defaultValue="cebu-city-lgu" className="ops-input" />
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
          ref={reportRef}
          name="report_text"
          required
          rows={7}
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
          padding: '12px 0',
          background: isLoading ? 'var(--rim)' : 'var(--text)',
          color: isLoading ? 'var(--muted)' : '#fff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: '0.02em',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = 'var(--alert)' }}
        onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = 'var(--text)' }}
      >
        {isLoading ? 'Processing…' : 'Run AI Pipeline →'}
      </button>
    </form>
  )
}
