/* ─────────────────────────────────────────────────────────────────────────────
   The AHA Centre's incoming SITREP queue.

   An AHA Centre coordinator does not author situation reports about another
   country — they RECEIVE them from member-state NDMOs and triage across
   concurrent incidents. The queue is the correct affordance for that role; a
   textarea asking them to type prose about Alcoy was not.

   The `via` field is load-bearing. Putting the national disaster management
   office on every row states the AADMER pathway as data rather than as a
   caption: reports reach Jakarta through a member state's NDMO, never directly
   from a municipality.

   The Viet Nam and Indonesia rows are decorative — they exist so the view reads
   as a regional system handling concurrent incidents. Their figures do not
   reconcile against the Alcoy anchor and are not covered by validateMockData().
   ──────────────────────────────────────────────────────────────────────────── */

import { SCENARIO } from './mockData'
import { SITREP_ID, composeSitrepText, RELAY_PATH } from './escalation'

/* Already triaged before our incident arrived. Static. */
const HISTORY = [
  {
    id: 'SITREP-2026-1104-QNM',
    country: 'Viet Nam',
    countryCode: 'VN',
    locality: 'Quang Nam',
    hazard: 'Flooding',
    via: 'VNDMA',
    affected: 1200,
    at: '22:40',
    status: 'PROCESSED',
  },
  {
    id: 'SITREP-2026-1103-ACH',
    country: 'Indonesia',
    countryCode: 'ID',
    locality: 'Aceh',
    hazard: 'Landslide',
    via: 'BNPB',
    affected: 430,
    at: '18:05',
    status: 'PROCESSED',
  },
]

/* The Alcoy row only exists once the municipality has actually submitted and the
   relay has carried it up. Before that the AHA Centre has not received anything —
   showing it early would fake the very chain the demo is trying to prove. */
export function buildQueue(escalation) {
  if (!escalation) return HISTORY

  const inbound = {
    id: escalation.sitrepId ?? SITREP_ID,
    country: 'Philippines',
    countryCode: 'PH',
    locality: `${SCENARIO.municipality}, ${SCENARIO.province}`,
    hazard: SCENARIO.hazard.replace(/^Typhoon .*/, 'Typhoon'),
    /* The national relay, taken from RELAY_PATH so the row cannot disagree with
       the provenance banner. */
    via: RELAY_PATH[RELAY_PATH.length - 2],
    affected: SCENARIO.residentsAffected,
    at: escalation.at,
    status: 'NEW',
    lguId: escalation.lguId,
    reportText: escalation.reportText ?? composeSitrepText(),
  }

  return [inbound, ...HISTORY]
}
