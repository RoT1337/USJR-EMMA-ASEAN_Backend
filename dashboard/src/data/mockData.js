/* ─────────────────────────────────────────────────────────────────────────────
   Mock data for the DRRMO / DSWD / LGU dashboards.

   Anchor scenario: Typhoon Kalmaegi — Brgy. Nug-as, Alcoy, Cebu.
   340 residents affected across 87 families.

   CONSISTENCY RULE
   The numbers must reconcile across all three dashboards. To make that structural
   rather than a matter of discipline, headline totals are DERIVED from SCENARIO
   and from the row data below — not typed twice. If you need to change "340",
   change SCENARIO.residentsAffected and every view follows.

   validateMockData() at the bottom re-checks the cross-view invariants at import
   time in dev and warns loudly if anything drifts.

   SHAPE / BACKEND SEAM
   Each export is shaped like a plausible API response (ids, ISO timestamps, flat
   rows) so swapping a real endpoint in later is a change to src/data/dataSource.js
   only — the views never import this file directly. See dataSource.js.
   ──────────────────────────────────────────────────────────────────────────── */

/* ── The anchor. Single source of truth. ──────────────────────────────────── */
export const SCENARIO = {
  hazard: 'Typhoon Kalmaegi',
  signal: 'TCWS #3',
  barangay: 'Brgy. Nug-as',
  municipality: 'Alcoy',
  province: 'Cebu',
  residentsAffected: 340,
  familiesAffected: 87,
  barangaysAtRisk: 4,
  declaredAt: '2026-08-06T04:20:00+08:00',
  center: { lat: 9.7167, lng: 123.5167 },   // Alcoy poblacion
}

/* Vulnerability figures stay constant everywhere they appear. */
export const VULNERABILITY = {
  pregnant: 2,
  pwd: 1,          // wheelchair user
  elderly: 4,      // 75+
  infants: 3,
}

/* The "PWD/Senior Citizens Assisted" card appears on all three dashboards. */
export const PWD_SENIOR_ASSISTED = VULNERABILITY.pwd + VULNERABILITY.elderly   // 5

/* ═════════════════════════════════════════════════════════════════════════════
   DRRMO — EMMA-Warn (The Sentinel)
   ═══════════════════════════════════════════════════════════════════════════ */

/* All 8 barangays of Alcoy. Exactly 4 sit at HIGH or CRITICAL — the figure
   EMMA-Warn reports. */
export const barangayRisk = [
  { id: 'brgy-nugas',       barangay: 'Nug-as',       risk: 'CRITICAL', population: 1240, affected: 340, families: 87, hazard: 'Flooding · landslide', advisory: 'Evacuate' },
  { id: 'brgy-pugalo',      barangay: 'Pugalo',       risk: 'HIGH',     population:  980, affected:   0, families:  0, hazard: 'Landslide',            advisory: 'Pre-emptive alert' },
  { id: 'brgy-guiwang',     barangay: 'Guiwang',      risk: 'HIGH',     population: 1510, affected:   0, families:  0, hazard: 'Storm surge',          advisory: 'Pre-emptive alert' },
  { id: 'brgy-atabay',      barangay: 'Atabay',       risk: 'HIGH',     population:  870, affected:   0, families:  0, hazard: 'Flooding',             advisory: 'Pre-emptive alert' },
  { id: 'brgy-daanlungsod', barangay: 'Daan-Lungsod', risk: 'MEDIUM',   population: 1120, affected:   0, families:  0, hazard: 'Flooding',             advisory: 'Monitor' },
  { id: 'brgy-pasol',       barangay: 'Pasol',        risk: 'MEDIUM',   population:  760, affected:   0, families:  0, hazard: 'Storm surge',          advisory: 'Monitor' },
  { id: 'brgy-poblacion',   barangay: 'Poblacion',    risk: 'LOW',      population: 2340, affected:   0, families:  0, hazard: '—',                    advisory: 'Monitor' },
  { id: 'brgy-sanagustin',  barangay: 'San Agustin',  risk: 'LOW',      population:  690, affected:   0, families:  0, hazard: '—',                    advisory: 'Monitor' },
]

