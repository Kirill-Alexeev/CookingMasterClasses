from typing import Union, Optional, Dict, Any
from rest_framework import serializers
from django.db.models import QuerySet
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
        fields = [
            "id",
            "name",
            "description",
            "address",
            "phone",
            "email",
            "website",
            "opening_hours",
            "first_image",
            "images",
        ]

    def get_first_image(self, obj: Restaurant) -> Optional[str]:
        """
        Получает URL первого изображения ресторана.

        Args:
            obj (Restaurant): Объект ресторана.

        Returns:
            Optional[str]: URL первого изображения или None, если изображений нет.
        """
        return getattr(obj, "_first_image", None)


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


    def get_master_classes_count(self, obj):
        return obj.master_classes.count()

    def get_restaurant_data(self, obj: Chef) -> Union[Dict[str, Any], None]:
        """
        Получает сериализованные данные о ресторане шеф-повара.

        Args:
            obj (Chef): Объект шеф-повара.

        Returns:
            Union[Dict[str, Any], None]: Сериализованные данные ресторана или None, если ресторан не указан.
        """
        if obj.restaurant_id:
            restaurants_data = self.context.get("restaurants_data", {})
            if obj.restaurant_id not in restaurants_data:
                # Сериализуем только необходимые поля, избегая повторных запросов
                restaurant = Restaurant.objects.prefetch_related("images").get(
                    id=obj.restaurant_id
                )
                restaurants_data[obj.restaurant_id] = RestaurantSerializer(
                    restaurant, context=self.context
                ).data
            return restaurants_data[obj.restaurant_id]
        return None


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

    def get_is_upcoming(self, obj: MasterClass) -> bool:
        """
        Проверяет, является ли мастер-класс предстоящим.

        Args:
            obj (MasterClass): Объект мастер-класса.

        Returns:
            bool: True, если мастер-класс в будущем, иначе False.
        """
        return obj.is_upcoming

    def get_days_until_event(self, obj: MasterClass) -> int:
        """
        Возвращает количество дней до мастер-класса.

        Args:
            obj (MasterClass): Объект мастер-класса.

        Returns:
            int: Количество дней до мероприятия, 0 если событие прошло.
        """
        return obj.days_until_event


class RecordSerializer(serializers.ModelSerializer):
    master_class__id = serializers.IntegerField(
        source="master_class.id", read_only=True
    )
    master_class__title = serializers.CharField(
        source="master_class.title", read_only=True
    )

    class Meta:
        model = Record
        fields = [
            "id",
            "master_class",
            "master_class__id",
            "master_class__title",
            "payment_status",
            "email",
            "phone",
            "tickets",
            "total_price",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Проверяет корректность данных для записи на мастер-класс.

        Args:
            data (Dict[str, Any]): Данные для валидации (master_class, tickets, total_price, email, phone).

        Returns:
            Dict[str, Any]: Проверенные данные.

        Raises:
            serializers.ValidationError: Если данные не прошли валидацию (недостаточно мест, неверный email, телефон или total_price).
        """
        import re

        master_class = data.get("master_class")
        tickets = data.get("tickets", 1)
        total_price = data.get("total_price")
        if master_class.seats_available < tickets:
            raise serializers.ValidationError(
                f"Доступно только {master_class.seats_available} мест"
            )
        if total_price != master_class.price * tickets:
            raise serializers.ValidationError(
                "Итоговая стоимость не соответствует количеству билетов"
            )
        email = data.get("email")
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
            raise serializers.ValidationError("Некорректный email")
        phone = data.get("phone")
        if not re.match(r"^\+?\d{10,15}$", phone):
            raise serializers.ValidationError("Некорректный номер телефона")
        return data

    def create(self, validated_data: Dict[str, Any]) -> Record:
        """
        Создаёт новую запись на мастер-класс.

        Args:
            validated_data (Dict[str, Any]): Проверенные данные для создания записи.

        Returns:
            Record: Созданный объект записи.

        Raises:
            serializers.ValidationError: Если создание записи не удалось.
        """
        return Record.objects.create(**validated_data)


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

    def create(self, validated_data: Dict[str, Any]) -> Review:
        """
        Создаёт новый отзыв для мастер-класса.

        Args:
            validated_data (Dict[str, Any]): Проверенные данные для создания отзыва.

        Returns:
            Review: Созданный объект отзыва.

        Raises:
            serializers.ValidationError: Если мастер-класс не найден или произошла ошибка при создании.
        """
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

    def get_url(self, obj: Video) -> str:
        """
        Получает абсолютный URL видео.

        Args:
            obj (Video): Объект видео.

        Returns:
            str: Абсолютный URL видео.
        """
        return obj.get_absolute_url()

    def get_duration(self, obj: Video) -> str:
        """
        Форматирует длительность видео в строку формата HH:MM:SS.

        Args:
            obj (Video): Объект видео.

        Returns:
            str: Форматированная длительность видео или '00:00:00', если длительность не указана.
        """
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

    def create(self, validated_data: Dict[str, Any]) -> Like:
        """
        Создаёт новый лайк для видео.

        Args:
            validated_data (Dict[str, Any]): Проверенные данные для создания лайка.

        Returns:
            Like: Созданный объект лайка.

        Raises:
            serializers.ValidationError: Если видео не найдено, лайк уже существует или произошла ошибка.
        """
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

    def create(self, validated_data: Dict[str, Any]) -> Comment:
        """
        Создаёт новый комментарий для видео.

        Args:
            validated_data (Dict[str, Any]): Проверенные данные для создания комментария.

        Returns:
            Comment: Созданный объект комментария.

        Raises:
            serializers.ValidationError: Если видео не найдено или произошла ошибка.
        """
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
