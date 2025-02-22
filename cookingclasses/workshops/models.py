from django.conf import settings
from django.db import models
from django.urls import reverse
from moviepy import VideoFileClip
import os


class Cuisine(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название")

    def __str__(self):
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

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("restaurant_detail", kwargs={"pk": self.pk})

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
        upload_to="chefs/", null=True, blank=True, verbose_name="Изображение"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def get_absolute_url(self):
        return reverse("chef_detail", kwargs={"pk": self.pk})

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

    def __str__(self):
        return f"Фото {self.id} - {self.restaurant.name}"

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
    raiting = models.FloatField(verbose_name="Рейтинг")
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
        Chef, related_name="master_classes", verbose_name="Шеф-повар"
    )
    cuisine_id = models.ForeignKey(
        Cuisine, on_delete=models.CASCADE, verbose_name="Кухня"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("master-class_detail", kwargs={"pk": self.pk})

    class Meta:
        verbose_name = "Мастер-класс"
        verbose_name_plural = "Мастер-классы"
        ordering = ["-date_event"]


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
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    def __str__(self):
        return f"Пользователь: {self.user.username} - Мастер-класс: {self.master_class.title}"

    def get_absolute_url(self):
        return reverse("record_detail", kwargs={"pk": self.pk})

    class Meta:
        verbose_name = "Запись"
        verbose_name_plural = "Записи"
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
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    def __str__(self):
        return f"Пользователь {self.user.username} - Мастер-класс {self.master_class.title}"

    def get_absolute_url(self):
        return reverse("review_detail", kwargs={"pk": self.pk})

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ["-created_at"]


class Video(models.Model):
    title = models.CharField(max_length=255, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    duration = models.DurationField(verbose_name="Длительность", blank=True, null=True)
    video = models.FileField(upload_to="videos/", null=True, verbose_name="Видеофайл")
    likes_count = models.IntegerField(default=0, verbose_name="Количество лайков")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("video_detail", kwargs={"pk": self.pk})

    def save(self, *args, **kwargs):
        if self.video:
            video_path = self.video.path
            if os.path.exists(video_path):
                try:
                    clip = VideoFileClip(video_path)
                    self.duration = clip.duration
                    clip.close()
                except Exception as e:
                    print(f"Ошибка при вычислении длительности видео: {e}")
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Видео"
        verbose_name_plural = "Видео"
        ordering = ["-created_at"]


class Like(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Пользователь"
    )
    video = models.ForeignKey(Video, on_delete=models.CASCADE, verbose_name="Видео")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    def __str__(self):
        return f"{self.user.username} - Видео {self.video_id}"

    class Meta:
        verbose_name = "Лайк"
        verbose_name_plural = "Лайки"
        ordering = ["user"]
