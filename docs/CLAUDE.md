# EMMA — Project Context for Claude Code

**Evacuation Management & Monitoring Assistants**
University of San Jose-Recoletos · AAIH 2026 Grand Finale · Danang, Vietnam · July 31

---

## Read this first

This repo contains a disaster-coordination system with **two layers**:

1. **Old EMMA (local)** — role-based dashboards for Philippine LGU disaster response. Multiple user roles, each with their own named AI agent. This is what we are **recreating** in this sprint.
2. **EMMA for ASEAN (regional)** — a five-agent LangGraph pipeline for cross-border coordination. **Already built and working.** Do not rebuild.

The narrative of the presentation is: *local Philippine coordination scales up into ASEAN regional coordination.* The dashboards demonstrate this literally — three local role views, plus one regional view where the ASEAN agents live.

---

## Check the reference screenshots first

**Before building any dashboard view, look at the old EMMA screenshots in `docs/`.**

These are screenshots of the original EMMA dashboards. They define the **layout and information hierarchy** we are recreating — what panels exist, where they sit, what data appears in each.

How to use them:

- **Take the layout from the screenshots** — panel arrangement, what information appears where, table columns, card groupings
- **Take the styling from our existing components** — colors, typography, card treatment, border radius, badge styling from `AgentCard.jsx` and the current dashboard

Do **not** copy the old visual styling. The old dashboards are a different design language. We want old EMMA's *structure* rendered in the current ASEAN dashboard's *aesthetic*, so all four views look like one product.

If a screenshot shows something not described in this document, follow the screenshot — it is the source of truth for layout.

---

## Current state — what already exists

**`dashboard/`** — React + Vite. Working, on `main`.

```
dashboard/src/
├── App.jsx                    ← state machine: idle → submitting → processing → awaiting_decision → done
├── api.js                     ← checkHealth, createSituationReport, processReport, logDecision
└── components/
    ├── IntroScreen.jsx        ← landing screen (BEING REPLACED — see below)
    ├── HealthBanner.jsx       ← agent service health indicator
    ├── SituationReportForm.jsx
    ├── AgentPipeline.jsx      ← orchestrates agent cards
    ├── AgentCard.jsx          ← individual agent output + confidence badge + reasoning
    ├── AgentNav.jsx
    └── HumanGate.jsx          ← Approve / Modify / Reject
```

**`agents/`** — Python FastAPI + LangGraph. Five agents + Handoff Coordinator. Claude Haiku 4.5. Qdrant for prior-event retrieval. Runs on port 8001. **46 passing tests. Do not modify.**

**`laravel/`** — PHP backend. Runs on port 8000. Existing endpoints plus four added for the agent service. **Do not modify.**

---

## What we are building

### 1. Mock login replacing IntroScreen

`IntroScreen.jsx` currently has a "Continue" button. Replace with a **mock login** that doubles as the role switcher.

- Username + password fields (cosmetic — accept anything, or prefill)
- A role selector: DRRMO Officer / DSWD Officer / LGU Executive / ASEAN Regional
- On submit, route to that role's dashboard
- No real auth. No backend call. Purely presentational.

This is deliberate: during the demo we log in as each role to show what that user sees. It reads as access control rather than tab-switching.

Keep a way to switch roles without a full logout — a small role indicator in the header that returns to login is enough.

### 2. Four dashboard views

| Route | Role | Agent name | Data |
|---|---|---|---|
| `/drrmo` | DRRMO Officer | **EMMA-Warn** — The Sentinel | Mock + live weather |
| `/dswd` | DSWD / MSWD Officer | **EMMA-Care** — The Welfare Manager | Mock |
| `/lgu` | LGU Executive / Mayor's Office | **EMMA-Plan** — The Planner | Mock |
| `/asean` | ASEAN Regional Coordinator | Five-agent pipeline + Handoff | **LIVE** — existing code |

**Only `/asean` calls our backend.** DSWD and LGU render hardcoded data from `src/data/mockData.js`. DRRMO renders mock data plus a live third-party weather overlay (see below).

`/asean` is the existing `App.jsx` flow, lifted into its own view component unchanged.

