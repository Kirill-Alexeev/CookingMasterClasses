from django.test import TransactionTestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from django.db import IntegrityError
from workshops.models import (
    Cuisine,
    Restaurant,
    MasterClass,
    Review,
    Video,
    Like,
    Record,
)
from workshops.serializers import RecordSerializer
from users.models import CustomUser


class WorkshopsTests(TransactionTestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = CustomUser.objects.create_user(
            username="user1", password="TestPass123", email="user1@example.com"
        )
        self.user2 = CustomUser.objects.create_user(
            username="user2", password="TestPass123", email="user2@example.com"
        )
        self.admin = CustomUser.objects.create_superuser(
            username="admin", password="AdminPass123", email="admin@example.com"
        )
        self.cuisine = Cuisine.objects.create(name="Итальянская")
        self.restaurant = Restaurant.objects.create(
            name="Test Restaurant",
            address="123 Test St",
            description="Test description",
        )
        self.master_class = MasterClass.objects.create(
            title="Test MasterClass",
            description="Test description",
            price=Decimal("100.00"),
            date_event=timezone.now() + timedelta(days=1),
            restaurant=self.restaurant,
            cuisine=self.cuisine,
            seats_total=10,
            seats_available=10,
            complexity="Новичок",
        )
        self.video = Video.objects.create(
            title="Test Video",
            description="Test video description",
            duration=timedelta(seconds=120),
            is_visible=True,
        )
        self.client.login(username="user1", password="TestPass123")

    def test_review_model_validation(self):
        with self.assertRaises(IntegrityError):
            Review.objects.create()
        review = Review.objects.create(
            user=self.user1,
            master_class=self.master_class,
            rating=5,
            comment="Great class!",
        )
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.comment, "Great class!")

    def test_master_class_calculated_rating(self):
        Review.objects.create(
            user=self.user1, master_class=self.master_class, rating=4, comment="Good"
        )
        Review.objects.create(
            user=self.user2,
            master_class=self.master_class,
            rating=5,
            comment="Excellent",
        )
        self.assertEqual(self.master_class.calculated_rating, 4.5)

    def test_video_update_likes_count(self):
        Like.objects.create(user=self.user1, video=self.video)
        Like.objects.create(user=self.user2, video=self.video)
        self.video.update_likes_count()
        self.assertEqual(self.video.likes_count, 2)

    def test_record_serializer_validation(self):
        self.master_class.seats_available = 1
        self.master_class.save()
        data = {
            "master_class": self.master_class.id,
            "tickets": 2,
            "total_price": Decimal("200.00"),
            "email": "test@example.com",
            "phone": "+1234567890",
            "payment_status": "Ожидание",
        }
        serializer = RecordSerializer(
            data=data, context={"request": self.client.request}
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("Доступно только 1 мест", str(serializer.errors))

    def test_list_reviews_api(self):
        Review.objects.create(
            user=self.user1,
            master_class=self.master_class,
            rating=5,
            comment="Amazing class!",
        )
        another_master_class = MasterClass.objects.create(
            title="Another MasterClass",
            description="Another description",
            price=Decimal("150.00"),
            date_event=timezone.now() + timedelta(days=2),
            restaurant=self.restaurant,
            cuisine=self.cuisine,
            seats_total=5,
            seats_available=5,
            complexity="Любитель",
        )
        Review.objects.create(
            user=self.user2,
            master_class=another_master_class,
            rating=4,
            comment="Good class!",
        )
        response = self.client.get(
            f"/api/workshops/reviews/?master_class={self.master_class.id}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["comment"], "Amazing class!")

    def test_delete_review_api(self):
        review = Review.objects.create(
            user=self.user1,
            master_class=self.master_class,
            rating=5,
            comment="Test review",
        )
        response = self.client.delete(f"/api/workshops/reviews/{review.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Review.objects.count(), 0)

        review = Review.objects.create(
            user=self.user1,
            master_class=self.master_class,
            rating=5,
            comment="Test review",
        )
        self.client.logout()
        self.client.login(username="user2", password="TestPass123")
        response = self.client.delete(f"/api/workshops/reviews/{review.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_reviews_by_master_class_api(self):
        another_master_class = MasterClass.objects.create(
            title="Another MasterClass",
            description="Another description",
            price=Decimal("150.00"),
            date_event=timezone.now() + timedelta(days=2),
            restaurant=self.restaurant,
            cuisine=self.cuisine,
            seats_total=5,
            seats_available=5,
            complexity="Любитель",
        )
        Review.objects.create(
            user=self.user1,
            master_class=self.master_class,
            rating=5,
            comment="Review 1",
        )
        Review.objects.create(
            user=self.user2,
            master_class=another_master_class,
            rating=4,
            comment="Review 2",
        )
        response = self.client.get(
            f"/api/workshops/reviews/?master_class={self.master_class.id}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["comment"], "Review 1")

    def test_filter_videos_by_duration_api(self):
        Video.objects.create(
            title="Long Video",
            description="Long video description",
            duration=timedelta(seconds=300),
            is_visible=True,
        )
        response = self.client.get("/api/workshops/videos/?max_duration_seconds=180")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["title"], "Test Video")

    def test_create_record_api(self):
        data = {
            "master_class": self.master_class.id,
            "tickets": 2,
            "total_price": Decimal("200.00"),
            "email": "test@example.com",
            "phone": "+1234567890",
            "payment_status": "Ожидание",
        }
        response = self.client.post("/api/workshops/records/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.master_class.refresh_from_db()
        self.assertEqual(self.master_class.seats_available, 8)
        self.assertEqual(Record.objects.count(), 1)

    def test_review_viewset_get_queryset(self):
        Review.objects.create(
            user=self.user1,
            master_class=self.master_class,
            rating=5,
            comment="User1 review",
        )
        Review.objects.create(
            user=self.user2,
            master_class=self.master_class,
            rating=4,
            comment="User2 review",
        )
        self.client.logout()
        response = self.client.get("/api/workshops/reviews/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.login(username="admin", password="AdminPass123")
        response = self.client.get("/api/workshops/reviews/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
