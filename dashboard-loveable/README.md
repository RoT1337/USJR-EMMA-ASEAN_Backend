# EMMA Dashboard — Loveable UI/UX Testing Ground

This is a **safe, parallel copy** of the real DRRMO operator dashboard (`../dashboard`), reskinned
with the new Loveable-designed visual language. It is **not** the production dashboard — it exists
so the new UI can be reviewed and rehearsed with before anything gets ported back.

- Same real backend wiring as `../dashboard` (`src/api.js`, the phase state machine in `App.jsx`,
  every agent's data shape) — untouched.
- Only the visual layer changed: components, CSS, layout.
- A few new panels (Analytics Summary, Hazard Map, Resource Stockpile, Cross-Border, Audit Trail)
  are backed by placeholder data in `src/lib/mock-data.js` until their backend work lands — each is
  commented with which feature-tracker item unblocks it.

See the PR description for the full breakdown of what's real vs. placeholder, and the list of
remaining tasks.

## Prerequisites

- **Node.js 20+** and npm (check with `node -v` / `npm -v`)
- The EMMA backend services running locally, same as for `../dashboard`:
  - Laravel API on `http://localhost:8000`
  - Python/LangGraph agent service on `http://localhost:8001`

If those services aren't running, the app still loads — the health banner will show "connecting…"
or "unreachable" and submitting a report will error, exactly like the real dashboard does. That's
expected, not a bug in this UI.

## Quick launch (all 3 services, Windows PowerShell)

If you've already done first-time setup for Laravel, the Python agent service, and this dashboard
at least once, there's a launcher script at the **repo root** (`../start-dashboard-loveable.ps1`)
that opens three PowerShell windows and starts everything for you:

```powershell
cd USJR-EMMA-ASEAN_Backend
.\start-dashboard-loveable.ps1
```

It starts Laravel on `:8000`, the Python agent service on `:8001`, and this dashboard on `:5174`
(kept distinct from the real dashboard's `:5173` so both can run side by side). If PowerShell
blocks it with an execution-policy error, run once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

This only launches already-configured services — do the manual first-time setup below at least
once first.

## Setup (Windows)

Using **PowerShell** or **Git Bash**:

```powershell
# 1. Clone the repo (or pull if you already have it)
git clone git@github.com:RoT1337/USJR-EMMA-ASEAN_Backend.git
cd USJR-EMMA-ASEAN_Backend
git checkout demo/ryu-new-ui/ux

# 2. Go into this folder
cd dashboard-loveable

# 3. Copy the env template and adjust if your backend runs on different ports
copy .env.example .env.local

# 4. Install dependencies
npm install

# 5. Run it
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

> If you're using **Git Bash** instead of PowerShell, use `cp .env.example .env.local` instead of
> `copy` in step 3 — everything else is identical.

## Setup (macOS/Linux, for reference)

```bash
git clone git@github.com:RoT1337/USJR-EMMA-ASEAN_Backend.git
cd USJR-EMMA-ASEAN_Backend
git checkout demo/ryu-new-ui/ux
cd dashboard-loveable
cp .env.example .env.local
npm install
npm run dev
```

## Trying it out

1. Click **Launch Dashboard** on the intro screen.
2. Click **Load Typhoon Kalmaegi · Alcoy** to pre-fill a realistic demo SITREP (or type your own).
3. Click **Run AI Pipeline →** — this hits the real Laravel + Python endpoints, so both services
   need to be running for it to actually process. Without them, you'll see the same error state the
   real dashboard shows.
4. Watch the six agent cards reveal in sequence in the main column, alongside the new Analytics
   Summary card and Hazard Map (placeholder data).
5. Once all six agents complete, use the **Human Gate** panel at the bottom to Approve / Modify /
   Reject — this also calls the real `POST /api/agent-logs` endpoint.

## Project structure

```
src/
  api.js                    # unchanged — same Laravel/Python endpoints as ../dashboard
  App.jsx                   # new 3-column results layout, same state machine
  lib/mock-data.js          # placeholder data for the not-yet-wired panels (clearly commented)
  components/
    IntroScreen.jsx          # restyled splash
    SituationReportForm.jsx  # restyled intake form + "Load Demo Scenario" button
    AgentCard.jsx            # restyled agent result card (same data-handling logic)
    AgentNav.jsx              # restyled left-rail pipeline nav
    HumanGate.jsx             # restyled decision panel, now also shows the real recommendation
    HealthBanner.jsx          # restyled health indicator
    AgentGlyph.jsx            # new — per-agent glyph badge
    ConfidenceBadge.jsx       # new — real traffic-light confidence badge (green/amber/red)
    AnalyticsSummary.jsx      # new — built entirely from real intake data
    HazardMap.jsx             # new — placeholder map + evac pins
    ResourcePanel.jsx         # new — placeholder resource stockpile
    CrossBorderPanel.jsx      # new — placeholder PH↔VN tracking
    EvacList.jsx              # new — placeholder evac center list
    AuditTrail.jsx            # new — real audit entries (report id, real per-agent confidence)
```

## Troubleshooting

- **`npm install` fails on Windows with a path-length error** — enable long paths
  (`git config --system core.longpaths true` as Administrator, or move the repo closer to
  `C:\` to shorten the path).
- **Port 5173 already in use** — run `npm run dev -- --port 5183` (or any free port).
- **Health banner stuck on "connecting…"** — the Python agent service isn't reachable at
  `http://localhost:8001`; start it or update `VITE_PYTHON_SERVICE_URL` in `.env.local`.
- **Do not commit `.env` or `.env.local`** — they're git-ignored on purpose.
