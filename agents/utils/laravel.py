"""
utils/laravel.py
Async HTTP calls to Ryu's Laravel backend, used by the Vulnerability,
Resource, and Routing agents.

Base URL comes from LARAVEL_BASE_URL in .env (defaults to localhost:8000).
Every function raises on non-2xx / network errors — callers in agents/*.py
already wrap these calls in try/except and fall back gracefully.
"""
import os

import httpx

_TIMEOUT = httpx.Timeout(10.0)


def _base_url() -> str:
    return os.environ.get("LARAVEL_BASE_URL", "http://localhost:8000").rstrip("/")


async def get_households_by_location(location: str, lgu_id: str) -> list[dict]:
    """
    Fetch households in the affected area.
    GET /api/households?location={location}&lgu_id={lgu_id}
    Returns a list of household dicts (or the 'data'/'households' key if
    the API wraps the list — handled by the caller in vulnerability.py).
    """
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.get(
            f"{_base_url()}/api/households",
            params={"location": location, "lgu_id": lgu_id},
        )
        response.raise_for_status()
        return response.json()


async def get_household_vulnerability(family_id: str) -> dict:
    """
    Fetch vulnerability flags (PWD, senior, pregnant, minor) for one family.
    GET /api/households/{familyId}/vulnerability
    """
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.get(
            f"{_base_url()}/api/households/{family_id}/vulnerability"
        )
        response.raise_for_status()
        return response.json()


async def get_resources(lgu_id: str) -> dict:
    """
    Fetch current stockpile/resource levels for an LGU.
    GET /api/resources?lgu_id={lguId}
    """
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.get(
            f"{_base_url()}/api/resources",
            params={"lgu_id": lgu_id},
        )
        response.raise_for_status()
        return response.json()


async def get_nearest_evacuation_centers(lat: float, lng: float) -> list[dict]:
    """
    Fetch the nearest evacuation centres to a coordinate.
    GET /api/evacuation-centers/nearest?lat={lat}&lng={lng}
    """
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.get(
            f"{_base_url()}/api/evacuation-centers/nearest",
            params={"lat": lat, "lng": lng},
        )
        response.raise_for_status()
        return response.json()