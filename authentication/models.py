from django.db import models
from django.contrib.auth.models import User

class Language(models.Model):
    code = models.CharField(max_length=2, primary_key=True)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Profile(models.Model):
    GENDER_CHOICES = [
        ('F', 'Female'),
        ('M', 'Male'),
        ('N', 'Non-binary'),
        ('NA', 'Prefer not to say'),
    ]

    EDUCATION_CHOICES = [
        ('NO', 'high_school_or_less'),
        ('CO', 'college'),
        ('BS', "bachelor"),
        ('GR', "graduate"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=2, choices=GENDER_CHOICES, blank=True)
    education = models.CharField(max_length=3, choices=EDUCATION_CHOICES, blank=True)
    mother_languages = models.ManyToManyField(Language, blank=True)

    def __str__(self):
        return self.user.username
