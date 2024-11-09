from ..spell_checker import PySpellChecker

class SpellCheckerService:
    def __init__(self):
        self.spell_checkers = {}
    
    def get_spell_checker(self, language='en_US'):
        try:
            # Create new spell checker instance if language not cached
            if language not in self.spell_checkers:
                self.spell_checkers[language] = PySpellChecker(language=language)
            return self.spell_checkers[language]
        except Exception as e:
            print(f"Error getting spell checker: {str(e)}")
            # Fallback to English if there's an error
            return PySpellChecker(language='en_US')

    def check_spelling(self, word, language='en_US'):
        spell_checker = self.get_spell_checker(language)
        return spell_checker.check_text(word)

    def get_suggestions(self, word, language='en_US'):
        try:
            spell_checker = self.get_spell_checker(language)
            suggestions = spell_checker.get_suggestions(word)
            return suggestions if suggestions else []
        except Exception as e:
            print(f"Error getting suggestions for word '{word}': {str(e)}")
            return []

spell_checker_service = SpellCheckerService()

