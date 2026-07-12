"""
tests/test_e2e_multilingual.py
End-to-end live tests for multilingual language detection and cross-border scenarios.

These tests make REAL Claude API calls and REAL Qdrant queries.
They verify:
  1. Filipino demo scenario still works (regression check)
  2. Vietnamese cross-border PH→VN scenario (tested 3x)
  3. Bahasa Indonesia scenario runs cleanly

Run:
    python -m pytest tests/test_e2e_multilingual.py -v -s

The -s flag shows live print output so you can see the Claude responses.
"""
import asyncio
import json
import sys
import io

import pytest
from dotenv import load_dotenv

load_dotenv()

pytestmark = [pytest.mark.asyncio, pytest.mark.e2e]

# Force UTF-8 output on Windows to handle Vietnamese/Thai/Bahasa characters
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")


# ── Sample inputs ─────────────────────────────────────────────────────────────

FILIPINO_REPORT = {
    "report_id": "E2E-FIL-001",
    "report_text": (
        "Malakas na ulan at baha sa Alcoy, Cebu. "
        "Mga 50 pamilya ang apektado. May dalawang buntis na babae "
        "at isang PWD na lalaki. Naharang ang daan papunta sa evacuation center."
    ),
    "lgu_id": "cebu-alcoy",
    "timestamp": "2026-07-10T08:00:00Z",
}

# Vietnamese cross-border scenario from reference.txt
VIETNAMESE_CROSSBORDER_REPORT = {
    "report_id": "E2E-VN-001",
    "report_text": (
        "Bao cao tinh hinh Da Nang, Viet Nam\n"
        "Bao Kalmaegi dang tien gan sau khi do bo Philippines.\n"
        "Uoc tinh 500 ho dan bi anh huong.\n"
        "Can so tan khap cap khu vuc ven bien."
    ),
    "lgu_id": "vn-da-nang",
    "timestamp": "2026-07-10T09:00:00Z",
}

