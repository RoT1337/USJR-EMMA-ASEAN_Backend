"""
tests/test_agents.py
Unit tests for all EMMA AI layer components.

Coverage:
  - Each of the 6 agent nodes (schema, logic, error handling)
  - LangGraph pipeline wiring
  - FastAPI endpoints (POST /process, GET /health)

All external I/O (Claude API, Laravel, Qdrant) is mocked so tests run
without any live services.

Run:
    pytest tests/test_agents.py -v
"""
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Mark entire module as async-capable
pytestmark = pytest.mark.asyncio


# ═══════════════════════════════════════════════════════════════════════════════
# 1. INTAKE AGENT
# ═══════════════════════════════════════════════════════════════════════════════

class TestIntakeAgent:
    """Tests for agents/intake.py"""

    async def test_returns_required_schema(self, sample_report, mock_claude_intake):
        """Intake output must contain every field defined in the API contract."""
        with patch("agents.intake.get_claude_client", return_value=mock_claude_intake):
            from agents.intake import intake_agent
            result = await intake_agent(sample_report)

        assert "intake" in result
        intake = result["intake"]
        required = {"language_detected", "location", "hazard_type",
                    "population_affected", "urgency", "key_flags", "confidence"}
        assert required.issubset(intake.keys()), (
            f"Missing fields: {required - intake.keys()}"
        )

    async def test_urgency_values_are_valid(self, sample_report, mock_claude_intake):
        """urgency must be one of the four defined levels."""
        with patch("agents.intake.get_claude_client", return_value=mock_claude_intake):
            from agents.intake import intake_agent
            result = await intake_agent(sample_report)

        assert result["intake"]["urgency"] in {"CRITICAL", "HIGH", "MEDIUM", "LOW"}

    async def test_confidence_is_clamped(self, sample_report):
        """Confidence > 1.0 returned by Claude must be clamped to 1.0."""
        from tests.conftest import make_claude_mock
        bad_response = {
            "language_detected": "Filipino", "location": "Alcoy, Cebu",
            "hazard_type": "flood", "population_affected": 100,
            "urgency": "HIGH", "key_flags": [], "confidence": 9.99,
        }
        mock_client = make_claude_mock(bad_response)
        with patch("agents.intake.get_claude_client", return_value=mock_client):
            from agents.intake import intake_agent
            result = await intake_agent(sample_report)

        assert result["intake"]["confidence"] <= 1.0

    async def test_handles_invalid_json_gracefully(self, sample_report):
        """If Claude returns non-JSON, agent must return a fallback dict, not crash."""
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="I'm sorry, I cannot analyse that.")]
        mock_client = MagicMock()
        mock_client.messages.create = AsyncMock(return_value=mock_response)

        with patch("agents.intake.get_claude_client", return_value=mock_client):
            from agents.intake import intake_agent
            result = await intake_agent(sample_report)

        assert "intake" in result
        assert result["intake"]["confidence"] == 0.0
        assert "parse_error" in result["intake"]["key_flags"]

    async def test_key_flags_is_a_list(self, sample_report, mock_claude_intake):
        """key_flags must always be a list."""
        with patch("agents.intake.get_claude_client", return_value=mock_claude_intake):
            from agents.intake import intake_agent
            result = await intake_agent(sample_report)

        assert isinstance(result["intake"]["key_flags"], list)

    async def test_population_affected_is_numeric(self, sample_report, mock_claude_intake):
        """population_affected must be numeric."""
        with patch("agents.intake.get_claude_client", return_value=mock_claude_intake):
            from agents.intake import intake_agent
            result = await intake_agent(sample_report)

        assert isinstance(result["intake"]["population_affected"], (int, float))


# ═══════════════════════════════════════════════════════════════════════════════
# 2. VULNERABILITY AGENT
# ═══════════════════════════════════════════════════════════════════════════════

