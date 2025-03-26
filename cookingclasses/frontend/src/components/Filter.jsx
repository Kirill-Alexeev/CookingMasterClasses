import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { getCuisines, getRestaurants, getChefs } from "../api/workshops";

function Filter({ masterClasses, onFilterChange }) {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [complexities, setComplexities] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [showMoreCuisines, setShowMoreCuisines] = useState(false);
  const [showMoreRestaurants, setShowMoreRestaurants] = useState(false);
  const [showMoreChefs, setShowMoreChefs] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cuisinesData, restaurantsData, chefsData] = await Promise.all([
          getCuisines(),
          getRestaurants(),
          getChefs(),
        ]);
        setCuisines(Array.isArray(cuisinesData) ? cuisinesData : []);
        setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
        setChefs(Array.isArray(chefsData) ? chefsData : []);
      } catch (err) {
        setError(err.error || "Не удалось загрузить данные для фильтров");
      }
    };
    fetchData();
  }, []);

  const minPriceValue = masterClasses.length
    ? Math.min(...masterClasses.map((mc) => parseFloat(mc.price)))
    : 0;
  const maxPriceValue = masterClasses.length
    ? Math.max(...masterClasses.map((mc) => parseFloat(mc.price)))
    : 0;
  const minDateValue = masterClasses.length
    ? Math.min(...masterClasses.map((mc) => new Date(mc.date_event).getTime()))
    : 0;
  const maxDateValue = masterClasses.length
    ? Math.max(...masterClasses.map((mc) => new Date(mc.date_event).getTime()))
    : 0;
  const minRatingValue = masterClasses.length
    ? Math.min(...masterClasses.map((mc) => mc.raiting))
    : 0;
  const maxRatingValue = masterClasses.length
    ? Math.max(...masterClasses.map((mc) => mc.raiting))
    : 0;

  const handleFilterChange = useCallback(() => {
    onFilterChange({
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      minDate: minDate ? new Date(minDate) : null,
      maxDate: maxDate ? new Date(maxDate) : null,
      minRating: minRating ? parseFloat(minRating) : null,
      maxRating: maxRating ? parseFloat(maxRating) : null,
      complexities,
      cuisines: cuisines.filter((c) => c.selected).map((c) => c.id),
      restaurants: restaurants.filter((r) => r.selected).map((r) => r.id),
      chefs: chefs.filter((c) => c.selected).map((c) => c.id),
    });
  }, [
    minPrice,
    maxPrice,
    minDate,
    maxDate,
    minRating,
    maxRating,
    complexities,
    cuisines,
    restaurants,
    chefs,
    onFilterChange,
  ]);

  const handleComplexityChange = (complexity) => {
    setComplexities((prev) =>
      prev.includes(complexity)
        ? prev.filter((c) => c !== complexity)
        : [...prev, complexity]
    );
  };

  const handleCuisineChange = (id) => {
    setCuisines((prev) =>
      prev.map((cuisine) =>
        cuisine.id === id
          ? { ...cuisine, selected: !cuisine.selected }
          : cuisine
      )
    );
  };

  const handleRestaurantChange = (id) => {
    setRestaurants((prev) =>
      prev.map((restaurant) =>
        restaurant.id === id
          ? { ...restaurant, selected: !restaurant.selected }
          : restaurant
      )
    );
  };

  const handleChefChange = (id) => {
    setChefs((prev) =>
      prev.map((chef) =>
        chef.id === id ? { ...chef, selected: !chef.selected } : chef
      )
    );
  };

  // Удаляем useEffect, который автоматически вызывает handleFilterChange
  // Вместо этого добавляем кнопку "Применить фильтры"
  const handleApplyFilters = () => {
    handleFilterChange();
  };

  if (error) {
    return <div className="filter__error">{error}</div>;
  }

  return (
    <div className="filter">
      <h2 className="filter__title">Фильтры</h2>
      <div className="filter__group">
        <h3 className="filter__group-title">Цена (₽)</h3>
        <div className="filter__range">
          <input
            type="number"
            placeholder={minPriceValue || "0"}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="filter__input"
          />
          <span className="filter__range-separator">-</span>
          <input
            type="number"
            placeholder={maxPriceValue || "0"}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="filter__input"
          />
        </div>
      </div>
      <div className="filter__group">
        <h3 className="filter__group-title">Дата</h3>
        <div className="filter__range">
          <input
            type="date"
            value={minDate}
            onChange={(e) => setMinDate(e.target.value)}
            className="filter__input"
            min={
              minDateValue
                ? new Date(minDateValue).toISOString().split("T")[0]
                : undefined
            }
            max={
              maxDateValue
                ? new Date(maxDateValue).toISOString().split("T")[0]
                : undefined
            }
          />
          <span className="filter__range-separator">-</span>
          <input
            type="date"
            value={maxDate}
            onChange={(e) => setMaxDate(e.target.value)}
            className="filter__input"
            min={
              minDateValue
                ? new Date(minDateValue).toISOString().split("T")[0]
                : undefined
            }
            max={
              maxDateValue
                ? new Date(maxDateValue).toISOString().split("T")[0]
                : undefined
            }
          />
        </div>
      </div>
      <div className="filter__group">
        <h3 className="filter__group-title">Рейтинг</h3>
        <div className="filter__range">
          <input
            type="number"
            step="0.1"
            placeholder={minRatingValue || "0"}
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="filter__input"
          />
          <span className="filter__range-separator">-</span>
          <input
            type="number"
            step="0.1"
            placeholder={maxRatingValue || "0"}
            value={maxRating}
            onChange={(e) => setMaxRating(e.target.value)}
            className="filter__input"
          />
        </div>
      </div>
      <div className="filter__group">
        <h3 className="filter__group-title">Сложность</h3>
        {["Новичок", "Любитель", "Опытный", "Профессионал"].map(
          (complexity) => (
            <label key={complexity} className="filter__checkbox-label">
              <input
                type="checkbox"
                checked={complexities.includes(complexity)}
                onChange={() => handleComplexityChange(complexity)}
                className="filter__checkbox"
              />
              {complexity}
            </label>
          )
        )}
      </div>
      <div className="filter__group">
        <h3 className="filter__group-title">Кухня</h3>
        {(showMoreCuisines ? cuisines : cuisines.slice(0, 3)).map((cuisine) => (
          <label key={cuisine.id} className="filter__checkbox-label">
            <input
              type="checkbox"
              checked={cuisine.selected || false}
              onChange={() => handleCuisineChange(cuisine.id)}
              className="filter__checkbox"
            />
            {cuisine.name}
          </label>
        ))}
        {cuisines.length > 3 && (
          <button
            className="filter__show-more"
            onClick={() => setShowMoreCuisines(!showMoreCuisines)}
          >
            {showMoreCuisines ? "Скрыть" : "Ещё"}
          </button>
        )}
      </div>
      {showAllFilters && (
        <>
          <div className="filter__group">
            <h3 className="filter__group-title">Ресторан</h3>
            {(showMoreRestaurants ? restaurants : restaurants.slice(0, 3)).map(
              (restaurant) => (
                <label key={restaurant.id} className="filter__checkbox-label">
                  <input
                    type="checkbox"
                    checked={restaurant.selected || false}
                    onChange={() => handleRestaurantChange(restaurant.id)}
                    className="filter__checkbox"
                  />
                  {restaurant.name}
                </label>
              )
            )}
            {restaurants.length > 3 && (
              <button
                className="filter__show-more"
                onClick={() => setShowMoreRestaurants(!showMoreRestaurants)}
              >
                {showMoreRestaurants ? "Скрыть" : "Ещё"}
              </button>
            )}
          </div>
          <div className="filter__group">
            <h3 className="filter__group-title">Шеф-повар</h3>
            {(showMoreChefs ? chefs : chefs.slice(0, 3)).map((chef) => (
              <label key={chef.id} className="filter__checkbox-label">
                <input
                  type="checkbox"
                  checked={chef.selected || false}
                  onChange={() => handleChefChange(chef.id)}
                  className="filter__checkbox"
                />
                {`${chef.first_name} ${chef.last_name}`}
              </label>
            ))}
            {chefs.length > 3 && (
              <button
                className="filter__show-more"
                onClick={() => setShowMoreChefs(!showMoreChefs)}
              >
                {showMoreChefs ? "Скрыть" : "Ещё"}
              </button>
            )}
          </div>
        </>
      )}
      <button
        className="filter__show-all"
        onClick={() => setShowAllFilters(!showAllFilters)}
      >
        {showAllFilters ? "Скрыть фильтры" : "Смотреть все"}
      </button>
      <button className="filter__apply" onClick={handleApplyFilters}>
        Применить фильтры
      </button>
    </div>
  );
}

Filter.propTypes = {
  masterClasses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
      date_event: PropTypes.string.isRequired,
      raiting: PropTypes.number.isRequired,
    })
  ).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default Filter;
