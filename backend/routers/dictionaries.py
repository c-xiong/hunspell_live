"""Runtime dictionary upload: drop in your .aff/.dic, test immediately.

Uploads are session-scoped: parsed in memory, sliding TTL + LRU cap (see
session_registry). Three guard rails against abuse on the public demo:
combined size limit, parse timeout, and a simple per-IP rate limit (real
client IP from X-Forwarded-For, since the Space sits behind a proxy).
"""
import asyncio
import logging
import tempfile
import time
from collections import defaultdict
from pathlib import Path

from fastapi import APIRouter, File, Form, Request, UploadFile
from fastapi.responses import JSONResponse
from spylls.hunspell import Dictionary

from backend.config import UPLOAD_MAX_BYTES
from backend.services.session_registry import session_registry
from backend.services.spell_check_service import SpellChecker

logger = logging.getLogger(__name__)

router = APIRouter()

PARSE_TIMEOUT_SECONDS = 30
RATE_LIMIT_MAX_UPLOADS = 10
RATE_LIMIT_WINDOW_SECONDS = 60 * 60

_upload_times: dict[str, list[float]] = defaultdict(list)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _rate_limited(ip: str) -> bool:
    now = time.monotonic()
    times = _upload_times[ip]
    times[:] = [t for t in times if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(times) >= RATE_LIMIT_MAX_UPLOADS:
        return True
    times.append(now)
    return False


def _parse_dictionary(base_path: str) -> Dictionary:
    return Dictionary.from_files(base_path)


@router.post("/api/dictionaries/upload/")
async def upload_dictionary(
    request: Request,
    aff: UploadFile = File(...),
    dic: UploadFile = File(...),
    name: str = Form(""),
    text_direction: str = Form("ltr"),
):
    if _rate_limited(_client_ip(request)):
        return JSONResponse(
            {"error": "Too many uploads from your address. Please try again later."},
            status_code=429,
        )

    if not (aff.filename or "").lower().endswith(".aff") or not (dic.filename or "").lower().endswith(".dic"):
        return JSONResponse(
            {"error": "Please provide one .aff file and one .dic file."},
            status_code=400,
        )

    aff_bytes = await aff.read()
    dic_bytes = await dic.read()
    if len(aff_bytes) + len(dic_bytes) > UPLOAD_MAX_BYTES:
        return JSONResponse(
            {
                "error": f"Combined file size exceeds the {UPLOAD_MAX_BYTES // (1024 * 1024)}MB limit. "
                "For large dictionaries, run Hunspell Live self-hosted."
            },
            status_code=413,
        )

    display_name = name.strip() or Path(aff.filename or "dictionary").stem
    direction = "rtl" if text_direction == "rtl" else "ltr"

    with tempfile.TemporaryDirectory() as tmp_dir:
        base = Path(tmp_dir) / "uploaded"
        base.with_suffix(".aff").write_bytes(aff_bytes)
        base.with_suffix(".dic").write_bytes(dic_bytes)
        try:
            loop = asyncio.get_running_loop()
            dictionary = await asyncio.wait_for(
                loop.run_in_executor(None, _parse_dictionary, str(base)),
                timeout=PARSE_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError:
            return JSONResponse(
                {"error": f"Parsing took longer than {PARSE_TIMEOUT_SECONDS}s and was aborted."},
                status_code=422,
            )
        except Exception as exc:
            # Spylls parse errors are useful feedback for dictionary authors —
            # pass them through verbatim.
            logger.info("Dictionary parse failed: %s", exc)
            return JSONResponse(
                {"error": f"Could not parse dictionary: {exc}"},
                status_code=422,
            )

    checker = SpellChecker.from_dictionary(dictionary, display_name)
    dictionary_id = session_registry.register(checker, display_name, direction)

    return {
        "dictionary_id": dictionary_id,
        "name": display_name,
        "text_direction": direction,
        "expires_in_seconds": session_registry.ttl_seconds,
        "message": "Dictionary loaded for this session.",
    }
