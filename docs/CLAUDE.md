# EMMA — Project Context for Claude Code

**Version 1.0** · Phases 1–3 complete · Phase 4 (escalation chain) is the current work

**Evacuation Management & Monitoring Assistants**
University of San Jose-Recoletos · AAIH 2026 Grand Finale · Danang, Vietnam

---

## Read this first

This repo is a disaster-coordination system with **two tiers**:

1. **Old EMMA (local)** — role-based dashboards for Philippine LGU disaster response. **Rebuilt and complete** as of Phase 3.
2. **EMMA for ASEAN (regional)** — five-agent LangGraph pipeline for cross-border coordination. Pre-existing, working, largely untouched.

The presentation narrative is **bottom-to-top**: a report starts in a barangay and escalates up through DRRMO → DSWD → LGU → AHA Centre. Phase 4 exists to make that escalation literal in the product, not just in the narration.

**Companion documents — read both:**
- `docs/Changes.md` — running build log, newest entry at the top
- `docs/NOTES.txt` — demo-day risks, open decisions, known gaps. Section A before presenting.

---

## Current state

### Complete

**Phase 1 — foundation.** `LoginScreen` (mock auth, role selector) → `App.jsx` routes on role state, no react-router. `roles.js` is the single source for role names, orgs, agent names, accents, nav trees, breadcrumbs. `DashboardShell` composes header + sidebar + breadcrumb + main/aside. Shared primitives in `src/components/shared/`: `StatCard`/`StatRow`, `DataTable`, `AgentPanel`, `RoleHeader`/`RoleChip`, `Sidebar`.

**Phase 2 — data.** `mockData.js` derives all headline totals from `SCENARIO`/`VULNERABILITY` via `DERIVED` — numbers cannot drift. `validateMockData()` runs **14 cross-view invariants** at import in dev. `dataSource.js` is the backend seam: every getter async, API-shaped returns, views never import `mockData.js` directly. `useDashboardData.js` wraps it. `api.js` has service-tagged errors, timeouts (15s Laravel / 120s agents), and `window.EMMA.probe()`.

**Phase 3 — four views.** `DswdView`, `LguView`, `DrrmoView` all render 6 stat cards + tables + agent panel, above the fold at 1600×900. `WeatherMap` (Leaflet + OpenWeatherMap, dark basemap, layer + scope toggles, `divIcon` pins colour-coded by occupancy). `ForecastStrip`. `AseanView` holds the original pipeline verbatim.

**Verified live:** 5 agents online, full run 16.4s, all six agents populated, Qdrant surfaced Typhoon Odette + westward tracking to Vietnam unprompted. Zero console errors across all views.

### Known open items

Tracked in `NOTES.txt`. The ASEAN-side items (**B1** badge rule, **B3** HumanGate dead prop, **C1** four lint errors) were deliberately deferred to be cleared as part of Phase 4 — they are one conversation, not three tasks.

---

## Phase 4 — the escalation chain (current work)

**The problem being solved:** every local view shows a system that already knows things. The ASEAN view shows an empty textarea waiting for prose. That seam is what makes the regional tier read as a demo harness rather than a product.

**The fix:** remove the textarea from the demo path. The report arrives on its own, escalated from the LGU.

### The chain

Each tier has one named operator and produces one artifact consumed by the tier above.

| Tier | Operator | Produces | Consumed by |
|---|---|---|---|
| Field (mobile) | Kap. M. Santos, Brgy. Nug-as | Situation report | DRRMO |
| DRRMO | J. Ramos | **Hazard Advisory** — 4 barangays HIGH | DSWD + LGU |
| DSWD | R. Village | **Validated Beneficiary List** — 87 HH, 3 duplicates | LGU |
| LGU Executive | Office of the Mayor | **SITREP** — ₱1.36M, 340 affected | ASEAN |
| ASEAN | AHA Centre | Regional coordination + Human Gate | — |

**The load-bearing join: the ASEAN situation report *is* the LGU's SITREP.** Not a re-typed summary — the same document, composed from the same anchor data. This is also institutionally correct: under AADMER, national authorities submit structured reports to the AHA Centre.

**Naming — SITREP, not PDRA.** Both are real NDRRMC instruments and they are not interchangeable. A **PDRA** (Pre-Disaster Risk Assessment) is produced *before* impact to justify pre-emptive evacuation. A **SITREP** (Situational Report) is produced *during* an event. Our demo scenario is mid-event — flooding underway, road already cut — so the escalating artifact is a SITREP. This also matches the existing API surface (`createSituationReport`, `report_text`, `report_id`), giving one name across the whole stack.

Keep PDRA listed as an LGU capability in the view. It is a genuine function of that tier per the Agent–User Mapping doc, and showing both makes the tier look complete rather than single-purpose — this demo simply exercises the mid-event path.

### 4a — Auto-generated escalation `[highest priority]`

LGU view gets a primary **"Escalate to AHA Centre"** action.

On click:
1. Compose report text from `SCENARIO` + `VULNERABILITY` + `DERIVED` — never hardcode the prose, derive it, so it stays inside the invariant system
2. Switch role to ASEAN
3. Land with the textarea **pre-filled** and a provenance banner above it:
   > ⬆ Escalated from Alcoy LGU · SITREP-2026-1105-ALC · 07:12 · Office of the Mayor