export const incidents = [
  { id: 'INC-2041', time: '05:12', barangay: 'Nug-as',   type: 'Landslide',      detail: 'Road cut at Sitio Cansuje, 2 households isolated', status: 'DISPATCHED', team: 'Team Alpha' },
  { id: 'INC-2042', time: '05:48', barangay: 'Nug-as',   type: 'Flooding',       detail: 'Waist-deep water along the riverside purok',       status: 'ACTIVE',     team: 'Team Bravo' },
  { id: 'INC-2043', time: '06:30', barangay: 'Guiwang',  type: 'Storm surge',    detail: 'Seawall overtopping at high tide',                 status: 'ACTIVE',     team: 'Team Charlie' },
  { id: 'INC-2044', time: '07:05', barangay: 'Nug-as',   type: 'Medical',        detail: 'Pregnant evacuee, 3rd trimester — transport req.',  status: 'DISPATCHED', team: 'MDRRMO Ambulance' },
  { id: 'INC-2045', time: '07:41', barangay: 'Pugalo',   type: 'Power outage',   detail: 'Distribution line down, 3 puroks affected',        status: 'ACTIVE',     team: 'CEBECO III' },
  { id: 'INC-2046', time: '08:14', barangay: 'Atabay',   type: 'Fallen tree',    detail: 'Blocking access to the national highway',          status: 'CLEARED',    team: 'Team Delta' },
  { id: 'INC-2047', time: '08:52', barangay: 'Nug-as',   type: 'Evacuation',     detail: 'Wheelchair user requires assisted transfer',       status: 'DISPATCHED', team: 'Team Alpha' },
]

export const responseTeams = [
  { id: 'team-alpha',   name: 'Team Alpha',   members: 8, assignment: 'Nug-as — search & rescue',   status: 'ACTIVE' },
  { id: 'team-bravo',   name: 'Team Bravo',   members: 6, assignment: 'Nug-as — evacuation convoy', status: 'ACTIVE' },
  { id: 'team-charlie', name: 'Team Charlie', members: 6, assignment: 'Guiwang — coastal watch',    status: 'ACTIVE' },
  { id: 'team-delta',   name: 'Team Delta',   members: 5, assignment: 'Atabay — road clearing',     status: 'ACTIVE' },
  { id: 'team-echo',    name: 'Team Echo',    members: 5, assignment: 'Poblacion — standby',        status: 'PENDING' },
]

export const advisories = [
  { id: 'ADV-118', issued: '04:20', title: 'TCWS #3 raised over southern Cebu',            scope: 'Municipality-wide', status: 'ACTIVE' },
  { id: 'ADV-119', issued: '04:55', title: 'Pre-emptive evacuation — Brgy. Nug-as',        scope: 'Nug-as',            status: 'ACTIVE' },
  { id: 'ADV-120', issued: '06:10', title: 'Landslide-prone slopes — avoid Sitio Cansuje', scope: 'Nug-as · Pugalo',   status: 'ACTIVE' },
]

/* 7-day outlook — renders as the strip above the weather map. */
export const forecast = [
  { day: 'Thu', label: 'Today', condition: 'Typhoon',       icon: '🌀', high: 27, low: 24, rainfall: 148 },
  { day: 'Fri', label: 'Fri',   condition: 'Heavy rain',    icon: '🌧️', high: 28, low: 24, rainfall: 92 },
  { day: 'Sat', label: 'Sat',   condition: 'Rain showers',  icon: '🌦️', high: 29, low: 24, rainfall: 41 },
  { day: 'Sun', label: 'Sun',   condition: 'Cloudy',        icon: '☁️', high: 30, low: 25, rainfall: 12 },
  { day: 'Mon', label: 'Mon',   condition: 'Partly cloudy', icon: '⛅', high: 31, low: 25, rainfall: 4 },
  { day: 'Tue', label: 'Tue',   condition: 'Partly cloudy', icon: '⛅', high: 31, low: 25, rainfall: 2 },
  { day: 'Wed', label: 'Wed',   condition: 'Fair',          icon: '☀️', high: 32, low: 26, rainfall: 0 },
]

/* ═════════════════════════════════════════════════════════════════════════════
   DSWD / MSWD — EMMA-Care (The Welfare Manager)
   ═══════════════════════════════════════════════════════════════════════════ */

/* Registry sample. The full set is REGISTRY_TOTALS below; these rows are what the
   table shows. Every constant in VULNERABILITY is findable here on purpose — a
   judge who counts should reconcile: 2 pregnant, 1 PWD, 4 elderly 75+, 3 infants. */
