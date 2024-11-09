from django.urls import path
from .views import SpellCheckerView, SpellCorrectionView

urlpatterns = [
    path('api/check/', SpellCheckerView.as_view(), name='check_spelling'),
    path('api/get-list/', SpellCorrectionView.as_view(), name='suggest_corrections'),
]

