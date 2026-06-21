"""
agents/handoff.py
Agent 6 — Handoff Coordinator
Reads all five agent outputs from state and synthesises them into a
single priority action + reasoning for the human operator.
This is the final LLM call before the result goes back to Earl's dashboard.
"""
import json

from utils.claude import MODEL, get_claude_client
from utils.helpers import clamp_confidence, get_logger, parse_llm_json

logger = get_logger(__name__)

SYSTEM_PROMPT = """You are the Handoff Coordinator for EMMA.

You receive the outputs of five specialist agents (Intake, Vulnerability,
Resource, Routing, Pattern).  Your job is to synthesise them into a single,
clear, priority action and a brief reasoning summary for the human operator.

Return ONLY a valid JSON object — no explanation, no markdown.

Required fields:
{
  "action": "<one specific, actionable instruction for the operator, e.g. \
'Evacuate 3 priority individuals via Pasil route with medical kit within 90 min'>",
  "reasoning": "<2–3 sentence synthesis of why this action is the priority, \
citing the most critical agent findings>",
  "confidence": <float 0.0–1.0, reflecting overall system confidence>
}

Prioritise life safety over resource efficiency.
If agents disagree, favour the most conservative (highest-risk) interpretation.
"""


async def handoff_coordinator(state: dict) -> dict:
    """
    LangGraph node — Handoff Coordinator.

    Reads:  state["intake"], ["vulnerability"], ["resource"], ["routing"], ["pattern"]
    Writes: state["handoff"]
    """
    logger.info("HandoffCoordinator  report_id=%s", state.get("report_id"))

    # Gather all agent outputs (use empty dicts for any that failed)
    context = {
        "intake": state.get("intake") or {},
        "vulnerability": state.get("vulnerability") or {},
        "resource": state.get("resource") or {},
        "routing": state.get("routing") or {},
        "pattern": state.get("pattern") or {},
    }

    client = get_claude_client()
    context_json = json.dumps(context, ensure_ascii=False, indent=2)

    response = await client.messages.create(
        model=MODEL,
        max_tokens=1000,
        temperature=0.2,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (
                    f"Report ID: {state.get('report_id')}\n"
                    f"LGU: {state.get('lgu_id')}\n"
                    f"Timestamp: {state.get('timestamp')}\n\n"
                    f"Agent outputs:\n{context_json}\n\n"
                    "Produce the final priority action and reasoning for the operator."
                ),
            }
        ],
    )

    raw = response.content[0].text
    logger.debug("HandoffCoordinator raw response: %s", raw)

    try:
        result = parse_llm_json(raw)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("HandoffCoordinator JSON parse error: %s", exc)
        result = {
            "action": "Manual review required — automated synthesis failed.",
            "reasoning": "One or more agents returned unexpected output. Human operator must assess.",
            "confidence": 0.0,
        }

    result["confidence"] = clamp_confidence(result.get("confidence", 0.0))
    logger.info(
        "HandoffCoordinator  confidence=%.2f  action=%r",
        result["confidence"],
        result.get("action", "")[:80],
    )
    return {"handoff": result}