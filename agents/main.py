"""
main.py
FastAPI service entry-point for the EMMA AI layer.

Endpoints exposed to Earl's Next.js dashboard:
  POST /process  — run all five agents, return full structured output
  GET  /health   — liveness check

Run with:
  uvicorn main:app --reload --port 8001
"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from graph import run_pipeline
from utils.claude import MODEL
from utils.helpers import get_logger

logger = get_logger("emma.main")


# ── Lifespan: startup / shutdown logging ──────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("EMMA AI Layer starting — model=%s", MODEL)
    yield
    logger.info("EMMA AI Layer shutting down.")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="EMMA AI Layer",
    description=(
        "Python FastAPI + LangGraph + Claude Haiku 4.5 service for the "
        "Emergency Management and Monitoring Assistant (EMMA). "
        "Built by Alliyana Rose Garcia (CS AI Layer) · AAIH 2026 · University of San Jose-Recoletos. "
        "Receives situation reports from Earl's Next.js dashboard, runs them through five "
        "LangGraph agents, and returns structured recommendations. "
        "Pulls data from Ryu's Laravel backend."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Earl's Next.js dashboard (any origin in dev; tighten in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Request / Response schemas ────────────────────────────────────────────────

class ProcessRequest(BaseModel):
    report_id: str = Field(..., description="Unique identifier for the situation report")
    report_text: str = Field(..., min_length=1, description="Full text of the situation report")
    lgu_id: str = Field(..., description="LGU (Local Government Unit) identifier")
    timestamp: str = Field(..., description="ISO 8601 datetime of the report")


class ProcessResponse(BaseModel):
    report_id: str
    intake: Optional[dict] = None
    vulnerability: Optional[dict] = None
    resource: Optional[dict] = None
    routing: Optional[dict] = None
    pattern: Optional[dict] = None
    handoff: Optional[dict] = None


class HealthResponse(BaseModel):
    status: str
    agents: int
    llm: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post(
    "/process",
    response_model=ProcessResponse,
    summary="Run all EMMA agents",
    description=(
        "Receive a situation report from Earl's dashboard, run it through the "
        "five-agent LangGraph pipeline (Intake → Vulnerability → Resource → Routing → Pattern → Handoff), "
        "and return the full structured output."
    ),
)
async def process_report(request: ProcessRequest) -> ProcessResponse:
    logger.info(
        "POST /process  report_id=%s  lgu_id=%s  chars=%d",
        request.report_id,
        request.lgu_id,
        len(request.report_text),
    )
    try:
        result = await run_pipeline(
            report_id=request.report_id,
            report_text=request.report_text,
            lgu_id=request.lgu_id,
            timestamp=request.timestamp,
        )
        return ProcessResponse(**result)
    except Exception as exc:
        logger.exception("Pipeline error  report_id=%s", request.report_id)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Service liveness check",
    description="Earl's dashboard pings this on load. Returns service status, agent count, and the active LLM.",
)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", agents=5, llm=MODEL)