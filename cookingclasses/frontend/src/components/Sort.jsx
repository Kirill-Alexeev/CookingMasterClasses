import PropTypes from "prop-types";
import sortIcon from "../assets/icons/sort_icon.svg";

function Sort({ sort, onSortChange }) {
  const handleSortDirectionToggle = () => {
    const newDirection = sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ field: sort.field, direction: newDirection });
  };

  const handleSortFieldChange = (e) => {
    const newField = e.target.value;
    onSortChange({ field: newField, direction: sort.direction });
  };

  return (
    <div className="sort">
      <button className="sort__button" onClick={handleSortDirectionToggle}>
        <img src={sortIcon} className="sort__icon" alt="Сортировка" />
      </button>
      <select
        className="sort__select"
        value={sort.field}
        onChange={handleSortFieldChange}
      >
        <option className="sort__option" value="title">
          По названию
        </option>
        <option className="sort__option" value="price">
          По цене
        </option>
        <option className="sort__option" value="date_event">
          По дате
        </option>
        <option className="sort__option" value="rating">
          {" "}
          {/* Исправлено: raiting -> rating */}
          По рейтингу
        </option>
      </select>
    </div>
  );
}

Sort.propTypes = {
  sort: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired,
  }).isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default Sort;
