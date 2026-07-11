"""
utils/qdrant.py
Thin wrapper around Qdrant for the Regional Pattern Agent.

Collection: "prior_events"
Each point's payload matches the EMMA API contract for prior events:
  { "event_name": str, "location": str, "date": str, "hazard_type": str,
    "outcome": str, "cross_border_note": str }

Uses Qdrant Cloud's built-in inference (Document objects) so you don't need
to run a separate embedding model — Qdrant embeds the text server-side.
"""
import os

from qdrant_client import AsyncQdrantClient, models

COLLECTION_NAME = "prior_events"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"  # 384-dim, free on Qdrant Cloud inference

_client: AsyncQdrantClient | None = None


def _get_client() -> AsyncQdrantClient:
    global _client
    if _client is None:
        _client = AsyncQdrantClient(
            url=os.environ["QDRANT_URL"],
            api_key=os.environ.get("QDRANT_API_KEY") or None,
            cloud_inference=True,  # embed Document text on Qdrant Cloud, not locally via FastEmbed
        )
    return _client


async def search_prior_events(hazard_type: str, location: str, top_k: int = 3) -> list[dict]:
    """
    Semantic search for prior events similar to the current hazard + location.
    Returns a list of payload dicts (possibly empty if the collection doesn't
    exist yet or Qdrant is unreachable — callers already handle exceptions).
    """
    client = _get_client()
    query_text = f"{hazard_type} disaster in {location}"

    results = await client.query_points(
        collection_name=COLLECTION_NAME,
        query=models.Document(text=query_text, model=EMBEDDING_MODEL),
        limit=top_k,
        with_payload=True,
    )

    return [point.payload for point in results.points]


# ── Seeding ───────────────────────────────────────────────────────────────────
# Run this file directly (`python -m utils.qdrant`) to create the collection
# and load prior events into it. Two sources feed the collection:
#
#   1. BASE_SEED_EVENTS   — the original 3 hand-written events (kept as-is,
#                            since they're grounded in first-hand local
#                            knowledge rather than a wire report).
#   2. REAL_EVENT_SOURCES — 4 additional events covering the extra hazard
#                            types / countries the cross-border demo needs
#                            (Indonesia, Vietnam, Thailand, a second PH
#                            reference point). Each entry's `outcome` is
#                            resolved in priority order at seed time:
#                              a. a live match from the ReliefWeb API
#                                 (reliefweb.int, run by UN OCHA) — freshest,
#                                 but currently requires a pre-approved
#                                 `appname` (see README step 4);
#                              b. that source's `fallback_outcome` — a
#                                 short, source-verified summary written
#                                 from public reporting (AP/Reuters/
#                                 Wikipedia/NASA/CDP, Nov-Dec 2025), used
#                                 today while ReliefWeb access is pending;
#                              c. a generic "no ReliefWeb match" message
#                                 naming the specific event/query, only for
#                                 a source with no `fallback_outcome` set
#                                 (e.g. one you add later without writing
#                                 a manual summary yet).
#
# This means seeding produces real, usable data right now (tier b), and
# will pick up fresher live text automatically (tier a) the moment
# RELIEFWEB_APPNAME is an approved value — no code changes needed.

BASE_SEED_EVENTS = [
    {
        "event_name": "Typhoon Odette",
        "location": "Alcoy, Cebu",
        "date": "2021-12-16",
        "hazard_type": "typhoon",
        "outcome": "Flood peaked 4 hours after first report. Medical demand tripled within 48 hours.",
        "cross_border_note": "None",
    },
    {
        "event_name": "Typhoon Kalmaegi",
        "location": "Cebu Province",
        "date": "2025-11-04",
        "hazard_type": "flood",
        "outcome": "Multiple barangay roads impassable for 36 hours; evacuation centers reached capacity.",
        "cross_border_note": "PH to VN — VDDMA alerted ahead of landfall.",
    },
    {
        "event_name": "Cebu City Flash Flood",
        "location": "Cebu City",
        "date": "2024-07-09",
        "hazard_type": "flood",
        "outcome": "Drainage overflow caused localized flooding within 2 hours of heavy rainfall onset.",
        "cross_border_note": "None",
    },
]

# Kept for backward compatibility with anything importing the old name.
SEED_EVENTS = BASE_SEED_EVENTS

