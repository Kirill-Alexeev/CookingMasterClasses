from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class CustomUser(AbstractUser):
    image = models.ImageField(
        upload_to="users/", null=True, blank=True, verbose_name="Изображение"
    )


class kaexam(models.Model):
    title = models.CharField(max_length=200, verbose_name="Название экзамена")
    created_at = models.DateTimeField(
        default=timezone.now, verbose_name="Дата создания"
    )
    exam_date = models.DateTimeField(verbose_name="Дата проведения экзамена")
    image = models.ImageField(
        upload_to="exam_images/",
        verbose_name="Изображение задания",
        blank=True,
        null=True,
    )
    users = models.ManyToManyField(CustomUser, verbose_name="Пользователи")
    is_public = models.BooleanField(default=False, verbose_name="Опубликовано")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Экзамен"
        verbose_name_plural = "Экзамены"
