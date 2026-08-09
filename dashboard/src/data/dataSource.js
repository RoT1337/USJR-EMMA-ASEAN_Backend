/* ─────────────────────────────────────────────────────────────────────────────
   dataSource — the single seam between the dashboards and where data comes from.

   Right now every local view (DRRMO / DSWD / LGU) reads from mockData.js. Only the
   ASEAN view talks to a real backend, via src/api.js.

   WHY THIS FILE EXISTS
   The views import from here, never from mockData.js directly. So when a real
   endpoint arrives, you change one function in this file and no view changes at
   all. The return shapes below ARE the contract — hand them to whoever writes the
   backend and the swap is mechanical.

   TO GO LIVE for a view, replace its body with a fetch and keep the shape:

       export async function getDrrmoData() {
         const { data } = await laravel.get('/api/drrmo/dashboard')
         return data                        // must match the shape returned below
       }

   Every getter is already async, so callers don't change when that happens.
   ──────────────────────────────────────────────────────────────────────────── */

import * as mock from './mockData'
import { buildQueue } from './sitrepQueue'

/* Flip to 'live' per view as endpoints land. Reads VITE_DATA_SOURCE if set, so you
   can demo against a real backend without editing code:  VITE_DATA_SOURCE=live */
export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? 'mock'

/* Threshold helpers — the same bands the occupancy bars and pin colours use, so
   a card and the row it summarises never disagree about what counts as full. */
const occupancyTone = d => {
  const pct = d.totalCapacity ? (d.totalOccupied / d.totalCapacity) * 100 : 0
  return pct >= 90 ? 'critical' : pct >= 60 ? 'warn' : 'neutral'
}
const suppliesTone = pct => (pct <= 25 ? 'critical' : pct <= 65 ? 'warn' : 'ok')

/* Shared context every view shows in its header/breadcrumb. */
export async function getScenario() {
  return {
    ...mock.SCENARIO,
    vulnerability: mock.VULNERABILITY,
  }
}

/** DRRMO — EMMA-Warn. @returns {Promise<{stats, barangayRisk, incidents, teams, advisories, forecast, agent}>} */
export async function getDrrmoData() {
  const d = mock.DERIVED
  return {
    /* Tone is earned: barangays at risk is the forward-looking alarm, open
       incidents are work in progress, and headcounts are facts. If everything
       is coloured, nothing reads as urgent. */
    stats: [
      { key: 'advisories', label: 'Active Advisories',     value: d.activeAdvisories,              tone: 'neutral' },
      { key: 'atRisk',     label: 'Barangays at Risk',     value: d.barangaysAtRisk,               tone: d.barangaysAtRisk > 0 ? 'critical' : 'ok' },
      { key: 'incidents',  label: 'Incidents Today',       value: d.incidentsToday,                tone: d.activeIncidents > 0 ? 'warn' : 'ok', sub: `${d.activeIncidents} still open` },
      { key: 'teams',      label: 'Teams Deployed',        value: d.teamsDeployed,                 tone: 'ok' },
      { key: 'affected',   label: 'Residents Affected',    value: mock.SCENARIO.residentsAffected, tone: 'neutral', sub: `${mock.SCENARIO.familiesAffected} families` },
      { key: 'pwdSenior',  label: 'PWD / Senior Assisted', value: mock.PWD_SENIOR_ASSISTED,        tone: 'neutral' },
    ],
    barangayRisk: mock.barangayRisk,
    incidents:    mock.incidents,
    teams:        mock.responseTeams,
    advisories:   mock.advisories,
    forecast:     mock.forecast,
    centers:      mock.evacuationCenters,     // map pins
    agent:        mock.agentAssessments.drrmo,
  }
}

