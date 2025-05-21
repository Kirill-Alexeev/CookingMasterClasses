from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CuisineViewSet,
    RestaurantViewSet,
    ChefViewSet,
    RestaurantImageViewSet,
    MasterClassViewSet,
    RecordViewSet,
    ReviewViewSet,
    VideoViewSet,
    LikeViewSet,
    CommentViewSet,
    VideoListFilteredView,
)

router = DefaultRouter()
router.register(r"cuisines", CuisineViewSet)
router.register(r"restaurants", RestaurantViewSet)
router.register(r"chefs", ChefViewSet)
router.register(r"restaurant-images", RestaurantImageViewSet)
router.register(r"master-classes", MasterClassViewSet)
router.register(r"records", RecordViewSet)
router.register(r"reviews", ReviewViewSet)
router.register(r"videos", VideoViewSet)
router.register(r"likes", LikeViewSet)
router.register(r"comments", CommentViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path(
        "videos/filtered/", VideoListFilteredView.as_view(), name="video_list_filtered"
    ),
]
