from django.urls import path
from .views import RegisterView, LoginView, CustomTokenRefreshView, home, user_info, logout_view, google_login

urlpatterns = [
    path('', home, name='home'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/user/', user_info, name='user_info'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/google/', google_login, name='google_login'),
]
