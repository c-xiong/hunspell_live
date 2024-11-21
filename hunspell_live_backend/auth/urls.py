from django.urls import path
from .views import RegisterView, LoginView, home, user_info, logout_view, google_login
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', home, name='home'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/user/', user_info, name='user_info'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/google/', google_login, name='google_login'),
]
