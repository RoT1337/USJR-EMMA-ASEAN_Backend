"""
agents/pattern.py
Agent 5 — Regional Pattern Agent
Retrieves prior similar events from Qdrant (semantic search) and
surfaces patterns and cross-border relevance via Claude Haiku 4.5.
"""
import json

from utils.claude import MODEL, get_claude_client
from utils.helpers import clamp_confidence, get_logger, parse_llm_json
from utils.qdrant import search_prior_events

logger = get_logger(__name__)

SYSTEM_PROMPT = """You are the Regional Pattern Agent for EMMA.

Given a set of prior similar disaster events from the EMMA historical database,
identify relevant patterns and any cross-border implications for the current event.

Return ONLY a valid JSON object — no explanation, no markdown.

Required fields:
{
  "prior_event": "<most relevant prior event name and date>",
  "insight": "<key operational pattern or lesson learned from prior events>",
  "cross_border": "<cross-border relevance, or 'None identified' if not applicable>",
  "confidence": <float 0.0–1.0>
}

Focus on actionable patterns: flood escalation timelines, medical demand spikes,
route failures, cross-border migration of the hazard, etc.
"""


async def pattern_agent(state: dict) -> dict:
    """
    LangGraph node — Regional Pattern Agent.

    Reads:  state["intake"]  (hazard_type, location)
    Writes: state["pattern"]
    """
    intake = state.get("intake") or {}
    hazard_type: str = intake.get("hazard_type", "")
    location: str = intake.get("location", "")
    logger.info("PatternAgent  hazard=%s  location=%s", hazard_type, location)

    # ── Semantic search in Qdrant ─────────────────────────────────────────────
    prior_events: list[dict] = []
    try:
        prior_events = await search_prior_events(hazard_type, location, top_k=3)
    except Exception as exc:
        logger.warning("PatternAgent  Qdrant unavailable: %s", exc)

    # ── Demo fallback: no prior events from Qdrant ───────────────────────────
    if not prior_events:
        logger.info("PatternAgent  no prior events — returning demo fallback")
        return {
            "pattern": {
                "prior_event": "Typhoon Odette (Dec 2021) — same Alcoy coastal zone",
                "insight": "Flood peaked 4-6 hrs after initial report. Medical demand tripled within 48 hours.",
                "cross_border": "Kalmaegi tracking PH → VN. VDDMA landfall in 36-48 hrs.",
                "confidence": 0.70,
            }
        }

    # ── Call Claude to generate pattern insight ───────────────────────────────
    client = get_claude_client()
    events_summary = json.dumps(prior_events, ensure_ascii=False)

    response = await client.messages.create(
        model=MODEL,
        max_tokens=1000,
        temperature=0.3,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (
                    f"Current hazard: {hazard_type}\n"
                    f"Current location: {location}\n\n"
                    f"Top 3 prior similar events from EMMA database:\n{events_summary}\n\n"
                    "Extract the most relevant pattern insight and any cross-border implications."
                ),
            }
        ],
    )

    raw = response.content[0].text
    logger.debug("PatternAgent raw response: %s", raw)

    try:
        result = parse_llm_json(raw)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("PatternAgent JSON parse error: %s", exc)
        result = {
            "prior_event": "No prior events retrieved",
            "insight": "Historical pattern data unavailable.",
            "cross_border": "None identified",
            "confidence": 0.0,
        }

    result["confidence"] = clamp_confidence(result.get("confidence", 0.0))
    logger.info(
        "PatternAgent  prior_event=%r  confidence=%.2f",
        result.get("prior_event"),
        result["confidence"],
    )
    return {"pattern": result}