from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path("silk/", include("silk.urls", namespace="silk")),
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/workshops/", include("workshops.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += [
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html"), name="index"),
]
