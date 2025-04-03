import { useState, useEffect, useCallback } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { getMasterClasses } from "../api/workshops";
import Breadcrumbs from "../components/Breadcrumbs";
import Sort from "../components/Sort";
import Filter from "../components/Filter";
import raitingStarIcon from "../assets/icons/raiting_star_icon.svg";

function MasterClassList() {
  const [masterClasses, setMasterClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ field: "title", direction: "asc" });
  const [searchParams, setSearchParams] = useSearchParams();

  const parseFiltersFromURL = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    return {
      minPrice: params.get("minPrice") || null,
      maxPrice: params.get("maxPrice") || null,
      minDate: params.get("minDate") || null,
      maxDate: params.get("maxDate") || null,
      minRating: params.get("minRating") || null,
      maxRating: params.get("maxRating") || null,
      complexities: params.getAll("complexity"),
      cuisines: params.getAll("cuisine").map(Number),
      restaurants: params.getAll("restaurant").map(Number),
      chefs: params.getAll("chef").map(Number),
    };
  }, [searchParams]);

  useEffect(() => {
    const initialFilters = parseFiltersFromURL();
    setFilters(initialFilters);
  }, [parseFiltersFromURL]);

  const fetchMasterClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMasterClasses(filters, sort);
      console.log("Fetched masterClasses:", data);
      setMasterClasses(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Ошибка в fetchMasterClasses:", err);
      setError(err.error || "Не удалось загрузить мастер-классы");
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    fetchMasterClasses();
  }, [fetchMasterClasses]);

  const handleSortChange = (sortParams) => {
    setSort(sortParams);
  };

  const handleFilterChange = (filterParams) => {
    const params = new URLSearchParams();
    if (filterParams.minPrice) params.set("minPrice", filterParams.minPrice);
    if (filterParams.maxPrice) params.set("maxPrice", filterParams.maxPrice);
    if (filterParams.minDate)
      params.set("minDate", filterParams.minDate.toISOString().split("T")[0]);
    if (filterParams.maxDate)
      params.set("maxDate", filterParams.maxDate.toISOString().split("T")[0]);
    if (filterParams.minRating) params.set("minRating", filterParams.minRating);
    if (filterParams.maxRating) params.set("maxRating", filterParams.maxRating);
    filterParams.complexities.forEach((complexity) =>
      params.append("complexity", complexity)
    );
    filterParams.cuisines.forEach((cuisineId) =>
      params.append("cuisine", cuisineId)
    );
    filterParams.restaurants.forEach((restaurantId) =>
      params.append("restaurant", restaurantId)
    );
    filterParams.chefs.forEach((chefId) => params.append("chef", chefId));
    setSearchParams(params);

    setFilters(filterParams);
  };

  const truncateDescription = (text, wordLimit = 10) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading)
    return <div className="master-classes__loading">Загрузка...</div>;
  if (error) return <div className="master-classes__error">{error}</div>;

  return (
    <div className="master-classes">
      <div className="master-classes__wrapper">
        <Breadcrumbs />
        <h1 className="master-classes__title">Мастер-классы</h1>
        <Sort sort={sort} onSortChange={handleSortChange} />
        <div className="catalog">
          <Filter
            masterClasses={masterClasses}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
          <div className="catalog__list">
            {Array.isArray(masterClasses) && masterClasses.length > 0 ? (
              masterClasses.map((mc) => (
                <div key={mc.id} className="card">
                  <NavLink
                    to={`/master-class-detail/${mc.id}`}
                    className="card__link"
                    end
                  >
                    <div className="card__img-wrapper">
                      <img
                        src={mc.image}
                        alt={mc.title}
                        className="card__img"
                      />
                    </div>
                    <div className="card__content">
                      <div className="card__top">
                        <h3 className="card__title">{mc.title}</h3>
                        <div className="card__raiting">
                          <img
                            src={raitingStarIcon}
                            className="card__raiting-img"
                            alt="Рейтинг"
                          />
                          {mc.raiting || 0}
                        </div>
                      </div>
                      <p className="card__date">{formatDate(mc.date_event)}</p>
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
        </div>
      </div>
    </div>
  );
}

export default MasterClassList;
