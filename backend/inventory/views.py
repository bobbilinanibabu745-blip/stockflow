
from django.contrib.auth import get_user_model
from django.db.models import Sum

from rest_framework import generics, viewsets, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Organization, Product
from .serializers import (
    SignupSerializer,
    ProductSerializer,
    OrganizationSettingsSerializer,
)


class SignupView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        login_value = attrs.get(self.username_field, "")

        if isinstance(login_value, str):
            login_value = login_value.strip()

        User = get_user_model()

        if isinstance(login_value, str) and "@" in login_value:
            users = User.objects.filter(email__iexact=login_value)

            if users.count() == 1:
                attrs[self.username_field] = (
                    users.first().get_username()
                )
            elif users.count() > 1:
                raise serializers.ValidationError({
                    "email": "Multiple accounts use this email address."
                })

        return super().validate(attrs)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(
            organization__owner=self.request.user
        ).select_related("organization")

    def perform_create(self, serializer):
        organization = self.request.user.organization
        serializer.save(organization=organization)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = Product.objects.filter(
            organization__owner=request.user
        ).select_related("organization")

        total_products = products.count()

        total_stock = products.aggregate(
            total=Sum("quantity")
        )["total"] or 0

        low_stock_products = [
            product for product in products
            if product.is_low_stock
        ]

        return Response({
            "total_products": total_products,
            "total_stock": total_stock,
            "low_stock_count": len(low_stock_products),
            "low_stock_items": ProductSerializer(
                low_stock_products,
                many=True
            ).data,
        })


class OrganizationSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            OrganizationSettingsSerializer(
                request.user.organization
            ).data
        )

    def patch(self, request):
        serializer = OrganizationSettingsSerializer(
            request.user.organization,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
