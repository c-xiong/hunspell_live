from django.contrib import admin
from .models import PersonalDictionary, WordReplacement

@admin.register(PersonalDictionary)
class PersonalDictionaryAdmin(admin.ModelAdmin):
    list_display = ('user', 'word', 'lang_code', 'word_type', 'created_at')
    list_filter = ('lang_code', 'word_type', 'created_at')
    search_fields = ('user__username', 'word', 'lang_code')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

@admin.register(WordReplacement)
class WordReplacementAdmin(admin.ModelAdmin):
    list_display = ('original_word', 'replacement_word', 'lang_code', 'created_at')
    list_filter = ('lang_code', 'created_at')
    search_fields = ('original_word', 'replacement_word', 'lang_code')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    def get_readonly_fields(self, request, obj=None):
        # 如果是编辑现有对象，所有字段都设为只读
        if obj:
            return ['original_word', 'replacement_word', 'lang_code', 'created_at']
        return []
