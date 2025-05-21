from django_filters import rest_framework as filters
from .models import Chef, Cuisine, MasterClass, Restaurant


class MasterClassFilter(filters.FilterSet):
    min_date = filters.IsoDateTimeFilter(field_name="date_event", lookup_expr="gte")
    max_date = filters.IsoDateTimeFilter(field_name="date_event", lookup_expr="lte")
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_rating = filters.NumberFilter(field_name="rating", lookup_expr="gte")
    max_rating = filters.NumberFilter(field_name="rating", lookup_expr="lte")
    complexity = filters.MultipleChoiceFilter(
        field_name="complexity",
        choices=MasterClass._meta.get_field("complexity").choices,
    )
    cuisine_id = filters.ModelMultipleChoiceFilter(
        field_name="cuisine",
        queryset=Cuisine.objects.all(),
    )
    restaurant_id = filters.ModelMultipleChoiceFilter(
        field_name="restaurant",
        queryset=Restaurant.objects.all(),
    )
    chef_id = filters.ModelMultipleChoiceFilter(
        field_name="chefs",
        queryset=Chef.objects.all(),
    )

    class Meta:
        model = MasterClass
        fields = [
            "min_date",
            "max_date",
            "min_price",
            "max_price",
            "min_rating",
            "max_rating",
            "complexity",
            "cuisine_id",
            "restaurant_id",
            "chef_id",
        ]
