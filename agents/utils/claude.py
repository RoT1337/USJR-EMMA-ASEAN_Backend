"""
utils/claude.py
Anthropic Claude client used by every agent.

MODEL is the single source of truth for which Claude model the pipeline
calls — referenced by main.py's /health endpoint and by every agent's
client.messages.create(model=MODEL, ...) call.
"""
import os

from anthropic import AsyncAnthropic

MODEL = "claude-haiku-4-5"

_client: AsyncAnthropic | None = None


def get_claude_client() -> AsyncAnthropic:
    """
    Return a shared AsyncAnthropic client, created lazily on first use.
    Reads ANTHROPIC_API_KEY from the environment (loaded via .env).
    """
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not set. Add it to your .env file."
            )
        _client = AsyncAnthropic(api_key=api_key)
    return _client