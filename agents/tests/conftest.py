"""
tests/conftest.py
Shared pytest fixtures for EMMA agent tests.
"""
import json
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

# ── sys.path guard ────────────────────────────────────────────────────────────
# Insert backend/agents/ (this file's grandparent) so that 'graph', 'main',
# 'agents.*' and 'utils.*' are all importable regardless of where pytest is invoked from.
_SERVICE_ROOT = str(Path(__file__).resolve().parent.parent)
if _SERVICE_ROOT not in sys.path:
    sys.path.insert(0, _SERVICE_ROOT)


# ── Claude mock builder ───────────────────────────────────────────────────────

def make_claude_mock(response_dict: dict):
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text=json.dumps(response_dict))]
    mock_client = MagicMock()
    mock_client.messages.create = AsyncMock(return_value=mock_response)
    return mock_client


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def sample_report():
    return {
        "report_id": "TEST-001",
        "report_text": (
            "Malakas na ulan at baha sa Alcoy, Cebu. "
            "Mga 50 pamilya ang apektado. May dalawang buntis na babae "
            "at isang PWD na lalaki. Naharang ang daan papunta sa evacuation center."
        ),
        "lgu_id": "cebu-alcoy",
        "timestamp": "2025-12-15T08:00:00Z",
    }

@pytest.fixture
def intake_output():
    return {
        "language_detected": "Filipino", "location": "Alcoy, Cebu",
        "hazard_type": "flood", "population_affected": 250,
        "urgency": "HIGH",
        "key_flags": ["heavy rainfall", "50 families affected", "road blocked"],
        "confidence": 0.92,
    }

@pytest.fixture
def vulnerability_output():
    return {
        "tier1": ["2 pregnant women", "1 PWD male"],
        "tier2": ["247 general population"],
        "recommendation": "Evacuate Tier 1 individuals first via accessible route.",
        "confidence": 0.88,
    }

@pytest.fixture
def resource_output():
    return {
        "gaps": ["Food — 3-day deficit", "Medicine — prenatal kit needed"],
        "available": ["Alcoy depot 2.3km", "EC capacity: 200 slots"],
        "recommendation": "Request prenatal kits and 3-day food packs from Alcoy depot.",
        "confidence": 0.85,
    }

@pytest.fixture
def routing_output():
    return {
        "primary_status": "BLOCKED — landslide on sitio road",
        "alternative": "Via Brgy. Pasil (+1.2km) — passable",
        "eta_minutes": 35, "risk": "HIGH",
        "recommendation": "Use Pasil alternate route; deploy 4x4 vehicles.",
        "confidence": 0.80,
    }

@pytest.fixture
def pattern_output():
    return {
        "prior_event": "Typhoon Odette (Rai) — Dec 2021, same Alcoy zone",
        "insight": "Flood peaked 4 hrs after report. Medical demand tripled within 48 hrs.",
        "cross_border": "None identified", "confidence": 0.78,
    }

@pytest.fixture
def handoff_output():
    return {
        "action": "Evacuate 3 priority individuals via Pasil route with prenatal medical kit within 90 min",
        "reasoning": (
            "All agents converge on route obstruction and medical urgency. "
            "Pattern data signals 4-hr flood escalation window. "
            "Tier-1 vulnerability requires immediate medical support."
        ),
        "confidence": 0.87,
    }

@pytest.fixture
def full_state(sample_report, intake_output, vulnerability_output,
               resource_output, routing_output, pattern_output):
    return {
        **sample_report,
        "intake": intake_output,
        "vulnerability": vulnerability_output,
        "resource": resource_output,
        "routing": routing_output,
        "pattern": pattern_output,
        "handoff": None,
    }

@pytest.fixture
def mock_claude_intake(intake_output):       return make_claude_mock(intake_output)
@pytest.fixture
def mock_claude_vulnerability(vulnerability_output): return make_claude_mock(vulnerability_output)
@pytest.fixture
def mock_claude_resource(resource_output):   return make_claude_mock(resource_output)
@pytest.fixture
def mock_claude_routing(routing_output):     return make_claude_mock(routing_output)
@pytest.fixture
def mock_claude_pattern(pattern_output):     return make_claude_mock(pattern_output)
@pytest.fixture
def mock_claude_handoff(handoff_output):     return make_claude_mock(handoff_output)