// Placeholder / demo-only data for UI sections that don't have a real backend
// endpoint wired up yet. Replace each block once the corresponding feature-tracker
// item ships:
//   - DEMO_REPORT      -> just a canned SITREP for the "Load Demo Scenario" button
//   - EVAC_CENTERS      -> replace with GET /api/evacuation-centers/nearest
//   - RESOURCES         -> replace once the Laravel `resources` table is seeded
//   - CROSS_BORDER      -> replace once the Regional Pattern Agent returns real cross-border data

export const DEMO_REPORT = {
  lgu_id: 'alcoy-cebu-lgu',
  report_text: `[SITREP] 31 JUL 2026 · 14:12 PHT · Alcoy LGU
Typhoon Kalmaegi tracking WNW at 22 kph, sustained winds 185 kph.
Landfall expected 18:24 PHT, coastal barangays Poblacion, Atabay, Pugalo.
Rainfall 240mm past 6h, storm surge 4.2m forecast.
Cebu South Road km 102-108 flooding, comms partial (9/42 cell towers offline).
Evac centers Alpha (San Roque) 84% cap, Bravo (Alcoy Gym) at capacity.
Estimated 24,000+ residents at risk, high senior density in Poblacion.
Requesting AI triage and cross-border sync -- storm tracking toward central Vietnam.`,
}

export const EVAC_CENTERS = [
  { id: 'EC-A', name: 'San Roque Elementary', capacity: 1200, filled: 1008, distanceKm: 1.2, status: 'warn', coords: [55, 42] },
  { id: 'EC-B', name: 'Alcoy Municipal Gym', capacity: 850, filled: 850, distanceKm: 0.6, status: 'crit', coords: [48, 55] },
  { id: 'EC-C', name: 'Sta. Rosa Parish Hall', capacity: 620, filled: 220, distanceKm: 2.8, status: 'ok', coords: [68, 30] },
  { id: 'EC-D', name: 'Pugalo Covered Court', capacity: 450, filled: 180, distanceKm: 3.4, status: 'ok', coords: [32, 62] },
]

export const RESOURCES = [
  { key: 'water',   label: 'Potable water',       unit: 'L',     pct: 68, status: 'ok',   stock: '12,400' },
  { key: 'food',    label: 'Food packs (72h)',    unit: 'packs', pct: 52, status: 'warn', stock: '3,120' },
  { key: 'med',     label: 'Medical kits',        unit: 'kits',  pct: 88, status: 'ok',   stock: '812' },
  { key: 'shelter', label: 'Shelter tarps',       unit: 'units', pct: 18, status: 'crit', stock: '140' },
  { key: 'gen',     label: 'Portable generators', unit: 'units', pct: 34, status: 'warn', stock: '42' },
]

export const CROSS_BORDER = {
  origin: { flag: '🇵🇭', place: 'Alcoy · Cebu', eta: 'T-4h' },
  projected: { flag: '🇻🇳', place: 'Vũng Tàu → Đà Nẵng corridor', eta: 'T+48h', riskPct: 82 },
}

export const STATUS_TONE = { ok: 'ok', warn: 'warn', crit: 'crit' }
