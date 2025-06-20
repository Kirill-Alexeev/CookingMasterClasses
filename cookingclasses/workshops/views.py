from datetime import timedelta
from django.db.models import Count, Sum, F, Q
from rest_framework import viewsets, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
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
from django_filters import rest_framework as filters
import logging

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
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(restaurant__name__contains=search)
            )
        return queryset.distinct()

class CuisineViewSet(viewsets.ModelViewSet):
    queryset = Cuisine.objects.all()
    serializer_class = CuisineSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset

class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all().prefetch_related("images")
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        queryset = Restaurant.objects
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(address__icontains=search)
            )
        return queryset

class ChefViewSet(viewsets.ModelViewSet):
    queryset = (
        Chef.objects.all()
        .select_related("restaurant")
        .prefetch_related("master_classes")
        .annotate(master_classes_count=Count("master_classes"))
    )
    serializer_class = ChefSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(profession__icontains=search)
                | Q(restaurant__name__icontains=search, restaurant__name__isnull=False)
            )
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        chefs = self.get_queryset() if self.action == "list" else [self.get_object()]
        restaurants = {chef.restaurant for chef in chefs if chef.restaurant}
        context["restaurants_data"] = {
            r.id: RestaurantSerializer(r, context=context).data for r in restaurants
        }
        return context

class RestaurantImageViewSet(viewsets.ModelViewSet):
    queryset = RestaurantImage.objects.all().select_related("restaurant")
    serializer_class = RestaurantImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

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
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = VideoFilter
    ordering_fields = [
        "title",
        "duration",
        "likes_count",
        "-title",
        "-duration",
        "-likes_count",
    ]
    ordering = ["-likes_count"]

    def get_queryset(self):
        queryset = (
            super()
            .get_queryset()
            .annotate(actual_likes_count=Count("like_set", distinct=True))
        )
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
        search = filter_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        ordering = filter_params.get("ordering", "-likes_count")
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
            queryset = queryset.order_by("-likes_count")
        return queryset

    def list(self, request, *args, **kwargs):
        total_likes = self.get_queryset().aggregate(total_likes=Sum("likes_count"))
        response = super().list(request, *args, **kwargs)
        result = {
            "results": (
                response.data
                if isinstance(response.data, list)
                else response.data.get("results", [])
            ),
            "total_likes": total_likes["total_likes"] or 0,
        }
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

class RecordViewSet(viewsets.ModelViewSet):
    queryset = Record.objects.all().select_related("user", "master_class")
    serializer_class = RecordSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Record.objects.filter(user=self.request.user).select_related(
                "master_class"
            )
        return Record.objects.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
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
        MasterClass.objects.filter(id=master_class_id).update(
            seats_available=F("seats_available") - 1
        )
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        Record.objects.filter(id=instance.id, user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related("user", "master_class")
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["master_class"]

    def get_queryset(self):
        master_class_id = self.request.query_params.get("master_class")
        if master_class_id:
            return Review.objects.filter(
                master_class__id=master_class_id
            ).select_related("user", "master_class")
        return Review.objects.all().select_related("user", "master_class")

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            raise

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user and not (
            request.user.is_superuser or request.user.is_staff
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all().select_related("user", "video")
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["video", "user"]

    def get_queryset(self):
        video_id = self.request.query_params.get("video")
        if video_id:
            return Like.objects.filter(video__id=video_id).select_related("video")
        return Like.objects.all().select_related("video")

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            raise

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user and not (
            request.user.is_superuser or request.user.is_staff
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().select_related("user", "video")
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["video"]

    def get_queryset(self):
        video_id = self.request.query_params.get("video")
        if video_id:
            return Comment.objects.filter(video__id=video_id).select_related(
                "user", "video"
            )
        return Comment.objects.all().select_related("user", "video")

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            raise

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user and not (
            request.user.is_superuser or request.user.is_staff
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)