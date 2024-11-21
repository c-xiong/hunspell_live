from django.urls import path
from .views import SpellCheckerView, SpellCorrectionView, PersonalDictionaryView

urlpatterns = [
    path('api/check/', SpellCheckerView.as_view(), name='check_spelling'),
    path('api/get-list/', SpellCorrectionView.as_view(), name='suggest_corrections'),
    path('api/dictionary/add/', PersonalDictionaryView.as_view(), name='add_to_dictionary'),
    path('api/dictionary/remove/', PersonalDictionaryView.as_view(), name='remove_from_dictionary'),
    path('api/dictionary/words/', PersonalDictionaryView.as_view(), name='get_dictionary_words'),
    path('api/dictionary/languages/', PersonalDictionaryView.as_view(), name='get_dictionary_languages'),
]

