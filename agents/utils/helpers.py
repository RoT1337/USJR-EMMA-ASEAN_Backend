"""
utils/helpers.py
Shared utilities used by every agent: logging, parsing Claude's raw JSON
response text, and clamping confidence scores into [0.0, 1.0].
"""
import json
import logging
import re

_LOG_FORMAT = "%(asctime)s  %(levelname)-8s  %(name)s  %(message)s"
_configured = False


def get_logger(name: str) -> logging.Logger:
    """Return a configured logger. Sets up basic logging once, globally."""
    global _configured
    if not _configured:
        logging.basicConfig(level=logging.INFO, format=_LOG_FORMAT)
        _configured = True
    return logging.getLogger(name)


def parse_llm_json(raw: str) -> dict:
    """
    Parse JSON out of a Claude response, tolerating common wrapping like
    ```json ... ``` or bare ``` ... ``` code fences.

    Raises:
        json.JSONDecodeError: if the text isn't valid JSON at all.
        ValueError: if it parses but isn't a JSON object (e.g. a list).
    """
    text = raw.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    parsed = json.loads(text)
    if not isinstance(parsed, dict):
        raise ValueError(f"Expected a JSON object, got {type(parsed).__name__}")
    return parsed


def clamp_confidence(value) -> float:
    """Coerce a confidence value into [0.0, 1.0]. Non-numeric -> 0.0."""
    try:
        value = float(value)
    except (TypeError, ValueError):
        return 0.0
    return max(0.0, min(1.0, value))