class TestVulnerabilityAgent:
    """Tests for agents/vulnerability.py"""

    async def test_returns_required_schema(self, full_state, mock_claude_vulnerability):
        """Vulnerability output must contain tier1, tier2, recommendation, confidence."""
        with patch("agents.vulnerability.get_claude_client", return_value=mock_claude_vulnerability), \
             patch("agents.vulnerability.get_households_by_location", AsyncMock(return_value=[])), \
             patch("agents.vulnerability.get_household_vulnerability", AsyncMock(return_value={})):
            from agents.vulnerability import vulnerability_agent
            result = await vulnerability_agent(full_state)

        assert "vulnerability" in result
        vuln = result["vulnerability"]
        assert {"tier1", "tier2", "recommendation", "confidence"}.issubset(vuln.keys())

    async def test_calls_laravel_with_location_and_lgu(self, full_state, mock_claude_vulnerability):
        """Agent must call get_households_by_location with location and lgu_id from state."""
        mock_get_households = AsyncMock(return_value=[])
        with patch("agents.vulnerability.get_claude_client", return_value=mock_claude_vulnerability), \
             patch("agents.vulnerability.get_households_by_location", mock_get_households), \
             patch("agents.vulnerability.get_household_vulnerability", AsyncMock(return_value={})):
            from agents.vulnerability import vulnerability_agent
            await vulnerability_agent(full_state)

        mock_get_households.assert_called_once_with("Alcoy, Cebu", "cebu-alcoy")

    async def test_tier1_and_tier2_are_lists(self, full_state, mock_claude_vulnerability):
        """tier1 and tier2 must always be lists."""
        with patch("agents.vulnerability.get_claude_client", return_value=mock_claude_vulnerability), \
             patch("agents.vulnerability.get_households_by_location", AsyncMock(return_value=[])), \
             patch("agents.vulnerability.get_household_vulnerability", AsyncMock(return_value={})):
            from agents.vulnerability import vulnerability_agent
            result = await vulnerability_agent(full_state)

        assert isinstance(result["vulnerability"]["tier1"], list)
        assert isinstance(result["vulnerability"]["tier2"], list)

    async def test_handles_laravel_unavailable(self, full_state, mock_claude_vulnerability):
        """Agent must continue and return a result even if Laravel is down."""
        with patch("agents.vulnerability.get_claude_client", return_value=mock_claude_vulnerability), \
             patch("agents.vulnerability.get_households_by_location",
                   AsyncMock(side_effect=Exception("Connection refused"))):
            from agents.vulnerability import vulnerability_agent
            result = await vulnerability_agent(full_state)

        assert "vulnerability" in result
        assert result["vulnerability"]["confidence"] >= 0.0


# ═══════════════════════════════════════════════════════════════════════════════
# 3. RESOURCE AGENT
# ═══════════════════════════════════════════════════════════════════════════════

class TestResourceAgent:
    """Tests for agents/resource.py"""

    async def test_returns_required_schema(self, full_state, mock_claude_resource):
        """Resource output must contain gaps, available, recommendation, confidence."""
        with patch("agents.resource.get_claude_client", return_value=mock_claude_resource), \
             patch("agents.resource.get_resources", AsyncMock(return_value={})):
            from agents.resource import resource_agent
            result = await resource_agent(full_state)

        assert "resource" in result
        res = result["resource"]
        assert {"gaps", "available", "recommendation", "confidence"}.issubset(res.keys())

    async def test_calls_laravel_resources_with_lgu_id(self, full_state, mock_claude_resource):
        """Agent must call get_resources with the correct lgu_id."""
        mock_get_resources = AsyncMock(return_value={})
        with patch("agents.resource.get_claude_client", return_value=mock_claude_resource), \
             patch("agents.resource.get_resources", mock_get_resources):
            from agents.resource import resource_agent
            await resource_agent(full_state)

        mock_get_resources.assert_called_once_with("cebu-alcoy")

    async def test_gaps_and_available_are_lists(self, full_state, mock_claude_resource):
        """gaps and available must always be lists."""
        with patch("agents.resource.get_claude_client", return_value=mock_claude_resource), \
             patch("agents.resource.get_resources", AsyncMock(return_value={})):
            from agents.resource import resource_agent
            result = await resource_agent(full_state)

        assert isinstance(result["resource"]["gaps"], list)
        assert isinstance(result["resource"]["available"], list)

    async def test_handles_laravel_unavailable(self, full_state, mock_claude_resource):
        """Agent must return a result with default gaps if Laravel is down."""
        with patch("agents.resource.get_claude_client", return_value=mock_claude_resource), \
             patch("agents.resource.get_resources",
                   AsyncMock(side_effect=Exception("Timeout"))):
            from agents.resource import resource_agent
            result = await resource_agent(full_state)

        assert "resource" in result


