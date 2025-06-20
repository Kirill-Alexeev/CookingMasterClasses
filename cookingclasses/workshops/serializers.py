from rest_framework import serializers
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
from users.serializers import CustomUserSerializer


class CuisineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuisine
        fields = "__all__"


class RestaurantImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantImage
        fields = ["id", "image", "restaurant"]


class RestaurantSerializer(serializers.ModelSerializer):
    first_image = serializers.SerializerMethodField()
    images = RestaurantImageSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = ["id", "name", "description", "address", "phone", "email", "website", "opening_hours", "first_image", "images"]

    def get_first_image(self, obj):
        first_image = obj.images.values_list("image", flat=True).first()
        return first_image if first_image else None


class ChefSerializer(serializers.ModelSerializer):
    restaurant_data = serializers.SerializerMethodField()
    master_classes_count = serializers.IntegerField(read_only=True)

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
            "master_classes_count",
        ]
        extra_kwargs = {"restaurant": {"write_only": True}}

    def get_restaurant_data(self, obj):
        restaurant_serializer = self.context.get(
            "restaurant_serializer",
            RestaurantSerializer(obj.restaurant, context=self.context),
        )
        if isinstance(restaurant_serializer, serializers.BaseSerializer):
            return restaurant_serializer.data
        return restaurant_serializer


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


class RecordSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    master_class__id = serializers.IntegerField(
        source="master_class.id", read_only=True
    )
    master_class__title = serializers.CharField(
        source="master_class.title", read_only=True
    )
    payment_status = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        master_class_data = validated_data.pop("master_class", {})
        master_class_id = master_class_data.get("id")
        master_class = MasterClass.objects.get(id=master_class_id)
        return Record.objects.create(
            master_class=master_class,
            user=self.context["request"].user,
            **validated_data,
        )


class ReviewSerializer(serializers.ModelSerializer):
    master_class__id = serializers.IntegerField(
        source="master_class.id", read_only=True
    )
    master_class__title = serializers.CharField(
        source="master_class.title", read_only=True
    )
    user = CustomUserSerializer(read_only=True, allow_null=True)
    master_class = serializers.PrimaryKeyRelatedField(
        queryset=MasterClass.objects.all()
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "master_class",
            "master_class__id",
            "master_class__title",
            "rating",
            "comment",
            "created_at",
            "user",
        ]

    def create(self, validated_data):
        try:
            master_class = validated_data.pop("master_class")
            print("Создание отзыва:", validated_data, "Master class:", master_class)
            review = Review.objects.create(
                master_class=master_class,
                user=self.context["request"].user,
                **validated_data,
            )
            print("Отзыв создан:", review.id)
            return review
        except MasterClass.DoesNotExist:
            raise serializers.ValidationError("Мастер-класс с указанным ID не найден")
        except Exception as e:
            print("Ошибка в ReviewSerializer.create:", str(e))
            raise serializers.ValidationError(f"Ошибка при создании отзыва: {str(e)}")


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
    video__id = serializers.IntegerField(source="video.id", read_only=True)
    video__title = serializers.CharField(source="video.title", read_only=True)
    user = CustomUserSerializer(read_only=True, allow_null=True)
    video = serializers.PrimaryKeyRelatedField(queryset=Video.objects.all())

    class Meta:
        model = Like
        fields = ["id", "video", "video__id", "video__title", "created_at", "user"]
        read_only_fields = ["id", "created_at", "user"]

    def create(self, validated_data):
        try:
            video = validated_data.pop("video")
            print("Создание лайка:", validated_data, "Video:", video)
            like, created = Like.objects.get_or_create(
                video=video, user=self.context["request"].user, defaults=validated_data
            )
            if not created:
                raise serializers.ValidationError("Лайк уже существует")
            print("Лайк создан:", like.id)
            return like
        except Video.DoesNotExist:
            raise serializers.ValidationError("Видео с указанным ID не найдено")
        except Exception as e:
            print("Ошибка в LikeSerializer.create:", str(e))
            raise serializers.ValidationError(f"Ошибка при создании лайка: {str(e)}")


class CommentSerializer(serializers.ModelSerializer):
    video = serializers.PrimaryKeyRelatedField(queryset=Video.objects.all())
    user = CustomUserSerializer(read_only=True, allow_null=True)

    class Meta:
        model = Comment
        fields = ["id", "video", "text", "created_at", "user"]
        read_only_fields = ["id", "created_at", "user"]

    def create(self, validated_data):
        try:
            video = validated_data.pop("video")
            print("Создание комментария:", validated_data, "Video:", video)
            comment = Comment.objects.create(
                video=video, user=self.context["request"].user, **validated_data
            )
            print("Комментарий создан:", comment.id)
            return comment
        except Video.DoesNotExist:
            raise serializers.ValidationError("Видео с указанным ID не найдено")
        except Exception as e:
            print("Ошибка в CommentSerializer.create:", str(e))
            raise serializers.ValidationError(
                f"Ошибка при создании комментария: {str(e)}"
            )
