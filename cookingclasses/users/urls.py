from django.urls import path
from .views import (
    CurrentUserView,
    ExamListView,
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    DeleteProfileView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("current-user/", CurrentUserView.as_view(), name="current-user"),
    path("delete/", DeleteProfileView.as_view(), name="delete-profile"),
    path("kaexam/", ExamListView.as_view(), name="exams-list"),
]
