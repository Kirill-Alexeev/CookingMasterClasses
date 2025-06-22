from datetime import timedelta
from typing import Union, Optional
from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.db.models import Avg, QuerySet
from moviepy import VideoFileClip
import os


class Cuisine(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название")

    def __str__(self) -> str:
        """
        Строковое представление объекта кухни.

        Returns:
            str: Название кухни.
        """
        return self.name

    class Meta:
        verbose_name = "Кухня"
        verbose_name_plural = "Кухни"
        ordering = ["name"]


class Restaurant(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название")
    description = models.TextField(verbose_name="Описание", blank=True, null=True)
    address = models.CharField(max_length=255, verbose_name="Адрес")
    phone = models.CharField(
        max_length=20, verbose_name="Телефон", blank=True, null=True
    )
    email = models.EmailField(verbose_name="Email", blank=True, null=True)
    website = models.URLField(verbose_name="Веб-сайт", blank=True, null=True)
    opening_hours = models.CharField(
        max_length=255, verbose_name="Часы работы", blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    def __str__(self) -> str:
        """
        Строковое представление объекта ресторана.

        Returns:
            str: Название ресторана.
        """
        return self.name

    class Meta:
        verbose_name = "Ресторан"
        verbose_name_plural = "Рестораны"
        ordering = ["name"]


class Chef(models.Model):
    first_name = models.CharField(max_length=100, verbose_name="Имя")
    last_name = models.CharField(max_length=100, verbose_name="Фамилия")
    profession = models.CharField(max_length=255, verbose_name="Профессия")
    biography = models.TextField(verbose_name="Биография")
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        verbose_name="Ресторан",
        null=True,
        blank=True,
    )
    image = models.ImageField(
        upload_to="chefs/", null=True, blank=True, verbose_name="Фотография"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    def __str__(self) -> str:
        """
        Строковое представление объекта шеф-повара.

        Returns:
            str: Имя и фамилия шеф-повара.
        """
        return f"{self.first_name} {self.last_name}"

    class Meta:
        verbose_name = "Шеф-повар"
        verbose_name_plural = "Шеф-повара"
        ordering = ["last_name", "first_name"]


class RestaurantImage(models.Model):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="Ресторан",
    )
    image = models.ImageField(upload_to="restaurants/", verbose_name="Изображение")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата загрузки")

    def __str__(self) -> str:
        """
        Строковое представление объекта изображения ресторана.

        Returns:
            str: Идентификатор изображения и название ресторана.
        """
        return f"Фото: {self.id} - Ресторан: {self.restaurant.name}"

    class Meta:
        verbose_name = "Фото ресторана"
        verbose_name_plural = "Фотографии ресторанов"
        ordering = ["restaurant"]


class MasterClass(models.Model):
    title = models.CharField(max_length=255, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена")
    date_event = models.DateTimeField(verbose_name="Дата мероприятия")
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        verbose_name="Ресторан",
        null=True,
        blank=True,
    )
    seats_total = models.IntegerField(verbose_name="Всего мест")
    seats_available = models.IntegerField(verbose_name="Свободных мест")
    rating = models.FloatField(verbose_name="Рейтинг", default=0.0)
    complexity = models.CharField(
        max_length=20,
        choices=[
            ("Новичок", "Новичок"),
            ("Любитель", "Любитель"),
            ("Опытный", "Опытный"),
            ("Профессионал", "Профессионал"),
        ],
        verbose_name="Сложность",
    )
    image = models.ImageField(
        upload_to="classes/", null=True, blank=True, verbose_name="Изображение"
    )
    chefs = models.ManyToManyField(
        Chef,
        related_name="master_classes",
        verbose_name="Шеф-повар",
        through="MasterClassChef",
    )
    cuisine = models.ForeignKey(Cuisine, on_delete=models.CASCADE, verbose_name="Кухня")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    def __str__(self) -> str:
        """
        Строковое представление объекта мастер-класса.

        Returns:
            str: Название мастер-класса.
        """
        return self.title

    @property
    def is_upcoming(self) -> bool:
        """
        Проверяет, является ли мастер-класс предстоящим.

        Returns:
            bool: True, если дата мероприятия в будущем, иначе False.
        """
        return self.date_event > timezone.now()

    @property
    def days_until_event(self) -> int:
        """
        Рассчитывает количество дней до мастер-класса.

        Returns:
            int: Количество дней до мероприятия, 0 если событие прошло.
        """
        delta = self.date_event - timezone.now()
        return delta.days if delta.days > 0 else 0

    @property
    def calculated_rating(self) -> float:
        """
        Рассчитывает средний рейтинг мастер-класса на основе отзывов.

        Returns:
            float: Средний рейтинг, округлённый до одного знака после запятой, или 0.0, если отзывов нет.
        """
        avg_rating = self.review_set.aggregate(avg_rating=Avg("rating"))["avg_rating"]
        return round(avg_rating or 0.0, 1)

    def update_rating(self) -> None:
        """
        Обновляет рейтинг мастер-класса на основе отзывов.

        Updates:
            Сохраняет новое значение рейтинга в поле `rating`.
        """
        self.rating = self.calculated_rating
        self.save(update_fields=["rating"])

    def save(self, *args, **kwargs) -> None:
        """
        Сохраняет объект мастер-класса в базу данных.

        Args:
            *args: Позиционные аргументы.
            **kwargs: Именованные аргументы.

        Updates:
            Сохраняет объект в базе данных, вызывая родительский метод save.
        """
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Мастер-класс"
        verbose_name_plural = "Мастер-классы"
        ordering = ["-date_event"]


class MasterClassChef(models.Model):
    master_class = models.ForeignKey(
        MasterClass, on_delete=models.CASCADE, verbose_name="Мастер-класс"
    )
    chef = models.ForeignKey(Chef, on_delete=models.CASCADE, verbose_name="Шеф-повар")
    role = models.CharField(
        max_length=100,
        verbose_name="Роль",
        blank=True,
        help_text="Например, ведущий, помощник и т.д.",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")

    def __str__(self) -> str:
        """
        Строковое представление связи мастер-класса и шеф-повара.

        Returns:
            str: Описание связи (шеф-повар и мастер-класс).
        """
        return f"{self.chef} на {self.master_class}"

    class Meta:
        verbose_name = "Связь Мастер-класс - Шеф-повар"
        verbose_name_plural = "Связи Мастер-класс - Шеф-повар"
        unique_together = [["master_class", "chef"]]


class Record(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Пользователь"
    )
    master_class = models.ForeignKey(
        MasterClass, on_delete=models.CASCADE, verbose_name="Мастер-класс"
    )
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ("Ожидание", "Ожидание оплаты"),
            ("Подтверждено", "Оплата подтверждена"),
            ("Отменено", "Оплата отменена"),
        ],
        verbose_name="Статус оплаты",
    )
    email = models.EmailField(verbose_name="Email", null=True)
    phone = models.CharField(max_length=20, verbose_name="Телефон", null=True)
    tickets = models.IntegerField(
        default=1, verbose_name="Количество билетов", null=True
    )
    total_price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    def __str__(self) -> str:
        """
        Строковое представление записи на мастер-класс.

        Returns:
            str: Имя пользователя и название мастер-класса.
        """
        return f"Пользователь: {self.user.username} - Мастер-класс: {self.master_class.title}"

    class Meta:
        verbose_name = "Запись на мастер-класс"
        verbose_name_plural = "Записи на мастер-классы"
        ordering = ["-created_at"]


class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Пользователь"
    )
    master_class = models.ForeignKey(
        MasterClass, on_delete=models.CASCADE, verbose_name="Мастер-класс"
    )
    rating = models.IntegerField(
        choices=[
            (1, "Очень плохо"),
            (2, "Плохо"),
            (3, "Удовлетворительно"),
            (4, "Хорошо"),
            (5, "Отлично"),
        ],
        verbose_name="Рейтинг",
    )
    comment = models.TextField(verbose_name="Комментарий")
    is_visible = models.BooleanField(default=False, verbose_name="Видимость")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    def __str__(self) -> str:
        """
        Строковое представление отзыва.

        Returns:
            str: Имя пользователя и название мастер-класса.
        """
        return f"Пользователь: {self.user.username} - Мастер-класс: {self.master_class.title}"

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ["-created_at"]


