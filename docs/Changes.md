# Changes

Running log of build changes. Newest entry at the top.

---

## 2026-08-08 · Session memory across role switches

Rob's polish note: *"When switching to a different role, maybe keep highlighted what was previously opened?"* — applied in three places, because it mattered in all of them.

- **Login returns you to your last seat.** It reset to DRRMO every time; now pre-selects the role you just left, username prefilled to match
- **Visited seats marked** with a small green tick on the login screen
- **The reporting chain no longer regresses** — this was the real bug underneath. `chainStateFor` computed completion purely from the current seat, so walking *backwards* un-filled the strip: DRRMO → MSWD → Mayor, then back to DRRMO, and the last two went dark as though they had never happened. Now takes a `visited` list and keeps them lit

`App.jsx` tracks `visited` + `lastRole`; threaded through the three views and `AseanView`. Relay tiers and the AHA Centre deliberately still light **only** on real submission, so browsing cannot fake the chain.

**Verified** — walked forward through all three seats, then backwards to DRRMO: strip still reads `[DRRMO · MSWD · Mayor]` lit with DRRMO current. Login shows 3 ticks and pre-selects correctly. Lint clean, build passes, zero console errors.

### ⚠ Found while testing: pre-submitting does not survive a role switch

Rob picked A3 option (a) — pre-submit, present a populated screen. **It doesn't work as-is.** `App.jsx` renders views with `key={roleId}` and signing out swaps in the login screen, so leaving the ASEAN view unmounts it and discards pipeline results. Verified directly: typed a marker into the ASEAN textarea, switched to LGU, switched back — field empty.

Logged as **NOTES A6** with three options. Recommended: two browser windows (zero code, zero risk). Same cause means a browser refresh also resets everything mid-demo.

---

## 2026-08-08 · Phase 4 corrections — institutional accuracy

Naming and provenance only. **Demo flow unchanged** — same click, same prefill, same landing, still no auto-submit.

Under RA 10121 the chain is Barangay → Municipal → Provincial → Regional → NDRRMC, and under AADMER only NDRRMC submits to the AHA Centre. A municipality reporting directly to Jakarta was the one structurally wrong claim on the board.

**1. LGU action renamed** — "Escalate to AHA Centre" → **"Submit SITREP"**. Alcoy submits to the Cebu Provincial DRRMC. The outbound SITREP card copy was corrected to match ("for onward relay to NDRRMC and the AHA Centre"), and "DSWD" → "MSWD" there since it's the municipal office.

**2. Provenance banner carries the relay path**
```
⬆ SITREP-2026-1105-ALC · 07:12 · Office of the Mayor
  Alcoy LGU → Cebu Provincial DRRMC → NDRRMC → AHA Centre
  relayed via EMMA-Aggregate · EMMA-Report
```
`buildEscalation()` now carries `relayPath` and `relayAgents` rather than a single `from`.

**3. Escalation strip regrouped** (the optional one — it fit)
```
Brgy. Nug-as ● ─ [ALCOY LGU: ●DRRMO ●MSWD ●Mayor] ⋯ Provincial ⟩ NDRRMC ⋯ AHA Centre
                                                      (dimmed · AUTO-RELAYED)
```
- `STAGES` (flat 5) replaced by `CHAIN` with node kinds `single` / `group` / `relay`; `stagesCompletedFor` → `chainStateFor`
- Municipal seats are **lateral peers in one boxed tier**, completing left to right — not three rungs
- Relay tiers render hatched and dimmed, and **light up only after Submit**. Arriving at the ASEAN view manually does not fake the relay
- Puts **EMMA-Aggregate** and **EMMA-Report** on screen, where they were previously only in a slide

**4. SITREP body corrected** (approved after flagging). It read *"Submitted by the Office of the Mayor to the AHA Centre"* — the same wrong claim, three lines under the banner that fixes it, both in frame at once. Now **derived from `RELAY_PATH`**, so the document cannot contradict the banner above it:

> "Submitted by the Office of the Mayor to the Cebu Provincial DRRMC for onward relay to NDRRMC and the AHA Centre, requesting regional augmentation."

1092 → 1160 chars (+6%), negligible against the 29.9s.

**5. Operator identities unified.** The same person was showing three different identities across login, sidebar and handoff banner (e.g. `j.ramos` / "James Avaceña" / "J. Ramos"). `roles.js` is now the single source — `escalation.js` derives every name through a `who(roleId)` helper and never restates one.

