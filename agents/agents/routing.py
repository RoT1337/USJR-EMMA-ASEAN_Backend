"""
agents/routing.py
Agent 4 — Routing Agent
Finds the safest evacuation path.  Flags blocked routes and suggests
alternatives.  Calls Laravel for nearest evacuation centres, then
Claude Haiku 4.5 to recommend a route.
"""
import json
import re

from utils.claude import MODEL, get_claude_client
from utils.helpers import clamp_confidence, get_logger, parse_llm_json
from utils.laravel import get_nearest_evacuation_centers

logger = get_logger(__name__)

SYSTEM_PROMPT = """You are the Routing Agent for EMMA.

Given evacuation centre data and the current hazard context, recommend
the safest evacuation route for the affected population.

Return ONLY a valid JSON object — no explanation, no markdown.

Required fields:
{
  "primary_status": "<status of primary route, e.g. 'BLOCKED — landslide on sitio road'>",
  "alternative": "<alternative route description and extra distance/time>",
  "eta_minutes": <integer estimated travel time in minutes via recommended route>,
  "risk": "HIGH|MODERATE|LOW",
  "recommendation": "<actionable routing recommendation>",
  "confidence": <float 0.0–1.0>
}

If a route is passable, primary_status should say 'CLEAR — <route description>'.
"""

# Simple regex to extract decimal lat/lng from a location string
_COORD_RE = re.compile(
    r"(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)"
)


def _extract_coords(location: str) -> tuple[float, float] | None:
    """Try to parse explicit lat/lng coordinates from a location string."""
    m = _COORD_RE.search(location)
    if m:
        return float(m.group(1)), float(m.group(2))
    return None


async def routing_agent(state: dict) -> dict:
    """
    LangGraph node — Routing Agent.

    Reads:  state["intake"]  (location, hazard_type, urgency)
    Writes: state["routing"]
    """
    intake = state.get("intake") or {}
    location: str = intake.get("location", "")
    logger.info("RoutingAgent  location=%s", location)

    # ── Fetch nearest evacuation centres ─────────────────────────────────────
    ev_centres: list[dict] = []
    coords = _extract_coords(location)
    if coords:
        lat, lng = coords
        try:
            ev_centres = await get_nearest_evacuation_centers(lat, lng)
        except Exception as exc:
            logger.warning("RoutingAgent  Laravel unavailable: %s", exc)
    else:
        logger.info(
            "RoutingAgent  no explicit coords in '%s' — proceeding without centre data",
            location,
        )

    # ── Call Claude to recommend a route ─────────────────────────────────────
    client = get_claude_client()
    centres_summary = json.dumps(ev_centres, ensure_ascii=False)

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
                    f"Hazard type: {intake.get('hazard_type', 'unknown')}\n"
                    f"Urgency: {intake.get('urgency', 'HIGH')}\n"
                    f"Population affected: {intake.get('population_affected', 0)}\n\n"
                    f"Nearest evacuation centres:\n{centres_summary}\n\n"
                    "Recommend the safest evacuation route, flagging any blocked roads."
                ),
            }
        ],
    )

    raw = response.content[0].text
    logger.debug("RoutingAgent raw response: %s", raw)

    try:
        result = parse_llm_json(raw)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("RoutingAgent JSON parse error: %s", exc)
        result = {
            "primary_status": "UNKNOWN — route data unavailable",
            "alternative": "Use nearest known evacuation centre",
            "eta_minutes": 60,
            "risk": "HIGH",
            "recommendation": "Proceed to nearest evacuation centre via safest available road.",
            "confidence": 0.0,
        }

    result["confidence"] = clamp_confidence(result.get("confidence", 0.0))
    logger.info(
        "RoutingAgent  risk=%s  eta=%s  confidence=%.2f",
        result.get("risk"),
        result.get("eta_minutes"),
        result["confidence"],
    )
    return {"routing": result}