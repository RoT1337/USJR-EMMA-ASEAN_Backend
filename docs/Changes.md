# Changes

Running log of build changes. Newest entry at the top.

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

**Phase 2** — write all of `src/data/mockData.js` in one sitting. Anchor: Typhoon Kalmaegi, Brgy. Nug-as, Alcoy, Cebu — 340 residents / 87 families; 2 pregnant, 1 PWD, 4 elderly (75+), 3 infants. Evac centre coords near Alcoy so map pins land right.

**Phase 3** — assemble views; DRRMO last (map dependency).
