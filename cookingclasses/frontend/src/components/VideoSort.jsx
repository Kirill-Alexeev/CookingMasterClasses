import { useState } from "react";
import PropTypes from "prop-types";
import sortIcon from "../assets/icons/sort_icon.svg";

function VideoSort({ sort, onSortChange }) {
  const [sortField, setSortField] = useState(sort.field);
  const [sortDirection, setSortDirection] = useState(sort.direction);

  const handleSortFieldChange = (e) => {
    const newField = e.target.value;
    setSortField(newField);
    onSortChange({ field: newField, direction: sortDirection });
  };

  const handleSortDirectionToggle = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    onSortChange({ field: sortField, direction: newDirection });
  };

  return (
    <div className="sort">
      <h3 className="sort__title">Сортировка</h3>
      <div className="sort__group">
        <label className="sort__label">Поле:</label>
        <select
          value={sortField}
          onChange={handleSortFieldChange}
          className="sort__select"
        >
          <option value="created_at">Дата создания</option>
          <option value="likes_count">Лайки</option>
          <option value="duration">Длительность</option>
          <option value="comments_count">Комментарии</option>
        </select>
      </div>
      <button
        className="sort__button"
        onClick={handleSortDirectionToggle}
        title={sortDirection === "asc" ? "По возрастанию" : "По убыванию"}
      >
        <img src={sortIcon} className="sort__icon" alt="Сортировка" />
      </button>
    </div>
  );
}

VideoSort.propTypes = {
  sort: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(["asc", "desc"]).isRequired,
  }).isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default VideoSort;
