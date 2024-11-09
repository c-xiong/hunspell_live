from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.spell_checker_service import spell_checker_service

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
            suggestions[word] = word_suggestions[:5] if word_suggestions else []
        
        return Response(
            {
                "suggestions": suggestions,
                "language": language
            },
            status=status.HTTP_200_OK
        )
