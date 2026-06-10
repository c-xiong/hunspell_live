"""Central configuration: paths, dictionary registry, environment flags."""
import json
import os
from pathlib import Path

from dotenv import load_dotenv

# Repo root (parent of backend/). Dictionary paths in dicts_config/*.json are
# relative to this directory.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")

DICTS_CONFIG_DIR = BASE_DIR / "dicts_config"
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

ENABLE_REPLACEMENT_LOGGING = os.getenv("ENABLE_REPLACEMENT_LOGGING", "false").lower() in (
    "1",
    "true",
    "yes",
)

# Comma-separated origins for the dev setup where the Vite dev server runs on a
# different port. Production is a same-origin single container and needs none.
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

# Session-uploaded dictionaries (Phase 4)
UPLOAD_MAX_BYTES = int(os.getenv("UPLOAD_MAX_BYTES", 10 * 1024 * 1024))  # .aff + .dic combined
UPLOAD_TTL_SECONDS = int(os.getenv("UPLOAD_TTL_SECONDS", 2 * 60 * 60))
UPLOAD_MAX_SESSIONS = int(os.getenv("UPLOAD_MAX_SESSIONS", 20))


def load_language_config() -> dict:
    """Merge default and custom dictionary configs (custom wins)."""
    with open(DICTS_CONFIG_DIR / "default_dicts_config.json", "r") as f:
        config = json.load(f)
    custom_path = DICTS_CONFIG_DIR / "custom_dicts_config.json"
    if custom_path.exists():
        with open(custom_path, "r") as f:
            config.update(json.load(f))
    return config


LANGUAGE_CONFIG = load_language_config()
