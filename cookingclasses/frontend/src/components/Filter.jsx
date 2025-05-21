import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { getCuisines, getRestaurants, getChefs } from "../api/workshops";

const complexityOptions = ["Новичок", "Любитель", "Опытный", "Профессионал"];

function Filter({ onFilterChange, initialFilters }) {
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minDate: "",
    maxDate: "",
    minRating: "",
    maxRating: "",
    complexities: [],
    cuisines: [],
    restaurants: [],
    chefs: [],
  });
  const [data, setData] = useState({
    cuisines: [],
    restaurants: [],
    chefs: [],
  });
  const [ui, setUi] = useState({
    showMore: {
      cuisines: false,
      restaurants: false,
      chefs: false,
    },
    error: null,
    loading: true,
  });

  useEffect(() => {
    setFilters({ ...initialFilters });
  }, [initialFilters]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cuisines, restaurants, chefs] = await Promise.all([
          getCuisines(),
          getRestaurants(),
          getChefs(),
        ]);
        setData({
          cuisines,
          restaurants,
          chefs: chefs.map((chef) => ({
            ...chef,
            full_name: `${chef.first_name} ${chef.last_name}`, // Добавлено: full_name для отображения
          })),
        });
      } catch (err) {
        setUi((prev) => ({
          ...prev,
          error: err.message || "Не удалось загрузить данные для фильтров",
        }));
      } finally {
        setUi((prev) => ({ ...prev, loading: false }));
      }
    };
    loadData();
  }, []);

  const handleChange = (field, value) => {
    // Валидация числовых полей
    if (
      ["minPrice", "maxPrice", "minRating", "maxRating"].includes(field) &&
      value !== "" &&
      (isNaN(value) || Number(value) < 0)
    ) {
      setUi((prev) => ({
        ...prev,
        error: `Поле ${field} должно быть числом >= 0`,
      }));
      return;
    }
    setFilters((prev) => ({ ...prev, [field]: value }));
    setUi((prev) => ({ ...prev, error: null }));
  };

  const handleMultiSelect = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const toggleShowMore = (field) => {
    setUi((prev) => ({
      ...prev,
      showMore: { ...prev.showMore, [field]: !prev.showMore[field] },
    }));
  };

  const applyFilters = useCallback(() => {
    try {
      if (filters.minDate && filters.maxDate) {
        if (new Date(filters.minDate) > new Date(filters.maxDate)) {
          throw new Error("Минимальная дата не может быть позже максимальной");
        }
      }
      if (filters.minPrice && filters.maxPrice) {
        if (Number(filters.minPrice) > Number(filters.maxPrice)) {
          throw new Error("Минимальная цена не может быть больше максимальной");
        }
      }
      if (filters.minRating && filters.maxRating) {
        if (Number(filters.minRating) > Number(filters.maxRating)) {
          throw new Error(
            "Минимальный рейтинг не может быть больше максимального"
          );
        }
      }

      const output = {
        min_price: filters.minPrice || null,
        max_price: filters.maxPrice || null,
        min_date: filters.minDate || null,
        max_date: filters.maxDate || null,
        min_rating: filters.minRating || null,
        max_rating: filters.maxRating || null,
        complexity: filters.complexities || [],
        cuisine_id: filters.cuisines || [], // Исправлено: cuisine -> cuisine_id
        restaurant_id: filters.restaurants || [], // Исправлено: restaurant -> restaurant_id
        chef_id: filters.chefs || [], // Исправлено: chef -> chef_id
      };

      onFilterChange(output);
      setUi((prev) => ({ ...prev, error: null }));
    } catch (e) {
      console.error("Ошибка фильтрации:", e);
      setUi((prev) => ({ ...prev, error: e.message }));
    }
  }, [filters, onFilterChange]);

  const resetFilters = () => {
    const reset = {
      minPrice: "",
      maxPrice: "",
      minDate: "",
      maxDate: "",
      minRating: "",
      maxRating: "",
      complexities: [],
      cuisines: [],
      restaurants: [],
      chefs: [],
    };
    setFilters(reset);
    onFilterChange({
      min_price: null,
      max_price: null,
      min_date: null,
      max_date: null,
      min_rating: null,
      max_rating: null,
      complexity: [],
      cuisine_id: [], // Исправлено: cuisine -> cuisine_id
      restaurant_id: [], // Исправлено: restaurant -> restaurant_id
      chef_id: [], // Исправлено: chef -> chef_id
    });
  };

  const renderRangeFilter = (title, minKey, maxKey, type = "number") => (
    <div className="filter__group">
      <h3 className="filter__group-title">{title}</h3>
      <div className="filter__range">
        <input
          type={type}
          inputMode={type === "number" ? "numeric" : undefined}
          value={filters[minKey]}
          placeholder="От"
          onChange={(e) => handleChange(minKey, e.target.value)}
          className="filter__input"
          step={type === "number" ? "0.01" : undefined} // Добавлено: для цен
        />
        <span className="filter__range-separator">-</span>
        <input
          type={type}
          inputMode={type === "number" ? "numeric" : undefined}
          value={filters[maxKey]}
          placeholder="До"
          onChange={(e) => handleChange(maxKey, e.target.value)}
          className="filter__input"
          step={type === "number" ? "0.01" : undefined} // Добавлено: для цен
        />
      </div>
    </div>
  );

  const renderDateFilter = () =>
    renderRangeFilter("Дата", "minDate", "maxDate", "datetime-local");

  const renderMultiSelect = (
    title,
    field,
    items,
    showMore,
    labelField = "name"
  ) => {
    return (
      <div className="filter__group">
        <h3 className="filter__group-title">{title}</h3>
        {(showMore ? items : items.slice(0, 3)).map((item) => (
          <label key={item.id} className="filter__checkbox-label">
            <input
              type="checkbox"
              checked={filters[field].includes(item.id)}
              onChange={() => handleMultiSelect(field, item.id)}
              className="filter__checkbox"
            />
            {item[labelField] || item.full_name || item.name}{" "}
            {/* Исправлено: поддержка full_name */}
          </label>
        ))}
        {items.length > 3 && (
          <button
            onClick={() => toggleShowMore(field)}
            className="filter__show-more"
          >
            {showMore ? "Скрыть" : "Ещё"}
          </button>
        )}
      </div>
    );
  };

  if (ui.loading)
    return <div className="filter__loading">Загрузка фильтров...</div>;
  if (ui.error) return <div className="filter__error">{ui.error}</div>;

  return (
    <div className="filter">
      <h2 className="filter__title">Фильтры</h2>

      {renderRangeFilter("Цена (₽)", "minPrice", "maxPrice", "number")}
      {renderDateFilter()}
      {renderRangeFilter("Рейтинг", "minRating", "maxRating", "number")}

      <div className="filter__group">
        <h3 className="filter__group-title">Сложность</h3>
        {complexityOptions.map((level) => (
          <label key={level} className="filter__checkbox-label">
            <input
              type="checkbox"
              checked={filters.complexities.includes(level)}
              onChange={() => handleMultiSelect("complexities", level)}
              className="filter__checkbox"
            />
            {level}
          </label>
        ))}
      </div>

      {renderMultiSelect(
        "Кухня",
        "cuisines",
        data.cuisines,
        ui.showMore.cuisines
      )}
      {renderMultiSelect(
        "Ресторан",
        "restaurants",
        data.restaurants,
        ui.showMore.restaurants
      )}
      {renderMultiSelect(
        "Шеф-повар",
        "chefs",
        data.chefs,
        ui.showMore.chefs,
        "full_name"
      )}

      <div className="filter__actions">
        <button onClick={applyFilters} className="filter__apply">
          Применить
        </button>
        <button onClick={resetFilters} className="filter__reset">
          Сбросить
        </button>
      </div>
    </div>
  );
}

Filter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  initialFilters: PropTypes.object,
};

export default Filter;
