from django.contrib import admin
from .models import Profile

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'bio')
    search_fields = ('user__username', 'location')

admin.site.register(Profile, ProfileAdmin)
