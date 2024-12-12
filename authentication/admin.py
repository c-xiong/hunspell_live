from django.contrib import admin
from .models import Profile

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'gender', 'education')
    search_fields = ('user__username', 'gender', 'education')
    list_filter = ('gender', 'education')

admin.site.register(Profile, ProfileAdmin)
