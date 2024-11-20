from django.db import models
from django.contrib.auth.models import User

class PersonalDictionary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    word = models.CharField(max_length=100)
    lang_code = models.CharField(max_length=10)  # e.g., 'en_US', 'de_DE'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'word', 'lang_code']
        verbose_name_plural = "Personal dictionaries"

    def __str__(self):
        return f"{self.user.username}'s {self.lang_code} dictionary - {self.word}" 