**Prefill, do not auto-submit.** The Process click stays a demo beat and it lets the presenter control when the 16.4s pipeline wait starts (see NOTES A3).

Keep the textarea editable and keep manual entry working — it is the fallback if escalation state is lost, and it demonstrates the view standalone. It just stops being the demo path.

### 4b — Escalation timeline strip `[strongest visual]`

A thin horizontal strip in `DashboardShell`, visible in all four views, filling in as the demo progresses:

```
Field ●───── DRRMO ●───── DSWD ●───── LGU ●───── ASEAN ○
```

This is bottom-to-top made literal — by the ASEAN segment the judge has watched the chain complete across four screens. Drive it from simple lifted state in `App.jsx`; it does not need to be real workflow state.

### 4c — Inbound handoff banners

Top of each view, naming what arrived and from whom:

- DSWD — *"Advisory received from DRRMO · 4 barangays HIGH · 06:47 · J. Ramos"*
- LGU — *"Validated list from DSWD · 87 households · ₱1.36M requested · 07:03"*
- ASEAN — the provenance banner from 4a

### 4d — Shared incident ID

`INC-2026-1105-ALC` in the breadcrumb across all four views. Same incident, four seats — not four separate apps.

### 4e — ASEAN cleanup (fold in here)

Clear the deferred items now that the rework is happening: **B1** (decide one badge rule and apply it to both tiers), **B3** (wire or drop `HumanGate`'s `handoff` prop), **C1** (four dead-code lint errors in ASEAN files).

---

## Map behaviour — narration direction

**DRRMO defaults to Alcoy scope, not Philippines.** The scope toggle then walks *outward* — Alcoy → Philippines → ASEAN — mirroring the escalation chain. Opening wide and flying in is top-down and fights the narrative.

At Alcoy scope the weather layer is dead weight: OpenWeatherMap tiles are a coarse global raster and go flat past roughly zoom 8. Reduce its opacity or hide it at local scope and let evacuation pins plus barangay risk carry the view.

> **Weather is regional context. Pins are local truth.** The scope toggle already knows which mode it is in.

---

## Design system — reuse, do not redesign

All four dashboards must look like one product. Use the existing visual language from `AgentCard.jsx` — same colours, card treatment, radius, typography, badge styling. Do not introduce a second design language.

The dark map basemap is a deliberate exception: it is a map surface, not UI chrome, and it exists because pale OpenWeatherMap tiles wash out on light basemaps.

**Dark mode is out of scope.** Whole-surface change, real regression risk across four views, and the one place it earns something (the map) already has it.

---

## Reference screenshots

`docs/picture_references/` holds the original EMMA dashboards. They are the source of truth for **layout** — panel arrangement, information hierarchy, table columns, card groupings.

Take styling from our existing components, never from the screenshots. Deliberately not copied: saturated solid-colour stat cards, dark chrome, "View All →" footers (dead links in a mock), and the `PartnerTrainingAgency` / `SUPERADMIN` screens (outside the four-role scope).

---

## Mock data consistency

Anchor: **Typhoon Kalmaegi, Brgy. Nug-as, Alcoy, Cebu.**

```
340 residents · 87 families
2 pregnant · 1 PWD (wheelchair) · 4 elderly 75+ · 3 infants
Registry: 93 submitted = 87 validated + 3 duplicates + 3 pending
Active EC occupancy sums to exactly 340 against 700 capacity
```

Every headline total is derived in `DERIVED`, never retyped. `validateMockData()` enforces 14 invariants at import in dev.

**If you edit numbers, watch the console.** A red `[EMMA mockData]` warning means a judge could catch you. It has already caught two real drifts during the build.

Escalation report text in Phase 4a must be composed from these same constants so it stays inside the invariant system.

---

## Presentation constraints

**5 minutes, strictly enforced.**

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

Each dashboard gets ~45 seconds. Everything important must be visible immediately at 1600×900 without scrolling. Above-the-fold density beats depth.

**The pipeline takes 16.4s** against a 45s ASEAN segment. Agent cards also stagger in over ~1250ms *after* results arrive — do not cut away the instant the gate appears.

---

## Before going on stage

1. `window.EMMA.probe()` in the browser console — **both rows must read reachable=yes**. The health banner only checks :8001; a dead Laravel stays invisible until someone clicks Submit.
2. If Laravel is unreachable: `VITE_LARAVEL_BASE_URL=http://127.0.0.1:8000`, not `localhost` (IPv6 `::1` resolution on Windows).
3. Confirm the console shows no `[EMMA mockData]` warnings.

Offline insurance: `dashboard/public/weather-map-fallback.png` — captured live at 2x for projector. Usable as a slide asset; auto-swap on tile failure is not wired.

---

## Do not

- Do not modify `agents/` or `laravel/`
- Do not rewrite the ASEAN pipeline — Phase 4e is targeted cleanup, not a rebuild
- Do not add real authentication
- Do not add our-backend calls to DRRMO / DSWD / LGU (the OpenWeatherMap tile layer is fine — third-party CDN, not our backend)
- Do not import `mockData.js` from a view — always go through `dataSource.js`
- Do not hardcode figures that `DERIVED` can compute
- Do not introduce a second design language
- Do not commit `.env` (now gitignored — teammates re-copy from `.env.example` after pulling)
- Do not add features beyond what is listed — the deadline is the constraint
