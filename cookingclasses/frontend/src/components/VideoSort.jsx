import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function VideoSort({ sort, onSortChange, sortOptions }) {
  const [sortField, setSortField] = useState(sort.field);
  const [sortDirection, setSortDirection] = useState(sort.direction);

  useEffect(() => {
    setSortField(sort.field);
    setSortDirection(sort.direction);
  }, [sort]);

  const handleFieldChange = (e) => {
    const newField = e.target.value;
    setSortField(newField);
    onSortChange({ field: newField, direction: sortDirection });
  };

  const handleDirectionChange = (e) => {
    const newDirection = e.target.value;
    setSortDirection(newDirection);
    onSortChange({ field: sortField, direction: newDirection });
  };

  return (
    <div className="video-sort">
      <h3>Сортировка</h3>
      <div className="sort-group">
        <label>
          Поле:
          <select value={sortField} onChange={handleFieldChange}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="sort-group">
        <label>
          Направление:
          <select value={sortDirection} onChange={handleDirectionChange}>
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </label>
      </div>
    </div>
  );
}

VideoSort.propTypes = {
  sort: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(["asc", "desc"]).isRequired,
  }).isRequired,
  onSortChange: PropTypes.func.isRequired,
  sortOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default VideoSort;
