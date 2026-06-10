"""In-memory registry for session-uploaded dictionaries.

Single-worker only (the production command is `uvicorn --workers 1`): entries
live in process memory with a sliding TTL and an LRU cap, so a public demo
has hard resource bounds. Space restarts/sleep wipe the registry — uploads
are explicitly session-scoped.
"""
import threading
import time
import uuid
from collections import OrderedDict
from dataclasses import dataclass, field

from backend.config import UPLOAD_MAX_SESSIONS, UPLOAD_TTL_SECONDS
from backend.services.spell_check_service import SpellChecker


@dataclass
class SessionEntry:
    checker: SpellChecker
    name: str
    direction: str
    last_access: float = field(default_factory=time.monotonic)


class SessionRegistry:
    def __init__(self, ttl_seconds: int = UPLOAD_TTL_SECONDS, max_entries: int = UPLOAD_MAX_SESSIONS):
        self._entries: "OrderedDict[str, SessionEntry]" = OrderedDict()
        self._lock = threading.Lock()
        self._ttl = ttl_seconds
        self._max = max_entries

    def _purge_expired(self) -> None:
        now = time.monotonic()
        expired = [key for key, entry in self._entries.items() if now - entry.last_access > self._ttl]
        for key in expired:
            del self._entries[key]

    def register(self, checker: SpellChecker, name: str, direction: str) -> str:
        with self._lock:
            self._purge_expired()
            while len(self._entries) >= self._max:
                self._entries.popitem(last=False)  # evict least recently used
            dictionary_id = str(uuid.uuid4())
            self._entries[dictionary_id] = SessionEntry(checker, name, direction)
            return dictionary_id

    def get(self, dictionary_id: str) -> SessionEntry | None:
        with self._lock:
            self._purge_expired()
            entry = self._entries.get(dictionary_id)
            if entry is None:
                return None
            entry.last_access = time.monotonic()
            self._entries.move_to_end(dictionary_id)
            return entry

    @property
    def ttl_seconds(self) -> int:
        return self._ttl


session_registry = SessionRegistry()
