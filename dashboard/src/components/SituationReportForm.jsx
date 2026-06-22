const LANGUAGES = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'bahasa',   label: 'Bahasa Indonesia' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'thai',     label: 'Thai' },
  { value: 'english',  label: 'English' },
]

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
            LGU / Location ID
          </label>
          <input
            name="lgu_id"
            type="text"
            defaultValue="cebu-city-lgu"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
            Operator ID
          </label>
          <input
            name="submitted_by"
            type="text"
            defaultValue="operator-1"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
            Language
          </label>
          <select
            name="language"
            defaultValue="english"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
          Situation Report
        </label>
        <textarea
          name="report_text"
          required
          rows={5}
          placeholder="Describe the emergency situation… e.g. 'Typhoon Egay made landfall in Cebu City. Estimated 2,000 families in Barangay Inayawan are affected. Roads to evacuation centers are flooded.'"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing…' : 'Submit Situation Report'}
      </button>
    </form>
  )
}
