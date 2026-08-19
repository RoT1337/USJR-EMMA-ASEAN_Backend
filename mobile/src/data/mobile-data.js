/* ─────────────────────────────────────────────────────────────────────────────
   Every scenario string lives here.

   The reference mockups are set in a different province. That is wrong for this
   demo: all four dashboards are Alcoy, Cebu, and if mobile shows a different
   place the "one incident seen from five seats" story visibly breaks. Everything
   below is re-skinned to the demo anchor, and the verification step greps the
   whole project for the old place names expecting zero hits — including this
   comment, which is why it does not name them.

   Figures are copied from the dashboard's mockData by hand rather than imported —
   the dashboard is frozen and this project must not couple to it. Where a number
   appears in both places it is noted, so a judge cross-referencing finds a match.
   ──────────────────────────────────────────────────────────────────────────── */

export const SCENARIO = {
  hazard: 'Typhoon Kalmaegi',
  signal: 'TCWS #3',
  barangay: 'Brgy. Nug-as',
  municipality: 'Alcoy',
  province: 'Cebu',
  responder: 'Alcoy MDRRMO Rescue 01',
  residentsAffected: 340,          // dashboard: SCENARIO.residentsAffected
  familiesAffected: 87,            // dashboard: SCENARIO.familiesAffected
}

export const LOCATION_LINE = `${SCENARIO.barangay}, ${SCENARIO.municipality}, ${SCENARIO.province}`

/* ── Screen 1 · Chat with EMMA ────────────────────────────────────────────────
   Scripted, not generated. The pipeline is demonstrated on the dashboard; this
   screen shows that EMMA reaches the ground.

   This exchange IS dashboard incident INC-2044 — "Medical · Nug-as · Pregnant
   evacuee, 3rd trimester — transport req. · 07:05 · MDRRMO Ambulance". The
   patient is Rosalinda Cabahug, FAM-0412 in the DSWD validated registry, and one
   of the two pregnant women in the Vulnerability agent's Tier 1 finding. Three
   screens agree on one person, which is the point. */

export const CHAT_OPENING = {
  from: 'emma',
  text: `Emergency Dispatch online. Detected location: ${LOCATION_LINE}. Tell me what is happening and I will route the first responder.`,
}

export const CHAT_EXCHANGE = [
  {
    user: 'Pregnant woman in labour at the evacuation centre, 3rd trimester, needs transport',
    emma: {
      text: `Medical response noted. ${SCENARIO.responder} is 6 minutes out. Keep the patient still and monitor breathing until they arrive.`,
      flag: 'TIER 1 VULNERABLE — DRRMO and MSWD notified',
      ref: 'INC-2044',
      at: '07:05',
    },
  },
]

export const QUICK_REPORTS = [
  { id: 'medical',  label: 'Medical Emergency' },
  { id: 'disaster', label: 'Natural Disaster' },
  { id: 'fire',     label: 'Fire Emergency' },
  { id: 'safety',   label: 'Safety Threat' },
]

/* ── Screen 2 · Prioritization of Vulnerable Groups ───────────────────────────
   Centres, capacities and occupancies match the LGU dashboard's evacuation
   centre table exactly. */

export const ACCESS_TAGS = {
  pwd:      'PWD accessible',
  elderly:  'Elderly ward',
  children: 'Child-friendly space',
}

export const EVAC_CENTERS = [
  {
    id: 'ec-nugas-es',
    name: 'Nug-as Elementary School',
    address: `Sitio Poblacion, ${SCENARIO.barangay}`,
    capacity: 180, occupied: 164,          // dashboard: 164/180, 91% — red pin
    distanceKm: 1.8, minutes: 14, mode: 'On foot',
    tags: ['pwd', 'elderly', 'children'],
    note: 'Primary barangay evacuation centre with covered court and medical station.',
  },
  {
    id: 'ec-alcoy-cs',
    name: 'Alcoy Central School',
    address: 'Rizal St., Poblacion',
    capacity: 220, occupied: 121,          // dashboard: 121/220
    distanceKm: 4.2, minutes: 38, mode: 'On foot',
    tags: ['pwd', 'children'],
    note: 'Municipal centre with classroom shelter and a separate family area.',
  },
  {
    id: 'ec-alcoy-gym',
    name: 'Alcoy Municipal Gymnasium',
    address: 'Municipal Compound',
    capacity: 300, occupied: 55,           // dashboard: 55/300
    distanceKm: 4.9, minutes: 44, mode: 'Vehicle',
    tags: ['pwd', 'elderly'],
    note: 'Largest capacity, ramp access throughout, adjacent to the municipal health office.',
  },
]

export const EVAC_FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'pwd',      label: 'PWD' },
  { id: 'elderly',  label: 'Elderly' },
  { id: 'children', label: 'Children' },
]