# ═══════════════════════════════════════════════════════════════════════════════
# 4. ROUTING AGENT
# ═══════════════════════════════════════════════════════════════════════════════

class TestRoutingAgent:
    """Tests for agents/routing.py"""

    async def test_returns_required_schema(self, full_state, mock_claude_routing):
        """Routing output must contain all five required fields."""
        with patch("agents.routing.get_claude_client", return_value=mock_claude_routing), \
             patch("agents.routing.get_nearest_evacuation_centers", AsyncMock(return_value=[])):
            from agents.routing import routing_agent
            result = await routing_agent(full_state)

        assert "routing" in result
        route = result["routing"]
        required = {"primary_status", "alternative", "eta_minutes", "risk",
                    "recommendation", "confidence"}
        assert required.issubset(route.keys())

    async def test_risk_is_valid_level(self, full_state, mock_claude_routing):
        """risk must be HIGH, MODERATE, or LOW."""
        with patch("agents.routing.get_claude_client", return_value=mock_claude_routing), \
             patch("agents.routing.get_nearest_evacuation_centers", AsyncMock(return_value=[])):
            from agents.routing import routing_agent
            result = await routing_agent(full_state)

        assert result["routing"]["risk"] in {"HIGH", "MODERATE", "LOW"}

    async def test_eta_minutes_is_numeric(self, full_state, mock_claude_routing):
        """eta_minutes must be numeric."""
        with patch("agents.routing.get_claude_client", return_value=mock_claude_routing), \
             patch("agents.routing.get_nearest_evacuation_centers", AsyncMock(return_value=[])):
            from agents.routing import routing_agent
            result = await routing_agent(full_state)

        assert isinstance(result["routing"]["eta_minutes"], (int, float))

    async def test_coord_extraction_triggers_laravel_call(self, full_state, mock_claude_routing):
        """When location contains coordinates, agent must call get_nearest_evacuation_centers."""
        # Patch state intake with explicit lat/lng
        state_with_coords = {
            **full_state,
            "intake": {**full_state["intake"], "location": "10.2333, 123.7167"},
        }
        mock_ev = AsyncMock(return_value=[])
        with patch("agents.routing.get_claude_client", return_value=mock_claude_routing), \
             patch("agents.routing.get_nearest_evacuation_centers", mock_ev):
            from agents.routing import routing_agent
            await routing_agent(state_with_coords)

        mock_ev.assert_called_once()

    async def test_handles_laravel_unavailable(self, full_state, mock_claude_routing):
        """Agent must return a result even when Laravel evacuation endpoint fails."""
        state_with_coords = {
            **full_state,
            "intake": {**full_state["intake"], "location": "10.2333, 123.7167"},
        }
        with patch("agents.routing.get_claude_client", return_value=mock_claude_routing), \
             patch("agents.routing.get_nearest_evacuation_centers",
                   AsyncMock(side_effect=Exception("503"))):
            from agents.routing import routing_agent
            result = await routing_agent(state_with_coords)

        assert "routing" in result


