from rest_framework import serializers
from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    isAdmin = serializers.BooleanField(source="is_staff", read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "image",
            "first_name",
            "last_name",
            "isAdmin",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ["username", "email", "password", "image", "first_name", "last_name"]

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            image=validated_data.get("image", None),
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        return user
