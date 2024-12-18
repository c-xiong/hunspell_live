from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .services.personal_starlist_service import PersonalStarlistService
from .services.personal_dictionary_service import PersonalDictionaryService
from .services.spell_check_service import spell_checker_service
from .models import WordReplacement
from rest_framework_simplejwt.authentication import JWTAuthentication

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

class PersonalStarlistView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        language = request.query_params.get('language')
        
        if 'languages' in request.path:
            languages = PersonalStarlistService.get_user_languages(request.user)
            return Response({"languages": list(languages)})
            
        if not language:
            return Response(
                {"error": "Language parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            words = PersonalStarlistService.get_user_starlist(request.user, language)
            return Response({"words": list(words)})
        except (DjangoValidationError, DRFValidationError) as e:
            error_message = str(e.detail[0]) if hasattr(e, 'detail') else str(e)
            return Response(
                {"error": error_message},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        if 'remove' in request.path:
            return self.delete(request)
            
        word = request.data.get('word')
        language = request.data.get('language', 'en_US')
        
        if not word or not isinstance(word, str):
            return Response(
                {"error": "A word string is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            PersonalStarlistService.add_word(request.user, word, language)
            return Response(
                {
                    "message": f"Word '{word}' added to personal starlist",
                    "language": language
                },
                status=status.HTTP_200_OK
            )
        except (DjangoValidationError, DRFValidationError) as e:
            error_message = str(e.detail[0]) if hasattr(e, 'detail') else str(e)
            return Response(
                {"error": error_message},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
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
            PersonalStarlistService.remove_word(request.user, word, language)
            return Response(
                {
                    "message": f"Word '{word}' removed from personal starlist",
                    "language": language
                },
                status=status.HTTP_200_OK
            )
        except (DjangoValidationError, DRFValidationError) as e:
            error_message = str(e) if isinstance(e, DjangoValidationError) else str(e.detail[0])
            return Response(
                {"error": error_message},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
            
        try:
            words = PersonalDictionaryService.get_user_dictionary(request.user, language)
            return Response({"words": list(words)})
        except (DjangoValidationError, DRFValidationError) as e:
            error_message = str(e.detail[0]) if hasattr(e, 'detail') else str(e)
            return Response(
                {"error": error_message},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        if 'remove' in request.path:
            return self.delete(request)
            
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
        except (DjangoValidationError, DRFValidationError) as e:
            error_message = str(e.detail[0]) if hasattr(e, 'detail') else str(e)
            return Response(
                {"error": error_message},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
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
        except (DjangoValidationError, DRFValidationError) as e:
            error_message = str(e) if isinstance(e, DjangoValidationError) else str(e.detail[0])
            return Response(
                {"error": error_message},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class WordReplacementView(APIView):
    authentication_classes = [JWTAuthentication]  # Allow anonymous access
    permission_classes = []      # Allow anonymous access
    
    def get(self, request):
        language = request.query_params.get('language')
        
        queryset = WordReplacement.objects.all()
        if language:
            queryset = queryset.filter(lang_code=language)
            
        replacements = queryset.values(
            'original_word',
            'replacement_word',
            'lang_code',
            'created_at'
        )
        
        return Response({
            "replacements": list(replacements)
        })
    
    def post(self, request):
        original_word = request.data.get('original_word')
        replacement_word = request.data.get('replacement_word')
        language = request.data.get('language', 'en_US')
        
        if not original_word or not replacement_word:
            return Response(
                {"error": "Both original_word and replacement_word are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            replacement_data = {
                'original_word': original_word,
                'replacement_word': replacement_word,
                'lang_code': language,
            }
            
            # Add user if authenticated
            if request.user.is_authenticated:
                replacement_data['user'] = request.user
            
            WordReplacement.objects.create(**replacement_data)
            
            return Response({
                "message": "Word replacement recorded successfully",
                "original_word": original_word,
                "replacement_word": replacement_word,
                "language": language,
                "user": request.user.username if request.user.is_authenticated else None
            })
            
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AllWordReplacementsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.email != 'chenfei.xiong@outlook.com':
            return Response(
                {"error": "Permission denied. Unauthorized user."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        language = request.query_params.get('language')
        
        queryset = WordReplacement.objects.all()
        
        # Apply filters if provided
        if language:
            queryset = queryset.filter(lang_code=language)
            
        # Add user filter if authenticated
        if request.user.is_authenticated:
            queryset = queryset.filter(user=request.user)
            
        replacements = queryset.values(
            'original_word',
            'replacement_word',
            'lang_code',
            'created_at',
            'user__username'  # Include username if available
        ).order_by('-created_at')
        
        return Response({
            "count": queryset.count(),
            "replacements": list(replacements)
        })
