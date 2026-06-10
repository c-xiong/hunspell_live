"""SQLite storage for word replacements (single table, no ORM).

Writes only happen when ENABLE_REPLACEMENT_LOGGING is on. On the public demo
the disk is ephemeral and logging stays off; self-hosted research instances
can enable it and treat data/replacements.db as the study dataset.
"""
import sqlite3
from datetime import datetime, timezone

from backend.config import DATA_DIR

DB_PATH = DATA_DIR / "replacements.db"

_SCHEMA = """
CREATE TABLE IF NOT EXISTS replacements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_word TEXT NOT NULL,
    replacement_word TEXT NOT NULL,
    lang_code TEXT NOT NULL,
    participant_id TEXT,
    created_at TEXT NOT NULL
);
"""


def _connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(_SCHEMA)
    return conn


def insert_replacement(original_word: str, replacement_word: str, lang_code: str, participant_id: str | None) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT INTO replacements (original_word, replacement_word, lang_code, participant_id, created_at)"
            " VALUES (?, ?, ?, ?, ?)",
            (
                original_word,
                replacement_word,
                lang_code,
                participant_id,
                datetime.now(timezone.utc).isoformat(),
            ),
        )


def fetch_replacements(lang_code: str | None = None) -> list[dict]:
    with _connect() as conn:
        query = "SELECT original_word, replacement_word, lang_code, participant_id, created_at FROM replacements"
        params: tuple = ()
        if lang_code:
            query += " WHERE lang_code = ?"
            params = (lang_code,)
        query += " ORDER BY created_at DESC"
        return [dict(row) for row in conn.execute(query, params).fetchall()]
