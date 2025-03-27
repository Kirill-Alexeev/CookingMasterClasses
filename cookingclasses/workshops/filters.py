import django_filters
from .models import MasterClass, Cuisine, Restaurant, Chef


class MasterClassFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_date = django_filters.DateTimeFilter(field_name="date_event", lookup_expr="gte")
    max_date = django_filters.DateTimeFilter(field_name="date_event", lookup_expr="lte")
    min_rating = django_filters.NumberFilter(field_name="raiting", lookup_expr="gte")
    max_rating = django_filters.NumberFilter(field_name="raiting", lookup_expr="lte")
    complexity = django_filters.MultipleChoiceFilter(
        field_name="complexity",
        choices=[
            ("Новичок", "Новичок"),
            ("Любитель", "Любитель"),
            ("Опытный", "Опытный"),
            ("Профессионал", "Профессионал"),
        ],
        conjoined=False
    )
    cuisine_id = django_filters.ModelMultipleChoiceFilter(
        field_name="cuisine_id",
        queryset=Cuisine.objects.all(),
        conjoined=False,
    )
    restaurant = django_filters.ModelMultipleChoiceFilter(
        field_name="restaurant__id",
        queryset=Restaurant.objects.all(),
        conjoined=False,
    )
    chefs = django_filters.ModelMultipleChoiceFilter(
        field_name="chefs__id",
        queryset=Chef.objects.all(),
        conjoined=False,
    )

    class Meta:
        model = MasterClass
        fields = []
