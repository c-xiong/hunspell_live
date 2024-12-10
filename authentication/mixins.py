from django.conf import settings
from django.utils.functional import SimpleLazyObject
from rest_framework_simplejwt.tokens import RefreshToken

class CookieMixin:
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get('refresh'):
            cookie_max_age = settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
            response.set_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE'],
                response.data['refresh'],
                max_age=cookie_max_age,
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
            )
            # 从响应数据中删除 refresh token
            del response.data['refresh']
        return super().finalize_response(request, response, *args, **kwargs) 