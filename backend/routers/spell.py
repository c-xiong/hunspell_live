"""Spell-check endpoints. Request/response shapes match the original Django API.

The `language` field accepts either a configured language code (dicts_config)
or a `dictionary_id` returned by the session upload endpoint.
"""
import uuid

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.services.session_registry import session_registry
from backend.services.spell_check_service import SpellChecker, spell_checker_service

router = APIRouter()


class WordsRequest(BaseModel):
    words: list[str] | None = None
    language: str = "en_US"


def _resolve_checker(language: str) -> SpellChecker | None:
    """Session-uploaded dictionary first, then configured languages.
    Returns None if `language` is an expired/unknown session dictionary id."""
    entry = session_registry.get(language)
    if entry is not None:
        return entry.checker
    try:
        uuid.UUID(language)
        return None  # looks like a session id but is no longer registered
    except ValueError:
        return spell_checker_service.get_spell_checker(language)


_EXPIRED = {
    "error": "This uploaded dictionary session has expired. Please upload the files again."
}


@router.post("/api/check/")
def check_spelling(payload: WordsRequest):
    if not payload.words:
        return JSONResponse({"error": "A list of words is required"}, status_code=400)
    checker = _resolve_checker(payload.language)
    if checker is None:
        return JSONResponse(_EXPIRED, status_code=404)
    results = [{"word": word, "is_correct": checker.check_text(word)} for word in payload.words]
    return {"results": results, "language": payload.language}


@router.post("/api/get-list/")
def suggest_corrections(payload: WordsRequest):
    if not payload.words:
        return JSONResponse({"error": "A list of words is required"}, status_code=400)
    checker = _resolve_checker(payload.language)
    if checker is None:
        return JSONResponse(_EXPIRED, status_code=404)
    suggestions = {}
    for word in payload.words:
        suggestions[word] = [s for s in checker.get_suggestions(word) if s != word]
    return {"suggestions": suggestions, "language": payload.language}
