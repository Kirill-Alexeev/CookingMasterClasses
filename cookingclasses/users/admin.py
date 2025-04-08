from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "is_staff")

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Персональная информация", {"fields": ("first_name", "last_name", "email", "image")}),
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
                "fields": ("username", "email", "first_name", "last_name", "password1", "password2", "is_staff", "is_superuser", "image"),
            },
        ),
    )

    search_fields = ("username", "email", "first_name", "last_name")

    list_filter = ("is_staff", "is_superuser", "is_active", "groups")

    list_display_links = ("username",)

    ordering = ("username",)


admin.site.register(CustomUser, CustomUserAdmin)
