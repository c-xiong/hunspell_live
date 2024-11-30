from django.db import models
from django.contrib.auth.models import User

class PersonalDictionary(models.Model):
    WORD_TYPE_CHOICES = [
        ('dictionary', 'Dictionary'),
        ('starlist', 'Star List'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    word = models.CharField(max_length=100)
    lang_code = models.CharField(max_length=10)  # e.g., 'en_US', 'de_DE'
    word_type = models.CharField(
        max_length=10, 
        choices=WORD_TYPE_CHOICES,
        default='dictionary'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'word', 'lang_code', 'word_type']
        verbose_name_plural = "Personal dictionaries"

    def __str__(self):
        return f"{self.user.username}'s {self.lang_code} dictionary - {self.word}" 

class WordReplacement(models.Model):
    original_word = models.CharField(max_length=100)
    replacement_word = models.CharField(max_length=100)
    lang_code = models.CharField(max_length=10)  # e.g., 'en_US', 'de_DE'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.original_word} -> {self.replacement_word} ({self.lang_code})" 