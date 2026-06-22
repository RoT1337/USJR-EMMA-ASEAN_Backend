# EMMA — Backend & Operator Dashboard

**Evacuation Management & Monitoring Assistants**  
University of San Jose-Recoletos · AAIH 2026 · Climate Change Resilience Track

EMMA is a multilingual multi-agent AI coordination system for ASEAN disaster response. This repository contains three components that work together:

| Folder | What it is | Port |
|---|---|---|
| `laravel/` | PHP backend — data layer, API endpoints, auth | 8000 |
| `agents/` | Python FastAPI + LangGraph — five AI agents | 8001 |
| `dashboard/` | React (Vite) — DRRMO operator interface | 5173 |

> The citizen-facing mobile app (Expo/React Native) lives in a separate repository: [emmafrontend](https://github.com/EarlGimenez/emmafrontend)

---

## Repository structure

```
emmabackend/
├── laravel/                  ← PHP Laravel backend
│   ├── app/
│   ├── database/
│   ├── routes/api.php
│   └── .env.example
├── agents/                   ← Python agent service
│   ├── main.py               ← FastAPI app (entry point)
│   ├── graph.py              ← LangGraph orchestration
│   ├── agents/               ← Six agent node functions
│   │   ├── intake.py
│   │   ├── vulnerability.py
│   │   ├── resource.py
│   │   ├── routing.py
│   │   ├── pattern.py
│   │   └── handoff.py
│   ├── utils/
│   │   ├── claude.py
│   │   ├── laravel.py
│   │   └── qdrant.py
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
├── dashboard/                ← React Vite DRRMO dashboard
│   ├── src/
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Quick start — get everything running

Run each service in a separate terminal. Order matters: Laravel first, agents second, dashboard third.

### Prerequisites

- PHP 8.2+, Composer, MySQL/MariaDB
- Python 3.10+ (3.11 recommended), pip
- Node.js 18+, npm
- Anthropic API key
- Qdrant Cloud cluster (free tier — [cloud.qdrant.io](https://cloud.qdrant.io))

---

### 1. Laravel backend (port 8000)

```bash
cd laravel
composer install
cp .env.example .env
php artisan key:generate
```

Configure your database in `laravel/.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=emma
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Then:

```bash
php artisan migrate
php artisan db:seed
php artisan serve
```

Laravel is now running at `http://localhost:8000`.

---

### 2. Python agent service (port 8001)

```bash
cd agents
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `agents/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
LARAVEL_BASE_URL=http://localhost:8000
QDRANT_URL=https://your-cluster.region.cloud.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-key
```

Seed the Qdrant prior-event collection (one-time setup):

```bash
python -m utils.qdrant
# Expected: Created collection 'prior_events' / Seeded 3 prior events
```

Start the service:

```bash
uvicorn main:app --reload --port 8001
```

Verify it's running:

```bash
curl http://localhost:8001/health
# Expected: { "status": "ok", "agents": 5, "llm": "claude-haiku-4-5" }
```

> The agents degrade gracefully if Laravel is unreachable — they return fallback data instead of crashing, so you can test the agent service independently.

---

### 3. React DRRMO dashboard (port 5173)

```bash
cd dashboard
npm install
cp .env.example .env
```

Fill in `dashboard/.env`:

```
VITE_PYTHON_SERVICE_URL=http://localhost:8001
VITE_LARAVEL_BASE_URL=http://localhost:8000
```

Start the dashboard:

```bash
npm run dev
```

Dashboard is now running at `http://localhost:5173`.

---

## Running the demo

With all three services running, open `http://localhost:5173`. The dashboard will show a green status indicator when the agent service is reachable.

**Demo scenario — Typhoon Kalmaegi, Alcoy, Cebu:**

Paste the following situation report into the dashboard input field and click **Process**:

```
Ulat ng Sitwasyon — Barangay Nug-as, Alcoy, Cebu
Petsa/Oras: Nobyembre 5, 2026, 06:30 AM

Epekto ng Bagyo Kalmaegi:
- Tinatayang 340 residente ang apektado sa 87 pamilya
- 12 bahay ang sinalanta, 3 ang ganap na nawasak
- Ang pangunahing daan patungo sa evacuation center ay naputol dahil sa pagbaha
- Nangangailangan ng agarang tulong: pagkain, inumin, gamot

Mga nangangailangan ng espesyal na atensyon:
- 2 buntis na kababaihan (8 at 7 buwan)
- 1 PWD (gumagamit ng wheelchair)
- 4 matatanda (75 taong gulang pataas)
- 3 sanggol (wala pang isang taong gulang)

Kalagayan ng imprastraktura:
- Brgy. Nug-as road: SARADO (baha, humigit 1 metro)
- Brgy. Pasil road: BUKAS (mababang baha, maaaring daanan)
- Evacuation center (Alcoy Central School): may 200 na pwesto, kasalukuyang 45 ang naroroon

Inihanda ni: Kap. Maria Santos
Brgy. Nug-as, Alcoy, Cebu
```

Walk through the five agent outputs as they appear, then click **Approve** at the Human Gate.

---

## Agent pipeline

```
Situation report
      ↓
  Intake Agent          — language detection, entity extraction, urgency
      ↓
  Vulnerability Agent   — PWD, elderly, pregnant, minor flags (from Laravel)
      ↓
  Resource Agent        — stockpile gaps and capacity (from Laravel)
      ↓
  Routing Agent         — safe evacuation paths (from /evacuation-centers/nearest)
      ↓
  Regional Pattern Agent — prior event context (from Qdrant)
      ↓
  Handoff Coordinator   — merges all outputs into one recommendation
      ↓
  Human Gate            — operator Approves / Modifies / Rejects
      ↓
  Agent log saved to Laravel (/api/agent-logs)
```

No operational action is dispatched without named human operator approval.

---

## Key API endpoints

### Laravel (port 8000)

| Method | Endpoint | Used by |
|---|---|---|
| GET | `/api/evacuation-centers/nearest?lat=&lng=` | Routing Agent |
| GET | `/api/family/{familyId}` | Vulnerability Agent |
| GET | `/api/households/{familyId}/vulnerability` | Vulnerability Agent |
| GET | `/api/resources?lgu_id=` | Resource Agent |
| POST | `/api/situation-reports` | Dashboard |
| POST | `/api/agent-logs` | Dashboard (after Human Gate) |

### Python agent service (port 8001)

| Method | Endpoint | Used by |
|---|---|---|
| GET | `/health` | Dashboard (status check) |
| POST | `/process` | Dashboard (runs full pipeline) |

**POST /process request body:**

```json
{
  "report_id": "string",
  "report_text": "string",
  "lgu_id": "string",
  "timestamp": "ISO datetime"
}
```

---

## Running tests

### Python agent tests (no API keys needed — fully mocked)

```bash
cd agents
source venv/bin/activate
pytest tests/test_agents.py -v
# Expected: 46 passed
```

---

## Team

| Name | Role |
|---|---|
| Robien Lee Tan | Team Lead |
| Jamal Robert Suba | Speaker / Integration QA |
| Alliyana Rose Garcia | CS — AI Layer (Python agents) |
| Ryu Mendoza | CS — Data Layer + Frontend |
| Earl Reynan Gimenez | IT — Integration & Mobile |

**Mentor:** Engr. Vicente Patalita III, MIT — University of San Jose-Recoletos

**Citizen app (Expo):** [github.com/EarlGimenez/emmafrontend](https://github.com/EarlGimenez/emmafrontend)