class NewVideosManager(models.Manager):
    def get_queryset(self) -> QuerySet:
        """
        Возвращает QuerySet для новых видео (за последние 7 дней).

        Returns:
            QuerySet: QuerySet с аннотацией is_new_annotation для видео, созданных не позднее 7 дней назад.
        """
        cutoff_date = timezone.now() - timedelta(days=7)
        return (
            super()
            .get_queryset()
            .annotate(
                is_new_annotation=models.ExpressionWrapper(
                    models.Q(created_at__gte=cutoff_date),
                    output_field=models.BooleanField(),
                )
            )
        )


class PopularVideosManager(models.Manager):
    def __init__(self, min_likes: int = 10) -> None:
        """
        Инициализирует менеджер популярных видео с минимальным количеством лайков.

        Args:
            min_likes (int): Минимальное количество лайков для фильтрации. По умолчанию 10.
        """
        super().__init__()
        self.min_likes = min_likes

    def get_queryset(self) -> QuerySet:
        """
        Возвращает QuerySet для популярных видео с количеством лайков не менее min_likes.

        Returns:
            QuerySet: QuerySet с аннотацией likes_count и фильтром по минимальному количеству лайков.
        """
        return (
            super()
            .get_queryset()
            .annotate(likes_count=models.Count("like_set", distinct=True))
            .filter(likes_count__gte=self.min_likes)
        )