# ═══════════════════════════════════════════════════════════════════════════════
# 5. PATTERN AGENT
# ═══════════════════════════════════════════════════════════════════════════════

class TestPatternAgent:
    """Tests for agents/pattern.py"""

    async def test_returns_required_schema(self, full_state, mock_claude_pattern):
        """Pattern output must contain prior_event, insight, cross_border, confidence."""
        prior_events = [
            {"event_name": "Typhoon Odette", "location": "Cebu", "hazard_type": "typhoon",
             "outcome": "Flood peaked 4 hrs after report.", "cross_border_note": "None"}
        ]
        with patch("agents.pattern.get_claude_client", return_value=mock_claude_pattern), \
             patch("agents.pattern.search_prior_events", AsyncMock(return_value=prior_events)):
            from agents.pattern import pattern_agent
            result = await pattern_agent(full_state)

        assert "pattern" in result
        pat = result["pattern"]
        assert {"prior_event", "insight", "cross_border", "confidence"}.issubset(pat.keys())

    async def test_calls_qdrant_with_hazard_and_location(self, full_state, mock_claude_pattern):
        """Agent must query Qdrant using hazard_type and location from intake."""
        mock_search = AsyncMock(return_value=[])
        with patch("agents.pattern.get_claude_client", return_value=mock_claude_pattern), \
             patch("agents.pattern.search_prior_events", mock_search):
            from agents.pattern import pattern_agent
            await pattern_agent(full_state)

        mock_search.assert_called_once_with("flood", "Alcoy, Cebu", top_k=3)

    async def test_handles_qdrant_unavailable(self, full_state, mock_claude_pattern):
        """Agent must return a result with reduced confidence if Qdrant is down."""
        with patch("agents.pattern.get_claude_client", return_value=mock_claude_pattern), \
             patch("agents.pattern.search_prior_events",
                   AsyncMock(side_effect=Exception("Connection refused"))):
            from agents.pattern import pattern_agent
            result = await pattern_agent(full_state)

        assert "pattern" in result

    async def test_handles_no_prior_events(self, full_state, mock_claude_pattern):
        """Agent must still return a valid result when Qdrant returns zero matches."""
        with patch("agents.pattern.get_claude_client", return_value=mock_claude_pattern), \
             patch("agents.pattern.search_prior_events", AsyncMock(return_value=[])):
            from agents.pattern import pattern_agent
            result = await pattern_agent(full_state)

        assert "pattern" in result


# ═══════════════════════════════════════════════════════════════════════════════
# 6. HANDOFF COORDINATOR
# ═══════════════════════════════════════════════════════════════════════════════

