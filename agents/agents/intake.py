"""
agents/intake.py
Agent 1 — Intake Agent
Detects language, extracts location, hazard type, population count,
urgency level, and key flags from the raw situation report.
Calls Claude Haiku 4.5 only. No Laravel calls. Low temperature (0.1).
"""
import json

from ..utils.claude import MODEL, get_claude_client
from ..utils.helpers import clamp_confidence, get_logger, parse_llm_json

logger = get_logger(__name__)

SYSTEM_PROMPT = """\
You are the Intake Agent for EMMA, an emergency management AI system for Southeast Asia.

Analyse the disaster situation report and extract structured information.

Return ONLY a valid JSON object — no explanation, no markdown, no preamble.

Required fields:
{
  "language_detected": "Filipino|Cebuano|Bahasa|Vietnamese|Thai|English",
  "location": "<most specific location string found in the report, e.g. 'Alcoy, Cebu'>",
  "hazard_type": "typhoon|flood|earthquake|landslide|fire|volcanic|other",
  "population_affected": <integer — if not stated, estimate from context>,
  "urgency": "CRITICAL|HIGH|MEDIUM|LOW",
  "key_flags": ["<concise flag>", ...],
  "confidence": <float 0.0–1.0>
}

Language detection notes:
  - Filipino/Tagalog: uses words like "mga", "ang", "sa", "na", "ay", "po"
  - Cebuano/Bisaya: uses words like "mga", "sa", "ang", "dili", "naa", "kaayo"
  - English: standard English text

Urgency guidelines:
  CRITICAL — immediate loss of life, mass casualties, total infrastructure collapse
  HIGH     — significant displacement, blocked evacuation routes, medical urgency, PWD/pregnant at risk
  MEDIUM   — localised impact, manageable with current resources
  LOW      — precautionary, early warning, minor or potential impact

key_flags should capture: blocked roads, medical needs, vulnerable groups,
missing persons, water/food shortage, structural damage, weather escalation.
"""


async def intake_agent(state: dict) -> dict:
    """
    LangGraph node — Intake Agent.

    Reads:  state["report_text"]
    Writes: state["intake"]
    """
    report_text: str = state["report_text"]
    logger.info("IntakeAgent START  report_id=%s", state.get("report_id"))

    client = get_claude_client()
    response = await client.messages.create(
        model=MODEL,
        max_tokens=1000,
        temperature=0.1,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (
                    "Analyse the following disaster situation report and return "
                    "the structured JSON extraction:\n\n"
                    f"{report_text}"
                ),
            }
        ],
    )

    raw = response.content[0].text
    logger.debug("IntakeAgent raw: %s", raw)

    try:
        result = parse_llm_json(raw)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("IntakeAgent parse error: %s", exc)
        result = {
            "language_detected": "English",
            "location": "Unknown",
            "hazard_type": "unknown",
            "population_affected": 0,
            "urgency": "HIGH",
            "key_flags": ["parse_error"],
            "confidence": 0.0,
        }

    # Normalise
    result["confidence"] = clamp_confidence(result.get("confidence", 0.0))
    if not isinstance(result.get("key_flags"), list):
        result["key_flags"] = []
    if not isinstance(result.get("population_affected"), (int, float)):
        result["population_affected"] = 0

    logger.info(
        "IntakeAgent DONE  hazard=%s  urgency=%s  location=%r  confidence=%.2f",
        result.get("hazard_type"),
        result.get("urgency"),
        result.get("location"),
        result["confidence"],
    )
    return {"intake": result}