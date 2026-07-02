"""
graph.py
LangGraph sequential agent chain for EMMA.

Flow:
  START → intake_agent → vulnerability_agent → resource_agent
        → routing_agent → pattern_agent → handoff_coordinator → END

Each agent adds its output to the shared EMMAState dict.
All agents downstream can read all previous outputs.
If an individual agent raises, its output is set to a safe fallback dict
so the pipeline can continue rather than failing entirely.
"""
import traceback
from typing import Optional

from langgraph.graph import END, StateGraph
from typing_extensions import TypedDict

from agents.handoff import handoff_coordinator
from agents.intake import intake_agent
from agents.pattern import pattern_agent
from agents.resource import resource_agent
from agents.routing import routing_agent
from agents.vulnerability import vulnerability_agent
from utils.helpers import get_logger

logger = get_logger("emma.graph")


# ── Shared state ──────────────────────────────────────────────────────────────

class EMMAState(TypedDict, total=False):
    """Shared state that flows through the entire agent pipeline."""
    # Inputs (set once at pipeline start)
    report_id: str
    report_text: str
    lgu_id: str
    timestamp: str
    # Agent outputs (populated sequentially; None until the agent runs)
    intake: Optional[dict]
    vulnerability: Optional[dict]
    resource: Optional[dict]
    routing: Optional[dict]
    pattern: Optional[dict]
    handoff: Optional[dict]


# ── Error-isolated wrappers ───────────────────────────────────────────────────
# Each wrapper calls the real agent and, if it raises, logs the traceback and
# returns a fallback dict so downstream agents still receive a valid state.

def _fallback(agent_name: str, key: str, exc: Exception) -> dict:
    logger.error("Agent %s raised — using fallback.  error=%s", agent_name, exc)
    logger.debug(traceback.format_exc())
    return {key: {"error": str(exc), "confidence": 0.0, "agent_failed": True}}


async def _safe_intake(state: EMMAState) -> dict:
    try:
        return await intake_agent(state)
    except Exception as exc:
        return _fallback("intake_agent", "intake", exc)


async def _safe_vulnerability(state: EMMAState) -> dict:
    try:
        return await vulnerability_agent(state)
    except Exception as exc:
        return _fallback("vulnerability_agent", "vulnerability", exc)


async def _safe_resource(state: EMMAState) -> dict:
    try:
        return await resource_agent(state)
    except Exception as exc:
        return _fallback("resource_agent", "resource", exc)


async def _safe_routing(state: EMMAState) -> dict:
    try:
        return await routing_agent(state)
    except Exception as exc:
        return _fallback("routing_agent", "routing", exc)


async def _safe_pattern(state: EMMAState) -> dict:
    try:
        return await pattern_agent(state)
    except Exception as exc:
        return _fallback("pattern_agent", "pattern", exc)


async def _safe_handoff(state: EMMAState) -> dict:
    try:
        return await handoff_coordinator(state)
    except Exception as exc:
        return _fallback("handoff_coordinator", "handoff", exc)


# ── Graph builder ─────────────────────────────────────────────────────────────

def build_graph():
    """
    Compile and return the EMMA LangGraph.
    The error-isolated wrappers are used as nodes so that a single agent
    failure does not abort the entire pipeline.
    """
    workflow: StateGraph = StateGraph(EMMAState)

    workflow.add_node("intake_agent", _safe_intake)
    workflow.add_node("vulnerability_agent", _safe_vulnerability)
    workflow.add_node("resource_agent", _safe_resource)
    workflow.add_node("routing_agent", _safe_routing)
    workflow.add_node("pattern_agent", _safe_pattern)
    workflow.add_node("handoff_coordinator", _safe_handoff)

    workflow.set_entry_point("intake_agent")
    workflow.add_edge("intake_agent", "vulnerability_agent")
    workflow.add_edge("vulnerability_agent", "resource_agent")
    workflow.add_edge("resource_agent", "routing_agent")
    workflow.add_edge("routing_agent", "pattern_agent")
    workflow.add_edge("pattern_agent", "handoff_coordinator")
    workflow.add_edge("handoff_coordinator", END)

    return workflow.compile()


# ── Module-level singleton ────────────────────────────────────────────────────
graph = build_graph()


# ── Public entry-point ────────────────────────────────────────────────────────

async def run_pipeline(
    report_id: str,
    report_text: str,
    lgu_id: str,
    timestamp: str,
) -> dict:
    """
    Execute the full EMMA agent pipeline and return the structured result.
    Called by main.py's POST /process handler.
    Always returns a complete dict even if individual agents failed.
    """
    logger.info(
        "run_pipeline START  report_id=%s  lgu_id=%s",
        report_id, lgu_id,
    )

    initial_state: EMMAState = {
        "report_id": report_id,
        "report_text": report_text,
        "lgu_id": lgu_id,
        "timestamp": timestamp,
        "intake": None,
        "vulnerability": None,
        "resource": None,
        "routing": None,
        "pattern": None,
        "handoff": None,
    }

    result = await graph.ainvoke(initial_state)

    logger.info(
        "run_pipeline END  report_id=%s  handoff_confidence=%.2f",
        report_id,
        (result.get("handoff") or {}).get("confidence", 0.0),
    )

    return {
        "report_id": result["report_id"],
        "intake":        result.get("intake"),
        "vulnerability": result.get("vulnerability"),
        "resource":      result.get("resource"),
        "routing":       result.get("routing"),
        "pattern":       result.get("pattern"),
        "handoff":       result.get("handoff"),
    }