# NOTE: ReliefWeb's v1 API is decommissioned — v2 is the current version.
# As of 1 Nov 2025, ReliefWeb also requires a *pre-approved* appname (an
# arbitrary string is no longer accepted). Request one via
# https://reliefweb.int/contact, then set RELIEFWEB_APPNAME in your .env.
# Until you have an approved appname, calls below will get rejected and
# every REAL_EVENT_SOURCES entry will use its verified fallback_outcome
# instead of live ReliefWeb text — that's expected, not a bug, and the
# collection still gets real, source-checked seed data either way.
RELIEFWEB_API_URL = "https://api.reliefweb.int/v2/reports"
RELIEFWEB_APPNAME = os.environ.get("RELIEFWEB_APPNAME", "emma-disaster-response")

REAL_EVENT_SOURCES = [
    {
        "event_name": "Typhoon Fung-wong",
        "location": "Dinalungan, Aurora Province, Philippines",
        "date": "2025-11-09",
        "hazard_type": "typhoon",
        "cross_border_note": "None",
        "query": "Typhoon Fung-wong Philippines",
        "country": "PH",
        # Verified from public reporting (AP/Al Jazeera/PBS, Nov 2025) — used
        # whenever ReliefWeb has no live match, so the collection has real
        # data today rather than a generic placeholder.
        "fallback_outcome": (
            "Made landfall in Dinalungan, Aurora as a super typhoon on "
            "2025-11-09, just 5 days after Typhoon Kalmaegi struck the same "
            "region. Over 1 million people evacuated in advance; floods and "
            "landslides caused at least 33 deaths and displaced roughly "
            "1.4 million residents."
        ),
    },
    {
        "event_name": "Cyclone Senyar",
        "location": "Aceh / North Sumatra, Indonesia",
        "date": "2025-11-26",
        "hazard_type": "cyclone",
        "cross_border_note": "None",
        "query": "Cyclone Senyar Indonesia",
        "country": "ID",
        # Verified from NASA Earth Observatory / PreventionWeb (Nov-Dec 2025).
        "fallback_outcome": (
            "Formed over the Strait of Malacca — an extremely rare location "
            "for a tropical cyclone — making landfall in Sumatra on "
            "2025-11-26. Triggered catastrophic flooding and landslides "
            "across Aceh and North Sumatra, with 500+ deaths and 250,000+ "
            "people displaced in Aceh province alone."
        ),
    },
    {
        "event_name": "Vietnam Flooding 2025",
        "location": "Central Vietnam (Da Nang, Quang Ngai, Gia Lai)",
        "date": "2025-11-06",
        "hazard_type": "flood",
        "cross_border_note": (
            "PH to VN — Typhoon Kalmaegi crossed the central Philippines "
            "before making landfall in central Vietnam days later."
        ),
        "query": "Vietnam flooding 2025",
        "country": "VN",
        # Verified from Wikipedia (2025 Central Vietnam floods) / Al Jazeera / CNN.
        "fallback_outcome": (
            "Central Vietnam flooding persisted from mid-October through "
            "early December 2025, worsened when Typhoon Kalmaegi — the same "
            "storm that had just hit the Philippines — made landfall in "
            "central Vietnam on 2025-11-06. Left dozens dead and tens of "
            "thousands of homes damaged across Da Nang, Quang Ngai, and "
            "neighboring provinces."
        ),
    },
    {
        "event_name": "Thailand Flooding, Hat Yai",
        "location": "Hat Yai, Songkhla, Thailand",
        "date": "2025-11-21",
        "hazard_type": "flood",
        "cross_border_note": "None",
        "query": "Hat Yai Thailand flooding",
        "country": "TH",
        # Verified from Center for Disaster Philanthropy (Dec 2025) / Wikipedia (Cyclone Senyar).
        "fallback_outcome": (
            "Hat Yai, Songkhla province received roughly 13 inches (330mm) "
            "of rain in a single day on 2025-11-21 — the heaviest daily "
            "rainfall recorded there in three decades — as part of the same "
            "November 2025 monsoon/cyclone system that produced Cyclone "
            "Senyar. Flooding affected nine provinces in southern Thailand, "
            "with roughly 1.4 million households impacted."
        ),
    },
]


