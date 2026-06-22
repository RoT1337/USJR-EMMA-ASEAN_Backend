# EMMA AI Layer — Setup & Testing Guide

Python FastAPI + LangGraph service that runs situation reports through six Claude-powered agents (Intake → Vulnerability → Resource → Routing → Pattern → Handoff). It's called by Ryu's Laravel backend / Earl's Next.js dashboard, not run standalone in production — but you can run and test it independently as described below.

## Folder structure (expected)

```
backend/
├── agents/                  ← this service
│   ├── main.py               ← FastAPI app
│   ├── graph.py               ← LangGraph chain
│   ├── agents/                ← agent node functions
│   │   ├── __init__.py
│   │   ├── intake.py
│   │   ├── vulnerability.py
│   │   ├── resource.py
│   │   ├── routing.py
│   │   ├── pattern.py
│   │   └── handoff.py
│   ├── utils/
│   │   ├── claude.py          ← Claude client + MODEL constant
│   │   ├── helpers.py         ← logger, JSON parsing, confidence clamp
│   │   ├── laravel.py         ← HTTP calls to Laravel
│   │   └── qdrant.py          ← vector DB client (prior-event semantic search)
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py        ← shared fixtures/mocks
│   │   └── test_agents.py
│   ├── .env
│   └── requirements.txt
└── laravel/                  ← PHP backend (separate setup, not covered here)
```

> Note the nested `agents/agents/` — the outer folder is the service root, the inner one is the Python package containing the six node functions. Don't flatten this; imports like `from agents.intake import intake_agent` depend on it.

## 1. Prerequisites

- Python 3.10+ (3.11 recommended)
- pip
- An Anthropic API key
- A Qdrant Cloud cluster (free tier) — used by the Pattern agent's historical-event search
- (Optional, for the full pipeline) a running Laravel backend — the agents degrade gracefully and return fallback data if it's unreachable, so it's not required just to boot the service or run unit tests

## 2. Install dependencies

```bash
cd backend/agents
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
pip install pytest pytest-asyncio httpx   # test runner + ASGI test client
```

## 3. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

`.env` contents:

```
ANTHROPIC_API_KEY=sk-ant-...
LARAVEL_BASE_URL=http://localhost:8000
QDRANT_URL=https://xyz-example.region.cloud-provider.cloud.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-key
```

