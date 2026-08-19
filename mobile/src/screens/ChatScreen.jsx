import { useEffect, useRef, useState } from 'react'
import { Info, Send, TriangleAlert, Plus, ShieldAlert, ChevronLeft } from 'lucide-react'
import { CHAT_OPENING, CHAT_EXCHANGE, QUICK_REPORTS, LOCATION_LINE } from '../data/mobile-data'

/* Screen 1 — conversational triage.

   Scripted, not generated: there is no LLM call here. The five-agent pipeline is
   demonstrated on the dashboard; this screen exists to show that EMMA reaches a
   person standing in the rain, and that the chain starts with them.

   Sending advances the script one step, with a typing pause between the user's
   message and EMMA's reply so the exchange reads as a conversation on video
   rather than two blocks appearing at once. */

const TYPING_MS = 1100

export default function ChatScreen({ onBack }) {
  const [sent, setSent] = useState(0)          // how many exchanges completed
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [calling, setCalling] = useState(false)
  const threadRef = useRef(null)

  const step = CHAT_EXCHANGE[sent]
  const done = sent >= CHAT_EXCHANGE.length

  function send(text) {
    if (typing || done) return
    setDraft('')
    setTyping(true)
  }

  /* The user's bubble shows immediately; EMMA answers after the pause. */
  useEffect(() => {
    if (!typing) return
    const t = setTimeout(() => {
      setTyping(false)
      setSent(n => n + 1)
    }, TYPING_MS)
    return () => clearTimeout(t)
  }, [typing])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [sent, typing])

  const answered = CHAT_EXCHANGE.slice(0, sent)

  return (
    <div className="screen">
      {/* Header */}
      <header className="chat-header">
        {/* The reference has no back control here. A prototype needs one. */}
        <button className="icon-tap chat-back" onClick={onBack} aria-label="Back">
          <ChevronLeft size={19} strokeWidth={2.5} />
        </button>
        <span className="chat-avatar">AI</span>
        <div className="chat-header-text">
          <div className="chat-title">Chat with EMMA</div>
          <div className="chat-status">
            <span className="chat-status-dot" />
            Dispatch online · 24/7
          </div>
        </div>
        <Info size={18} strokeWidth={2} className="chat-info" />
      </header>

      {/* Life-threat banner */}
      <div className="threat-bar">
        <TriangleAlert size={15} strokeWidth={2.5} className="threat-icon" />
        <span className="threat-text">
          <strong>IMMEDIATE LIFE THREAT?</strong> Call 911 now.
        </span>
        {/* Shows a state rather than firing a tel: link — an OS dialer prompt
            mid-presentation is the last thing anyone needs. */}
        <button
          className={`threat-call ${calling ? 'threat-call-live' : ''}`}
          onClick={() => { setCalling(true); setTimeout(() => setCalling(false), 2600) }}
        >
          {calling ? 'CONNECTING…' : 'CALL'}
        </button>
      </div>

      {/* Thread */}
      <div className="thread" ref={threadRef}>
        <Bubble from="emma" text={CHAT_OPENING.text} />

        {answered.map((x, i) => (
          <div key={i}>
            <Bubble from="you" text={x.user} />
            <Bubble
              from="emma"
              text={x.emma.text}
              flag={x.emma.flag}
              ref_={x.emma.ref}
              at={x.emma.at}
            />
          </div>
        ))}

        {typing && (
          <>
            <Bubble from="you" text={step.user} />
            <div className="bubble bubble-emma bubble-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </>
        )}
      </div>

      {/* Quick report */}
      <div className="quick">
        <div className="quick-label">Quick Report</div>
        <div className="quick-grid">
          {QUICK_REPORTS.map(q => (
            <button
              key={q.id}
              className="quick-chip"
              onClick={() => send(step?.user)}
              disabled={typing || done}
            >
              <Plus size={12} strokeWidth={2.5} />
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <form
        className="composer"
        onSubmit={e => { e.preventDefault(); send(draft || step?.user) }}
      >
        <input
          className="composer-input"
          value={done ? '' : draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={done ? 'Responder dispatched' : step?.user}
          disabled={typing || done}
        />
        <button className="composer-send" type="submit" disabled={typing || done} aria-label="Send">
          <Send size={16} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  )
}

function Bubble({ from, text, flag, ref_, at }) {
  const isEmma = from === 'emma'
  return (
    <div className={`bubble-row ${isEmma ? '' : 'bubble-row-you'}`}>
      <div className={`bubble ${isEmma ? 'bubble-emma' : 'bubble-you'}`}>
        {isEmma && <div className="bubble-who">EMMA Dispatch</div>}
        <p className="bubble-text">{text}</p>

        {flag && (
          <div className="bubble-flag">
            <ShieldAlert size={12} strokeWidth={2.5} />
            {flag}
          </div>
        )}
        {ref_ && (
          <div className="bubble-ref">
            Ref <strong>{ref_}</strong> · {at} · {LOCATION_LINE}
          </div>
        )}
      </div>
    </div>
  )
}