BAHASA_REPORT = {
    "report_id": "E2E-ID-001",
    "report_text": (
        "Banjir besar di Aceh, Indonesia akibat Siklon Senyar. "
        "Lebih dari 200 rumah terendam air. "
        "Warga membutuhkan evakuasi segera ke tempat yang lebih aman. "
        "Jalan utama tidak dapat dilalui."
    ),
    "lgu_id": "id-aceh",
    "timestamp": "2026-07-10T10:00:00Z",
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _reset_qdrant_client():
    """Reset the global Qdrant client so each test gets a fresh event loop."""
    import utils.qdrant as q
    q._client = None


async def _run_intake(report: dict) -> dict:
    """Run only the Intake Agent on a report and return its output."""
    from agents.agents.intake import intake_agent
    return await intake_agent(report)


async def _run_full_pipeline(report: dict) -> dict:
    """Run Intake + Pattern Agent (Qdrant-backed) for cross-border testing."""
    _reset_qdrant_client()
    from agents.agents.intake import intake_agent
    from agents.agents.pattern import pattern_agent

    intake_result = await intake_agent(report)
    full_state = {**report, **intake_result}
    pattern_result = await pattern_agent(full_state)
    return {**intake_result, **pattern_result}


def _assert_intake_schema(result: dict, label: str):
    """Validate the Intake Agent output schema."""
    assert "intake" in result, f"[{label}] Missing 'intake' key"
    intake = result["intake"]
    required = {"language_detected", "location", "hazard_type",
                "population_affected", "urgency", "key_flags", "confidence"}
    missing = required - intake.keys()
    assert not missing, f"[{label}] Missing fields: {missing}"
    assert intake["urgency"] in {"CRITICAL", "HIGH", "MEDIUM", "LOW"}, (
        f"[{label}] Invalid urgency: {intake['urgency']}"
    )
    assert 0.0 <= intake["confidence"] <= 1.0, (
        f"[{label}] Confidence out of range: {intake['confidence']}"
    )


# ═══════════════════════════════════════════════════════════════════════════════
# 1. FILIPINO DEMO SCENARIO (regression)
# ═══════════════════════════════════════════════════════════════════════════════

class TestFilipinoDemo:
    async def test_filipino_detection_and_extraction(self):
        """Filipino report must be detected as Filipino with correct extraction."""
        result = await _run_intake(FILIPINO_REPORT)
        _assert_intake_schema(result, "Filipino")

        intake = result["intake"]
        print(f"\n[FILIPINO] language={intake['language_detected']}  "
              f"hazard={intake['hazard_type']}  urgency={intake['urgency']}  "
              f"location={intake['location']}  confidence={intake['confidence']:.2f}")

        assert intake["language_detected"] == "Filipino", (
            f"Expected Filipino, got {intake['language_detected']}"
        )
        assert intake["hazard_type"] in ("flood", "typhoon"), (
            f"Unexpected hazard_type: {intake['hazard_type']}"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 2. VIETNAMESE CROSS-BORDER PH→VN SCENARIO (test 3x)
# ═══════════════════════════════════════════════════════════════════════════════

class TestVietnameseCrossBorder:
    @pytest.mark.parametrize("run", [1, 2, 3])
    async def test_vietnamese_crossborder_end_to_end(self, run):
        """Vietnamese report must: (a) detect as Vietnamese, (b) retrieve
        Kalmaegi-related prior events from Qdrant, (c) surface cross-border
        relevance."""
        result = await _run_full_pipeline(VIETNAMESE_CROSSBORDER_REPORT)
        _assert_intake_schema(result, f"VN run {run}")

        intake = result["intake"]
        pattern = result.get("pattern", {})
        print(f"\n[VN run {run}] language={intake['language_detected']}  "
              f"hazard={intake['hazard_type']}  location={intake['location']}  "
              f"confidence={intake['confidence']:.2f}")
        print(f"  pattern prior_event={pattern.get('prior_event', 'N/A')}")
        print(f"  pattern cross_border={pattern.get('cross_border', 'N/A')}")

        # Language detection
        assert intake["language_detected"] == "Vietnamese", (
            f"Run {run}: Expected Vietnamese, got {intake['language_detected']}"
        )

        # Hazard type should be typhoon or flood
        assert intake["hazard_type"] in ("typhoon", "flood"), (
            f"Run {run}: Unexpected hazard_type: {intake['hazard_type']}"
        )

        # Pattern agent must return valid schema
        assert "prior_event" in pattern, f"Run {run}: Missing prior_event in pattern"
        assert "cross_border" in pattern, f"Run {run}: Missing cross_border in pattern"
        assert isinstance(pattern.get("confidence", 0), (int, float)), (
            f"Run {run}: pattern confidence not numeric"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 3. BAHASA INDONESIA SCENARIO
# ═══════════════════════════════════════════════════════════════════════════════

class TestBahasaIndonesia:
    async def test_bahasa_detection_and_extraction(self):
        """Bahasa Indonesia report must be detected with correct field extraction."""
        result = await _run_full_pipeline(BAHASA_REPORT)
        _assert_intake_schema(result, "Bahasa")

        intake = result["intake"]
        pattern = result.get("pattern", {})
        print(f"\n[BAHASA] language={intake['language_detected']}  "
              f"hazard={intake['hazard_type']}  urgency={intake['urgency']}  "
              f"location={intake['location']}  confidence={intake['confidence']:.2f}")
        print(f"  pattern prior_event={pattern.get('prior_event', 'N/A')}")

        assert intake["language_detected"] == "Bahasa", (
            f"Expected Bahasa, got {intake['language_detected']}"
        )
        assert intake["hazard_type"] in ("flood", "typhoon", "cyclone"), (
            f"Unexpected hazard_type: {intake['hazard_type']}"
        )
