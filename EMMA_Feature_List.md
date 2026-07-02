# EMMA — Grand Finale Feature List

University of San Jose-Recoletos · AAIH 2026 · Climate Change Resilience Track
Grand Finale: July 31, 2026 · Danang, Vietnam

## Key Dates

- July 5 — Promotional video due (2 files: with + without background music)
- July 6-12 — Online public voting on P2A Facebook
- July 25-30 — Final rehearsals with live dashboard
- July 31 — Grand Finale live pitch, Danang, Vietnam

## Team Ownership

- **Rob** — Dashboard coordination, hazard map component, GitHub cleanup, team logistics
- **Ryu** — Dashboard build (React/Vite), Leaflet map, resource inventory seeding
- **Alliyana** — Qdrant seed expansion, multilingual agent extension (Bahasa, Vietnamese, Thai)
- **Jamal** — Promotional video (most urgent), pitch rehearsal, Q&A prep

## Feature Tracker

| PRIORITY | FEATURE | DESCRIPTION | OWNER | STATUS |
|----------|---------|-------------|-------|--------|
| CRITICAL | Agent Cards — Progressive Loading | Cards appear one by one as agents complete, not all at once. Critical for demo pacing and narration. | Ryu | Done |
| CRITICAL | Agent Reasoning Text | Full reasoning paragraph visible under each agent card. Mentor specifically requested this. | Ryu | Done |
| CRITICAL | Human Gate — Approve/Modify/Reject | Buttons fire POST /api/agent-logs to Laravel after operator decision. Audit trail logged. | Ryu | Done |
| CRITICAL | Full Agent Pipeline End-to-End | All five LangGraph agents returning real outputs via /process endpoint. | Alliyana | Done |
| CRITICAL | Qdrant Expanded Seed Data | Add Typhoon Fung-wong, Cyclone Senyar (Indonesia), Vietnam flooding event. Currently only 3 events. | Alliyana | To Do |
| CRITICAL | Cross-border PH to VN Scenario | Vietnamese input showing Kalmaegi tracking PH to VN. Regional Pattern Agent must return relevant cross-border insight. | Alliyana | To Do |
| CRITICAL | Multilingual Extension | Intake Agent handles Bahasa Indonesia, Vietnamese, Thai in addition to Filipino and English. | Alliyana | To Do |
| CRITICAL | Resource Inventory Seeded | Laravel resources table seeded with realistic Alcoy stockpile data (food, medicine, water, EC capacity) for demo. | Ryu | In Progress |
| IMPORTANT | Hazard Map with Evacuation Center Pins | Leaflet.js or Mapbox GL with GeoRiskPH overlay tiles. Evacuation center pins from existing Laravel /api/evacuation-centers/nearest endpoint. | Ryu | In Progress |
| IMPORTANT | Analytics Summary Card | Top-level card showing urgency level, population affected, and key flags before agent detail. Operator sees headline at a glance. | Ryu | Done |
| IMPORTANT | Simulation Mode — Load Demo Button | "Load Demo Scenario" button pre-fills the Alcoy Kalmaegi situation report automatically. Reduces setup friction during live pitch. | Ryu | Done |
| IMPORTANT | Confidence Score Color Coding | Green badge 80+, amber badge 60-79, red badge below 60. Visible on every agent card. | Ryu | Done |
| SHOULD HAVE | Bahasa Indonesia Demo Scenario | A second prepared input in Bahasa that Jamal can use to show multilingual capability live. Shows ASEAN scope. | Alliyana | To Do |
| SHOULD HAVE | GitHub Repos Public + Clean | Both emmafrontend and emmabend public before July 31. README passes 10-minute clone test. No committed API keys. | Rob | To Do |
| SHOULD HAVE | Mobile App Brief Demo Clip | 10-second screen recording of citizen app for the Grand Finale pitch. Shows bottom-up data collection. Not needed for promo video. | Earl or Rob | To Do |
| SHOULD HAVE | Laravel Vulnerability Endpoint Live | GET /api/households/{familyId}/vulnerability returning real data from registration DB for Vulnerability Agent. | Ryu | To Do |
| STRETCH | 3D / Heatmap Visualization | Deck.gl heatmap overlay on Leaflet base showing hazard intensity by barangay. More dramatic than 2D map alone. | Ryu | To Do |
| STRETCH | Alcoy LGU Letter of Intent | Email or signed letter from Alcoy MSWD expressing pilot intent. Strong Gate 3 credibility signal. | Rob | To Do |
| STRETCH | SMS Fallback Architecture Diagram | One-slide visual showing degraded mode (Llama 3.3 local + SMS queue). Describe, do not build. | Jamal | To Do |
| NON-DEV | Promotional Video | 2-3 min, MP4 1080p. Two files (with/without music). AAIH intro + USJR logo. English subtitles mandatory. See separate plan document. | Jamal + Rob | To Do |
| NON-DEV | Vietnam eVisa + Travel Prep | Philippine passport holders can apply online at evisa.xuatnhapcanh.gov.vn. Usually 3-5 business days. Coordinate with P2A. | P2A Secretariat | To Do |
| NON-DEV | Live Pitch Rehearsal x3 | Three full run-throughs with working dashboard before July 31. One session with mentor. Jamal leads, Rob controls screen. | All | To Do |
| NON-DEV | Grand Finale Narrative Upgrade | Gate 3 rewards storytelling. Pitch needs bigger human moment than semi-final version. Reframe around Alcoy pilot progress. | Jamal | To Do |

## Status Legend

Done — Complete and tested | In Progress — Actively being built | To Do — Not yet started

---

EMMA · University of San Jose-Recoletos · AAIH 2026 · Built in the Philippines. Ready for ASEAN.
