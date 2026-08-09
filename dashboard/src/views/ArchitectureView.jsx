import { RELAY_AGENTS } from '../data/escalation'

/* Standalone architecture asset for the 0:15 presentation segment.

   Not a dashboard — a diagram, reachable at ?view=architecture so it can be
   screenshotted at any size or projected directly. Inline SVG rather than an
   image so it stays sharp on a projector and stays editable in the repo.

   It has to answer three questions in fifteen seconds: what the tier chain is,
   where the five agents sit, and what EMMA-Aggregate and EMMA-Report do. */

const TIERS = [
  { id: 'field',      label: 'Barangay',            sub: 'Brgy. Nug-as',           agent: null,             staffed: true  },
  { id: 'municipal',  label: 'Municipal',           sub: 'DRRMO · MSWD · Mayor',   agent: 'EMMA-Warn / Care / Plan', staffed: true },
  { id: 'provincial', label: 'Provincial DRRMC',    sub: 'Cebu',                   agent: RELAY_AGENTS[0],  staffed: false },
  { id: 'national',   label: 'NDRRMC',              sub: 'OCD · national',         agent: RELAY_AGENTS[1],  staffed: false },
  { id: 'regional',   label: 'AHA Centre',          sub: 'AADMER operations',      agent: '5-agent pipeline', staffed: true },
]

const PIPELINE = ['Intake', 'Vulnerability', 'Resource', 'Routing', 'Pattern', 'Handoff']

export default function ArchitectureView() {
  return (
    <div className="arch-root">
      <header className="arch-header">
        <span className="app-logo">EMMA</span>
        <span className="app-pipe">|</span>
        <span className="arch-title">System architecture</span>
        <span className="arch-sub">
          One incident, five tiers · RA 10121 reporting chain into AADMER
        </span>
      </header>

      <div className="arch-body">
        {/* ── Tier chain ───────────────────────────────────── */}
        <section className="arch-section">
          <h2 className="arch-section-label">Reporting chain</h2>
          <div className="arch-chain">
            {TIERS.map((t, i) => (
              <div className="arch-tier-wrap" key={t.id}>
                {i > 0 && <span className="arch-arrow" aria-hidden="true" />}
                <div className={`arch-tier ${t.staffed ? '' : 'arch-tier-relay'}`}>
                  <span className="arch-tier-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="arch-tier-label">{t.label}</span>
                  <span className="arch-tier-sub">{t.sub}</span>
                  {t.agent && <span className="arch-tier-agent">{t.agent}</span>}
                  {!t.staffed && <span className="arch-tier-note">auto-relayed</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="arch-caption">
            Municipal offices are lateral peers, not rungs. Provincial and national tiers are
            relayed rather than staffed — under AADMER only NDRRMC submits to the AHA Centre.
          </p>
        </section>

        {/* ── The five agents ──────────────────────────────── */}
        <section className="arch-section">
          <h2 className="arch-section-label">Regional pipeline · AHA Centre</h2>
          <div className="arch-pipeline">
            {PIPELINE.map((p, i) => (
              <div className="arch-agent-wrap" key={p}>
                {i > 0 && <span className="arch-arrow arch-arrow-sm" aria-hidden="true" />}
                <div className={`arch-agent ${p === 'Handoff' ? 'arch-agent-gate' : ''}`}>
                  <span className="arch-agent-index">{i + 1}</span>
                  {p}
                </div>
              </div>
            ))}
            <span className="arch-arrow arch-arrow-sm" aria-hidden="true" />
            <div className="arch-gate">Human Gate</div>
          </div>
          <p className="arch-caption">
            LangGraph · Claude Haiku 4.5 · Qdrant prior-event retrieval. Every recommendation
            passes a human decision before it leaves the system.
          </p>
        </section>

        {/* ── The relay agents — the scaling story ─────────── */}
        <section className="arch-section">
          <h2 className="arch-section-label">Relay agents</h2>
          <div className="arch-relays">
            <div className="arch-relay">
              <span className="arch-relay-name">{RELAY_AGENTS[0]}</span>
              <span className="arch-relay-role">
                Consolidates municipal SITREPs into a provincial picture. One province,
                many municipalities — the fan-in that makes this scale past one town.
              </span>
            </div>
            <div className="arch-relay">
              <span className="arch-relay-name">{RELAY_AGENTS[1]}</span>
              <span className="arch-relay-role">
                Formats the consolidated report into the AADMER submission NDRRMC files
                with the AHA Centre. One national voice, not 1,600 municipal ones.
              </span>
            </div>
          </div>
        </section>
      </div>

      <footer className="arch-footer">
        University of San Jose-Recoletos · AAIH 2026
      </footer>
    </div>
  )
}
