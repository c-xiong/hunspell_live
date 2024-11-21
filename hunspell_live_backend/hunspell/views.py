from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.spell_check_service import spell_checker_service
from rest_framework.permissions import IsAuthenticated
from .services.personal_dict_service import PersonalDictionaryService
from django.core.exceptions import ValidationError

class SpellCheckerView(APIView):
    def post(self, request):
        words = request.data.get('words')
        language = request.data.get('language', 'en_US')
        
        if not words or not isinstance(words, list):
            return Response(
                {"error": "A list of words is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        spell_checker = spell_checker_service.get_spell_checker(language)
        results = []
        for word in words:
            is_correct = spell_checker.check_text(word)
            results.append({
                "word": word,
                "is_correct": is_correct
            })
        
        return Response(
            {
                "results": results,
                "language": language
            },
            status=status.HTTP_200_OK
        )

class SpellCorrectionView(APIView):
    def post(self, request):
        words = request.data.get('words')
        language = request.data.get('language', 'en_US')
        
        if not words or not isinstance(words, list):
            return Response(
                {"error": "A list of words is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        spell_checker = spell_checker_service.get_spell_checker(language)
        suggestions = {}
        for word in words:
            word_suggestions = spell_checker.get_suggestions(word)
            filtered_suggestions = [s for s in word_suggestions if s != word]
            suggestions[word] = filtered_suggestions if filtered_suggestions else []
        
        return Response(
            {
                "suggestions": suggestions,
                "language": language
            },
            status=status.HTTP_200_OK
        )

class PersonalDictionaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        language = request.query_params.get('language')
        
        if 'languages' in request.path:
            languages = PersonalDictionaryService.get_user_languages(request.user)
            return Response({"languages": list(languages)})
            
        if not language:
            return Response(
                {"error": "Language parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        words = PersonalDictionaryService.get_user_dictionary(request.user, language)
        return Response({"words": list(words)})
    
    def post(self, request):
        word = request.data.get('word')
        language = request.data.get('language', 'en_US')
        
        if not word or not isinstance(word, str):
            return Response(
                {"error": "A word string is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            PersonalDictionaryService.add_word(request.user, word, language)
            return Response(
                {
                    "message": f"Word '{word}' added to personal dictionary",
                    "language": language
                },
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "Failed to add word to personal dictionary"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request):
        word = request.data.get('word')
        language = request.data.get('language', 'en_US')
        
        if not word or not isinstance(word, str):
            return Response(
                {"error": "A word string is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            PersonalDictionaryService.remove_word(request.user, word, language)
            return Response(
                {
                    "message": f"Word '{word}' removed from personal dictionary",
                    "language": language
                },
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "Failed to remove word from personal dictionary"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
