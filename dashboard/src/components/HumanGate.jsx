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
    <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🚦</span>
        <h2 className="font-bold text-rose-800 text-base">Human Gate — Operator Decision Required</h2>
      </div>

      {handoff && (
        <div className="bg-white rounded-lg border border-rose-100 p-4 space-y-2">
          <div className="text-sm font-semibold text-slate-600">Handoff Coordinator Recommendation</div>
          {handoff.action && (
            <p className="text-sm text-slate-800">
              <strong>Action:</strong> {handoff.action}
            </p>
          )}
          {handoff.reasoning && (
            <p className="text-sm text-slate-600 italic">"{handoff.reasoning}"</p>
          )}
          {handoff.confidence != null && (
            <span className="inline-block text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
              {Math.round(handoff.confidence * 100)}% confidence
            </span>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
          Audit Note (required)
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder="Add a note explaining your decision…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => submit('approved')}
          disabled={isLogging}
          className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          ✓ Approve
        </button>
        <button
          onClick={() => submit('modified')}
          disabled={isLogging}
          className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-2 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          ✏ Modify
        </button>
        <button
          onClick={() => submit('rejected')}
          disabled={isLogging}
          className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          ✕ Reject
        </button>
      </div>
    </div>
  )
}
