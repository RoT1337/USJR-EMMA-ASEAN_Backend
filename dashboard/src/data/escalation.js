/* ─────────────────────────────────────────────────────────────────────────────
   The escalation chain — Phase 4.

   One incident, four seats. Each tier produces an artifact the tier above
   consumes, and the ASEAN situation report IS the LGU's SITREP — not a re-typed
   summary, the same document composed from the same anchor data.

   Every figure below is DERIVED, never typed. That keeps the escalation prose
   inside the same invariant system as the dashboards: if the anchor numbers
   change, the SITREP the AHA Centre receives changes with them, and
   validateMockData() still guards the whole thing.

   Naming is SITREP, not PDRA. A PDRA is pre-impact and justifies pre-emptive
   evacuation; a SITREP is produced during an event. Our scenario is mid-event —
   flooding underway, road already cut — and SITREP also matches the existing API
   surface (createSituationReport / report_text / report_id).
   ──────────────────────────────────────────────────────────────────────────── */

import {
  SCENARIO,
  VULNERABILITY,
  REGISTRY_TOTALS,
  DERIVED,
  SUPPLIES_REMAINING_PCT,
  coordinatingLGUs,
  barangayRisk,
  inventory,
} from './mockData'
import { ROLE_MAP } from '../roles'

/* Operator names come from roles.js, never restated here. The sidebar, the login
   screen and the handoff banners then cannot disagree about who someone is —
   they previously showed three different identities for the same person. */
const who = roleId => ROLE_MAP[roleId].displayName

/* The barangay captain is not a dashboard role, so this one is defined here. */
const FIELD_OPERATOR = 'Kap. M. Santos'

/* One incident ID across all four views — same incident, four seats. */
export const INCIDENT_ID = 'INC-2026-1105-ALC'
export const SITREP_ID   = 'SITREP-2026-1105-ALC'

/* ── The chain ────────────────────────────────────────────────────────────────

   Modelled on the real reporting structure, not a flat ladder.

   Under RA 10121 the Philippine chain is Barangay → Municipal → Provincial →
   Regional → NDRRMC. Under AADMER only the national body (OCD/NDRRMC) submits to
   the AHA Centre — a municipality cannot report directly to Jakarta.

   Two consequences for how this renders:
     · DRRMO, MSWD and the Mayor's Office are LATERAL PEERS, all municipal offices
       under the Mayor. They are one tier with three seats, not three rungs.
     · Provincial DRRMC and NDRRMC are real tiers that exist between Alcoy and the
       AHA Centre. We do not staff them in this demo — EMMA relays through them
       automatically — so they render dimmed and labelled as such rather than
       being silently omitted.
   ──────────────────────────────────────────────────────────────────────────── */

export const RELAY_AGENTS = ['EMMA-Aggregate', 'EMMA-Report']

/* Alcoy LGU → Cebu Provincial DRRMC → NDRRMC → AHA Centre */
export const RELAY_PATH = [
  'Alcoy LGU',
  'Cebu Provincial DRRMC',
  'NDRRMC',
  'AHA Centre',
]

export const CHAIN = [
  {
    id: 'field',
    kind: 'single',
    label: 'Brgy. Nug-as',
    detail: `${FIELD_OPERATOR} · situation report · 06:12`,
  },
  {
    id: 'municipal',
    kind: 'group',
    label: 'Alcoy LGU',
    detail: 'Three municipal offices under the Mayor — lateral peers, not tiers',
    seats: [
      { id: 'drrmo', label: 'DRRMO', detail: `Hazard Advisory · ${who('drrmo')} · 06:47` },
      { id: 'dswd',  label: 'MSWD',  detail: `Validated Beneficiary List · ${who('dswd')} · 07:03` },
      { id: 'lgu',   label: 'Mayor', detail: `SITREP · ${who('lgu')}, Office of the Mayor · 07:12` },
    ],
  },
  {
    id: 'relay',
    kind: 'relay',
    label: 'Provincial ⟩ NDRRMC',
    note: 'auto-relayed',
    detail: `Cebu Provincial DRRMC then NDRRMC — relayed by ${RELAY_AGENTS.join(' and ')}`,
  },
  {
    id: 'asean',
    kind: 'single',
    label: 'AHA Centre',
    detail: 'AADMER regional coordination',
  },
]

/* Which chain nodes read as complete from a given seat.

   Municipal seats complete left to right as you move across them, and stay
   complete: `visited` carries the seats opened earlier this session, so stepping
   back a tier mid-demo does not un-fill the strip behind you.

   The relay tiers and the AHA Centre only light up once a SITREP has actually
   been submitted — arriving at the ASEAN view manually does not fake the relay. */
