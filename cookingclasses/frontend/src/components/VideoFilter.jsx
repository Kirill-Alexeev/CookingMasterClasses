import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function VideoFilter({ onFilterChange, initialFilters }) {
  const [filters, setFilters] = useState({
    maxDurationSeconds: initialFilters.maxDurationSeconds || "",
    minLikes: initialFilters.minLikes || "",
    minComments: initialFilters.minComments || "",
    sortField: initialFilters.sortField || "title",
    sortDirection: initialFilters.sortDirection || "desc",
  });

  useEffect(() => {
    setFilters({
      maxDurationSeconds: initialFilters.maxDurationSeconds || "",
      minLikes: initialFilters.minLikes || "",
      minComments: initialFilters.minComments || "",
      sortField: initialFilters.sortField || "title",
      sortDirection: initialFilters.sortDirection || "desc",
    });
  }, [initialFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleReset = () => {
    const resetFilters = {
      maxDurationSeconds: "",
      minLikes: "",
      minComments: "",
      sortField: "title",
      sortDirection: "desc",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="video-filter">
      <h3>Фильтры</h3>
      <div className="filter-group">
        <label>
          Макс. длительность (сек):
          <input
            type="number"
            name="maxDurationSeconds"
            value={filters.maxDurationSeconds}
            onChange={handleChange}
            min="0"
          />
        </label>
      </div>
      <div className="filter-group">
        <label>
          Мин. лайков:
          <input
            type="number"
            name="minLikes"
            value={filters.minLikes}
            onChange={handleChange}
            min="0"
          />
        </label>
      </div>
      <div className="filter-group">
        <label>
          Мин. комментариев:
          <input
            type="number"
            name="minComments"
            value={filters.minComments}
            onChange={handleChange}
            min="0"
          />
        </label>
      </div>
      <button onClick={handleReset}>Сбросить</button>
    </div>
  );
}

VideoFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  initialFilters: PropTypes.shape({
    maxDurationSeconds: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    minLikes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    minComments: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sortField: PropTypes.string,
    sortDirection: PropTypes.oneOf(["asc", "desc"]),
  }).isRequired,
};

export default VideoFilter;