class TestHandoffCoordinator:
    """Tests for agents/handoff.py"""

    async def test_returns_required_schema(self, full_state, mock_claude_handoff):
        """Handoff output must contain action, reasoning, confidence."""
        with patch("agents.handoff.get_claude_client", return_value=mock_claude_handoff):
            from agents.handoff import handoff_coordinator
            result = await handoff_coordinator(full_state)

        assert "handoff" in result
        handoff = result["handoff"]
        assert {"action", "reasoning", "confidence"}.issubset(handoff.keys())

    async def test_confidence_range(self, full_state, mock_claude_handoff):
        """Confidence must be within [0.0, 1.0]."""
        with patch("agents.handoff.get_claude_client", return_value=mock_claude_handoff):
            from agents.handoff import handoff_coordinator
            result = await handoff_coordinator(full_state)

        conf = result["handoff"]["confidence"]
        assert 0.0 <= conf <= 1.0

    async def test_action_is_non_empty_string(self, full_state, mock_claude_handoff):
        """action must be a non-empty string."""
        with patch("agents.handoff.get_claude_client", return_value=mock_claude_handoff):
            from agents.handoff import handoff_coordinator
            result = await handoff_coordinator(full_state)

        assert isinstance(result["handoff"]["action"], str)
        assert len(result["handoff"]["action"]) > 0

    async def test_handles_partial_state(self, sample_report, mock_claude_handoff):
        """Handoff must work even when some upstream agents returned None."""
        partial_state = {
            **sample_report,
            "intake": {"hazard_type": "flood", "urgency": "HIGH",
                       "location": "Alcoy", "population_affected": 100,
                       "key_flags": [], "language_detected": "Filipino",
                       "confidence": 0.8},
            "vulnerability": None,
            "resource": None,
            "routing": None,
            "pattern": None,
            "handoff": None,
        }
        with patch("agents.handoff.get_claude_client", return_value=mock_claude_handoff):
            from agents.handoff import handoff_coordinator
            result = await handoff_coordinator(partial_state)

        assert "handoff" in result

    async def test_handles_invalid_json_gracefully(self, full_state):
        """Handoff must return a fallback dict if Claude returns non-JSON."""
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Unable to process.")]
        mock_client = MagicMock()
        mock_client.messages.create = AsyncMock(return_value=mock_response)

        with patch("agents.handoff.get_claude_client", return_value=mock_client):
            from agents.handoff import handoff_coordinator
            result = await handoff_coordinator(full_state)

        assert "handoff" in result
        assert result["handoff"]["confidence"] == 0.0


# ═══════════════════════════════════════════════════════════════════════════════
# 7. SHARED UTILITIES
# ═══════════════════════════════════════════════════════════════════════════════

class TestHelpers:
    """Tests for utils/helpers.py"""

    def test_parse_plain_json(self):
        from utils.helpers import parse_llm_json
        result = parse_llm_json('{"key": "value"}')
        assert result == {"key": "value"}

    def test_parse_json_with_fence(self):
        from utils.helpers import parse_llm_json
        fenced = '```json\n{"key": "value"}\n```'
        result = parse_llm_json(fenced)
        assert result == {"key": "value"}

    def test_parse_json_with_bare_fence(self):
        from utils.helpers import parse_llm_json
        fenced = '```\n{"key": "value"}\n```'
        result = parse_llm_json(fenced)
        assert result == {"key": "value"}

    def test_raises_on_invalid_json(self):
        from utils.helpers import parse_llm_json
        with pytest.raises(json.JSONDecodeError):
            parse_llm_json("not json at all")

    def test_raises_on_non_dict_json(self):
        from utils.helpers import parse_llm_json
        with pytest.raises(ValueError):
            parse_llm_json("[1, 2, 3]")

    def test_clamp_confidence_normal(self):
        from utils.helpers import clamp_confidence
        assert clamp_confidence(0.85) == pytest.approx(0.85)

    def test_clamp_confidence_above_1(self):
        from utils.helpers import clamp_confidence
        assert clamp_confidence(9.5) == 1.0

    def test_clamp_confidence_below_0(self):
        from utils.helpers import clamp_confidence
        assert clamp_confidence(-0.5) == 0.0

    def test_clamp_confidence_non_numeric(self):
        from utils.helpers import clamp_confidence
        assert clamp_confidence("high") == 0.0


# ═══════════════════════════════════════════════════════════════════════════════
# 8. GRAPH PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

