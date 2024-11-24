from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from ..models import PersonalDictionary

class PersonalStarlistService:
    @staticmethod
    def add_word(user: User, word: str, lang_code: str) -> bool:
        """
        Add a word to user's personal starlist for a specific language
        
        Args:
            user: The authenticated user
            word: The word to add to the starlist
            lang_code: Language code (e.g., 'en_US', 'de_DE')
            
        Returns:
            bool: True if word was added successfully
            
        Raises:
            ValidationError: If word is invalid or already exists
        """
        if not word or not word.strip():
            raise ValidationError("Word cannot be empty")

        if not lang_code:
            raise ValidationError("Language must be specified")

        word = word.strip().lower()
        
        # Check if word already exists in user's starlist for this language
        if PersonalDictionary.objects.filter(
            user=user, 
            word=word,
            lang_code=lang_code,
            word_type='starlist'
        ).exists():
            raise ValidationError(f"Word already exists in your {lang_code} starlist")

        # Create new starlist entry
        PersonalDictionary.objects.create(
            user=user,
            word=word,
            lang_code=lang_code,
            word_type='starlist'
        )
        return True

    @staticmethod
    def get_user_starlist(user: User, lang_code: str) -> list:
        """
        Get all words in user's personal starlist for a specific language
        
        Args:
            user: The authenticated user
            lang_code: Language code (e.g., 'en_US', 'de_DE')
            
        Returns:
            list: List of words in user's starlist for the specified language
            
        Raises:
            ValidationError: If starlist doesn't exist for the specified language
        """
        # First check if the language exists for this user
        if not PersonalDictionary.objects.filter(
            user=user, 
            lang_code=lang_code,
            word_type='starlist'
        ).exists():
            raise ValidationError(f"No starlist exists for language '{lang_code}'")
        
        return PersonalDictionary.objects.filter(
            user=user,
            lang_code=lang_code,
            word_type='starlist'
        ).values_list('word', flat=True)

    @staticmethod
    def remove_word(user: User, word: str, lang_code: str) -> bool:
        """
        Remove a word from user's personal starlist for a specific language
        
        Args:
            user: The authenticated user
            word: The word to remove
            lang_code: Language code (e.g., 'en_US', 'de_DE')
            
        Returns:
            bool: True if word was removed successfully
            
        Raises:
            ValidationError: If word doesn't exist in starlist
        """
        word = word.strip().lower()
        result = PersonalDictionary.objects.filter(
            user=user, 
            word=word,
            lang_code=lang_code
        ).delete()
        if result[0] == 0:
            raise ValidationError(f"Word not found in your {lang_code} starlist")
        return True

    @staticmethod
    def get_user_languages(user: User) -> list:
        """
        Get all languages for which the user has a personal starlist
        
        Args:
            user: The authenticated user
            
        Returns:
            list: List of language codes that have at least one word
        """
        return PersonalDictionary.objects.filter(
            user=user,
            word_type='starlist'
        ).values_list('lang_code', flat=True).distinct()