/** DSWD — EMMA-Care. @returns {Promise<{stats, beneficiaries, programs, inventory, agent}>} */
export async function getDswdData() {
  const d = mock.DERIVED
  const r = mock.REGISTRY_TOTALS
  return {
    /* Tone encodes state, not identity. A figure is neutral unless it means
       something needs attention: duplicates block disbursement, and undelivered
       packages are work outstanding. Counts of people are facts, not alarms. */
    stats: [
      { key: 'validated',     label: 'Households Validated',   value: r.validated,                     tone: 'ok',       sub: `of ${r.submitted} submitted` },
      { key: 'duplicates',    label: 'Duplicates Flagged',     value: r.duplicates,                    tone: r.duplicates > 0 ? 'critical' : 'neutral' },
      /* 174 = two active programs staged for the same 87 households. Without the
         sub-line it reads as an unexplained ~2x of every other figure on screen. */
      { key: 'packages',      label: 'Aid Packages Ready',     value: d.packagesReady,                 tone: 'neutral',  sub: `AICS + food packs · ${r.validated} HH each` },
      { key: 'disbursements', label: 'Pending Disbursements',  value: d.pendingDisbursements,          tone: d.pendingDisbursements > 0 ? 'warn' : 'ok' },
      { key: 'beneficiaries', label: 'Total Beneficiaries',    value: mock.SCENARIO.residentsAffected, tone: 'neutral' },
      { key: 'pwdSenior',     label: 'PWD / Senior Assisted',  value: mock.PWD_SENIOR_ASSISTED,        tone: 'neutral' },
    ],
    beneficiaries: mock.beneficiaries,
    registry:      r,
    programs:      mock.aidPrograms,
    inventory:     mock.inventory,
    agent:         mock.agentAssessments.dswd,
  }
}

/** LGU — EMMA-Plan. @returns {Promise<{stats, centers, fundRequests, lgus, allocation, agent}>} */
export async function getLguData() {
  const d = mock.DERIVED
  return {
    /* Occupancy and supplies cross into warn/critical on thresholds rather than
       being permanently tinted — the colour has to mean something changed. */
    stats: [
      { key: 'occupancy',  label: 'EC Occupancy',          value: d.totalOccupied, unit: `/${d.totalCapacity}`, tone: occupancyTone(d), sub: `${d.activeCenterCount} active centers` },
      { key: 'families',   label: 'Affected Families',     value: mock.SCENARIO.familiesAffected,  tone: 'neutral' },
      { key: 'evacuees',   label: 'Total Evacuees',        value: mock.SCENARIO.residentsAffected, tone: 'neutral' },
      { key: 'barangays',  label: 'Barangays Affected',    value: d.barangaysAtRisk,               tone: d.barangaysAtRisk > 0 ? 'warn' : 'ok' },
      { key: 'supplies',   label: 'Supplies Left',         value: mock.SUPPLIES_REMAINING_PCT, unit: '%', tone: suppliesTone(mock.SUPPLIES_REMAINING_PCT) },
      { key: 'pwdSenior',  label: 'PWD / Senior Assisted', value: mock.PWD_SENIOR_ASSISTED,        tone: 'neutral' },
    ],
    centers:      mock.evacuationCenters,
    fundRequests: mock.fundRequests,
    lgus:         mock.coordinatingLGUs,
    allocation:   mock.resourceAllocation,
    pending:      { count: d.pendingApprovals, amount: d.pendingAmount },
    agent:        mock.agentAssessments.lgu,
  }
}

/** ASEAN — the AHA Centre's incoming SITREP queue.
    Async like the rest, so a real member-state feed can replace it without the
    view changing. */
export async function getSitrepQueue(escalation) {
  return buildQueue(escalation)
}

/* Dispatch by role id — what the views actually call. */
const BY_ROLE = {
  drrmo: getDrrmoData,
  dswd:  getDswdData,
  lgu:   getLguData,
}

export async function getDashboardData(roleId) {
  const getter = BY_ROLE[roleId]
  if (!getter) throw new Error(`[dataSource] no data getter for role "${roleId}"`)
  return getter()
}
