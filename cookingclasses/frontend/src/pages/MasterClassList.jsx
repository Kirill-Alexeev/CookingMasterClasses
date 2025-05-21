import { useState, useEffect, useCallback } from "react";
import { NavLink, useSearchParams, useNavigate } from "react-router-dom";
import { masterClassesApi } from "../api/workshops";
import Breadcrumbs from "../components/Breadcrumbs";
import Sort from "../components/Sort";
import Filter from "../components/Filter";
import raitingStarIcon from "../assets/icons/raiting_star_icon.svg";

function MasterClassList() {
  const [masterClasses, setMasterClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const getFiltersFromURL = useCallback(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      minPrice: params.min_price || "",
      maxPrice: params.max_price || "",
      minDate: params.min_date || "",
      maxDate: params.max_date || "",
      minRating: params.min_rating || "",
      maxRating: params.max_rating || "",
      complexities: searchParams.getAll("complexity") || [],
      cuisines: searchParams.getAll("cuisine_id").map(Number).filter(Boolean),
      restaurants: searchParams
        .getAll("restaurant_id")
        .map(Number)
        .filter(Boolean),
      chefs: searchParams.getAll("chef_id").map(Number).filter(Boolean),
      sortField: params.ordering?.startsWith("-")
        ? params.ordering.slice(1)
        : params.ordering || "date_event",
      sortDirection: params.ordering?.startsWith("-") ? "desc" : "asc",
    };
  }, [searchParams]);

  const fetchMasterClasses = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const filters = getFiltersFromURL();

        const apiFilters = {
          min_price: filters.minPrice || undefined,
          max_price: filters.maxPrice || undefined,
          min_date: filters.minDate || undefined,
          max_date: filters.maxDate || undefined,
          min_rating: filters.minRating || undefined,
          max_rating: filters.maxRating || undefined,
          complexity: filters.complexities,
          cuisine_id: filters.cuisines,
          restaurant_id: filters.restaurants,
          chef_id: filters.chefs,
          ordering:
            filters.sortDirection === "asc"
              ? filters.sortField
              : `-${filters.sortField}`,
          page,
        };

        console.log("Фильтры, отправленные в API:", apiFilters);

        const response = await masterClassesApi.getList(apiFilters);
        setMasterClasses(
          Array.isArray(response.results) ? response.results : response
        );
        setPagination({
          next: response.next,
          previous: response.previous,
          count: response.count || 0,
        });
      } catch (err) {
        console.error("Ошибка загрузки мастер-классов:", err);
        setError(err.error?.message || "Не удалось загрузить мастер-классы");
      } finally {
        setLoading(false);
      }
    },
    [getFiltersFromURL]
  );

  useEffect(() => {
    fetchMasterClasses();
  }, [fetchMasterClasses, searchParams]);

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams);
    params.set(
      "ordering",
      newSort.direction === "asc" ? newSort.field : `-${newSort.field}`
    );
    navigate({ search: params.toString() });
  };

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();

    if (newFilters.min_price) params.set("min_price", newFilters.min_price);
    if (newFilters.max_price) params.set("max_price", newFilters.max_price);
    if (newFilters.min_rating) params.set("min_rating", newFilters.min_rating);
    if (newFilters.max_rating) params.set("max_rating", newFilters.max_rating);
    if (newFilters.min_date) params.set("min_date", newFilters.min_date);
    if (newFilters.max_date) params.set("max_date", newFilters.max_date);

    (newFilters.complexity || []).forEach((c) =>
      params.append("complexity", c)
    );
    (newFilters.cuisine_id || []).forEach((id) =>
      params.append("cuisine_id", id)
    );
    (newFilters.restaurant_id || []).forEach((id) =>
      params.append("restaurant_id", id)
    );
    (newFilters.chef_id || []).forEach((id) => params.append("chef_id", id));

    navigate({ search: params.toString() });
  };

  const handlePageChange = (url) => {
    if (url) {
      const page = new URL(url).searchParams.get("page");
      fetchMasterClasses(page);
    }
  };

  const truncateDescription = (text = "", wordLimit = 10) => {
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date)
      ? "Некорректная дата"
      : date.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  if (loading)
    return <div className="master-classes__loading">Загрузка...</div>;
  if (error) return <div className="master-classes__error">{error}</div>;

  const currentFilters = getFiltersFromURL();

  return (
    <div className="master-classes">
      <div className="master-classes__wrapper">
        <Breadcrumbs />
        <h1 className="master-classes__title">Мастер-классы</h1>
        <div className="master-classes__content">
          {" "}
          {/* Добавлено: новая обертка */}
          <div className="master-classes__controls">
            <Sort
              sort={{
                field: currentFilters.sortField,
                direction: currentFilters.sortDirection,
              }}
              onSortChange={handleSortChange}
            />
            <Filter
              onFilterChange={handleFilterChange}
              initialFilters={currentFilters}
            />
          </div>
          <div className="catalog">
            <div className="catalog__list">
              {masterClasses.length > 0 ? (
                masterClasses.map((mc) => (
                  <div key={mc.id} className="card">
                    <NavLink
                      to={`/master-class-detail/${mc.id}`}
                      state={{ title: mc.title }}
                      className="card__link"
                    >
                      <div className="card__img-wrapper">
                        <img
                          src={mc.image || "/placeholder.jpg"}
                          alt={mc.title}
                          className="card__img"
                        />
                      </div>
                      <div className="card__content">
                        <div className="card__top">
                          <h3 className="card__title">{mc.title}</h3>
                          <div className="card__rating">
                            <img
                              src={raitingStarIcon}
                              className="card__rating-img"
                              alt="Рейтинг"
                            />
                            {mc.rating || 0}
                          </div>
                        </div>
                        <p className="card__date">
                          {formatDate(mc.date_event)}
                        </p>
                        <p className="card__desc">
                          {truncateDescription(mc.description)}
                        </p>
                        <p className="card__price">{mc.price} ₽</p>
                        <button className="card__button">Записаться</button>
                      </div>
                    </NavLink>
                  </div>
                ))
              ) : (
                <div className="catalog__empty">
                  Нет доступных мастер-классов. Попробуйте изменить фильтры.
                </div>
              )}
            </div>
            {pagination.count > 0 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.previous)}
                  disabled={!pagination.previous}
                  className="pagination__button"
                >
                  Предыдущая
                </button>
                <button
                  onClick={() => handlePageChange(pagination.next)}
                  disabled={!pagination.next}
                  className="pagination__button"
                >
                  Следующая
                </button>
                <span className="pagination__count">
                  Всего: {pagination.count}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterClassList;