| Role | login | sidebar | inbound banner shows |
|---|---|---|---|
| DRRMO | `j.avacena` | James Avaceña | — (from Kap. M. Santos) |
| DSWD | `s.monteverde` | Shiela Monteverde | James Avaceña |
| LGU | `j.matias` | Jason Matias | Shiela Monteverde |

Side benefit: the chain is now traceable **by name**. You see James Avaceña on the DRRMO sidebar, then his name again on DSWD's inbound banner — the handoff is between people, not just offices.

**Verified** — strip fills correctly at each seat, button reads "Submit SITREP", provenance shows all four hops plus both relay agents, relay tier lights only post-submit, AHA Centre highlights, SITREP no longer contains the old claim, all three identities agree across login/sidebar/chip/banner. Lint clean (zero errors, zero warnings), build passes, zero console errors.

---

## 2026-08-08 · Phase 4 — the escalation chain

The seam is gone: the ASEAN report now **arrives** instead of being typed.

**4a — auto-generated escalation.** New `src/data/escalation.js`. LGU header gets a primary **Escalate to AHA Centre** action; clicking it composes the SITREP, switches role, and lands on ASEAN with the textarea prefilled and a provenance banner. Prefill, **not** auto-submit — the Process click stays a demo beat.
- Report text is **composed from `SCENARIO` / `VULNERABILITY` / `DERIVED`**, never hardcoded, so it stays inside the invariant system
- SITREP not PDRA — mid-event instrument, and it matches the existing API surface
- Manual entry still works; textarea grows 6→18 rows when prefilled so the document is actually readable

**4b — escalation strip** in all four views (`DashboardShell` + `AseanView`), filling in as the demo walks up: `Field ● DRRMO ● DSWD ● LGU ● ASEAN ○`.

**4c — inbound handoff banners** naming what arrived and from which human.

**4d — one incident ID** `INC-2026-1105-ALC` in every breadcrumb and the ASEAN header.

**4e — deferred ASEAN items cleared**
- **B1** one confidence rule across both tiers. `AgentCard` now tints by 80/60 thresholds instead of repeating the agent accent (which its border, title and icon already carry). Earns itself immediately: on the verification run Resource returned 72% and renders **amber against five greens** — the operator can see which agent was least certain before approving
- **B3** `handoff` prop dropped from `HumanGate` + call site, orphaned CSS removed. Dropped rather than wired: the Handoff card sits directly above and already shows the same content
- **C1** all four lint errors cleared. **`eslint src/` is now zero errors, zero warnings** for the first time. One was not cosmetic — the `agentStates` dependency warning hid a real **timer leak**: the reveal effect created up to 6 `setTimeout`s with no cleanup. Restructured to schedule off the `AGENTS` constant and clear on unmount

**Map narration reversed** (per updated CLAUDE.md) — opens on **Alcoy** and walks outward, mirroring the chain instead of fighting it. Alcoy now at zoom 13 for true municipal framing. Overlay drops to 0.15 opacity locally where it carries no information, and the **basemap is scope-aware**: dark regionally so weather glows, light locally so streets stay readable. Fallback image re-captured to match.

**⚠ Demo timing regressed** — the richer auto-composed SITREP (1,092 chars) takes **29.9s** vs 16.4s for the old short report. Report length drives latency; confirmed, not guessed. Against a 45s segment that needs a decision — see NOTES A3.

**Verified live** — chain walked DRRMO→DSWD→LGU→escalate→process against running backends. Strip fills correctly at each tier, provenance banner correct, `lgu_id` carried through, agents extracted every anchor figure (340 / 87 / Nug-as / Alcoy). Zero console errors.

---

## 2026-08-08 · Polish — A2 weather overlay, B2 stat consistency

Acting on Rob's responses to `NOTES.txt`. Three resolved, three deferred to the ASEAN rework.

**A2 — weather overlay now actually visible** (was the biggest "looks broken but isn't" risk)
- **Basemap → CartoDB Dark Matter.** This was the real fix. OWM tiles are pale and semi-transparent; on light basemaps they wash out, on dark they glow — same reason radar displays are dark. Map surface, not UI chrome, so no second design language.
- Default layer **Clouds, not Rain** — rain only paints where it's actually raining; clouds always exist and render as dramatic banded structure on dark
- Default scope **Philippines, not Alcoy**; layers reordered by reliability (Clouds, Temp, Wind, Rain); opacity 0.6→0.8; Alcoy zoom 11→10
- Compared all four layers against both basemaps before choosing — findings recorded in NOTES so nobody repeats it
- Rob's point about local zoom confirmed **unfixable**: OWM tiles are a coarse global raster, past ~zoom 8 one tile covers the viewport. Reframed instead — wide scope = weather is the story, local scope = pins are the story

