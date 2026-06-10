"""Spylls-backed spell checking, ported from the Django service layer.

Dictionaries declared in dicts_config/*.json are lazy-loaded on first use and
cached for the lifetime of the process. Behaviour mirrors the original
implementation: unknown languages and load failures fall back to en_US.
"""
import logging
from pathlib import Path

from spylls.hunspell import Dictionary

from backend.config import BASE_DIR, LANGUAGE_CONFIG

logger = logging.getLogger(__name__)

FALLBACK_LANGUAGE = "en_US"


def _find_dict_pair(dict_dir: Path) -> Path:
    """Locate a matching .aff/.dic pair in a directory; return the base path."""
    for aff_file in sorted(dict_dir.glob("*.aff")):
        base = aff_file.with_suffix("")
        if base.with_suffix(".dic").exists():
            return base
    raise FileNotFoundError(f"No matching .aff/.dic pair found in {dict_dir}")


class SpellChecker:
    def __init__(self, lang_code: str = FALLBACK_LANGUAGE):
        self.lang_code = lang_code
        if lang_code not in LANGUAGE_CONFIG:
            logger.warning("Language %r not supported, falling back to %s", lang_code, FALLBACK_LANGUAGE)
            self.lang_code = lang_code = FALLBACK_LANGUAGE
        try:
            dict_dir = BASE_DIR / LANGUAGE_CONFIG[lang_code]["hunspell_path"]
            base = _find_dict_pair(dict_dir)
            logger.info("Loading dictionary: %s.aff / %s.dic", base, base)
            self.dictionary = Dictionary.from_files(str(base))
        except Exception:
            logger.exception("Failed to load dictionary for %s, falling back to %s", lang_code, FALLBACK_LANGUAGE)
            self.lang_code = FALLBACK_LANGUAGE
            fallback_dir = BASE_DIR / LANGUAGE_CONFIG[FALLBACK_LANGUAGE]["hunspell_path"]
            self.dictionary = Dictionary.from_files(str(_find_dict_pair(fallback_dir)))

    @classmethod
    def from_dictionary(cls, dictionary: Dictionary, lang_code: str) -> "SpellChecker":
        """Wrap an already-parsed Dictionary (used for uploaded dictionaries)."""
        instance = cls.__new__(cls)
        instance.lang_code = lang_code
        instance.dictionary = dictionary
        return instance

    def check_text(self, text: str) -> bool:
        try:
            word = text.strip()
            if not word:
                return False
            result = self.dictionary.lookup(word)
            if not result:
                result = self.dictionary.lookup(word.lower())
            return bool(result)
        except Exception:
            logger.exception("Error checking text %r", text)
            return False

    def get_suggestions(self, word: str) -> list:
        try:
            return list(self.dictionary.suggest(word))
        except Exception:
            logger.exception("Error getting suggestions for %r", word)
            return []


class SpellCheckerService:
    def __init__(self):
        self._checkers: dict[str, SpellChecker] = {}

    def get_spell_checker(self, lang_code: str = FALLBACK_LANGUAGE) -> SpellChecker:
        try:
            if lang_code not in self._checkers or self._checkers[lang_code].lang_code != lang_code:
                self._checkers[lang_code] = SpellChecker(lang_code=lang_code)
            return self._checkers[lang_code]
        except Exception:
            logger.exception("Error getting spell checker for %s", lang_code)
            return SpellChecker(lang_code=FALLBACK_LANGUAGE)


spell_checker_service = SpellCheckerService()
