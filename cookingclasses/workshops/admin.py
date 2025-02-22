from django.contrib import admin
from .models import (
    Cuisine,
    Chef,
    MasterClass,
    Record,
    Restaurant,
    RestaurantImage,
    Review,
    Video,
    Like,
)


class ChefInline(admin.TabularInline):
    model = MasterClass.chefs.through
    extra = 1


class RestaurantImageInline(admin.TabularInline):
    model = RestaurantImage
    extra = 1
    readonly_fields = ("uploaded_at",)


@admin.register(Cuisine)
class CuisineAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
    list_display_links = ("name",)
    ordering = ("name",)


@admin.register(Chef)
class ChefAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "profession", "restaurant", "created_at")
    list_filter = ("profession", "restaurant", "created_at")
    search_fields = ("first_name", "last_name", "profession")
    list_display_links = ("first_name", "last_name")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    ordering = ("last_name", "first_name")


@admin.register(MasterClass)
class MasterClassAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "date_event",
        "cuisine_id",
        "get_chefs",
        "price",
        "seats_available",
    )
    list_filter = ("cuisine_id", "date_event", "complexity")
    search_fields = ("title", "description", "restaurant")
    list_display_links = ("title",)
    date_hierarchy = "date_event"
    filter_horizontal = ("chefs",)
    inlines = [ChefInline]
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-date_event",)

    @admin.display(description="Шеф-повара")
    def get_chefs(self, obj):
        return ", ".join(
            [chef.first_name + " " + chef.last_name for chef in obj.chefs.all()]
        )


@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ("user", "master_class", "payment_status", "created_at")
    list_filter = ("payment_status", "created_at")
    search_fields = ("user__username", "master_class__title")
    list_display_links = ("user", "master_class")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "master_class", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("user__username", "master_class__title", "comment")
    list_display_links = ("user", "master_class")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("title", "duration", "likes_count", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "description")
    list_display_links = ("title",)
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("user", "video", "get_video_title")
    list_filter = ("user", "video")
    search_fields = ("user__username", "video__title")
    list_display_links = ("user", "video")
    raw_id_fields = ("video",)
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    ordering = ("user",)

    @admin.display(description="Название видео")
    def get_video_title(self, obj):
        return obj.video.title


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "phone", "email", "website", "created_at")
    inlines = [RestaurantImageInline]
    list_filter = ("created_at", "updated_at")
    search_fields = ("name", "address", "phone", "email")
    list_display_links = ("name", "address")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("name",)


@admin.register(RestaurantImage)
class RestaurantImageAdmin(admin.ModelAdmin):
    list_display = ("restaurant", "get_restaurant_name", "image", "uploaded_at")
    list_filter = ("restaurant", "uploaded_at")
    search_fields = ("restaurant__name",)
    list_display_links = ("restaurant", "image")
    raw_id_fields = ("restaurant",)
    date_hierarchy = "uploaded_at"
    readonly_fields = ("uploaded_at",)
    ordering = ("restaurant",)

    @admin.display(description="Название ресторана")
    def get_restaurant_name(self, obj):
        return obj.restaurant.name
