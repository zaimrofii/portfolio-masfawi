from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from pesanan.views import PesananViewSet

router = DefaultRouter()
router.register(r"pesanan", PesananViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]