export const beneficiaries = [
  { id: 'FAM-0403', name: 'Teodoro Yburan',       age: 78, sex: 'M', senior: true,  pwd: false, note: '—',                      status: 'VALIDATED' },
  { id: 'FAM-0407', name: 'Consolacion Piloton',  age: 81, sex: 'F', senior: true,  pwd: false, note: 'Maintenance medication', status: 'VALIDATED' },
  { id: 'FAM-0409', name: 'Sofia Baring',         age:  0, sex: 'F', senior: false, pwd: false, note: 'Infant — 5 months',      status: 'VALIDATED' },
  { id: 'FAM-0412', name: 'Rosalinda Cabahug',    age: 34, sex: 'F', senior: false, pwd: false, note: 'Pregnant — 3rd trimester', status: 'VALIDATED' },
  { id: 'FAM-0412', name: 'Liam Cabahug',         age:  0, sex: 'M', senior: false, pwd: false, note: 'Infant — 8 months',      status: 'VALIDATED' },
  { id: 'FAM-0415', name: 'Jomar Tabanao',        age: 41, sex: 'M', senior: false, pwd: true,  note: 'Wheelchair user',        status: 'VALIDATED' },
  { id: 'FAM-0418', name: 'Maricel Enriquez',     age: 27, sex: 'F', senior: false, pwd: false, note: 'Pregnant — 2nd trimester', status: 'VALIDATED' },
  { id: 'FAM-0421', name: 'Bienvenido Sarmiento', age: 76, sex: 'M', senior: true,  pwd: false, note: '—',                      status: 'VALIDATED' },
  { id: 'FAM-0425', name: 'Mateo Lumapas',        age:  0, sex: 'M', senior: false, pwd: false, note: 'Infant — 11 months',     status: 'VALIDATED' },
  { id: 'FAM-0430', name: 'Nemesia Alcordo',      age: 79, sex: 'F', senior: true,  pwd: false, note: '—',                      status: 'VALIDATED' },
  { id: 'FAM-0433', name: 'Arnel Bacus',          age: 52, sex: 'M', senior: false, pwd: false, note: '—',                      status: 'VALIDATED' },
  { id: 'FAM-0418', name: 'Maricel Enriquez',     age: 27, sex: 'F', senior: false, pwd: false, note: 'Same PSA record as FAM-0418', status: 'DUPLICATE' },
  { id: 'FAM-0421', name: 'B. Sarmiento',         age: 76, sex: 'M', senior: true,  pwd: false, note: 'Name variant, same birthdate', status: 'DUPLICATE' },
  { id: 'FAM-0407', name: 'Consolacion Piloton',  age: 81, sex: 'F', senior: true,  pwd: false, note: 'Submitted twice by relief desk', status: 'DUPLICATE' },
  { id: 'FAM-0441', name: 'Editha Managbanag',    age: 63, sex: 'F', senior: false, pwd: false, note: 'Awaiting barangay certification', status: 'PENDING' },
]

/* 93 records submitted → 87 validated + 3 duplicates + 3 pending. */
export const REGISTRY_TOTALS = {
  submitted: 93,
  validated: SCENARIO.familiesAffected,   // 87
  duplicates: 3,
  pending: 3,
}

export const aidPrograms = [
  { id: 'AICS',  name: 'AICS — Assistance to Individuals in Crisis', households: 87, packages: 87, released: 74, unit: '₱3,000 / household', status: 'ACTIVE' },
  { id: 'FFP',   name: 'Family Food Packs',                          households: 87, packages: 87, released: 87, unit: '7-day ration',       status: 'ACTIVE' },
  { id: 'CFW',   name: 'Cash-for-Work — debris clearing',            households: 40, packages: 40, released:  0, unit: '₱395 / day · 10 days', status: 'PENDING' },
  { id: 'PRENAT', name: 'Prenatal & maternal kits',                  households:  2, packages:  0, released:  0, unit: 'per expectant mother', status: 'FLAGGED' },
]

