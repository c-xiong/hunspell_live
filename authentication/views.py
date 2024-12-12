from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.contrib.auth.hashers import make_password
from django.http import HttpResponse
from .serializers import RegisterSerializer  # Ensure you have a serializer for registration
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from allauth.socialaccount.models import SocialAccount
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .mixins import CookieMixin
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Profile

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully"}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Add a new class for login using TokenObtainPairView
class LoginView(CookieMixin, TokenObtainPairView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            request.data['username'] = user.username
        except User.DoesNotExist:
            return Response(
                {"error": "No user found with this email"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
        return super().post(request, *args, **kwargs)

# 添加自定义的 TokenRefreshView
class CustomTokenRefreshView(CookieMixin, TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        if not refresh_token:
            return Response(
                {"error": "No refresh token found in cookies"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        request.data['refresh'] = refresh_token
        return super().post(request, *args, **kwargs)

def home(request):
    try:
        return HttpResponse("Welcome to the Home Page")
    except Exception as e:
        return HttpResponse(
            "Service temporarily unavailable", 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    profile = getattr(user, 'profile', None)
    
    user_data = {
        'username': user.username,
        'email': user.email,
    }
    
    if profile:
        user_data.update({
            'age': profile.age,
            'gender': dict(Profile.GENDER_CHOICES).get(profile.gender),
            'education': dict(Profile.EDUCATION_CHOICES).get(profile.education),
            'mother_languages': list(profile.mother_languages.values_list('code', flat=True))
        })
    
    try:
        google_account = SocialAccount.objects.get(user=user, provider='google')
        extra_data = google_account.extra_data
        user_data.update({
            'google_id': extra_data.get('sub'),
            'picture': extra_data.get('picture'),
        })
    except SocialAccount.DoesNotExist:
        pass
        
    return Response(user_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
    if not refresh_token:
        return Response(
            {"error": "No refresh token found"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    token = RefreshToken(refresh_token)
    token.blacklist()
    
    response = Response(
        {"message": "Successfully logged out."}, 
        status=status.HTTP_200_OK
    )
    response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
    return response

def google_login(request):
    return redirect('accounts/google/login/')
