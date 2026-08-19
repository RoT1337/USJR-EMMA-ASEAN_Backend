# EMMA — Project Context for Claude Code

**Version 1.2 (final)** · All phases complete · This document lists the remaining fixes only

**Evacuation Management & Monitoring Assistants**
University of San Jose-Recoletos · AAIH 2026 Grand Finale · Danang, Vietnam

---

## Read this first

Disaster-coordination system with **two tiers**:

1. **Old EMMA (local)** — role-based dashboards for Philippine LGU disaster response
2. **EMMA for ASEAN (regional)** — five-agent LangGraph pipeline for cross-border coordination

Narrative is **bottom-to-top**: a report starts in a barangay, travels up through the municipal offices, relays through provincial and national tiers, arrives at the AHA Centre.

**Companion documents:**
- `docs/Changes.md` — build log, newest first
- `docs/NOTES.txt` — demo-day risks. **Section A before presenting.**

---

## Status

Phases 1–4 and V1.2 are complete: login + role routing, shared primitives, mock data with enforced invariants, four views, live weather map, escalation chain, SITREP queue, architecture diagram, design pass.

Verified: lint clean, build passes, zero console errors on every view, queue click drives the live pipeline end to end.

**What follows is a short list of remaining fixes from a screenshot review.** Everything else is done. The risk now is breaking something, not missing something — do not refactor beyond what is listed.

---

## Remaining fixes

### 1. LGU contradicts itself on the document name `[required — do this first]`

The LGU screen names one artifact two ways:

- EMMA-Plan panel reads *"**PDRA** draft generated from DRRMO and DSWD inputs"*
- Its ACTION field reads *"Review **PDRA** and release QRF augmentation"*
- But the header button says **Submit SITREP** and the outbound panel says **SITREP**

Our scenario is mid-event — flooding underway, road cut — so the artifact is a **SITREP**. A PDRA is a *pre*-disaster instrument. Both are real NDRRMC documents, which is exactly why a Philippine judge will notice the mismatch.

**Change the EMMA-Plan copy to say SITREP.** String-level change. If the copy is derived rather than hardcoded, change it at the source so it cannot drift again.

PDRA may remain listed as an LGU *capability* elsewhere — it is a genuine function of that tier. It just is not the thing being submitted here.

### 2. ASEAN view is half empty before processing `[optional — only if time]`

The bottom ~55% of `AseanView` is dead space until the pipeline runs. It is the climax screen and currently the emptiest.

**This may not matter.** With the two-window approach from NOTES A6, the presented window is already populated and nobody sees the empty state. Choreography handles it.

If you want insurance anyway: replace the flat `TRIAGE RUNS` chip row with the **six agent cards rendered in an idle/waiting state**. Same information, fills the frame, and shows the shape of what is about to happen before it happens. Reuse the existing card component with an idle variant — do not build a second component.

Do not add filler. An empty region is better than decoration.

### 3. ASEAN view has no sidebar `[decision, not necessarily a change]`

All three local views have a sidebar; `AseanView` does not, so it reads as a different application rather than a different seat.

Defensible as-is — AHA Centre genuinely is a different organisation from Alcoy LGU. Either leave it and answer that way if asked, or add a cosmetic nav matching the others (Incident Queue · Member States · Deployments · Reports). **Do not spend long on this.**

### 4. DRRMO map at Alcoy scope `[low priority]`

Large grey sea, pale land, small pins. Weakest visual on that screen.

Already partly accounted for — the overlay is intentionally low-opacity locally because OpenWeatherMap tiles carry no information past ~zoom 8, and the caption says pins carry the view. If touched at all, larger pins are the cheapest improvement. **Not worth risk this close to submission.**

---

## Reference — do not break these

### The reporting chain

Under RA 10121: **Barangay → Municipal → Provincial → Regional → NDRRMC.** Under AADMER, only OCD/NDRRMC submits to the AHA Centre — a municipality cannot submit directly to Jakarta.

**DRRMO and MSWD are lateral peers**, both under the Mayor. Not two rungs.

The strip's grouped municipal seats and hatched relay tiers are correct. So is `via NDRRMC` as a queue column. Leave both alone.

### Chain honesty

The Alcoy row appears in the ASEAN queue **only after** the municipality actually submits, and relay tiers light only on real submission. Browsing must not be able to fake the chain. Preserve this.

### Mock data

Anchor: **Typhoon Kalmaegi, Brgy. Nug-as, Alcoy, Cebu.**

```
340 residents · 87 families
2 pregnant · 1 PWD (wheelchair) · 4 elderly 75+ · 3 infants
Registry: 93 submitted = 87 validated + 3 duplicates + 3 pending
Active EC occupancy sums to exactly 340 against 700 capacity
```

All headline totals derived in `DERIVED`. `validateMockData()` enforces the invariants at import in dev. **A red `[EMMA mockData]` warning means a judge could catch you.**

### Design

Operations software, not SaaS dashboard. Density is a feature. Colour encodes state only. Figures monospace with tabular digits. No emoji — `lucide-react` throughout. Motion encodes state change; nothing moves on idle except the radar sweep.

All five views must look like one product. The dark map basemap at regional scope stays a deliberate exception.

---

## Demo choreography

**Pre-submitting does not survive a role switch** (NOTES A6) — `App.jsx` keys views by `roleId`, so leaving `AseanView` unmounts it and discards results. A browser refresh does the same.

**Use two browser windows.** Zero code, zero risk. Window A walks the local seats; window B holds the ASEAN view already populated.

Sequence: show the queue for the few seconds you narrate it — *"reports arrive from member-state NDMOs"* — then cut to the populated window. The empty region below is never in view long enough to register.

**Do not click Process live.** The pipeline takes ~26–30s against a 45-second segment.

---

## Before going on stage

1. `window.EMMA.probe()` — **both rows must read reachable=yes**. The health banner only checks :8001
2. If Laravel is unreachable: `VITE_LARAVEL_BASE_URL=http://127.0.0.1:8000`, not `localhost` (IPv6 `::1` on Windows)
3. No `[EMMA mockData]` warnings in console
4. Second window pre-populated before the segment starts

Offline insurance: `dashboard/public/weather-map-fallback.png`.

---

## Do not

- Do not modify `agents/` or `laravel/`
- Do not change the agent pipeline — the queue feeds it, it does not change
- Do not trim `composeSitrepText()` — length is handled by choreography
- Do not let browsing fake the reporting chain
- Do not import `mockData.js` from a view — go through `dataSource.js`
- Do not hardcode figures that `DERIVED` can compute
- Do not introduce a second design system
- Do not commit `.env`
- **Do not refactor beyond the four items above.** The build is verified; unrequested changes are the main remaining risk