export const inventory = [
  { id: 'inv-ffp',    item: 'Family food packs',   onHand: 210, required: 87, status: 'OPEN' },
  { id: 'inv-water',  item: 'Potable water (20L)', onHand: 168, required: 87, status: 'OPEN' },
  { id: 'inv-mats',   item: 'Sleeping mats',       onHand: 300, required: 340, status: 'PARTIAL' },
  { id: 'inv-hygiene', item: 'Hygiene kits',       onHand: 120, required: 87, status: 'OPEN' },
  { id: 'inv-prenat', item: 'Prenatal kits',       onHand:   0, required: VULNERABILITY.pregnant, status: 'FLAGGED' },
  { id: 'inv-meds',   item: 'Maintenance meds',    onHand:  35, required: PWD_SENIOR_ASSISTED, status: 'OPEN' },
]

/* ═════════════════════════════════════════════════════════════════════════════
   LGU Executive — EMMA-Plan (The Planner)
   ═══════════════════════════════════════════════════════════════════════════ */

/* Occupancy across ACTIVE centres sums to SCENARIO.residentsAffected (340).
   Coordinates sit around Alcoy so the Leaflet pins land correctly. */
export const evacuationCenters = [
  { id: 'ec-nugas-es',  name: 'Nug-as Elementary School',   barangay: 'Nug-as',    address: 'Sitio Poblacion, Nug-as',    capacity: 180, occupied: 164, status: 'ACTIVE', contact: 'Elena Bacalso',   phone: '0917 812 4455', lat: 9.7024, lng: 123.4881 },
  { id: 'ec-alcoy-cs',  name: 'Alcoy Central School',       barangay: 'Poblacion', address: 'Rizal St., Poblacion',       capacity: 220, occupied: 121, status: 'ACTIVE', contact: 'Ramon Villaflor', phone: '0918 334 7720', lat: 9.7133, lng: 123.5089 },
  { id: 'ec-alcoy-gym', name: 'Alcoy Municipal Gymnasium',  barangay: 'Poblacion', address: 'Municipal Compound',         capacity: 300, occupied:  55, status: 'ACTIVE', contact: 'Grace Ytang',     phone: '0920 551 9012', lat: 9.7159, lng: 123.5142 },
  { id: 'ec-guiwang',   name: 'Guiwang Barangay Hall',      barangay: 'Guiwang',   address: 'Guiwang proper',             capacity:  90, occupied:   0, status: 'OPEN',   contact: 'Nestor Caballes', phone: '0927 118 6633', lat: 9.7361, lng: 123.5083 },
  { id: 'ec-pugalo',    name: 'Pugalo Covered Court',       barangay: 'Pugalo',    address: 'Purok 3, Pugalo',            capacity: 120, occupied:   0, status: 'OPEN',   contact: 'Lita Suico',      phone: '0915 447 2288', lat: 9.6928, lng: 123.5006 },
]

export const fundRequests = [
  { id: 'FR-0091', requested: '05:30', item: 'AICS augmentation — 87 households',       amount: 1_200_000, source: 'QRF',        status: 'PENDING'  },
  { id: 'FR-0092', requested: '06:05', item: 'Family food pack replenishment',          amount:   480_000, source: 'LDRRMF 70%', status: 'APPROVED' },
  { id: 'FR-0093', requested: '07:15', item: 'Generator rental — 3 evacuation centers', amount:    95_000, source: 'LDRRMF 30%', status: 'PENDING'  },
  { id: 'FR-0094', requested: '07:50', item: 'Prenatal & maternal kit procurement',     amount:    62_000, source: 'QRF',        status: 'REVIEW'   },
  { id: 'FR-0095', requested: '08:20', item: 'Fuel — evacuation convoy',                amount:    38_000, source: 'LDRRMF 30%', status: 'APPROVED' },
]

export const coordinatingLGUs = [
  { id: 'lgu-dalaguete', name: 'Dalaguete',       role: 'Receiving overflow evacuees', pledged: 'Gymnasium — 150 slots', status: 'ACTIVE' },
  { id: 'lgu-boljoon',   name: 'Boljoon',         role: 'Road clearing support',       pledged: '1 backhoe · 6 personnel', status: 'ACTIVE' },
  { id: 'lgu-argao',     name: 'Argao',           role: 'Medical augmentation',        pledged: '2 nurses · ambulance',    status: 'PENDING' },
]

export const resourceAllocation = [
  { id: 'res-food',  resource: 'Food packs',    allocated: 87,  requested: 87,  status: 'APPROVED' },
  { id: 'res-water', resource: 'Water (20L)',   allocated: 168, requested: 168, status: 'APPROVED' },
  { id: 'res-mats',  resource: 'Sleeping mats', allocated: 300, requested: 340, status: 'PARTIAL'  },
  { id: 'res-gen',   resource: 'Generators',    allocated: 1,   requested: 3,   status: 'PENDING'  },
]

