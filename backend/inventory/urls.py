
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    SignupView,
    EmailTokenObtainPairView,
    ProductViewSet,
    DashboardView,
    OrganizationSettingsView,
)

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")

urlpatterns = [
    path("auth/signup/", SignupView.as_view(), name="signup"),
    path(
        "auth/login/",
        EmailTokenObtainPairView.as_view(),
        name="login",
    ),
    path(
        "auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("settings/", OrganizationSettingsView.as_view(), name="settings"),
    path("", include(router.urls)),
]
