from typing import Dict, Any, List
from datetime import timedelta
from django.db.models import Count, Sum, F, Q
from django.db.models import QuerySet
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.request import Request
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
from hawk_python_sdk import Hawk

hawk = Hawk(
    "eyJpbnRlZ3JhdGlvbklkIjoiZDgwOTdlNWMtMDcwNy00NWVjLTg0YjctMTU4OWRkOTExNzE2Iiwic2VjcmV0IjoiM2Y1ZGJkZjctY2I0My00MTk5LWEwMDMtMzVlYmJjYTk0ZTBiIn0="
)


class MasterClassViewSet(viewsets.ModelViewSet):
    queryset = (
        MasterClass.objects.all()
        .select_related("restaurant", "cuisine")
        .prefetch_related("masterclasschef_set", "chefs", "restaurant__images")
    )
    serializer_class = MasterClassSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = MasterClassFilter
    ordering_fields = ["title", "price", "date_event", "rating"]
    ordering = ["title"]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self) -> QuerySet[MasterClass]:
        """
        Получает QuerySet мастер-классов с учётом поискового запроса.

        Returns:
            QuerySet[MasterClass]: QuerySet мастер-классов, отфильтрованный по поисковому запросу, если он указан.
        """
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

    def get_queryset(self) -> QuerySet[Cuisine]:
        """
        Получает QuerySet кухонь с учётом поискового запроса.

        Returns:
            QuerySet[Cuisine]: QuerySet кухонь, отфильтрованный по поисковому запросу, если он указан.
        """
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all().prefetch_related("images")
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self) -> List[Any]:
        """
        Определяет разрешения для действий вьюсета.

        Returns:
            List[Any]: Список разрешений (IsAdminUser для create/update/destroy, IsAuthenticatedOrReadOnly для остальных).
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]

    def get_queryset(self) -> QuerySet[Restaurant]:
        """
        Получает QuerySet ресторанов с учётом поискового запроса.

        Returns:
            QuerySet[Restaurant]: QuerySet ресторанов, отфильтрованный по поисковому запросу, если он указан.
        """
        queryset = Restaurant.objects.all().exclude(masterclass__isnull=True)
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
        .prefetch_related("master_classes", "restaurant__images")
        .annotate(master_classes_count=Count("master_classes"))
    )
    serializer_class = ChefSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self) -> QuerySet[Chef]:
        """
        Получает QuerySet шеф-поваров с учётом поискового запроса.

        Returns:
            QuerySet[Chef]: QuerySet шеф-поваров, отфильтрованный по поисковому запросу, если он указан.
        """
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

    def get_serializer_context(self) -> Dict[str, Any]:
        """
        Получает контекст для сериализатора, включая данные о ресторанах.

        Returns:
            Dict[str, Any]: Контекст с сериализованными данными ресторанов.
        """
        context = super().get_serializer_context()
        chefs = self.get_queryset() if self.action == "list" else [self.get_object()]
        restaurant_ids = {chef.restaurant_id for chef in chefs if chef.restaurant_id}
        if restaurant_ids:
            restaurants = Restaurant.objects.filter(
                id__in=restaurant_ids
            ).prefetch_related("images")
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

    def filter_max_duration_seconds(
        self, queryset: QuerySet[Video], name: str, value: str
    ) -> QuerySet[Video]:
        """
        Фильтрует видео по максимальной длительности в секундах.

        Args:
            queryset (QuerySet[Video]): Исходный QuerySet видео.
            name (str): Имя поля для фильтрации.
            value (str): Значение максимальной длительности в секундах.

        Returns:
            QuerySet[Video]: Отфильтрованный QuerySet видео.
        """
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

    def get_queryset(self) -> QuerySet[Video]:
        """
        Получает QuerySet видео с учётом фильтров и поискового запроса.

        Returns:
            QuerySet[Video]: QuerySet видео, отфильтрованный по параметрам запроса.
        """
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
                hawk.send()
                pass
        if "min_likes" in filter_params:
            try:
                queryset = queryset.filter(
                    likes_count__gte=int(filter_params.get("min_likes"))
                )
            except ValueError:
                hawk.send()
                pass
        if "min_comments" in filter_params:
            try:
                queryset = queryset.filter(
                    comments_count__gte=int(filter_params.get("min_comments"))
                )
            except ValueError:
                hawk.send()
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

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Возвращает список видео с дополнительной информацией о сумме лайков.

        Args:
            request (Request): HTTP-запрос.
            *args: Позиционные аргументы.
            **kwargs: Именованные аргументы.

        Returns:
            Response: Ответ с сериализованными данными видео и суммой лайков.
        """
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

    def get_queryset(self) -> QuerySet[Record]:
        """
        Получает QuerySet записей на мастер-классы в зависимости от прав пользователя.

        Returns:
            QuerySet[Record]: QuerySet записей, отфильтрованный по пользователю или полный для админов.
        """
        if self.request.user.is_authenticated:
            if self.request.user.is_superuser or self.request.user.is_staff:
                return Record.objects.all().select_related("master_class")
            return Record.objects.filter(user=self.request.user).select_related(
                "master_class"
            )
        return Record.objects.none()

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Создаёт новую запись на мастер-класс.

        Args:
            request (Request): HTTP-запрос с данными записи.
            *args: Позиционные аргументы.
            **kwargs: Именованные аргументы.

        Returns:
            Response: Ответ с сериализованными данными созданной записи.

        Raises:
            serializers.ValidationError: Если данные невалидны.
            MasterClass.DoesNotExist: Если мастер-класс не найден.
        """
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        master_class_data = request.data.get("master_class")
        master_class_id = (
            master_class_data
            if isinstance(master_class_data, (int, str))
            else master_class_data.get("id")
        )
        tickets = int(request.data.get("tickets", 1))
        try:
            master_class = MasterClass.objects.get(id=master_class_id)
        except MasterClass.DoesNotExist:
            return Response(
                {"error": "Мастер-класс не найден"}, status=status.HTTP_404_NOT_FOUND
            )
        if master_class.seats_available < tickets:
            return Response(
                {"error": f"Доступно только {master_class.seats_available} мест"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        MasterClass.objects.filter(id=master_class_id).update(
            seats_available=F("seats_available") - tickets
        )
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_create(self, serializer: RecordSerializer) -> None:
        """
        Выполняет создание записи, добавляя текущего пользователя.

        Args:
            serializer (RecordSerializer): Сериализатор с валидированными данными.

        Updates:
            Сохраняет запись с привязкой к текущему пользователю.
        """
        serializer.save(user=self.request.user)

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Удаляет запись на мастер-класс.

        Args:
            request (Request): HTTP-запрос.
            *args: Позиционные аргументы.
            **kwargs: Именованные аргументы.

        Returns:
            Response: Ответ с кодом 204 при успешном удалении или 403, если нет прав.

        Raises:
            Http404: Если запись не найдена.
        """
        instance = self.get_object()
        if instance.user != request.user and not (
            request.user.is_superuser or request.user.is_staff
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        instance.master_class.seats_available += instance.tickets
        instance.master_class.save(update_fields=["seats_available"])
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related("user", "master_class")
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["master_class"]

    def get_queryset(self) -> QuerySet[Review]:
        """
        Получает QuerySet отзывов с учётом фильтра по мастер-классу.

        Returns:
            QuerySet[Review]: QuerySet отзывов, отфильтрованный по master_class, если указан.
        """
        master_class_id = self.request.query_params.get("master_class")
        if master_class_id:
            return Review.objects.filter(
                master_class__id=master_class_id
            ).select_related("user", "master_class")
        return Review.objects.all().select_related("user", "master_class")

    def perform_create(self, serializer: ReviewSerializer) -> None:
        """
        Выполняет создание отзыва, добавляя текущего пользователя.

        Args:
            serializer (ReviewSerializer): Сериализатор с валидированными данными.

        Raises:
            Exception: Если создание отзыва не удалось.
        """
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            raise

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Удаляет отзыв.

        Args:
            request (Request): HTTP-запрос.
            *args: Позиционные аргументы.
            **kwargs: Именованные аргументы.

        Returns:
            Response: Ответ с кодом 204 при успешном удалении или 403, если нет прав.

        Raises:
            Http404: Если отзыв не найден.
        """
        instance = self.get_object()
        if instance.user != request.user and not (
            request.user.is_superuser or request.user.is_staff
        ):
            return Response(
                {"error": "Нет прав для удаления отзыва"},
                status=status.HTTP_403_FORBIDDEN,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all().select_related("user", "video")
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["video", "user"]

    def get_queryset(self) -> QuerySet[Like]:
        """
        Получает QuerySet лайков с учётом фильтра по видео.

        Returns:
            QuerySet[Like]: QuerySet лайков, отфильтрованный по video, если указан.
        """
        video_id = self.request.query_params.get("video")
        if video_id:
            return Like.objects.filter(video__id=video_id).select_related("video")
        return Like.objects.all().select_related("video")

    def perform_create(self, serializer: LikeSerializer) -> None:
        """
        Выполняет создание лайка, добавляя текущего пользователя.

        Args:
            serializer (LikeSerializer): Сериализатор с валидированными данными.

        Raises:
            Exception: Если создание лайка не удалось.
        """
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            raise

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Удаляет лайк.

        Args:
            request (Request): HTTP-запрос.
            *args: Позиционные аргументы.
            **kwargs: Именованные аргументы.

        Returns:
            Response: Ответ с кодом 204 при успешном удалении или 403, если нет прав.

        Raises:
            Http404: Если лайк не найден.
        """
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

    def get_queryset(self) -> QuerySet[Comment]:
        """
        Получает QuerySet комментариев с учётом фильтра по видео.

        Returns:
            QuerySet[Comment]: QuerySet комментариев, отфильтрованный по video, если указан.
        """
        video_id = self.request.query_params.get("video")
        if video_id:
            return Comment.objects.filter(video__id=video_id).select_related(
                "user", "video"
            )
        return Comment.objects.all().select_related("user", "video")

    def perform_create(self, serializer: CommentSerializer) -> None:
        """
        Выполняет создание комментария, добавляя текущего пользователя.

        Args:
            serializer (CommentSerializer): Сериализатор с валидированными данными.

        Raises:
            Exception: Если создание комментария не удалось.
        """
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            raise

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Удаляет комментарий.

        Args:
            request (Request): HTTP-запрос.
            *args: Позиционные аргументы.
            **kwargs: Именованные аргументы.

        Returns:
            Response: Ответ с кодом 204 при успешном удалении или 403, если нет прав.

        Raises:
            Http404: Если комментарий не найден.
        """
        instance = self.get_object()
        if instance.user != request.user and not (
            request.user.is_superuser or request.user.is_staff
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