export function chainStateFor(roleId, { hasEscalated = false, visited = [] } = {}) {
  const seats = ['drrmo', 'dswd', 'lgu']
  const seatIdx = seats.indexOf(roleId)

  const done = new Set(['field'])
  const doneSeats = new Set()

  /* everything opened earlier stays lit */
  visited.filter(v => seats.includes(v)).forEach(v => doneSeats.add(v))

  /* plus everything up to and including where you are standing now */
  if (seatIdx !== -1) {
    seats.slice(0, seatIdx + 1).forEach(s => doneSeats.add(s))
  }

  if (roleId === 'asean') {
    seats.forEach(s => doneSeats.add(s))
    if (hasEscalated) { done.add('relay'); done.add('asean') }
  }

  if (seats.every(s => doneSeats.has(s))) done.add('municipal')

  return { done, doneSeats, here: roleId }
}

/* ── Inbound handoff banners (4c) ─────────────────────────────────────────── */

export const INBOUND = {
  drrmo: {
    from: 'Brgy. Nug-as field report',
    detail: `Landslide at Sitio Cansuje · ${SCENARIO.residentsAffected} residents affected`,
    at: '06:12',
    by: FIELD_OPERATOR,
  },
  dswd: {
    from: 'Hazard Advisory from DRRMO',
    detail: `${SCENARIO.barangaysAtRisk} barangays at HIGH risk · evacuation ordered for ${SCENARIO.barangay}`,
    at: '06:47',
    by: who('drrmo'),
  },
  lgu: {
    /* MSWD, not DSWD — the municipal office, a lateral peer of DRRMO. */
    from: 'Validated Beneficiary List from MSWD',
    detail: `${REGISTRY_TOTALS.validated} households validated · ${REGISTRY_TOTALS.duplicates} duplicates flagged · prenatal kit shortage`,
    at: '07:03',
    by: who('dswd'),
  },
}

/* ── The SITREP itself ────────────────────────────────────────────────────── */

const peso = n => `PHP ${(n / 1_000_000).toFixed(3)}M`

/* "A, B and C" rather than "A, B, C" — this text is read aloud by a judge. */
function listOf(names) {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export function composeSitrepText() {
  const prenatal = inventory.find(i => i.id === 'inv-prenat')
  const lgus = listOf(coordinatingLGUs.map(l => l.name))

  return [
    `${SITREP_ID} — Municipality of ${SCENARIO.municipality}, ${SCENARIO.province}, Philippines.`,
    /* Derived from RELAY_PATH so the document can never contradict the provenance
       banner rendered directly above it. A municipality submits to its provincial
       DRRMC; only NDRRMC reports onward to the AHA Centre. */
    `Submitted by the Office of the Mayor to the ${RELAY_PATH[1]} for onward relay ` +
    `to ${RELAY_PATH[2]} and the ${RELAY_PATH[3]}, requesting regional augmentation.`,
    ``,
    `${SCENARIO.hazard} (${SCENARIO.signal}) has made landfall over ${SCENARIO.municipality}, ${SCENARIO.province}. ` +
    `${SCENARIO.residentsAffected} residents across ${SCENARIO.familiesAffected} families are displaced from ${SCENARIO.barangay}, ` +
    `which is cut off by a landslide at Sitio Cansuje. ${SCENARIO.barangaysAtRisk} of ${barangayRisk.length} barangays are at HIGH or CRITICAL risk.`,
    ``,
    `Vulnerable individuals confirmed in the validated registry: ${VULNERABILITY.pregnant} pregnant women, ` +
    `${VULNERABILITY.pwd} person with disability (wheelchair user), ${VULNERABILITY.elderly} elderly aged 75 and above, ` +
    `and ${VULNERABILITY.infants} infants under one year.`,
    ``,
    `${DERIVED.totalOccupied} evacuees are sheltered across ${DERIVED.activeCenterCount} active evacuation centers ` +
    `against a combined capacity of ${DERIVED.totalCapacity}. MSWD has validated ${REGISTRY_TOTALS.validated} households ` +
    `of ${REGISTRY_TOTALS.submitted} submitted, flagging ${REGISTRY_TOTALS.duplicates} duplicates. ` +
    `Prenatal kits stand at ${prenatal.onHand} against a requirement of ${prenatal.required}.`,
    ``,
    `Local funds are committed: ${DERIVED.pendingApprovals} requests totalling ${peso(DERIVED.pendingAmount)} await approval. ` +
    `Municipal relief supplies stand at ${SUPPLIES_REMAINING_PCT} percent. ${lgus} are coordinating support.`,
    ``,
    `Requesting regional augmentation for medical, shelter and maternal supplies, and cross-border advisory on ` +
    `the system's projected track.`,
  ].join('\n')
}

/* The payload handed to the ASEAN view when the municipality submits.

   It carries the relay path, not just an origin. A SITREP that shows the route it
   travelled reads as a real document; one that appears to jump straight from a
   municipality to Jakarta does not, and is the claim a Philippine or ASEAN judge
   is most likely to challenge. */
export function buildEscalation() {
  return {
    sitrepId:    SITREP_ID,
    incidentId:  INCIDENT_ID,
    by:          `${who('lgu')}, Office of the Mayor`,
    at:          '07:12',
    lguId:       'cebu-alcoy',
    relayPath:   RELAY_PATH,
    relayAgents: RELAY_AGENTS,
    reportText:  composeSitrepText(),
  }
}