export const SUPPLIES_REMAINING_PCT = 62

/* ═════════════════════════════════════════════════════════════════════════════
   Derived headline figures — computed, never retyped
   ═══════════════════════════════════════════════════════════════════════════ */

const activeCenters  = evacuationCenters.filter(c => c.status === 'ACTIVE')
const activePrograms = aidPrograms.filter(p => p.status === 'ACTIVE')
const openRequests   = fundRequests.filter(f => f.status === 'PENDING' || f.status === 'REVIEW')

export const DERIVED = {
  totalOccupied:      activeCenters.reduce((n, c) => n + c.occupied, 0),
  totalCapacity:      activeCenters.reduce((n, c) => n + c.capacity, 0),
  activeCenterCount:  activeCenters.length,
  barangaysAtRisk:    barangayRisk.filter(b => b.risk === 'HIGH' || b.risk === 'CRITICAL').length,
  activeIncidents:    incidents.filter(i => i.status !== 'CLEARED').length,
  incidentsToday:     incidents.length,
  teamsDeployed:      responseTeams.filter(t => t.status === 'ACTIVE').length,
  activeAdvisories:   advisories.filter(a => a.status === 'ACTIVE').length,
  pendingApprovals:   openRequests.length,
  pendingAmount:      openRequests.reduce((n, f) => n + f.amount, 0),
  coordinatingLGUs:   coordinatingLGUs.length,
  /* staged across the two live programs (AICS + food packs) */
  packagesReady:      activePrograms.reduce((n, p) => n + p.packages, 0),
  /* staged but not yet handed out */
  pendingDisbursements: activePrograms.reduce((n, p) => n + (p.packages - p.released), 0),
  flaggedInventory:   inventory.filter(i => i.status === 'FLAGGED').length,
}

/* Keep in step with the formatter in LguView so the same figure never renders
   two ways on one screen. */
const peso = n => `₱${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 1 : 2)}M`

/* ═════════════════════════════════════════════════════════════════════════════
   Agent assessments — copy comes from CLAUDE.md
   ═══════════════════════════════════════════════════════════════════════════ */

export const agentAssessments = {
  drrmo: {
    confidence: 91,
    headline: `Predicted ${SCENARIO.barangaysAtRisk} barangays at high risk from PAGASA feed.`,
    detail: `Advisory drafted for ${SCENARIO.barangay}. Landslide-prone slopes flagged at Sitio Cansuje; recommend pre-emptive evacuation before the 14:00 rainfall peak.`,
    fields: [
      { label: 'Hazard',   value: `${SCENARIO.hazard} · ${SCENARIO.signal}` },
      { label: 'At risk',  value: `${SCENARIO.barangaysAtRisk} barangays` },
      { label: 'Affected', value: `${SCENARIO.residentsAffected} residents · ${SCENARIO.familiesAffected} families` },
      { label: 'Action',   value: 'Issue evacuation advisory — Nug-as', wide: true },
    ],
  },
  dswd: {
    confidence: 88,
    headline: `${REGISTRY_TOTALS.duplicates} duplicate beneficiaries flagged. ${REGISTRY_TOTALS.validated} households validated.`,
    detail: 'Prenatal kit shortage detected — 0 on hand against 2 expectant mothers in the registry. Recommend procurement request to the LGU before disbursement.',
    fields: [
      { label: 'Validated',  value: `${REGISTRY_TOTALS.validated} of ${REGISTRY_TOTALS.submitted} records` },
      { label: 'Duplicates', value: `${REGISTRY_TOTALS.duplicates} flagged for review` },
      { label: 'Shortage',   value: 'Prenatal kits — 0 / 2' },
      { label: 'Action',     value: 'Escalate prenatal kit procurement to LGU', wide: true },
    ],
  },
  lgu: {
    confidence: 84,
    headline: 'PDRA draft generated from DRRMO and DSWD inputs. Ready for review.',
    detail: `Consolidated ${DERIVED.totalOccupied} evacuees across ${DERIVED.activeCenterCount} active centers against a combined capacity of ${DERIVED.totalCapacity}. ${DERIVED.pendingApprovals} fund requests await your approval, including the prenatal kit procurement escalated by EMMA-Care.`,
    fields: [
      { label: 'Occupancy', value: `${DERIVED.totalOccupied} / ${DERIVED.totalCapacity} across ${DERIVED.activeCenterCount} active centers` },
      { label: 'Pending',   value: `${DERIVED.pendingApprovals} fund requests · ${peso(DERIVED.pendingAmount)}` },
      { label: 'Inter-LGU', value: coordinatingLGUs.map(l => l.name).join(' · ') },
      { label: 'Action',    value: 'Review PDRA and release QRF augmentation', wide: true },
    ],
  },
}

