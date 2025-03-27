import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { getCuisines, getRestaurants, getChefs } from "../api/workshops";

function Filter({ masterClasses, onFilterChange, initialFilters }) {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || "");
  const [minDate, setMinDate] = useState(initialFilters.minDate || "");
  const [maxDate, setMaxDate] = useState(initialFilters.maxDate || "");
  const [minRating, setMinRating] = useState(initialFilters.minRating || "");
  const [maxRating, setMaxRating] = useState(initialFilters.maxRating || "");
  const [complexities, setComplexities] = useState(
    initialFilters.complexities || []
  );
  const [selectedCuisines, setSelectedCuisines] = useState(
    initialFilters.cuisines || []
  );
  const [selectedRestaurants, setSelectedRestaurants] = useState(
    initialFilters.restaurants || []
  );
  const [selectedChefs, setSelectedChefs] = useState(
    initialFilters.chefs || []
  );
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
    const filterParams = {
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      minDate: minDate ? new Date(minDate) : null,
      maxDate: maxDate ? new Date(maxDate) : null,
      minRating: minRating ? parseFloat(minRating) : null,
      maxRating: maxRating ? parseFloat(maxRating) : null,
      complexities,
      cuisines: selectedCuisines,
      restaurants: selectedRestaurants,
      chefs: selectedChefs,
    };
    console.log("Applying filters:", filterParams);
    onFilterChange(filterParams);
  }, [
    minPrice,
    maxPrice,
    minDate,
    maxDate,
    minRating,
    maxRating,
    complexities,
    selectedCuisines,
    selectedRestaurants,
    selectedChefs,
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
    setSelectedCuisines((prev) =>
      prev.includes(id)
        ? prev.filter((cuisineId) => cuisineId !== id)
        : [...prev, id]
    );
  };

  const handleRestaurantChange = (id) => {
    setSelectedRestaurants((prev) =>
      prev.includes(id)
        ? prev.filter((restaurantId) => restaurantId !== id)
        : [...prev, id]
    );
  };

  const handleChefChange = (id) => {
    setSelectedChefs((prev) =>
      prev.includes(id) ? prev.filter((chefId) => chefId !== id) : [...prev, id]
    );
  };

  const handleApplyFilters = () => {
    handleFilterChange();
  };

  const handleResetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinDate("");
    setMaxDate("");
    setMinRating("");
    setMaxRating("");
    setComplexities([]);
    setSelectedCuisines([]);
    setSelectedRestaurants([]);
    setSelectedChefs([]);
    onFilterChange({
      minPrice: null,
      maxPrice: null,
      minDate: null,
      maxDate: null,
      minRating: null,
      maxRating: null,
      complexities: [],
      cuisines: [],
      restaurants: [],
      chefs: [],
    });
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
              checked={selectedCuisines.includes(cuisine.id)}
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
                    checked={selectedRestaurants.includes(restaurant.id)}
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
                  checked={selectedChefs.includes(chef.id)}
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
      <div className="filter__actions">
        <button
          className="filter__show-all"
          onClick={() => setShowAllFilters(!showAllFilters)}
        >
          {showAllFilters ? "Скрыть фильтры" : "Смотреть все"}
        </button>
        <button className="filter__apply" onClick={handleApplyFilters}>
          Применить фильтры
        </button>
        <button className="filter__reset" onClick={handleResetFilters}>
          Сбросить фильтры
        </button>
      </div>
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
  initialFilters: PropTypes.shape({
    minPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    minDate: PropTypes.string,
    maxDate: PropTypes.string,
    minRating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxRating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    complexities: PropTypes.arrayOf(PropTypes.string),
    cuisines: PropTypes.arrayOf(PropTypes.number),
    restaurants: PropTypes.arrayOf(PropTypes.number),
    chefs: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};

export default Filter;
