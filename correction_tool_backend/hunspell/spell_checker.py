from django.conf import settings
from spylls.hunspell import Dictionary
import os
from pathlib import Path
import json

class SpellChecker:
    # Load supported languages from JSON configuration
    config_path = Path(__file__).parent.parent / 'dicts_config.json'
    with open(config_path, 'r') as f:
        SUPPORTED_LANGUAGES = set(json.load(f).keys())

    def __init__(self, lang_code='en_US'):
        try:
            if lang_code not in self.SUPPORTED_LANGUAGES:
                print(f"Warning: Language '{lang_code}' not supported. Falling back to English.")
                lang_code = 'en_US'
            
            # Get the base directory path
            base_dir = Path(__file__).parent
            dict_dir = base_dir / 'dicts' / lang_code
            
            # Find any .aff and .dic files in the directory
            aff_files = list(dict_dir.glob("*.aff"))
            dic_files = list(dict_dir.glob("*.dic"))
            
            if not aff_files or not dic_files:
                raise ValueError(f"Could not find required dictionary files for language: {lang_code}")
                
            # Use the first matching files found
            dict_path = dic_files[0].with_suffix('')
            
            # Initialize Spylls Dictionary with specified language
            self.spell = Dictionary.from_files(str(dict_path))
            
            if not self.spell:
                raise ValueError(f"Failed to initialize Dictionary for language: {lang_code}")
                
        except Exception as e:
            print(f"Error initializing Dictionary: {str(e)}")
            # Fallback to English if there's an error
            fallback_dir = base_dir / 'dicts' / 'en_US'
            fallback_files = list(fallback_dir.glob("*.dic"))
            fallback_path = fallback_files[0].with_suffix('')
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
