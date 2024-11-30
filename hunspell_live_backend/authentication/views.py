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

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            
            if not email or not password:
                return Response(
                    {"error": "Email and password are required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if email already exists
            if User.objects.filter(email=email).exists():
                return Response(
                    {"error": "User with this email already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Add password length validation
            if len(password) < 8:
                return Response(
                    {"error": "Password must be at least 8 characters long"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"message": "User created successfully"}, 
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": "Registration failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Add a new class for login using TokenObtainPairView
class LoginView(CookieMixin, TokenObtainPairView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        try:
            email = request.data.get('email')
            password = request.data.get('password')

            if not email or not password:
                return Response(
                    {"error": "Email and password are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if email:
                try:
                    user = User.objects.get(email=email)
                    request.data['username'] = user.username
                except User.DoesNotExist:
                    return Response(
                        {"error": "No user found with this email"}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
        
            try:
                response = super().post(request, *args, **kwargs)
                return response
            except Exception as e:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        except Exception as e:
            return Response(
                {"error": "Login failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# 添加自定义的 TokenRefreshView
class CustomTokenRefreshView(CookieMixin, TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
            if not refresh_token:
                return Response(
                    {"error": "No refresh token found in cookies"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            request.data['refresh'] = refresh_token
            return super().post(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"error": "Token refresh failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
    try:
        user = request.user
        # Get user's profile
        profile = getattr(user, 'profile', None)
        
        # Base user data
        user_data = {
            'username': user.username,
            'email': user.email,
        }
        
        # Add profile data if it exists
        if profile:
            user_data.update({
                'birthdate': profile.birthdate,
                'gender': profile.get_gender_display(),
                'education': profile.get_education_display(),
            })
        
        try:
            # Add Google account data if exists
            google_account = SocialAccount.objects.get(user=user, provider='google')
            extra_data = google_account.extra_data
            user_data.update({
                'google_id': extra_data.get('sub'),
                'picture': extra_data.get('picture'),
            })
        except SocialAccount.DoesNotExist:
            pass
            
        return Response(user_data)
        
    except Exception as e:
        return Response(
            {"error": "Failed to retrieve user information", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        if not refresh_token:
            return Response(
                {"error": "No refresh token found"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            return Response(
                {"error": "Invalid token", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response = Response(
            {"message": "Successfully logged out."}, 
            status=status.HTTP_200_OK
        )
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
        return response
    except Exception as e:
        return Response(
            {"error": "Logout failed", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def google_login(request):
    try:
        return redirect('accounts/google/login/')
    except Exception as e:
        return Response(
            {
                "error": "Google login redirect failed",
                "details": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
