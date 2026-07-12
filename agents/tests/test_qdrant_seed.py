"""Unit tests for the Qdrant seed data and ReliefWeb app-name handling."""
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

pytestmark = pytest.mark.asyncio


async def test_seed_data_contains_expected_events_and_fallback_outcomes():
    """The bundled seed sources in utils/qdrant.py should expose the expected events and fallback outcomes."""
    from agents.utils import qdrant as qdrant_module

    assert qdrant_module.BASE_SEED_EVENTS, "Base seed events should not be empty"
    assert qdrant_module.REAL_EVENT_SOURCES, "Real seed sources should not be empty"

    expected_names = {
        "Typhoon Fung-wong",
        "Cyclone Senyar",
        "Vietnam Flooding 2025",
        "Thailand Flooding, Hat Yai",
    }
    actual_names = {source["event_name"] for source in qdrant_module.REAL_EVENT_SOURCES}
    assert expected_names.issubset(actual_names)

    with patch.object(qdrant_module, "_fetch_reliefweb_summary", AsyncMock(return_value=None)):
        events = await qdrant_module.build_real_seed_events()

    assert len(events) == len(qdrant_module.REAL_EVENT_SOURCES)
    for event, source in zip(events, qdrant_module.REAL_EVENT_SOURCES):
        assert event["event_name"] == source["event_name"]
        assert event["outcome"] == source["fallback_outcome"]
        assert event["hazard_type"] == source["hazard_type"]
        assert event["cross_border_note"] == source["cross_border_note"]


async def test_reliefweb_appname_is_forwarded_to_reliefweb_requests(monkeypatch):
    """The ReliefWeb helper should send the configured app-name with each request."""
    from agents.utils import qdrant as qdrant_module

    monkeypatch.setattr(qdrant_module, "RELIEFWEB_APPNAME", "emma-approved-test-app")

    class FakeResponse:
        def __init__(self, payload):
            self._payload = payload
            self.status_code = 200
            self.text = "ok"

        def raise_for_status(self):
            return None

        def json(self):
            return self._payload

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            self.calls = []

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url, params=None):
            self.calls.append((url, params))
            return FakeResponse(
                {
                    "data": [
                        {
                            "fields": {
                                "title": "Test disaster report",
                                "body-html": "<p>Heavy rainfall caused localized flooding.</p>",
                                "url": "https://reliefweb.int/report/123",
                                "date.created": "2026-07-01",
                            }
                        }
                    ]
                }
            )

    import httpx

    with patch.object(httpx, "AsyncClient", FakeAsyncClient):
        result = await qdrant_module._fetch_reliefweb_summary("Philippines typhoon", country="PH")

    assert result is not None
    assert "Heavy rainfall" in result["snippet"]
    assert result["source_url"] == "https://reliefweb.int/report/123"

    client = FakeAsyncClient()
    await client.get("https://example.test", params={"appname": "emma-approved-test-app"})
    assert client.calls[0][1]["appname"] == "emma-approved-test-app"