- `ANTHROPIC_API_KEY` — required to actually call Claude. Without it, `/process` will fail at runtime (unit tests don't need it since the Claude client is mocked).
- `LARAVEL_BASE_URL` — base URL of Ryu's Laravel API (defaults to `http://localhost:8000` for local dev).
- `QDRANT_URL` / `QDRANT_API_KEY` — from your Qdrant Cloud cluster (see step 4 below). Leave blank to run without it — Pattern agent will log a warning and fall back gracefully.

## 4. Set up Qdrant (prior-event search for the Pattern agent)

You already have a free Qdrant Cloud cluster, so you just need its URL/key and a seeded collection.

**Find your URL and API key:**
1. Log into the [Qdrant Cloud Dashboard](https://cloud.qdrant.io).
2. Open your cluster → the **cluster URL** is shown on the cluster detail page (looks like `https://xyz-example.region.cloud-provider.cloud.qdrant.io:6333`).
3. Go to the **API Keys** section of the cluster page. If you saved the key when you created the cluster, reuse it; if you lost it (it's only shown once), click **Create** to generate a new one.
4. Put both values into `.env` as shown in step 3.

**Create the collection and seed sample data:**

The repo includes `utils/qdrant.py` with a `search_prior_events()` function (used by `agents/pattern.py`) and a one-off seeding routine. From `backend/agents`, with your `.env` filled in:

```bash
python -m utils.qdrant
```

Expected output:
```
Created collection 'prior_events'
Seeded 3 prior events into 'prior_events'
```

This creates a `prior_events` collection (384-dim, cosine distance) and loads a few synthetic disaster events (Typhoon Odette, Typhoon Kalmaegi, Cebu City Flash Flood) using Qdrant Cloud's built-in inference — no separate embedding model or extra API key needed.

**Verify it worked:**

```bash
set -a
source .env
set +a

curl "$QDRANT_URL/collections/prior_events" -H "api-key: $QDRANT_API_KEY"
```

You should see `"points_count": 3` in the response.

> Re-running `python -m utils.qdrant` is safe — it checks if the collection already exists before creating it, and re-upserts the same 3 seed points (same IDs, so no duplicates).

**Add more seed events:** edit the `SEED_EVENTS` list in `utils/qdrant.py` to cover whatever hazard types/locations you're testing with, then re-run `python -m utils.qdrant`.

**Free tier note:** Qdrant Cloud free clusters auto-suspend after a week of inactivity (data is preserved — just reactivate from the dashboard) and are deleted after 4 weeks if never reactivated.

## 5. Run the service locally

```bash
uvicorn main:app --reload --port 8001
```

The service starts at `http://localhost:8001`.

### Health check

```bash
curl http://localhost:8001/health
```

Expected response:

```json
{ "status": "ok", "agents": 5, "llm": "claude-haiku-4-5" }
```

If this fails:
- Import error → confirm you're running the command from `backend/agents` (not the repo root) so `main.py` is on the path.
- Missing module → re-run `pip install -r requirements.txt`.

### Manual end-to-end test

```bash
curl -X POST http://localhost:8001/process \
  -H "Content-Type: application/json" \
  -d '{
    "report_id": "test-001",
    "report_text": "May sunog sa Barangay Pasil, mga 20 pamilya naapektado.",
    "lgu_id": "cebu-alcoy",
    "timestamp": "2026-06-21T10:00:00Z"
  }'
```

This makes real calls to Claude, Laravel (if reachable), and your seeded Qdrant collection, so it requires a valid `ANTHROPIC_API_KEY` and the `.env` values from steps 3–4. A successful response includes `intake`, `vulnerability`, `resource`, `routing`, `pattern`, and `handoff` keys — `pattern.prior_event` should reference one of your seeded events (e.g. Typhoon Odette) if the location/hazard type are a reasonable semantic match.

## 6. Run the automated tests

Tests mock Claude, Laravel, and Qdrant entirely, so **no API keys or live services are needed** to run them.

From `backend/agents`:

```bash
pytest tests/test_agents.py -v
```

Run a single test class or test:

```bash
pytest tests/test_agents.py::TestIntakeAgent -v
pytest tests/test_agents.py::TestIntakeAgent::test_returns_required_schema -v
```

Run everything in `tests/` with a short summary:

```bash
pytest tests/ -q
```

Expected result: all tests pass (`46 passed` with the current `conftest.py` + `test_agents.py`), with a few harmless `pytest-asyncio` warnings about synchronous helper tests inheriting the module-level async mark — these don't affect correctness.

What's covered:
- Each of the 6 agent nodes — required output schema, value validation (e.g. urgency/risk enums), confidence clamping, and graceful fallback when Claude returns bad JSON or Laravel/Qdrant are unreachable
- `graph.py` — pipeline wiring and that `run_pipeline` returns all expected keys
- `main.py` — `/health` and `/process` endpoints, including validation errors (422) and pipeline failures (500)

### If tests fail to collect/import

- `ModuleNotFoundError: No module named 'agents'` → run pytest from `backend/agents` (the service root), not from inside `tests/` or the repo root.
- `from tests.conftest import make_claude_mock` fails → make sure `tests/__init__.py` exists (even empty) so `tests` is importable as a package.
- `pytest: command not found` → activate your virtualenv and re-run `pip install pytest pytest-asyncio httpx`.

## 7. Quick troubleshooting reference

| Symptom | Likely cause |
|---|---|
| `/health` returns 500 or won't start | Wrong working directory, or a missing dependency from `requirements.txt` |
| `/process` returns 500 | Bad/missing `ANTHROPIC_API_KEY`, or check server logs for which agent raised |
| Agent output has `"agent_failed": true` | That specific agent threw an exception — pipeline still completed using the fallback dict (by design, see `graph.py`) |
| Resource/Routing/Vulnerability agents return generic fallback gaps/recommendations | Laravel is unreachable or `LARAVEL_BASE_URL` is wrong |
| Pattern agent has low confidence, no prior_event | Qdrant collection isn't seeded yet (`python -m utils.qdrant`), or `QDRANT_URL`/`QDRANT_API_KEY` are wrong/unset |
| `python -m utils.qdrant` fails with auth/connection error | Recheck `QDRANT_URL` and `QDRANT_API_KEY` in `.env`; confirm the cluster isn't suspended in the Qdrant Cloud dashboard |
| `ValueError: ... is not found among supported models. Check if cloud_inference is set to True or fastembed is installed` | The client defaults to embedding locally via FastEmbed, which isn't installed. `utils/qdrant.py` already sets `cloud_inference=True` so embedding happens on Qdrant Cloud instead — if you still see this, confirm your cluster's **Inference** tab (Cluster Detail page) lists `sentence-transformers/all-MiniLM-L6-v2` as available, and that Inference is enabled for the cluster (it's on by default for clusters created after July 2025) |
| Tests can't find fixtures | Confirm `tests/conftest.py` is the version with `sample_report`, `full_state`, `*_output`, `mock_claude_*`, and `make_claude_mock` defined |

## 8. Running in production

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

Put this behind a process manager (systemd, supervisor, or a container) and set `allow_origins` in `main.py`'s CORS config to your actual dashboard domain instead of `"*"` before going live.