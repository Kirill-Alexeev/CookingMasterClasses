import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function VideoFilter({ onFilterChange, initialFilters }) {
  const [filters, setFilters] = useState({
    maxDuration: initialFilters.maxDuration || "",
    recentDays: initialFilters.recentDays || "",
    username: initialFilters.username || "",
    commentText: initialFilters.commentText || "",
  });

  // Синхронизация фильтров с initialFilters при изменении URL
  useEffect(() => {
    setFilters({
      maxDuration: initialFilters.maxDuration || "",
      recentDays: initialFilters.recentDays || "",
      username: initialFilters.username || "",
      commentText: initialFilters.commentText || "",
    });
  }, [initialFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({
      ...filters,
      sortField: initialFilters.sortField,
      sortDirection: initialFilters.sortDirection,
    });
  };

  const handleReset = () => {
    const resetFilters = {
      maxDuration: "",
      recentDays: "",
      username: "",
      commentText: "",
      sortField: "created_at",
      sortDirection: "desc",
    };
    setFilters({
      maxDuration: "",
      recentDays: "",
      username: "",
      commentText: "",
    });
    onFilterChange(resetFilters);
  };

  return (
    <form className="filter" onSubmit={handleSubmit}>
      <h3 className="filter__title">Фильтры</h3>
      <div className="filter__group">
        <label className="filter__label">Макс. длительность (мин):</label>
        <input
          type="number"
          name="maxDuration"
          value={filters.maxDuration}
          onChange={handleChange}
          placeholder="Например, 30"
          className="filter__input"
        />
      </div>
      <div className="filter__group">
        <label className="filter__label">Загружено за последние (дней):</label>
        <input
          type="number"
          name="recentDays"
          value={filters.recentDays}
          onChange={handleChange}
          placeholder="Например, 7"
          className="filter__input"
        />
      </div>
      <div className="filter__group">
        <label className="filter__label">Пользователь (лайки):</label>
        <input
          type="text"
          name="username"
          value={filters.username}
          onChange={handleChange}
          placeholder="Например, john"
          className="filter__input"
        />
      </div>
      <div className="filter__group">
        <label className="filter__label">Текст комментария:</label>
        <input
          type="text"
          name="commentText"
          value={filters.commentText}
          onChange={handleChange}
          placeholder="Например, отличное"
          className="filter__input"
        />
      </div>
      <div className="filter__actions">
        <button type="submit" className="filter__button">
          Применить
        </button>
        <button type="button" onClick={handleReset} className="filter__button">
          Сбросить
        </button>
      </div>
    </form>
  );
}

VideoFilter.propTypes = {
  initialFilters: PropTypes.shape({
    maxDuration: PropTypes.string,
    recentDays: PropTypes.string,
    username: PropTypes.string,
    commentText: PropTypes.string,
    sortField: PropTypes.string,
    sortDirection: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default VideoFilter;
