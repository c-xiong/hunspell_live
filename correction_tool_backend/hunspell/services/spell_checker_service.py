from ..spell_checker import SpellChecker

class SpellCheckerService:
    def __init__(self):
        self.spell_checkers = {}
    
    def get_spell_checker(self, lang_code='en_US'):
        try:
            # Create new spell checker instance if language not cached
            if lang_code not in self.spell_checkers:
                self.spell_checkers[lang_code] = SpellChecker(lang_code=lang_code)
            return self.spell_checkers[lang_code]
        except Exception as e:
            print(f"Error getting spell checker: {str(e)}")
            # Fallback to English if there's an error
            return SpellChecker(lang_code='en_US')

    def check_spelling(self, word, lang_code='en_US'):
        spell_checker = self.get_spell_checker(lang_code)
        return spell_checker.check_text(word)

    def get_suggestions(self, word, lang_code='en_US'):
        try:
            spell_checker = self.get_spell_checker(lang_code)
            suggestions = spell_checker.get_suggestions(word)
            return suggestions if suggestions else []
        except Exception as e:
            print(f"Error getting suggestions for word '{word}': {str(e)}")
            return []

spell_checker_service = SpellCheckerService()

