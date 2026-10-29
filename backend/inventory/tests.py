
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Organization, Product


class StockFlowAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user_a = User.objects.create_user(
            username="owner_a",
            email="owner_a@example.com",
            password="TestPassword123!",
        )
        self.org_a = Organization.objects.create(
            name="Organization A",
            owner=self.user_a,
        )

        self.user_b = User.objects.create_user(
            username="owner_b",
            email="owner_b@example.com",
            password="TestPassword123!",
        )
        self.org_b = Organization.objects.create(
            name="Organization B",
            owner=self.user_b,
        )

    def create_product(self, organization, name, sku, quantity):
        return Product.objects.create(
            organization=organization,
            name=name,
            sku=sku,
            quantity=quantity,
            selling_price=Decimal("100.00"),
        )

    def test_signup_creates_user_and_organization(self):
        response = self.client.post(
            "/api/auth/signup/",
            {
                "username": "new_owner",
                "email": "new_owner@example.com",
                "password": "StrongPassword123!",
                "organization_name": "New Organization",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            User.objects.filter(username="new_owner").exists()
        )
        self.assertTrue(
            Organization.objects.filter(
                name="New Organization",
                owner__username="new_owner",
            ).exists()
        )

    def test_duplicate_email_signup_is_rejected(self):
        response = self.client.post(
            "/api/auth/signup/",
            {
                "username": "another_owner",
                "email": "owner_a@example.com",
                "password": "StrongPassword123!",
                "organization_name": "Another Organization",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_users_only_see_their_own_products(self):
        self.create_product(
            self.org_a, "Keyboard A", "KEY-A", 5
        )
        self.create_product(
            self.org_b, "Mouse B", "MOUSE-B", 3
        )

        self.client.force_authenticate(user=self.user_a)
        response = self.client.get("/api/products/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["sku"], "KEY-A")

    def test_dashboard_totals_and_low_stock(self):
        self.create_product(
            self.org_a, "Keyboard", "KEY-01", 3
        )
        self.create_product(
            self.org_a, "Monitor", "MON-01", 10
        )

        self.client.force_authenticate(user=self.user_a)
        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_products"], 2)
        self.assertEqual(response.data["total_stock"], 13)
        self.assertEqual(response.data["low_stock_count"], 1)
    
    def test_sku_must_be_unique_within_organization(self):
        self.create_product(
            self.org_a, "Keyboard", "SKU-001", 5
        )

        from django.db import IntegrityError, transaction

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                self.create_product(
                    self.org_a, "Another Keyboard", "SKU-001", 2
                )

    def test_low_stock_uses_organization_default(self):
        product = self.create_product(
            self.org_a, "Mouse", "MOUSE-LOW", 3
        )

        # Organization A's default threshold is 5.
        self.assertEqual(
            product.effective_low_stock_threshold, 5
        )
        self.assertTrue(product.is_low_stock)

        product.quantity = 8
        product.save()

        self.assertFalse(product.is_low_stock)

