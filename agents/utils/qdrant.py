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


# ── One-off seeding helper ───────────────────────────────────────────────────
# Run this file directly (`python -m utils.qdrant`) to create the collection
# and load a handful of synthetic prior events to get started.

SEED_EVENTS = [
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


async def _seed():
    client = _get_client()

    if not await client.collection_exists(COLLECTION_NAME):
        await client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
        )
        print(f"Created collection '{COLLECTION_NAME}'")

    points = [
        models.PointStruct(
            id=i,
            vector=models.Document(
                text=f"{e['hazard_type']} disaster in {e['location']}: {e['outcome']}",
                model=EMBEDDING_MODEL,
            ),
            payload=e,
        )
        for i, e in enumerate(SEED_EVENTS)
    ]
    await client.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"Seeded {len(points)} prior events into '{COLLECTION_NAME}'")


if __name__ == "__main__":
    import asyncio
    from dotenv import load_dotenv

    load_dotenv()
    asyncio.run(_seed())