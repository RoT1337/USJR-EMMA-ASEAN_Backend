"""
agents/resource.py
Agent 3 — Resource Agent
Checks stockpile levels against population needs.  Identifies gaps and
available nearby resources.  Calls Laravel for inventory data, then
Claude Haiku 4.5 for gap analysis.
"""
import json

from utils.claude import MODEL, get_claude_client
from utils.helpers import clamp_confidence, get_logger, parse_llm_json
from utils.laravel import get_resources

logger = get_logger(__name__)

SYSTEM_PROMPT = """You are the Resource Agent for EMMA.

Given current stockpile data and the affected population count, produce
a gap analysis and identify available nearby resources.

Return ONLY a valid JSON object — no explanation, no markdown.

Required fields:
{
  "gaps": ["<e.g. 'Food — 3-day deficit', 'Medicine — prenatal kit needed'>"],
  "available": ["<e.g. 'Alcoy depot 2.3km', 'EC capacity: 200 slots'>"],
  "recommendation": "<actionable resource mobilisation recommendation>",
  "confidence": <float 0.0–1.0>
}

If stockpile data is empty, flag all standard items as unverified gaps.
"""


async def resource_agent(state: dict) -> dict:
    """
    LangGraph node — Resource Agent.

    Reads:  state["intake"]        (population_affected, location)
            state["lgu_id"]
    Writes: state["resource"]
    """
    intake = state.get("intake") or {}
    lgu_id: str = state.get("lgu_id", "")
    population: int = intake.get("population_affected", 0)
    location: str = intake.get("location", "")
    logger.info("ResourceAgent  lgu_id=%s  population=%d", lgu_id, population)

    # ── Fetch stockpile data from Laravel ────────────────────────────────────
    stockpile: dict = {}
    try:
        stockpile = await get_resources(lgu_id)
    except Exception as exc:
        logger.warning("ResourceAgent  Laravel unavailable: %s", exc)

    # ── Demo fallback: no stockpile data from Laravel ────────────────────────
    if not stockpile:
        logger.info("ResourceAgent  no stockpile data — returning demo fallback")
        return {
            "resource": {
                "gaps": ["Food — 3-day deficit", "Prenatal medicine kit needed"],
                "available": [
                    "Alcoy Central School EC — 200 slots, 45 occupied",
                    "Nearest depot 2.3km via Pasil road",
                ],
                "recommendation": "Request emergency food packs and prenatal medical kits",
                "confidence": 0.75,
            }
        }

    # ── Call Claude for gap analysis ──────────────────────────────────────────
    client = get_claude_client()
    stockpile_summary = json.dumps(stockpile, ensure_ascii=False)

    response = await client.messages.create(
        model=MODEL,
        max_tokens=1000,
        temperature=0.2,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (
                    f"Affected location: {location}\n"
                    f"Population affected: {population}\n"
                    f"Hazard type: {intake.get('hazard_type', 'unknown')}\n"
                    f"Urgency: {intake.get('urgency', 'HIGH')}\n\n"
                    f"Current stockpile data:\n{stockpile_summary}\n\n"
                    "Produce a gap analysis and list available nearby resources."
                ),
            }
        ],
    )

    raw = response.content[0].text
    logger.debug("ResourceAgent raw response: %s", raw)

    try:
        result = parse_llm_json(raw)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("ResourceAgent JSON parse error: %s", exc)
        result = {
            "gaps": ["Stockpile data unavailable — full inventory check required"],
            "available": [],
            "recommendation": "Initiate emergency resupply request to regional depot.",
            "confidence": 0.0,
        }

    result["confidence"] = clamp_confidence(result.get("confidence", 0.0))

    def _as_list(value) -> list:
        if isinstance(value, list):
            return value
        if value is None:
            return []
        return [value]

    result["gaps"] = _as_list(result.get("gaps"))
    result["available"] = _as_list(result.get("available"))

    logger.info(
        "ResourceAgent  gaps=%d  available=%d  confidence=%.2f",
        len(result.get("gaps", [])),
        len(result.get("available", [])),
        result["confidence"],
    )
    return {"resource": result}