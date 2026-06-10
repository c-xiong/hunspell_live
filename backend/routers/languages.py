"""Language list for the frontend dropdown, driven by dicts_config/*.json."""
from fastapi import APIRouter

from backend.config import ENABLE_REPLACEMENT_LOGGING, LANGUAGE_CONFIG, UPLOAD_MAX_BYTES

router = APIRouter()


@router.get("/api/languages/")
def list_languages():
    languages = [
        {
            "code": code,
            "name": entry["language"],
            "direction": entry.get("text_direction", "ltr"),
        }
        for code, entry in LANGUAGE_CONFIG.items()
    ]
    languages.sort(key=lambda item: item["name"])
    return {"languages": languages}


@router.get("/api/config/")
def server_config():
    """Lets the UI distinguish 'public demo, no logging' from a self-hosted
    research instance that records replacement data."""
    return {
        "replacement_logging": ENABLE_REPLACEMENT_LOGGING,
        "upload_max_bytes": UPLOAD_MAX_BYTES,
    }
