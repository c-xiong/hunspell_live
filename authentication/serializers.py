from rest_framework import serializers
from django.contrib.auth.models import User
from authentication.models import Profile, Language
from django.conf.global_settings import LANGUAGES

def get_all_languages():
    return [code for code, name in LANGUAGES]

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)
    age = serializers.IntegerField(required=False)
    gender = serializers.ChoiceField(
        choices=['female', 'male', 'non-binary', 'na'],
        required=False
    )
    education = serializers.ChoiceField(
        choices=[
            'high_school_or_less',
            'college',
            'bachelor',
            'graduate'
        ],
        required=False
    )
    mother_languages = serializers.ListField(
        child=serializers.CharField(max_length=2),
        required=False
    )

    class Meta:
        model = User
        fields = ['email', 'password', 'age', 'gender', 'education', 'mother_languages']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_mother_languages(self, value):
        # Get language codes from LANGUAGE_CHOICES in frontend
        valid_codes = [
            'ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae', 'ay', 'az',
            'bm', 'ba', 'eu', 'be', 'bn', 'bh', 'bi', 'bs', 'br', 'bg', 'my', 'ca', 'km', 'ch',
            'ce', 'zh', 'cu', 'cv', 'kw', 'co', 'cr', 'hr', 'cs', 'da', 'dv', 'nl', 'dz', 'en',
            'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fr', 'ff', 'gd', 'gl', 'lg', 'ka', 'de', 'el',
            'gn', 'gu', 'ht', 'ha', 'he', 'hz', 'hi', 'ho', 'hu', 'is', 'io', 'ig', 'id', 'ia',
            'ie', 'iu', 'ik', 'ga', 'it', 'ja', 'jv', 'kl', 'kn', 'kr', 'ks', 'kk', 'ki', 'rw',
            'ky', 'kv', 'kg', 'ko', 'kj', 'ku', 'lo', 'la', 'lv', 'li', 'ln', 'lt', 'lu', 'lb',
            'mk', 'mg', 'ms', 'ml', 'mt', 'gv', 'mi', 'mr', 'mh', 'mn', 'na', 'nv', 'ng', 'ne',
            'nd', 'se', 'no', 'nb', 'nn', 'ny', 'oc', 'oj', 'or', 'om', 'os', 'pi', 'pa', 'fa',
            'pl', 'pt', 'ps', 'qu', 'ro', 'rm', 'rn', 'ru', 'sm', 'sg', 'sa', 'sc', 'sr', 'sn',
            'ii', 'sd', 'si', 'sk', 'sl', 'so', 'nr', 'st', 'es', 'su', 'sw', 'ss', 'sv', 'tl',
            'ty', 'tg', 'ta', 'tt', 'te', 'th', 'bo', 'ti', 'to', 'ts', 'tn', 'tr', 'tk', 'tw',
            'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'fy', 'wo', 'xh', 'yi', 'yo',
            'za', 'zu'
        ]
        invalid_codes = [code for code in value if code not in valid_codes]
        if invalid_codes:
            raise serializers.ValidationError(
                f"Invalid language code(s): {', '.join(invalid_codes)}"
            )
        return value

    def create(self, validated_data):
        # Extract profile data
        age = validated_data.pop('age', None)
        gender = validated_data.pop('gender', None)
        education = validated_data.pop('education', None)
        mother_languages = validated_data.pop('mother_languages', [])

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

        # Create profile with mapped values
        gender_map = {
            'female': 'F',
            'male': 'M',
            'non-binary': 'N',
            'na': 'NA'
        }

        education_map = {
            'high_school_or_less': 'NO',
            'college': 'CO',
            'bachelor': 'BS',
            'graduate': 'GR'
        }

        profile = Profile.objects.create(
            user=user,
            age=age,
            gender=gender_map.get(gender, 'P'),
            education=education_map.get(education, '')
        )

        # Add mother languages (simplified to only store codes)
        for lang_code in mother_languages:
            language, _ = Language.objects.get_or_create(
                code=lang_code,
                defaults={'name': dict(LANGUAGES).get(lang_code, lang_code)}  # Use code as fallback name
            )
            profile.mother_languages.add(language)

        return user
