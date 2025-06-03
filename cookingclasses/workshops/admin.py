from django.contrib import admin
from django.urls import reverse
from .models import (
    Cuisine,
    Chef,
    MasterClass,
    MasterClassChef,
    Record,
    Restaurant,
    RestaurantImage,
    Review,
    Video,
    Like,
    Comment,
)
from django.utils.html import format_html
from weasyprint import HTML
from django.template.loader import render_to_string
from django.http import HttpResponse


class MasterClassChefInline(admin.TabularInline):
    model = MasterClassChef
    extra = 1
    fields = ["chef", "role"]
    autocomplete_fields = ["chef"]


class ChefInline(admin.TabularInline):
    model = MasterClass.chefs.through
    extra = 1


class RestaurantImageInline(admin.TabularInline):
    model = RestaurantImage
    extra = 1
    readonly_fields = ("uploaded_at",)


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1
    readonly_fields = ("created_at", "updated_at")


@admin.register(Cuisine)
class CuisineAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
    list_display_links = ("name",)
    ordering = ("name",)


@admin.register(Chef)
class ChefAdmin(admin.ModelAdmin):
    list_display = (
        "last_name",
        "first_name",
        "profession",
        "restaurant_link",
        "created_at",
    )
    list_filter = ("profession", "restaurant", "created_at")
    search_fields = ("first_name", "last_name", "profession")
    raw_id_fields = ("restaurant",)
    list_display_links = ("first_name", "last_name")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    ordering = ("last_name", "first_name")

    def restaurant_link(self, obj):
        url = reverse("admin:workshops_restaurant_change", args=[obj.restaurant.id])
        return format_html('<a href="{}">{}</a>', url, obj.restaurant.name)

    restaurant_link.short_description = "Ресторан"


@admin.register(MasterClass)
class MasterClassAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "date_event",
        "cuisine",
        "get_chefs",
        "price",
        "seats_available",
    )
    list_filter = ("cuisine", "date_event", "complexity", "chefs")
    search_fields = ("title", "description", "restaurant")
    raw_id_fields = ("restaurant", "cuisine")
    list_display_links = ("title",)
    date_hierarchy = "date_event"
    inlines = [ChefInline]
    readonly_fields = ("seats_available", "rating", "created_at", "updated_at")
    ordering = ("-date_event",)
    actions = ["generate_pdf"]

    @admin.display(description="Шеф-повара")
    def get_chefs(self, obj):
        return ", ".join(
            [chef.first_name + " " + chef.last_name for chef in obj.chefs.all()]
        )

    @admin.action(description="Сгенерировать PDF для выбранных мастер-классов")
    def generate_pdf(self, request, queryset):
        html_string = render_to_string(
            "workshops/masterclass_pdf.html",
            {
                "master_classes": queryset,
            },
        )

        html = HTML(string=html_string)
        pdf_file = html.write_pdf()

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="master_classes.pdf"'
        response.write(pdf_file)
        return response


@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ("user", "master_class_link", "payment_status", "created_at")
    list_filter = ("payment_status", "created_at")
    search_fields = ("user__username", "master_class__title")
    raw_id_fields = ("user", "master_class")
    list_display_links = ("user",)
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)

    def master_class_link(self, obj):
        url = reverse("admin:workshops_masterclass_change", args=[obj.master_class.id])
        return format_html('<a href="{}">{}</a>', url, obj.master_class.title)

    master_class_link.short_description = "Мастер-класс"


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "master_class_link", "rating", "is_visible", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("user__username", "master_class__title", "comment")
    raw_id_fields = ("user", "master_class")
    list_display_links = ("user",)
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    actions = ["make_visible"]

    def master_class_link(self, obj):
        url = reverse("admin:workshops_masterclass_change", args=[obj.master_class.id])
        return format_html('<a href="{}">{}</a>', url, obj.master_class.title)

    master_class_link.short_description = "Мастер-класс"

    @admin.action(description="Сделать выбранные отзывы видимыми")
    def make_visible(self, request, queryset):
        updated = queryset.update(is_visible=True)
        self.message_user(request, f"Сделано видимыми {updated} отзывов.")


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "duration",
        "likes_count",
        "comments_count",
        "is_visible",
        "created_at",
    )
    list_filter = ("created_at",)
    search_fields = ("title", "description")
    date_hierarchy = "created_at"
    list_display_links = ("title",)
    inlines = [CommentInline]
    readonly_fields = ("duration", "likes_count", "comments_count", "created_at")
    ordering = ("-created_at",)
    actions = ["make_visible"]

    @admin.action(description="Сделать выбранные видео видимыми")
    def make_visible(self, request, queryset):
        updated = queryset.update(is_visible=True)
        self.message_user(request, f"Сделано видимыми {updated} видео.")


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("user", "video_link")
    list_filter = ("user", "video")
    search_fields = ("user__username", "video__title")
    raw_id_fields = ("user", "video")
    list_display_links = ("user",)
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    ordering = ("user",)

    def video_link(self, obj):
        url = reverse("admin:workshops_video_change", args=[obj.video.id])
        return format_html('<a href="{}">{}</a>', url, obj.video.title)

    video_link.short_description = "Видео"


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "phone", "email", "website", "created_at")
    inlines = [RestaurantImageInline]
    list_filter = ("created_at", "updated_at")
    search_fields = ("name", "address", "phone", "email")
    list_display_links = ("name",)
    readonly_fields = ("created_at", "updated_at")
    ordering = ("name",)


@admin.register(RestaurantImage)
class RestaurantImageAdmin(admin.ModelAdmin):
    list_display = ("id", "restaurant_link", "image", "uploaded_at")
    list_filter = ("restaurant", "uploaded_at")
    search_fields = ("restaurant__name",)
    list_display_links = ("id",)
    raw_id_fields = ("restaurant",)
    date_hierarchy = "uploaded_at"
    readonly_fields = ("uploaded_at",)
    ordering = ("restaurant",)

    def restaurant_link(self, obj):
        url = reverse("admin:workshops_restaurant_change", args=[obj.restaurant.id])
        return format_html('<a href="{}">{}</a>', url, obj.restaurant.name)

    restaurant_link.short_description = "Ресторан"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "video_link", "text", "is_visible", "created_at")
    list_filter = ("user", "video", "created_at")
    search_fields = ("user__username", "video__title", "text")
    raw_id_fields = ("user", "video")
    list_display_links = ("user",)
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)
    actions = ["make_visible"]

    def video_link(self, obj):
        url = reverse("admin:workshops_video_change", args=[obj.video.id])
        return format_html('<a href="{}">{}</a>', url, obj.video.title)

    video_link.short_description = "Видео"

    @admin.action(description="Сделать выбранные комментарии видимыми")
    def make_visible(self, request, queryset):
        updated = queryset.update(is_visible=True)
        self.message_user(request, f"Сделано видимыми {updated} комментариев.")
