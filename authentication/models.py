from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    GENDER_CHOICES = [
        ('F', 'Female'),
        ('M', 'Male'),
        ('N', 'Non-binary'),
        ('P', 'Prefer not to say'),
    ]

    EDUCATION_CHOICES = [
        ('NO', 'No formal education'),
        ('ES', 'Elementary School'),
        ('MS', 'Middle School'),
        ('HS', 'High School'),
        ('SC', 'Some College'),
        ('AS', 'Associate Degree'),
        ('BS', "Bachelor's Degree"),
        ('MS', "Master's Degree"),
        ('PD', 'Professional Degree'),
        ('PhD', 'Doctorate'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    birthdate = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    education = models.CharField(max_length=3, choices=EDUCATION_CHOICES, blank=True)

    def __str__(self):
        return self.user.username
