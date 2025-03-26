from django_filters import rest_framework as filters
from .models import MasterClass, Cuisine, Restaurant, Chef


class MasterClassFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")

    min_date = filters.DateTimeFilter(field_name="date_event", lookup_expr="gte")
    max_date = filters.DateTimeFilter(field_name="date_event", lookup_expr="lte")

    min_rating = filters.NumberFilter(field_name="raiting", lookup_expr="gte")
    max_rating = filters.NumberFilter(field_name="raiting", lookup_expr="lte")

    complexity = filters.MultipleChoiceFilter(
        field_name="complexity",
        choices=[
            ("Новичок", "Новичок"),
            ("Любитель", "Любитель"),
            ("Опытный", "Опытный"),
            ("Профессионал", "Профессионал"),
        ],
    )

    cuisine_id = filters.ModelMultipleChoiceFilter(
        field_name="cuisine_id",
        queryset=Cuisine.objects.all(),
    )

    restaurant = filters.ModelMultipleChoiceFilter(
        field_name="restaurant",
        queryset=Restaurant.objects.all(),
    )

    chefs = filters.ModelMultipleChoiceFilter(
        field_name="chefs",
        queryset=Chef.objects.all(),
    )

    class Meta:
        model = MasterClass
        fields = [
            "min_price",
            "max_price",
            "min_date",
            "max_date",
            "min_rating",
            "max_rating",
            "complexity",
            "cuisine_id",
            "restaurant",
            "chefs",
        ]
