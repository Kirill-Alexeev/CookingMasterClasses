from datetime import timedelta
from django.db.models import Count, Sum
from rest_framework import viewsets, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticatedOrReadOnly
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
from .serializers import (
    CuisineSerializer,
    RestaurantSerializer,
    ChefSerializer,
    RestaurantImageSerializer,
    MasterClassSerializer,
    RecordSerializer,
    ReviewSerializer,
    VideoSerializer,
    LikeSerializer,
    CommentSerializer,
)
from .filters import MasterClassFilter


class MasterClassViewSet(viewsets.ModelViewSet):
    queryset = (
        MasterClass.objects.all()
        .select_related("restaurant", "cuisine")
        .prefetch_related("masterclasschef_set", "chefs")
    )
    serializer_class = MasterClassSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = MasterClassFilter
    ordering_fields = ["title", "price", "date_event", "rating"]
    ordering = ["title"]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.distinct()


class CuisineViewSet(viewsets.ModelViewSet):
    queryset = Cuisine.objects.all()
    serializer_class = CuisineSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all().prefetch_related("images")
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Restaurant.objects.exclude(masterclass__isnull=True)


class ChefViewSet(viewsets.ModelViewSet):
    queryset = (
        Chef.objects.all()
        .select_related("restaurant")
        .prefetch_related("master_classes")
    )
    serializer_class = ChefSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class RestaurantImageViewSet(viewsets.ModelViewSet):
    queryset = RestaurantImage.objects.all().select_related("restaurant")
    serializer_class = RestaurantImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class RecordViewSet(viewsets.ModelViewSet):
    queryset = Record.objects.all().select_related("user", "master_class")
    serializer_class = RecordSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        master_class_id = request.data.get("master_class")
        try:
            master_class = MasterClass.objects.get(id=master_class_id)
        except MasterClass.DoesNotExist:
            return Response(
                {"error": "Мастер-класс не найден"}, status=status.HTTP_404_NOT_FOUND
            )

        if master_class.seats_available <= 0:
            return Response(
                {"error": "Нет свободных мест"}, status=status.HTTP_400_BAD_REQUEST
            )

        master_class.seats_available -= 1
        master_class.save()

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related("user", "master_class")
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["master_class"]


class VideoFilter(filters.FilterSet):
    max_duration_seconds = filters.NumberFilter(
        field_name="duration", lookup_expr="lte", method="filter_max_duration_seconds"
    )
    min_likes = filters.NumberFilter(field_name="likes_count", lookup_expr="gte")
    min_comments = filters.NumberFilter(field_name="comments_count", lookup_expr="gte")

    class Meta:
        model = Video
        fields = ["max_duration_seconds", "min_likes", "min_comments"]

    def filter_max_duration_seconds(self, queryset, name, value):
        max_duration = timedelta(seconds=int(value))
        return queryset.filter(duration__lte=max_duration)


class VideoViewSet(viewsets.ModelViewSet):
    queryset = (
        Video.new_videos.all()
        .prefetch_related("like_set", "comments")
        .filter(is_visible=True)
    )
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = VideoFilter

    def get_queryset(self):
        queryset = (
            super()
            .get_queryset()
            .annotate(actual_likes_count=Count("like_set", distinct=True))
        )

        # Применяем фильтры
        filter_params = self.request.query_params
        if "max_duration_seconds" in filter_params:
            try:
                max_duration = timedelta(
                    seconds=int(filter_params.get("max_duration_seconds"))
                )
                queryset = queryset.filter(duration__lte=max_duration)
            except ValueError:
                pass
        if "min_likes" in filter_params:
            try:
                queryset = queryset.filter(
                    likes_count__gte=int(filter_params.get("min_likes"))
                )
            except ValueError:
                pass
        if "min_comments" in filter_params:
            try:
                queryset = queryset.filter(
                    comments_count__gte=int(filter_params.get("min_comments"))
                )
            except ValueError:
                pass

        # Применяем сортировку через order_by
        ordering = filter_params.get("ordering", "-title")
        # Защита от SQL-инъекций: проверяем, что ordering — допустимое поле
        allowed_fields = [
            "title",
            "duration",
            "likes_count",
            "-title",
            "-duration",
            "-likes_count",
        ]
        if ordering in allowed_fields:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("-title")  # Значение по умолчанию

        return queryset

    def list(self, request, *args, **kwargs):
        total_likes = self.get_queryset().aggregate(total_likes=Sum("likes_count"))
        response = super().list(request, *args, **kwargs)

        # Создаём новый словарь для ответа
        result = {
            "results": (
                response.data
                if isinstance(response.data, list)
                else response.data.get("results", [])
            ),
            "total_likes": total_likes["total_likes"] or 0,
        }

        # Если пагинация включена, добавляем count, next, previous
        if not isinstance(response.data, list):
            result.update(
                {
                    "count": response.data.get("count", 0),
                    "next": response.data.get("next"),
                    "previous": response.data.get("previous"),
                }
            )

        response.data = result
        return response


class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all().select_related("user", "video")
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().select_related("user", "video")
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