**A4 — fallback image captured** → `dashboard/public/weather-map-fallback.png`, 2x for projector, taken while tiles were confirmed live. Usable as a slide asset now; auto-swap-on-tile-failure not wired.

**B2 — "Aid Packages Ready = 174"** resolved by *disclosure*, not by changing the number (174 is correct — two programs for the same 87 households; showing 87 would be less true). Card now reads `174 / AICS + food packs · 87 HH each`, plus **two new invariants** pinning the relationship. 14 invariants, all passing.

**Deferred to the ASEAN rework** — B1 (badge rule), B3 (HumanGate dead prop), C1 (4 lint errors). All ASEAN-side, and Rob wants ASEAN delivery reworked to be automatic and fed from old EMMA. One conversation, not three tasks.

**Verified** — all 14 invariants pass; DSWD stat row renders the new sub-line; map tiles 10 basemap + 10 OWM, 0 failures, 5 pins visible on dark at both scopes; lint and build clean; dev server stopped afterwards.

---

## 2026-08-07 · Phase 3c — DRRMO view · Phase 3 complete

**`DrrmoView.jsx`** — layout from `oldEMMA_DRRMO.jpg`: 6 stat cards → forecast strip → weather map → barangay risk → incidents. Agent panel + active advisories in the rail.

**`ForecastStrip.jsx`** — 7-day outlook, today highlighted, rainfall drives a bar under each day.

**`WeatherMap.jsx`** — Leaflet + OpenWeatherMap, **verified live**: 15 OSM + 15 OWM tiles, 0 failures, 5 pins.
- Layer toggle (Rain / Clouds / Wind) and scope toggle (Alcoy / Philippines / ASEAN), both from CLAUDE.md's tables
- Pins are `divIcon`s, not Leaflet's default PNGs — those break under bundlers, and this lets pin colour encode occupancy on the same thresholds as the LGU bars
- Degrades gracefully with no API key: base map + pins still render, with a visible notice
- `ScopeController` uses `useEffect`, not a render-body side effect

**Cleanup** — `PendingRegion.jsx` deleted and its CSS removed; nothing references it.

**Verified** — all three local views: 6 stat cards, 3 tables, agent panel each (91 / 88 / 84). Role switching works. **Zero console errors across all views.** Build passes; the only lint errors are the 4 pre-existing ones in ASEAN pipeline files.

⚠️ **`docs/NOTES.txt` written** — collated demo-day risks, open decisions, and known gaps. Read section A before presenting; the weather overlay may look empty on a clear day (A2) and that's the biggest "looks broken but isn't" risk.

---

## 2026-08-06 · Backends verified live + Phase 3b LGU view

**Backend connection — one real bug found and fixed**
- `window.EMMA.probe()` reported **agents up, Laravel unreachable**. Cause: `localhost` resolves to IPv6 `::1` first on Windows, but Laravel is bound to IPv4 `127.0.0.1` only. `curl localhost:8000` failed while `curl 127.0.0.1:8000` worked
- Fixed in `dashboard/.env`: `VITE_LARAVEL_BASE_URL=http://127.0.0.1:8000`. **If this ever recurs on the demo machine, that's the fix**
- Probe now targets `/api/families` instead of `/` — the Laravel welcome page 500s for unrelated reasons and read as a false failure

**Live pipeline verified end to end** — real LLM calls, real DB writes
- Health: `5 agents online · claude-haiku-4-5`
- Full run in **16.4s**: all 6 agents populated (Intake 98 · Vulnerability 80 · Resource 78 · Routing 82 · Pattern 92 · Handoff 87), Human Gate rendered
- Qdrant retrieval works — Pattern agent surfaced *Typhoon Odette, 2021-12-16, Alcoy* and flagged westward tracking to Vietnam, which is exactly the cross-border narrative
- Agents correctly extracted every anchor figure from the report: 340 residents, 87 families, 2 pregnant, 1 wheelchair, 4 elderly 75+, 3 infants

**`LguView.jsx`** — layout from `oldEMMA_EvacCenters.jpg`
- Hero "Evacuation Centers" table with occupancy bars that colour by fill (Nug-as ES at 164/180 reads red, others green), then the approvals queue with peso amounts and fund source
- Aside: EMMA-Plan at 84% + inter-LGU coordination panel
- Everything above the fold at 1600×900

