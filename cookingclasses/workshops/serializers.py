from django.conf import settings
from rest_framework import serializers

from users.serializers import CustomUserSerializer
from .models import (
    Cuisine,
    Restaurant,
    Chef,
    RestaurantImage,
    MasterClass,
    Record,
    Review,
    Video,
    Like,
    Comment,
)
from django.contrib.auth import get_user_model


class CuisineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuisine
        fields = "__all__"


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = "__all__"


class ChefSerializer(serializers.ModelSerializer):
    masterclasses_count = serializers.SerializerMethodField()
    restaurant_data = serializers.SerializerMethodField()

    class Meta:
        model = Chef
        fields = [
            "id",
            "first_name",
            "last_name",
            "profession",
            "biography",
            "restaurant",
            "restaurant_data",
            "image",
            "created_at",
            "masterclasses_count",
        ]
        extra_kwargs = {
            "restaurant": {"write_only": True}
        }

    def get_masterclasses_count(self, obj):
        return obj.masterclass_set.count()

    def get_restaurant_data(self, obj):
        restaurant_serializer = self.context.get(
            "restaurant_serializer",
            RestaurantSerializer(obj.restaurant, context=self.context),
        )

        if isinstance(restaurant_serializer, serializers.BaseSerializer):
            return restaurant_serializer.data

        return restaurant_serializer


class RestaurantImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantImage
        fields = "__all__"


class MasterClassSerializer(serializers.ModelSerializer):
    is_upcoming = serializers.SerializerMethodField()
    days_until_event = serializers.SerializerMethodField()
    date_event = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S")
    cuisine = CuisineSerializer(read_only=True)
    restaurant = RestaurantSerializer(read_only=True)
    chefs = ChefSerializer(many=True, read_only=True)

    class Meta:
        model = MasterClass
        fields = "__all__"

    def get_is_upcoming(self, obj):
        return obj.is_upcoming

    def get_days_until_event(self, obj):
        return obj.days_until_event


class RecordSerializer(serializers.ModelSerializer):
    master_class = MasterClassSerializer(read_only=True)

    class Meta:
        model = Record
        fields = "__all__"


class ReviewSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "user", "master_class", "rating", "comment", "created_at"]


class VideoSerializer(serializers.ModelSerializer):
    likes_count = serializers.ReadOnlyField(source="calculated_likes_count")
    comments_count = serializers.ReadOnlyField(source="calculated_comments_count")
    is_new = serializers.ReadOnlyField()
    actual_likes_count = serializers.IntegerField(read_only=True)
    url = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id",
            "title",
            "description",
            "duration",
            "video",
            "likes_count",
            "actual_likes_count",
            "comments_count",
            "created_at",
            "updated_at",
            "is_new",
            "url",
        ]

    def get_url(self, obj):
        return obj.get_absolute_url()

    def get_duration(self, obj):
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        return "00:00:00"


class LikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Like
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    video = serializers.PrimaryKeyRelatedField(queryset=Video.objects.all())

    class Meta:
        model = Comment
        fields = ["id", "user", "video", "text", "created_at"]