---

## Weather overlay — DRRMO dashboard

The DRRMO view needs a **live weather map overlay** covering the Philippines, ideally extendable to the wider ASEAN region. This is a mentor requirement and a strong visual for the demo.

### Recommended: OpenWeatherMap tile layers over Leaflet

Free tier, works directly as a Leaflet `TileLayer`, no proxy or backend needed.

**Setup:** [Already done by me]

1. Get a free API key at `openweathermap.org/api` (signup takes a few minutes; key activation can take up to a couple of hours — **do this first, before writing the map code**)
2. Store it in `dashboard/.env`:
   ```
   VITE_OPENWEATHER_API_KEY=your_key_here
   ```
3. Install: `npm install leaflet react-leaflet`

**Tile URL format:**

```
https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={API_KEY}
```

**Available layers** — use `precipitation_new` and `clouds_new` for typhoon visualisation:

| Layer value | Shows |
|---|---|
| `precipitation_new` | Rainfall intensity — **best for typhoon demo** |
| `clouds_new` | Cloud cover — good for storm structure |
| `wind_new` | Wind speed |
| `temp_new` | Temperature |
| `pressure_new` | Pressure |

**Implementation:**

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// Philippines view
<MapContainer center={[12.8797, 121.7740]} zoom={6} style={{ height: '400px' }}>
  {/* Base map */}
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="&copy; OpenStreetMap contributors"
  />

  {/* Weather overlay */}
  <TileLayer
    url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`}
    opacity={0.6}
    attribution="&copy; OpenWeatherMap"
  />

  {/* Evacuation center pins from mockData */}
  {evacuationCenters.map(ec => (
    <Marker key={ec.id} position={[ec.lat, ec.lng]}>
      <Popup>{ec.name} — {ec.occupied}/{ec.capacity}</Popup>
    </Marker>
  ))}
</MapContainer>
```

**Useful map centers:**

| View | Center | Zoom |
|---|---|---|
| Philippines | `[12.8797, 121.7740]` | 6 |
| ASEAN region | `[8.0, 115.0]` | 4 |
| Alcoy, Cebu (demo focus) | `[9.7167, 123.5167]` | 12 |

**Nice touch if time allows:** a small layer toggle letting the operator switch between precipitation / clouds / wind. Cheap to build, demos well, and reinforces that this is an operator tool rather than a static image.

**Fallback if the API key doesn't activate in time:** ship a static screenshot of the weather map as a placeholder image. Do not let this block the rest of the build — it is one panel on one dashboard.

---

## Design system — reuse, do not redesign

**Critical rule: all four dashboards must look like the same product.**

Use the existing visual language from `AgentCard.jsx` and the current components — same colors, same card treatment, same border radius, same typography, same confidence badge styling. Do not introduce a second design language for the new views.

When all four views look like siblings, it reads as one coherent system with role-scoped access. That is the intended impression.

Confidence badge colors (keep consistent):
- 80+ → green
- 60–79 → amber
- below 60 → red

---

## Build order

**Phase 0 — before anything else**

- Look at the screenshots in `docs/`
- Sign up for the OpenWeatherMap API key (activation lag means starting this early matters)

**Phase 1 — foundation**

1. Extract current `App.jsx` agent flow into `src/views/AseanView.jsx` — move it, don't change it
2. Replace `IntroScreen.jsx` with `LoginScreen.jsx` (role selector)
3. Add routing in `App.jsx` — role state determines which view renders
4. Build three shared primitives in `src/components/shared/`:
   - `StatCard.jsx` — a number, a label, optional trend indicator
   - `DataTable.jsx` — header row, data rows, status pills
   - `AgentPanel.jsx` — **thin wrapper around AgentCard styling**, so EMMA-Warn/Care/Plan render in the identical visual language as the ASEAN agents

**Phase 2 — mock data**

Write all of `src/data/mockData.js` in one sitting so numbers stay internally consistent across views. See the consistency rule below.

**Phase 3 — assembly**

Each view is: a row of `StatCard`s, one or two `DataTable`s, an `AgentPanel` on the side. Same skeleton, different content. Should be 30–45 min per view once primitives exist. Build DRRMO last since it has the map dependency.