**Fixes**
- `.data-cell-mono` now `nowrap` — ref codes were wrapping as `FR-` / `0091`
- **Two peso formatters disagreed on the same number** — table caption said `₱1.36M`, agent panel said `₱1.357M`. Aligned; both read `₱1.36M`

**Known, not fixed** — `HumanGate` receives a `handoff` prop it never renders, and the `.humangate-summary` CSS is orphaned (pre-existing lint error). Functionally harmless: the Handoff card sits directly above the gate showing the same action + reasoning, so restoring it would duplicate. Either wire it or drop the prop — say which.

---

## 2026-08-06 · Phase 3a — DSWD view assembled

First real view. Proves the primitives + data seam work end to end; DRRMO and LGU are now fill-in.

**`DswdView.jsx`** — layout from `oldEMMA_LGUMSWD.jpg`: 6 stat cards over one hero "List of Beneficiaries" table, aid programs below, agent panel + relief inventory in the right rail.
- The whole DSWD story sits **above the fold** at 1600×900: 87 validated / 3 duplicates flagged / prenatal shortage, all three duplicate rows visible, EMMA-Care explaining why, and prenatal kits showing `0 / 2` in red
- Vulnerability rows are individually visible — Rosalinda Cabahug 3rd trimester, Jomar Tabanao wheelchair user — so the summary reconciles against the table on screen
- Confidence badge reads **88% green**, per the 80/60 rule

**`useDashboardData.js`** — hook over the dataSource seam, returns `{data, loading, error}`. Views never touch `mockData.js`. When dataSource swaps to a real fetch, the loading/error branches already written here start doing real work; no view changes.

**Primitive changes**
- `DataTable` gained `render: (row) => node` for composed cells (name + sub-line, progress bars, stock ratios)
- `DataTable` gained `rowKey` — **bug fix**: it keyed on `row.id`, but a DSWD family id is shared by every family member *and* by its own duplicate records, so React saw duplicate keys. Now defaults to row index
- Table row padding 9px→6px, and stock figures no longer wrap

**Backends were down during this work** — irrelevant for DSWD, which is pure mock. Only `/asean` needs :8000/:8001.

**Verified** — build + eslint clean on all new code; all three local views render and role-switch with **no console errors**; DSWD screenshotted and reviewed at 1600×900.

---

## 2026-08-06 · Phase 2 — mock data + backend seam

**`src/data/mockData.js`** — one sitting, all three views. Anchor: Typhoon Kalmaegi, Brgy. Nug-as, Alcoy, Cebu.
- `SCENARIO` + `VULNERABILITY` are the single source of truth; headline totals are **computed in `DERIVED`**, never retyped, so they can't drift
- Real Alcoy barangays (8, exactly 4 at HIGH/CRITICAL); evac centre coords around Alcoy for map pins; neighbouring LGUs Dalaguete / Boljoon / Argao
- Registry: 93 submitted = 87 validated + 3 duplicates + 3 pending. The 2 pregnant / 1 PWD / 4 elderly / 3 infants are **findable as actual named rows**, not just a summary count
- Active EC occupancy sums to exactly 340 against 700 capacity

**`validateMockData()`** — 12 cross-view invariants, run at import in dev, warns in console if the story stops reconciling. Caught two stale hardcoded strings in the LGU agent copy on first run (said "2 fund requests · ₱1.295M", actually 3 · ₱1.357M) — now derived.

**`src/data/dataSource.js`** — the backend seam. Views import from here, **never** from `mockData.js`.
- Every getter is already `async` and returns an API-shaped response, so swapping in a real endpoint is a one-function change with zero view edits
- `VITE_DATA_SOURCE=live` env flag reserved for per-view cutover
- The return shapes ARE the backend contract — hand them to whoever writes the endpoints

**`src/api.js`** — rebuilt for live-demo debugging. **All four call signatures unchanged**, so `AseanView` needed no edits.
- Timeouts: 15s Laravel, 120s agents (the pipeline legitimately takes a while)
- Dev interceptors log every request/response with service tag + timing
- Errors normalised to name the service, url and fix: `"cannot reach agents at http://localhost:8001/health — is the service running on :8001? (also check CORS)"` instead of `"Network Error"`
- **`window.EMMA.probe()`** — pings both services from the browser console, prints a table. Run it before going on stage: the health banner only covers :8001, so a dead Laravel would otherwise surface mid-demo on the first submit

**Verified** — all 12 invariants pass in node and in-browser; data seam returns correct stats for all 3 roles; probe and error normalisation confirmed against *down* services; build + lint clean.

---

## 2026-08-06 · Sidebar, breadcrumb, six-card grid — Phase 1 revised

