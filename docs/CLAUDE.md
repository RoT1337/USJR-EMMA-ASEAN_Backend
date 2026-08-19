# EMMA Mobile — Project Context for Claude Code

**Version 1.3** · Mobile companion prototype · Separate from the dashboard

University of San Jose-Recoletos · AAIH 2026 Grand Finale

---

## What this is and why it exists

The Grand Finale has a **10-minute Q&A**. The presentation shows mobile screens as static images. If a judge asks *"can we see the mobile app?"* we currently have nothing interactive to show.

This builds a **clickable prototype** of those five screens so that question has an answer.

**This is a demo artifact, not a product.** No backend, no real data, no auth. Static screens with working navigation between them.

---

## Hard rule: do not touch the dashboard

The dashboard is **frozen**. It is verified, rehearsed, and being presented tomorrow.

```
repo/
├── dashboard/     ← FROZEN. Do not open, do not edit, do not import from.
├── agents/        ← FROZEN.
├── laravel/       ← FROZEN.
└── mobile/        ← NEW. All work happens here.
```

Create `mobile/` as a **completely independent** Vite + React project with its own `package.json`, its own `node_modules`, its own dev server on a **different port** (5174).

Do not add it to a workspace. Do not share dependencies. Do not import anything from `dashboard/src`. If a component is needed, copy it — duplication is correct here, coupling is not.

Rationale: the only way this work can hurt tomorrow is by breaking the dashboard. Physical separation makes that impossible.

---

## The five screens

From `docs/mobile_reference.png`. Build in this order — the list is a priority order, not just a list.

### 1. Chat with EMMA — conversational triage `[build first]`

The most important screen. It is the only one that shows the **agentic** story on mobile, which is what we are selling.

- Chat thread: EMMA message → user message → EMMA response
- Red banner at top: *"IMMEDIATE LIFE THREAT? Call 911 now."* with a CALL button
- Quick-report chips at the bottom: Medical Emergency · Natural Disaster · Fire Emergency · Safety Threat
- Text input with send button

Messages are **scripted and hardcoded**. Tapping send advances to the next pre-written exchange. No LLM call — the pipeline is demonstrated on the dashboard, not here.

### 2. Prioritization of Vulnerable Groups `[build second]`

The second-most important — it visibly connects to the Vulnerability Agent on the DSWD dashboard.

- Filter chips: All · PWD · Elderly · Children
- Accessible route card with distance and walking time
- Map area (static image is fine — do not add Leaflet)
- Evacuation centre detail: name, accessibility tags (PWD accessible, elderly ward, child-friendly), distance, est. time
- Amber advisory box about road data during active disasters
- Navigate button

### 3. Citizen Home Hub

- Family tracking card with member count and last sync
- Track Family Member / Join Family buttons
- Take Action list: Donate Now · Request Needs · Volunteer Now
- Advisory banner at the bottom

### 4. Family Tracking

- Map area with member pins (static image)
- Filter tabs: All · Online · Offline
- Selected member card
- Member list with online/offline status and role labels
- Add Family Member button

### 5. Volunteer & Training Hub

- Search field
- Location / Type of Task dropdowns
- Tabs: Available · My Tasks · Submitted · Completed
- Task cards with location, date, time, rating, View Details

---

## Scenario data — must match the dashboards

**The reference mockups say Tacloban City, Leyte. That is wrong for our demo.**

Every dashboard is Alcoy, Cebu. If mobile shows a different place, the "one incident seen from five seats" story visibly breaks.

Re-skin everything to the demo anchor:

| Reference says | Use instead |
|---|---|
| Barangay Poblacion, Tacloban City | Brgy. Nug-as, Alcoy, Cebu |
| Typhoon Amihan | Typhoon Kalmaegi |
| Tacloban City Astrodome | Nug-as Elementary School |
| Leyte National High School | Alcoy Central School |
| Tacloban EMS 04 | Alcoy MDRRMO Rescue 01 |
| Signal No. 3 | TCWS #3 |

Family members should be **names already in the DSWD beneficiary registry** so a judge cross-referencing finds them — for example Rosalinda Cabahug (pregnant, 3rd trimester) and Jomar Tabanao (wheelchair user).

Anchor figures, unchanged from the dashboards:

```
340 residents · 87 families · Brgy. Nug-as, Alcoy, Cebu
2 pregnant · 1 PWD (wheelchair) · 4 elderly 75+ · 3 infants
```

Keep all scenario strings in one `src/data/mobile-data.js` file so nothing is hardcoded across components.

---

## Technical approach

**Stack:** Vite + React. No router — a single `screen` state variable, same pattern the dashboard uses for roles. No state library. No backend calls.

**Frame:** render inside a phone-shaped container (~390×844) centred on screen, with a status bar showing 9:41 and signal/battery icons. On a projector this reads as a phone immediately.

**Navigation:** a bottom tab bar or a simple screen switcher. Every tap must go somewhere — a dead button in front of a judge is worse than no button.

**Icons:** `lucide-react`. No emoji.

**Maps:** static image assets. Do not add Leaflet or any map library — it is one more thing to fail.

---

## Design

Follow the reference mockups' own language, not the dashboard's — mobile is a different surface and citizens are not operators.

- Blue primary (`#1B44E0` family), white cards, light grey background
- Rounded cards, generous tap targets — **density is wrong here.** Operators want density; a person standing in the rain does not
- Red only for life-threatening alerts, amber for advisories
- Large readable type

The one consistency that matters: **EMMA wordmark and the orange accent** should appear so it is recognisably the same product.

---

## Build order and stopping points

This is being built the day before the presentation. **Ship something complete rather than everything half-done.**

1. Project scaffold + phone frame + screen switcher
2. **Screen 1 (Chat)** — complete and polished
3. **Screen 2 (Vulnerable Groups)** — complete and polished
4. Stop and evaluate. Two working screens beat five broken ones.
5. Screens 3, 4, 5 if time allows, in that order

If only screens 1 and 2 exist, that is a successful outcome. They carry the agentic story and the vulnerability story, which are the two things a judge is likely to actually ask about.

---

## Verification before calling it done

- `npm run dev` in `mobile/` starts on **5174** and does not conflict with the dashboard on 5173
- The dashboard still runs, unchanged — `git status` shows no modifications outside `mobile/`
- Every visible button either navigates or is visibly disabled
- No console errors
- All place names read Alcoy, Cebu — search the codebase for "Tacloban" and "Leyte" and confirm zero results

---

## Do not

- Do not touch `dashboard/`, `agents/`, or `laravel/` — for any reason
- Do not import from the dashboard project
- Do not add a backend call, an LLM call, or a map library
- Do not use port 5173
- Do not leave Tacloban or Leyte anywhere in the strings
- Do not build all five screens shallowly — depth first, in the given order
- Do not refactor anything outside `mobile/`