from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, kaexam


class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "is_staff")

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (
            "Персональная информация",
            {"fields": ("first_name", "last_name", "email", "image")},
        ),
        (
            "Разрешения",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Важные даты", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_superuser",
                    "image",
                ),
            },
        ),
    )

    search_fields = ("username", "email", "first_name", "last_name")

    list_filter = ("is_staff", "is_superuser", "is_active", "groups")

    list_display_links = ("username",)

    ordering = ("username",)


admin.site.register(CustomUser, CustomUserAdmin)


@admin.register(kaexam)
class kaexamAdmin(admin.ModelAdmin):
    list_display = ("title", "created_at", "exam_date", "is_public")
    list_filter = ("is_public", "created_at", "exam_date")
    search_fields = ("title", "users__email")
    filter_horizontal = ("users",)
    date_hierarchy = "exam_date"
    readonly_fields = ("created_at",)

    fieldsets = (
        (None, {"fields": ("title", "image", "is_public")}),
        (
            "Даты",
            {
                "fields": ("created_at", "exam_date"),
            },
        ),
        (
            "Пользователи",
            {
                "fields": ("users",),
                "classes": ("wide",),
            },
        ),
    )