---

## Mock data consistency rule

Numbers must reconcile across dashboards. A judge who looks closely should find the story holds together.

Anchor scenario: **Typhoon Kalmaegi, Brgy. Nug-as, Alcoy, Cebu — 340 residents affected across 87 families.**

- DRRMO shows 340 affected, 87 families, in Brgy. Nug-as
- DSWD beneficiary counts should sum to roughly 87 households
- LGU evacuation center capacity should plausibly accommodate 340 people
- Vulnerability figures stay constant: 2 pregnant, 1 PWD (wheelchair), 4 elderly (75+), 3 infants

Use these same figures everywhere they appear. Evacuation center coordinates in `mockData.js` should sit around Alcoy, Cebu so the map pins land correctly.

---

## Dashboard contents

Layout comes from the screenshots in `docs/`. The lists below are what each view must contain — use them to check nothing is missing, not as a substitute for the screenshots.

### DRRMO — EMMA-Warn (The Sentinel)

Core tasks: hazard monitoring · early warning & advisories · incident reporting · equipment & team inventory · simulation drills

- **Weather map** with precipitation overlay + evacuation center pins (see above)
- **StatCards**: active advisories, barangays at risk, incidents today, teams deployed
- **DataTable**: barangay risk levels (color-coded), active incident reports
- **AgentPanel**: "Predicted 4 barangays at high risk from PAGASA feed. Advisory drafted for Brgy. Nug-as."

### DSWD / MSWD — EMMA-Care (The Welfare Manager)

Core tasks: program creation (AICS, cash/food aid) · beneficiary registry & validation · inventory tracking · disbursement & liquidation · grievance handling

- **StatCards**: households validated, duplicates flagged, aid packages ready, pending disbursements
- **DataTable**: beneficiary registry with validation status pills, aid program cards
- **AgentPanel**: "3 duplicate beneficiaries flagged. 87 households validated. Prenatal kit shortage detected."

### LGU Executive — EMMA-Plan (The Planner)

Core tasks: evacuation center overview · resource allocation · local disaster plan (PDRA) · fund requests & approvals · reports & analytics · inter-LGU coordination

- **StatCards**: EC occupancy vs capacity, resources allocated, pending fund approvals, LGUs coordinating
- **DataTable**: evacuation center status, pending approvals queue
- **AgentPanel**: "PDRA draft generated from DRRMO and DSWD inputs. Ready for review."
- Optional: auto-drafted SITREP preview panel

### ASEAN Regional — five-agent pipeline

Existing build, unchanged. Situation report input → Intake → Vulnerability → Resource → Routing → Regional Pattern → Handoff Coordinator → Human Gate.

Frame this view as the tier that local dashboards escalate into.

---

## Presentation constraints

The demo is **5 minutes, strictly enforced.** Segment budget:

| Segment | Time |
|---|---|
| Problem | 0:30 |
| Solution + SDG | 0:30 |
| Mobile + Web overview | 0:30 |
| DRRMO | 0:45 |
| DSWD | 0:45 |
| LGU | 0:45 |
| AADMER / ASEAN | 0:45 |
| Architecture diagram | 0:15 |
| Call to action | 0:15 |

Build for **live demo pacing**. Each dashboard gets ~45 seconds on screen, so the important information must be visible immediately without scrolling or interaction. Above-the-fold density matters more than depth.

---

## Do not

- Do not modify `agents/` or `laravel/`
- Do not rebuild the ASEAN agent pipeline — move it, don't touch it
- Do not add real authentication
- Do not add our-backend calls to DRRMO / DSWD / LGU views (the OpenWeatherMap tile layer is fine — it's a third-party CDN, not our backend)
- Do not introduce a second design language
- Do not copy the old screenshots' visual styling — layout only
- Do not commit the OpenWeatherMap API key; keep it in `.env` and confirm `.env` is gitignored
- Do not add features beyond what is listed — the deadline is the constraint

---

## Deadlines

- **Draft**: Saturday, August 8
- **Finalize**: Sunday, August 9
- **Hard submit**: morning of August 10
