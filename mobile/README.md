# EMMA Mobile

Clickable prototype of the mobile companion, built for the Grand Finale Q&A and
for a short video beat in the presentation.

**Completely independent of `dashboard/`.** Own `package.json`, own
`node_modules`, own port. Nothing is imported across. The dashboard is frozen and
this project cannot affect it.

## Run

```bash
npm install
npm run dev          # http://localhost:5174
```

Port 5174 with `strictPort` — the dashboard owns 5173 and a clash fails loudly
rather than silently moving.

## Record the video

```bash
npm run dev        # terminal 1, :5174
npm run record     # terminal 2
```

Output lands in `recordings/` as `.webm` (gitignored). Roughly 45 seconds.

A tour of all five screens, **phone only** — the dashboard is not involved. The
demo chrome (top bar, screen switcher) is hidden during recording, so the frame
is the handset alone on a dark ground and drops into a slide as-is.

It is not a feature list. The point is that EMMA is available to the people on
the ground, which is what makes the bottom-to-top chain credible.

**Format note:** Playwright outputs `.webm`. Browsers and Google Slides play it;
PowerPoint generally does not. Convert first if the deck is PowerPoint —
`ffmpeg -i in.webm out.mp4`.

## What is built

There is **no chrome around the handset** — no header, no screen switcher. The
page renders the phone alone on a dark ground, so it reads as a device rather
than a prototype viewer.

Navigation lives **inside the phone**, the way it would on a real one:

- the **hamburger** on Home opens a slide-out drawer listing all five screens
- **back chevrons** on the sub-screens return to Home
- Home's own cards route into Family Tracking and Volunteer Tasks
- the bell opens Chat

Landing screen is Home, since that is where an app opens.

All five screens from `docs/screenshots/mobile_reference.png` are built.

| # | Screen | Interactive |
|---|---|---|
| 01 | Chat with EMMA | scripted exchange, quick-report chips, CALL state |
| 02 | Prioritization of Vulnerable Groups | accessibility filters, centre picker, route info |
| 03 | Citizen Home Hub | routes into Family Tracking and Volunteer Hub |
| 04 | Family Tracking | member selection drives map + card, working zoom |
| 05 | Volunteer & Training Hub | tabs, search, cycling filters, expandable detail |

Every button does something. Nothing is inert — verified programmatically, not
by eye.

## The cross-reference that matters

The chat exchange is not generic. It **is** dashboard incident `INC-2044` —
*"Medical · Nug-as · Pregnant evacuee, 3rd trimester — transport req. · 07:05 ·
MDRRMO Ambulance"*. The patient is **Rosalinda Cabahug**, `FAM-0412` in the DSWD
validated registry, and one of the two pregnant women in the Vulnerability
agent's Tier 1 finding.

A judge who cross-references three screens finds the same person. That is the
point of the mobile tier existing at all.

Evacuation centre capacities and occupancies also match the LGU dashboard exactly
(Nug-as Elementary School 164/180, etc.).

## Constraints held

- No backend, no LLM call, no auth — scripted throughout
- No map library; the route is inline SVG
- `lucide-react` for icons, no emoji
- All scenario strings live in `src/data/mobile-data.js`
- Zero occurrences of the reference mockups' original place names