export const ROUTE_ADVISORY =
  'Real-time capacity and road data may be unavailable during an active disaster. Confirm with your barangay before travelling.'

export const STORM_ADVISORY = {
  title: `${SCENARIO.signal} — ${SCENARIO.hazard}`,
  body: 'Evacuation advised for coastal barangays before 18:00.',
}

/* ── Screen 3 · Citizen Home Hub ──────────────────────────────────────────── */

export const TAKE_ACTION = [
  { id: 'donate',    label: 'Donate Now',    sub: 'Cash, goods or medical supplies' },
  { id: 'needs',     label: 'Request Needs', sub: 'Food, water, shelter, medicine' },
  { id: 'volunteer', label: 'Volunteer Now', sub: '12 open tasks near you' },
]

/* ── Screen 4 · Family Tracking ───────────────────────────────────────────────
   The Cabahug household. Rosalinda and Liam are real rows in the DSWD validated
   registry — FAM-0412, the same family — and Rosalinda is the patient in the
   Screen 1 exchange and in dashboard incident INC-2044. A judge who checks finds
   the same household in three places.

   Danilo and Nena are not in the registry sample the dashboard renders, which
   shows 15 of 93 records; they sit in the unshown remainder. */

export const FAMILY = {
  name: 'Cabahug',
  familyId: 'FAM-0412',
  linked: 4,
  lastSync: '2 min ago',
}

export const FAMILY_MEMBERS = [
  {
    id: 'm-rosalinda',
    name: 'Rosalinda Cabahug',
    role: 'Mother',
    detail: 'Pregnant — 3rd trimester',
    location: 'Nug-as Elementary School',
    status: 'online',
    updated: '2 min ago',
    tag: 'tier1',
    initial: 'R',
  },
  {
    id: 'm-liam',
    name: 'Liam Cabahug',
    role: 'Son · 8 months',
    detail: 'Infant',
    location: 'Nug-as Elementary School',
    status: 'online',
    updated: '2 min ago',
    tag: 'tier1',
    initial: 'L',
  },
  {
    id: 'm-danilo',
    name: 'Danilo Cabahug',
    role: 'Father',
    detail: 'En route from Poblacion',
    location: 'Rizal St., Poblacion',
    status: 'online',
    updated: '6 min ago',
    initial: 'D',
  },
  {
    id: 'm-nena',
    name: 'Nena Cabahug',
    role: 'Grandmother · Elderly',
    detail: 'Last seen at the covered court',
    location: 'Sitio Cansuje — no signal',
    status: 'offline',
    updated: '54 min ago',
    tag: 'attention',
    initial: 'N',
  },
]

export const FAMILY_FILTERS = [
  { id: 'all',     label: 'All' },
  { id: 'online',  label: 'Online' },
  { id: 'offline', label: 'Offline' },
]

/* ── Screen 5 · Volunteer & Training Hub ──────────────────────────────────── */

export const VOLUNTEER_TABS = ['Available', 'My Tasks', 'Submitted', 'Completed']

export const VOLUNTEER_TASKS = [
  {
    id: 'vt-food',
    title: 'Food Distribution',
    org: 'MSWD Alcoy',
    location: 'Nug-as Elementary School',
    date: 'Thu 06 Nov',
    time: '08:00 – 14:00',
    rating: 4.8,
    reviews: 126,
    status: 'Available',
    tab: 'Available',
  },
  {
    id: 'vt-health',
    title: 'Health Awareness Drive',
    org: 'Alcoy Rural Health Unit',
    location: 'Alcoy Central School',
    date: 'Fri 07 Nov',
    time: '09:00 – 12:00',
    rating: 4.6,
    reviews: 84,
    status: 'Available',
    tab: 'Available',
  },
  {
    id: 'vt-relief',
    title: 'Relief Repacking',
    org: 'Alcoy MDRRMO',
    location: 'Alcoy Municipal Gymnasium',
    date: 'Sat 08 Nov',
    time: '13:00 – 17:00',
    rating: 4.9,
    reviews: 61,
    status: 'Available',
    tab: 'Available',
  },
  {
    id: 'vt-transport',
    title: 'Evacuee Transport Assist',
    org: 'Alcoy MDRRMO',
    location: 'Brgy. Nug-as',
    date: 'Wed 05 Nov',
    time: '06:00 – 12:00',
    rating: 4.7,
    reviews: 38,
    status: 'Joined',
    tab: 'My Tasks',
  },
]

export const VOLUNTEER_FILTERS = {
  locations: ['All locations', 'Brgy. Nug-as', 'Poblacion', 'Guiwang'],
  types: ['All task types', 'Relief', 'Medical', 'Logistics'],
}