class Video(models.Model):
    title = models.CharField(max_length=255, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    duration = models.DurationField(
        verbose_name="Длительность видео", blank=True, null=True
    )
    video = models.FileField(upload_to="videos/", null=True, verbose_name="Видеофайл")
    likes_count = models.IntegerField(default=0, verbose_name="Количество лайков")
    comments_count = models.IntegerField(
        default=0, verbose_name="Количество комментариев"
    )
    is_visible = models.BooleanField(default=False, verbose_name="Видимость")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    objects = models.Manager()
    new_videos = NewVideosManager()
    popular_videos = PopularVideosManager(min_likes=10)

    def __str__(self) -> str:
        """
        Строковое представление объекта видео.

        Returns:
            str: Название видео.
        """
        return self.title

    def get_absolute_url(self) -> str:
        """
        Возвращает абсолютный URL для видео.

        Returns:
            str: URL видео, построенный через reverse.
        """
        return reverse("video-detail", kwargs={"pk": self.pk})

    def save(self, *args, **kwargs) -> None:
        """
        Сохраняет объект видео в базу данных, вычисляя длительность видео, если файл загружен.

        Args:
            *args: Позиционные аргументы.
            **kwargs: Именованные аргументы.

        Updates:
            Если видео загружено, обновляет поле duration на основе анализа файла.

        Raises:
            Exception: Если не удаётся вычислить длительность видео.
        """
        super().save(*args, **kwargs)
        if self.video and os.path.exists(self.video.path):
            try:
                clip = VideoFileClip(self.video.path)
                self.duration = timedelta(seconds=int(clip.duration))
                clip.close()
                super().save(update_fields=["duration"])
            except Exception as e:
                print(f"Ошибка при вычислении длительности видео: {e}")

    @property
    def is_new(self) -> bool:
        """
        Проверяет, является ли видео новым (создано не позднее 7 дней назад).

        Returns:
            bool: True, если видео создано менее 7 дней назад, иначе False.
        """
        return (timezone.now() - self.created_at).days <= 7

    @property
    def calculated_likes_count(self) -> int:
        """
        Рассчитывает текущее количество лайков для видео.

        Returns:
            int: Количество лайков, связанных с видео.
        """
        return self.like_set.count()

    def update_likes_count(self) -> None:
        """
        Обновляет поле likes_count на основе текущего количества лайков.

        Updates:
            Сохраняет новое значение likes_count в базе данных.
        """
        self.likes_count = self.calculated_likes_count
        self.save(update_fields=["likes_count"])

    @property
    def calculated_comments_count(self) -> int:
        """
        Рассчитывает текущее количество комментариев для видео.

        Returns:
            int: Количество комментариев, связанных с видео.
        """
        return self.comments.count()

    def update_comments_count(self) -> None:
        """
        Обновляет поле comments_count на основе текущего количества комментариев.

        Updates:
            Сохраняет новое значение comments_count в базе данных.
        """
        self.comments_count = self.calculated_comments_count
        self.save(update_fields=["comments_count"])

    class Meta:
        verbose_name = "Видео"
        verbose_name_plural = "Видео"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["duration"]),
            models.Index(fields=["likes_count"]),
            models.Index(fields=["comments_count"]),
        ]


class Like(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Пользователь"
    )
    video = models.ForeignKey(
        Video, on_delete=models.CASCADE, related_name="like_set", verbose_name="Видео"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    def __str__(self) -> str:
        """
        Строковое представление объекта лайка.

        Returns:
            str: Описание лайка (пользователь и видео).
        """
        return f"Лайк от {self.user.username} к видео {self.video.title}"

    class Meta:
        verbose_name = "Лайк"
        verbose_name_plural = "Лайки"
        ordering = ["user"]
        unique_together = [["user", "video"]]
        indexes = [
            models.Index(fields=["user", "video"]),
        ]


class Comment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Пользователь"
    )
    video = models.ForeignKey(
        Video, on_delete=models.CASCADE, related_name="comments", verbose_name="Видео"
    )
    text = models.TextField(verbose_name="Текст комментария")
    is_visible = models.BooleanField(default=False, verbose_name="Видимость")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    def __str__(self) -> str:
        """
        Строковое представление объекта комментария.

        Returns:
            str: Описание комментария (пользователь и видео).
        """
        return f"Комментарий от {self.user.username} к видео {self.video.title}"

    class Meta:
        verbose_name = "Комментарий"
        verbose_name_plural = "Комментарии"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["video"]),
        ]