Triggered by the CLAUDE.md update (screenshots + weather overlay). Phase 1 re-opened to match the reference layout.

**Security — fixed before anything else**
- `dashboard/.env` was **tracked by git** and `.gitignore` had no `.env` rule; the new OpenWeatherMap key was one `git add -A` from a public repo
- Verified key was never committed (`git log -S` across all branches) → no history rewrite, no key rotation needed
- `git rm --cached dashboard/.env` (file kept on disk) · added `.env` / `.env.*` / `!.env.example` to `dashboard/.gitignore` · documented the key in `.env.example`
- ⚠️ On next commit, teammates who pull lose their local `.env` — they re-copy from `.env.example`

**Phase 0 verified**
- OpenWeatherMap key is **live** — real `precipitation_new` tile returns `200 image/png`. No activation wait, no static fallback needed
- `leaflet@1.9.4` + `react-leaflet@5.0.0` installed and present
- Read all 5 screenshots in `docs/picture_references/`

**Layout changes from the screenshots**
- **New** `Sidebar.jsx` — cosmetic per-role nav tree (nothing clickable, one item active). Styled to mirror `AgentNav` (200px, white, right rim border) so local views and the ASEAN view share one shell
- **New** `DashboardShell.jsx` — composes header + sidebar + breadcrumb + main/aside; the three views are now content-only
- **New** breadcrumb strip — "Home / Alcoy, Cebu — DRRMO"
- Stat grid retuned for **6 cards**, not 4 (screenshot is layout source of truth); `minmax(122px, 1fr)`, value 26px→24px
- `roles.js` extended with `nav`, `activeNav`, `displayName`, `breadcrumb` per role
- Sidebar hidden below 900px — it's cosmetic, not worth crowding data on tablet
- Fixed orphaned `|` in the login card when the tagline wrapped

**Deliberately not copied from the screenshots**
- Saturated solid-colour stat cards and dark chrome → old design language, layout only
- "View All →" card footers → dead links in a mock; flag if you want them back
- `PartnerTrainingAgency` / `SUPERADMIN` screenshots → roles outside the four-role scope, treated as reference only

**Verified** — build clean; Playwright chromium installed; login → DRRMO → role switch → ASEAN walked with **no page errors**; screenshots reviewed.

---

## 2026-08-06 · Phase 1 foundation

- `AseanView.jsx` — App.jsx state machine moved **verbatim**; only import paths, the removed intro gate, and an added role chip differ
- `LoginScreen.jsx` replaces `IntroScreen.jsx` (deleted) — cosmetic username/password + 4 role cards; picking a role swaps the username and tints the submit button
- `App.jsx` is now ~30 lines: role state is the router (`null` → login), keyed on `roleId` so switching remounts clean. No react-router
- `roles.js` — single source for role names, orgs, agent names, accents
- Shared primitives in `src/components/shared/`:
  - `StatCard.jsx` — value/label/sub/trend, `.agent-card` treatment; exports `StatRow`
  - `DataTable.jsx` — column config, `pill: true` renders `StatusPill`; palette **extends** AgentCard's `URGENCY_STYLES` with identical hex values
  - `AgentPanel.jsx` — reuses `.agent-card` / `.conf-bar-track` / `.field-row` classes directly
  - `RoleHeader.jsx` — shared header + `RoleChip` (returns to login)
- Scaffolds for `DrrmoView` / `DswdView` / `LguView`
- `demo-record.js` updated — clicked `.intro-cta`, which no longer exists

**Open decision** — `AgentPanel` colours its confidence badge by the 80/60 rule from CLAUDE.md, but `AgentCard` colours its badge by *agent accent*. So EMMA-Warn may show a green badge on an orange card while ASEAN cards stay accent-coloured. Flip with `tintByConfidence={false}`.

**Also changed** — AseanView header title was "DRRMO Operator Dashboard" (confusing now that a real `/drrmo` exists); now pulls from `roles.js`.

---

## Next up

All four views are built. **Polish pass next** — full detail in `docs/NOTES.txt`; suggested order:

1. **A2** weather overlay visibility — biggest visual risk, ~10 min
2. **B1** confidence badge rule (one prop, three views)
3. **B2** "Aid Packages Ready = 174" — keep or change to 87
4. **B3** HumanGate dead `handoff` prop — wire it or drop it
5. **A3** rehearse the 16s pipeline wait against the 45s ASEAN segment
6. **C1** clear the 4 pre-existing lint errors (optional)
7. **A4** capture a static map screenshot as venue-wifi insurance
