import { useState } from "react";
import PropTypes from "prop-types";
import sortIcon from "../assets/icons/sort_icon.svg";

function Sort({ onSortChange }) {
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortField, setSortField] = useState("title");

  const handleSortDirectionToggle = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    onSortChange({ field: sortField, direction: newDirection });
  };

  const handleSortFieldChange = (e) => {
    const newField = e.target.value;
    setSortField(newField);
    onSortChange({ field: newField, direction: sortDirection });
  };

  return (
    <div className="sort">
      <button
        className={`sort__button sort__button--${sortDirection}`}
        onClick={handleSortDirectionToggle}
      >
        <img src={sortIcon} alt="Sort" className="sort__icon" />
      </button>
      <select
        className="sort__select"
        value={sortField}
        onChange={handleSortFieldChange}
      >
        <option value="title">По названию</option>
        <option value="price">По цене</option>
        <option value="date_event">По дате</option>
        <option value="raiting">По рейтингу</option>
      </select>
    </div>
  );
}

Sort.propTypes = {
  onSortChange: PropTypes.func.isRequired,
};

export default Sort;
