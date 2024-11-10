from spylls.hunspell import Dictionary
import os
from pathlib import Path

class SpellChecker:
    SUPPORTED_LANGUAGES = {'en_US', 'es_ES', 'fr_FR', 'de_DE', 'pt_PT', 'it_IT'}  # Updated to match full locale codes

    def __init__(self, language='en_US'):
        try:
            if language not in self.SUPPORTED_LANGUAGES:
                print(f"Warning: Language '{language}' not supported. Falling back to English.")
                language = 'en_US'
            
            # Get the base directory path
            base_dir = Path(__file__).parent
            dict_path = base_dir / 'dicts' / language / language
            
            # Initialize Spylls Dictionary with specified language
            self.spell = Dictionary.from_files(str(dict_path))
            
            if not self.spell:
                raise ValueError(f"Failed to initialize Dictionary for language: {language}")
                
        except Exception as e:
            print(f"Error initializing Dictionary: {str(e)}")
            # Fallback to English if there's an error
            fallback_path = base_dir / 'dicts' / 'en_US' / 'en_US'
            self.spell = Dictionary.from_files(str(fallback_path))

    def check_text(self, text):
        try:
            # Handle empty strings
            if not text.strip():
                return False
                
            # Remove extra whitespace but preserve case
            word = text.strip()
            result = self.spell.lookup(word)
            
            # If initial check fails, try lowercase version as fallback
            if not result:
                result = self.spell.lookup(word.lower())
            
            return bool(result)
            
        except Exception as e:
            print(f"Error checking text: {str(e)}")
            return False

    def get_suggestions(self, word):
        try:
            # Returns a list of suggested corrections for the given word
            suggestions = list(self.spell.suggest(word))
            return suggestions if suggestions else []
        except Exception as e:
            print(f"Error getting suggestions: {str(e)}")
            return []
