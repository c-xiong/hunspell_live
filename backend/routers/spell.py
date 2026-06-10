"""Spell-check endpoints. Request/response shapes match the original Django API."""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.services.spell_check_service import spell_checker_service

router = APIRouter()


class WordsRequest(BaseModel):
    words: list[str] | None = None
    language: str = "en_US"


@router.post("/api/check/")
def check_spelling(payload: WordsRequest):
    if not payload.words:
        return JSONResponse({"error": "A list of words is required"}, status_code=400)
    checker = spell_checker_service.get_spell_checker(payload.language)
    results = [{"word": word, "is_correct": checker.check_text(word)} for word in payload.words]
    return {"results": results, "language": payload.language}


@router.post("/api/get-list/")
def suggest_corrections(payload: WordsRequest):
    if not payload.words:
        return JSONResponse({"error": "A list of words is required"}, status_code=400)
    checker = spell_checker_service.get_spell_checker(payload.language)
    suggestions = {}
    for word in payload.words:
        suggestions[word] = [s for s in checker.get_suggestions(word) if s != word]
    return {"suggestions": suggestions, "language": payload.language}
