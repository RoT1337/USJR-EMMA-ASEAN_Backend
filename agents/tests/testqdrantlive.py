"""
tests/test_qdrant_live.py
LIVE integration tests for utils/qdrant.py's ReliefWeb lookups.

Unlike test_agents.py, these tests make REAL network calls to the ReliefWeb
API (api.reliefweb.int) — nothing here is mocked. They exist to prove the
integration actually works against the live service, in particular that:

  1. a query likely to match returns real report data, and
  2. a query that cannot possibly match returns a clean "no result" outcome
     that names the specific event/query — not a crash, not silence.

Run these on their own (they're slower and depend on an external service):

    pytest tests/test_qdrant_live.py -v -m live

Or exclude them from a normal CI run of the rest of the suite:

    pytest tests/ -m "not live"

If the environment has no outbound access to api.reliefweb.int (offline
dev box, sandboxed CI runner, restrictive egress allowlist), every test in
this file skips itself with a clear reason instead of failing — this file
is meant to prove real connectivity, not to require it everywhere.
"""
import pytest

pytestmark = [pytest.mark.asyncio, pytest.mark.live]


async def _skip_if_reliefweb_unreachable():
    """
    Do a minimal real request to ReliefWeb before running a live test.
    Skips (rather than fails) for two distinct environment reasons:

      - Network/egress can't reach api.reliefweb.int at all (offline dev,
        sandboxed CI runner, restrictive allowlist).
      - The network call succeeds but ReliefWeb rejects RELIEFWEB_APPNAME
        (HTTP 401/403) — as of 1 Nov 2025 ReliefWeb requires a
        pre-approved appname, so the default placeholder value will be
        rejected until you request a real one and set it in .env.

    Either way this is an environment/configuration limitation, not a
    code bug, so tests skip with a specific, actionable reason instead
    of failing.
    """
    import httpx

    from agents.utils.qdrant import RELIEFWEB_API_URL, RELIEFWEB_APPNAME

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                RELIEFWEB_API_URL,
                params={"appname": RELIEFWEB_APPNAME, "limit": 1},
            )
    except httpx.HTTPError as exc:
        pytest.skip(f"ReliefWeb API unreachable from this environment: {exc}")

    if response.status_code in (401, 403):
        pytest.skip(
            f"ReliefWeb rejected RELIEFWEB_APPNAME={RELIEFWEB_APPNAME!r} "
            f"(HTTP {response.status_code}). Since 1 Nov 2025 ReliefWeb "
            "requires a pre-approved appname — request one at "
            "https://reliefweb.int/contact and set RELIEFWEB_APPNAME in "
            "your .env, then re-run these live tests."
        )
    if response.status_code != 200:
        pytest.skip(
            f"ReliefWeb API not reachable from this environment "
            f"(HTTP {response.status_code}: {response.text[:120]!r})"
        )


class TestReliefWebLiveMatch:
    """A query that should realistically match a real, published report."""

    async def test_live_query_with_real_match_returns_report_data(self):
        """A broad, realistic disaster query must return a populated result
        with a non-empty snippet and a working reliefweb.int source URL."""
        await _skip_if_reliefweb_unreachable()

        from agents.utils.qdrant import _fetch_reliefweb_summary

        result = await _fetch_reliefweb_summary("Philippines typhoon", country="PH")

        # ReliefWeb's PH archive is large and constantly updated, so a broad
        # query like this should virtually always match *something*. If it
        # ever doesn't, that's worth knowing about rather than silently
        # treating a real "no data" response as a mock artifact.
        assert result is not None, (
            "Expected at least one real ReliefWeb report for a broad "
            "'Philippines typhoon' query — got no match."
        )
        assert isinstance(result["snippet"], str)
        assert len(result["snippet"]) > 0
        assert result["source_url"] is None or result["source_url"].startswith("https://reliefweb.int")

    async def test_live_build_real_seed_events_returns_all_four_with_valid_schema(self):
        """The full seeding step, run live, must return exactly 4 events —
        each with the required EMMA payload schema and a non-empty outcome,
        whether or not every single one found a live ReliefWeb match."""
        await _skip_if_reliefweb_unreachable()

        from agents.utils.qdrant import REAL_EVENT_SOURCES, build_real_seed_events

        events = await build_real_seed_events()

        assert len(events) == len(REAL_EVENT_SOURCES) == 4
        required_fields = {"event_name", "location", "date", "hazard_type",
                            "outcome", "cross_border_note"}
        for event in events:
            assert required_fields.issubset(event.keys())
            assert isinstance(event["outcome"], str)
            assert len(event["outcome"]) > 0


class TestReliefWebLiveNoMatch:
    """A query engineered to have no real match — proves the 'no result'
    path is exercised against the live API, not just simulated with mocks."""

    async def test_live_query_with_no_possible_match_returns_none(self):
        """A nonsense query must return None from ReliefWeb, not raise,
        and not silently fabricate a result."""
        await _skip_if_reliefweb_unreachable()

        from agents.utils.qdrant import _fetch_reliefweb_summary

        nonsense_query = "zzqxv9184-nonexistent-disaster-event-fabricated-2099"
        result = await _fetch_reliefweb_summary(nonsense_query)

        assert result is None

    async def test_live_no_match_produces_event_specific_outcome(self):
        """When a source's query has no real ReliefWeb match AND it has no
        verified fallback_outcome set, the resulting seed event's outcome
        must name that specific event and query — not a vague or silent
        failure."""
        await _skip_if_reliefweb_unreachable()

        from agents.utils.qdrant import build_real_seed_events, REAL_EVENT_SOURCES

        # Temporarily point one real source at a query guaranteed not to
        # match, and strip its verified fallback_outcome so this actually
        # exercises the generic no-match path (not the real seed data).
        patched_sources = [dict(src) for src in REAL_EVENT_SOURCES]
        patched_sources[0]["query"] = "zzqxv9184-nonexistent-disaster-event-fabricated-2099"
        patched_sources[0]["country"] = None
        patched_sources[0].pop("fallback_outcome", None)

        import agents.utils.qdrant as qdrant_module

        original_sources = qdrant_module.REAL_EVENT_SOURCES
        qdrant_module.REAL_EVENT_SOURCES = patched_sources
        try:
            events = await build_real_seed_events()
        finally:
            qdrant_module.REAL_EVENT_SOURCES = original_sources

        no_match_event = events[0]
        assert patched_sources[0]["event_name"] in no_match_event["outcome"]
        assert patched_sources[0]["query"] in no_match_event["outcome"]
        assert "placeholder" in no_match_event["outcome"].lower()