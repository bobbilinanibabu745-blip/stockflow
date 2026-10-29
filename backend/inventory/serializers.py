
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Organization, Product


User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )
    organization_name = serializers.CharField(
        max_length=150,
        write_only=True,
        trim_whitespace=True,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "organization_name",
        ]

    def validate_username(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Username is required."
            )

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Email already registered."
            )

        return value

    def validate_organization_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Organization name is required."
            )

        return value.strip()

    def create(self, validated_data):
        organization_name = validated_data.pop(
            "organization_name"
        )
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        Organization.objects.create(
            name=organization_name,
            owner=user,
        )

        return user


class ProductSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)
    effective_low_stock_threshold = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "description",
            "quantity",
            "cost_price",
            "selling_price",
            "low_stock_threshold",
            "is_low_stock",
            "effective_low_stock_threshold",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class OrganizationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            "name",
            "default_low_stock_threshold",
        ]