/* ═════════════════════════════════════════════════════════════════════════════
   Cross-view invariants

   Runs at import time in dev. If a future edit breaks the story a judge would
   check, this says so in the console instead of failing silently on stage.
   ═══════════════════════════════════════════════════════════════════════════ */

export function validateMockData() {
  const problems = []
  const check = (ok, msg) => { if (!ok) problems.push(msg) }

  check(
    DERIVED.totalOccupied === SCENARIO.residentsAffected,
    `Evacuation center occupancy (${DERIVED.totalOccupied}) != SCENARIO.residentsAffected (${SCENARIO.residentsAffected})`,
  )
  check(
    DERIVED.totalCapacity >= SCENARIO.residentsAffected,
    `Active EC capacity (${DERIVED.totalCapacity}) cannot hold ${SCENARIO.residentsAffected} evacuees`,
  )
  check(
    REGISTRY_TOTALS.validated === SCENARIO.familiesAffected,
    `Validated households (${REGISTRY_TOTALS.validated}) != SCENARIO.familiesAffected (${SCENARIO.familiesAffected})`,
  )
  check(
    REGISTRY_TOTALS.validated + REGISTRY_TOTALS.duplicates + REGISTRY_TOTALS.pending === REGISTRY_TOTALS.submitted,
    `Registry totals do not add up to ${REGISTRY_TOTALS.submitted} submitted`,
  )
  check(
    DERIVED.barangaysAtRisk === SCENARIO.barangaysAtRisk,
    `Barangays at HIGH/CRITICAL (${DERIVED.barangaysAtRisk}) != SCENARIO.barangaysAtRisk (${SCENARIO.barangaysAtRisk})`,
  )
  check(
    beneficiaries.filter(b => b.status === 'DUPLICATE').length === REGISTRY_TOTALS.duplicates,
    `Duplicate rows shown != REGISTRY_TOTALS.duplicates (${REGISTRY_TOTALS.duplicates})`,
  )
  check(
    beneficiaries.filter(b => b.pwd).length === VULNERABILITY.pwd,
    `PWD rows in registry != VULNERABILITY.pwd (${VULNERABILITY.pwd})`,
  )
  check(
    beneficiaries.filter(b => b.status === 'VALIDATED' && b.age >= 75).length === VULNERABILITY.elderly,
    `Elderly (75+) validated rows != VULNERABILITY.elderly (${VULNERABILITY.elderly})`,
  )
  check(
    beneficiaries.filter(b => b.note.startsWith('Infant')).length === VULNERABILITY.infants,
    `Infant rows != VULNERABILITY.infants (${VULNERABILITY.infants})`,
  )
  check(
    beneficiaries.filter(b => b.note.startsWith('Pregnant')).length === VULNERABILITY.pregnant,
    `Pregnant rows != VULNERABILITY.pregnant (${VULNERABILITY.pregnant})`,
  )
  check(
    barangayRisk.reduce((n, b) => n + b.families, 0) === SCENARIO.familiesAffected,
    `Families across barangays != SCENARIO.familiesAffected (${SCENARIO.familiesAffected})`,
  )
  check(
    barangayRisk.reduce((n, b) => n + b.affected, 0) === SCENARIO.residentsAffected,
    `Affected across barangays != SCENARIO.residentsAffected (${SCENARIO.residentsAffected})`,
  )

  return problems
}

if (import.meta.env.DEV) {
  const problems = validateMockData()
  if (problems.length) {
    console.warn(
      `%c[EMMA mockData] ${problems.length} consistency problem(s) — the demo numbers no longer reconcile:`,
      'color:#DC2626;font-weight:700',
    )
    problems.forEach(p => console.warn('  ·', p))
  }
}