class TestGraphPipeline:
    """Tests for graph.py — pipeline wiring and state accumulation."""

    async def test_run_pipeline_returns_all_keys(
        self, sample_report, intake_output, vulnerability_output,
        resource_output, routing_output, pattern_output, handoff_output
    ):
        """run_pipeline must return a dict with report_id + all six agent keys."""
        with patch("graph.intake_agent", AsyncMock(return_value={"intake": intake_output})), \
             patch("graph.vulnerability_agent", AsyncMock(return_value={"vulnerability": vulnerability_output})), \
             patch("graph.resource_agent", AsyncMock(return_value={"resource": resource_output})), \
             patch("graph.routing_agent", AsyncMock(return_value={"routing": routing_output})), \
             patch("graph.pattern_agent", AsyncMock(return_value={"pattern": pattern_output})), \
             patch("graph.handoff_coordinator", AsyncMock(return_value={"handoff": handoff_output})):
            from graph import run_pipeline, build_graph
            # Rebuild graph with patched nodes
            import graph as g
            g.graph = build_graph()
            result = await run_pipeline(**sample_report)

        expected_keys = {"report_id", "intake", "vulnerability",
                         "resource", "routing", "pattern", "handoff"}
        assert expected_keys.issubset(result.keys())

    async def test_report_id_passes_through(
        self, sample_report, intake_output, vulnerability_output,
        resource_output, routing_output, pattern_output, handoff_output
    ):
        """report_id from the input must appear unchanged in the output."""
        with patch("graph.intake_agent", AsyncMock(return_value={"intake": intake_output})), \
             patch("graph.vulnerability_agent", AsyncMock(return_value={"vulnerability": vulnerability_output})), \
             patch("graph.resource_agent", AsyncMock(return_value={"resource": resource_output})), \
             patch("graph.routing_agent", AsyncMock(return_value={"routing": routing_output})), \
             patch("graph.pattern_agent", AsyncMock(return_value={"pattern": pattern_output})), \
             patch("graph.handoff_coordinator", AsyncMock(return_value={"handoff": handoff_output})):
            import graph as g
            g.graph = g.build_graph()
            result = await g.run_pipeline(**sample_report)

        assert result["report_id"] == sample_report["report_id"]


# ═══════════════════════════════════════════════════════════════════════════════
# 9. FASTAPI ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestAPIEndpoints:
    """Tests for main.py FastAPI endpoints."""

    @pytest.fixture
    def full_pipeline_result(
        self, sample_report, intake_output, vulnerability_output,
        resource_output, routing_output, pattern_output, handoff_output
    ) -> dict:
        return {
            "report_id": sample_report["report_id"],
            "intake": intake_output,
            "vulnerability": vulnerability_output,
            "resource": resource_output,
            "routing": routing_output,
            "pattern": pattern_output,
            "handoff": handoff_output,
        }

    async def test_health_returns_ok(self):
        """GET /health must return status=ok."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    async def test_health_returns_5_agents(self):
        """GET /health must report exactly 5 agents."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/health")

        assert response.json()["agents"] == 5

    async def test_health_returns_correct_llm(self):
        """GET /health must report the correct LLM model string."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/health")

        assert response.json()["llm"] == "claude-haiku-4-5"

    async def test_process_returns_full_response(self, sample_report, full_pipeline_result):
        """POST /process must return all six agent outputs."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        with patch("main.run_pipeline", AsyncMock(return_value=full_pipeline_result)):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
                response = await ac.post("/process", json=sample_report)

        assert response.status_code == 200
        data = response.json()
        for key in ("intake", "vulnerability", "resource", "routing", "pattern", "handoff"):
            assert key in data, f"Missing key in /process response: {key}"

    async def test_process_report_id_echoed(self, sample_report, full_pipeline_result):
        """POST /process response must echo back the original report_id."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        with patch("main.run_pipeline", AsyncMock(return_value=full_pipeline_result)):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
                response = await ac.post("/process", json=sample_report)

        assert response.json()["report_id"] == sample_report["report_id"]

    async def test_process_validates_missing_fields(self):
        """POST /process must return 422 if required fields are absent."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/process", json={"report_id": "x"})  # missing fields

        assert response.status_code == 422

    async def test_process_returns_500_on_pipeline_error(self, sample_report):
        """POST /process must return 500 if the pipeline raises an exception."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        with patch("main.run_pipeline", AsyncMock(side_effect=RuntimeError("pipeline failed"))):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
                response = await ac.post("/process", json=sample_report)

        assert response.status_code == 500