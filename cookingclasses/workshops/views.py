from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
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
from django.utils import timezone
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly,
)


class MasterClassViewSet(viewsets.ModelViewSet):
    queryset = MasterClass.objects.all()
    serializer_class = MasterClassSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = MasterClassFilter
    ordering_fields = [
        "title",
        "price",
        "date_event",
        "rating",
    ]
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
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Restaurant.objects.exclude(masterclass__isnull=True)


class ChefViewSet(viewsets.ModelViewSet):
    queryset = Chef.objects.all()
    serializer_class = ChefSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class RestaurantImageViewSet(viewsets.ModelViewSet):
    queryset = RestaurantImage.objects.all()
    serializer_class = RestaurantImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class RecordViewSet(viewsets.ModelViewSet):
    queryset = Record.objects.all()
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
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