async def _fetch_reliefweb_summary(query: str, country: str | None = None) -> dict | None:
    """
    Query the ReliefWeb API (free, no API key required) for the most recent
    report matching `query`, optionally narrowed to a country ISO2 code.

    Returns a small dict: {"snippet": str, "source_url": str} or None if the
    API is unreachable, times out, or has no matching report. Callers must
    treat None as "use the fallback" rather than letting seeding fail.
    """
    import httpx  # imported locally so the module still loads if httpx isn't installed

    params = {
        "appname": RELIEFWEB_APPNAME,
        "query[value]": query,
        "query[fields][]": "title",
        "fields[include][]": ["title", "body-html", "url", "date.created"],
        "sort[]": "date.created:desc",
        "limit": 1,
    }
    if country:
        params["filter[field]"] = "country"
        params["filter[value][]"] = country

    try:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            response = await http_client.get(RELIEFWEB_API_URL, params=params)
            if response.status_code in (401, 403):
                print(
                    f"  ReliefWeb rejected the request for {query!r} "
                    f"(HTTP {response.status_code}). Since 1 Nov 2025 ReliefWeb "
                    "requires a pre-approved appname — request one via "
                    "https://reliefweb.int/contact and set RELIEFWEB_APPNAME "
                    "in your .env."
                )
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        print(f"  ReliefWeb lookup failed for {query!r}: {exc}")
        return None

    items = data.get("data") or []
    if not items:
        return None

    fields = items[0].get("fields", {})
    raw_body = fields.get("body-html") or fields.get("body") or ""
    # Strip any HTML tags and collapse whitespace, then keep a short excerpt.
    # This is metadata to ground retrieval, not a republished copy of the
    # report — keep it brief and always pair it with the source URL.
    import re

    text_only = re.sub(r"<[^>]+>", " ", raw_body)
    snippet = " ".join(text_only.split())[:280]
    if not snippet:
        return None

    return {"snippet": snippet, "source_url": fields.get("url")}


def _no_match_outcome(src: dict) -> str:
    """
    Build a clear, event-specific message for when ReliefWeb has no
    matching report — named to the actual event rather than a generic
    boilerplate string, so anyone reading the seeded payload (or the
    Pattern agent quoting it back) can tell which event is a placeholder
    and why.
    """
    country_note = f", country filter: {src['country']}" if src.get("country") else ""
    return (
        f"No ReliefWeb report currently matches '{src['event_name']}' "
        f"(query: \"{src['query']}\"{country_note}) as of this seed run. "
        f"This entry is a placeholder, not a verified outcome — re-run "
        f"`python -m utils.qdrant` once a matching report is published on "
        f"ReliefWeb, or replace this text with a manually verified summary."
    )


async def build_real_seed_events() -> list[dict]:
    """
    Build the 4 additional seed events, resolving each one's `outcome` in
    priority order: a live ReliefWeb match, then the source's verified
    `fallback_outcome` (if provided), then a generic message naming the
    event/query that had no match (only reached if `fallback_outcome`
    is absent).
    """
    events = []
    for src in REAL_EVENT_SOURCES:
        summary = await _fetch_reliefweb_summary(src["query"], src.get("country"))
        if summary:
            outcome = summary["snippet"]
            if summary.get("source_url"):
                outcome = f"{outcome} (Source: {summary['source_url']})"
            print(f"  \u2713 {src['event_name']}: matched a live ReliefWeb report")
        elif src.get("fallback_outcome"):
            outcome = src["fallback_outcome"]
            print(f"  \u25cb {src['event_name']}: no live ReliefWeb match — using verified fallback summary")
        else:
            outcome = _no_match_outcome(src)
            print(f"  \u2717 {src['event_name']}: no ReliefWeb match and no fallback_outcome — using placeholder")

        events.append(
            {
                "event_name": src["event_name"],
                "location": src["location"],
                "date": src["date"],
                "hazard_type": src["hazard_type"],
                "outcome": outcome,
                "cross_border_note": src["cross_border_note"],
            }
        )
    return events


async def _seed():
    client = _get_client()

    if not await client.collection_exists(COLLECTION_NAME):
        await client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
        )
        print(f"Created collection '{COLLECTION_NAME}'")

    print("Building the 4 additional seed events (live ReliefWeb match, "
          "falling back to verified summaries where needed)...")
    real_events = await build_real_seed_events()
    all_events = BASE_SEED_EVENTS + real_events

    points = [
        models.PointStruct(
            id=i,
            vector=models.Document(
                text=f"{e['hazard_type']} disaster in {e['location']}: {e['outcome']}",
                model=EMBEDDING_MODEL,
            ),
            payload=e,
        )
        for i, e in enumerate(all_events)
    ]
    await client.upsert(collection_name=COLLECTION_NAME, points=points)
    print(
        f"Seeded {len(points)} prior events into '{COLLECTION_NAME}' "
        f"({len(BASE_SEED_EVENTS)} base + {len(real_events)} additional — "
        "see the ✓/○/✗ lines above for which source each one used)"
    )


if __name__ == "__main__":
    import asyncio

    from dotenv import load_dotenv

    load_dotenv()
    asyncio.run(_seed())