from rest_framework import serializers
from django.contrib.auth.models import User
from authentication.models import Profile

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)
    birthdate = serializers.DateField(required=False)
    gender = serializers.ChoiceField(choices=['female', 'male', 'non-binary', 'prefer not to say'], required=False)
    education = serializers.ChoiceField(
        choices=[
            'no formal education',
            'elementary school',
            'middle school',
            'high school',
            'some college',
            'associate degree',
            'bachelor degree',
            'master degree',
            'professional degree',
            'doctorate'
        ],
        required=False
    )

    class Meta:
        model = User
        fields = ['email', 'password', 'birthdate', 'gender', 'education']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        # Extract profile data
        birthdate = validated_data.pop('birthdate', None)
        gender = validated_data.pop('gender', None)
        education = validated_data.pop('education', None)

        # Create user
        username = validated_data['email'].split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Create profile
        gender_map = {
            'female': 'F',
            'male': 'M',
            'non-binary': 'N',
            'prefer not to say': 'P'
        }

        education_map = {
            'no formal education': 'NO',
            'elementary school': 'ES',
            'middle school': 'MS',
            'high school': 'HS',
            'some college': 'SC',
            'associate degree': 'AS',
            'bachelor degree': 'BS',
            'master degree': 'MS',
            'professional degree': 'PD',
            'doctorate': 'PhD'
        }

        Profile.objects.create(
            user=user,
            birthdate=birthdate,
            gender=gender_map.get(gender, 'P'),
            education=education_map.get(education, '')
        )

        return user
