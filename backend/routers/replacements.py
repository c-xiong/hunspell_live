"""Replacement logging ("error -> correction" pairs) and export.

This is the field-research feature: collected pairs are raw material for a
misspelling corpus and for REP rules in the .aff file. No auth by design —
participant_id is just a label researchers hand out, not an account.
"""
import csv
import io

from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from backend import db
from backend.config import ENABLE_REPLACEMENT_LOGGING

router = APIRouter()


class ReplacementRequest(BaseModel):
    original_word: str | None = None
    replacement_word: str | None = None
    language: str = "en_US"
    participant_id: str | None = None


@router.post("/api/replacements/")
def record_replacement(payload: ReplacementRequest):
    if not payload.original_word or not payload.replacement_word:
        return JSONResponse(
            {"error": "Both original_word and replacement_word are required"},
            status_code=400,
        )
    if not ENABLE_REPLACEMENT_LOGGING:
        return {
            "message": "Replacement logging is disabled on this server",
            "logged": False,
        }
    db.insert_replacement(
        payload.original_word,
        payload.replacement_word,
        payload.language,
        payload.participant_id,
    )
    return {
        "message": "Word replacement recorded successfully",
        "logged": True,
        "original_word": payload.original_word,
        "replacement_word": payload.replacement_word,
        "language": payload.language,
        "participant_id": payload.participant_id,
    }


@router.get("/api/replacements/export/")
def export_replacements(format: str = "json", language: str | None = None):
    rows = db.fetch_replacements(language)
    if format == "csv":
        buffer = io.StringIO()
        writer = csv.DictWriter(
            buffer,
            fieldnames=["original_word", "replacement_word", "lang_code", "participant_id", "created_at"],
        )
        writer.writeheader()
        writer.writerows(rows)
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=replacements.csv"},
        )
    return {"count": len(rows), "replacements": rows}
