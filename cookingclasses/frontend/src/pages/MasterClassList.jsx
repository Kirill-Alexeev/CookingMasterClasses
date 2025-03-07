import { useState, useEffect } from "react";
import { getMasterClasses } from "../api/workshops";

function MasterClassList() {
  const [masterClasses, setMasterClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    getMasterClasses()
      .then((data) => {
        setMasterClasses(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.error);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="master-class-list__loading">Загрузка...</div>;
  if (error) return <div className="master-class-list__error">{error}</div>;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = masterClasses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(masterClasses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="master-class-list">
      <h1 className="master-class-list__title">Мастер-классы</h1>
      <div className="master-class-list__filters">
        <h2 className="master-class-list__filters-title">Фильтры</h2>
        <div className="master-class-list__filter-group">
          <label className="master-class-list__filter-label">
            <input
              type="checkbox"
              className="master-class-list__filter-input"
            />{" "}
            Новичок
          </label>
          <label className="master-class-list__filter-label">
            <input
              type="checkbox"
              className="master-class-list__filter-input"
            />{" "}
            Любитель
          </label>
          <label className="master-class-list__filter-label">
            <input
              type="checkbox"
              className="master-class-list__filter-input"
            />{" "}
            Опытный
          </label>
          <label className="master-class-list__filter-label">
            <input
              type="checkbox"
              className="master-class-list__filter-input"
            />{" "}
            Профессионал
          </label>
        </div>
        <div className="master-class-list__filter-group">
          <label className="master-class-list__filter-label">
            <input
              type="checkbox"
              className="master-class-list__filter-input"
            />{" "}
            Русская
          </label>
          <label className="master-class-list__filter-label">
            <input
              type="checkbox"
              className="master-class-list__filter-input"
            />{" "}
            Итальянская
          </label>
          <label className="master-class-list__filter-label">
            <input
              type="checkbox"
              className="master-class-list__filter-input"
            />{" "}
            Французская
          </label>
          <label className="master-class-list__filter-label">
            <input
              type="checkbox"
              className="master-class-list__filter-input"
            />{" "}
            Европейская
          </label>
        </div>
        <button className="master-class-list__filter-submit">
          Смотреть все фильтры
        </button>
      </div>
      <div className="master-class-list__grid">
        {currentItems.map((mc) => (
          <div key={mc.id} className="master-class-list__card">
            <img
              src={mc.image || "https://via.placeholder.com/300x200"}
              alt={mc.title}
              className="master-class-list__card-image"
            />
            <div className="master-class-list__card-content">
              <h3 className="master-class-list__card-title">{mc.title}</h3>
              <div className="master-class-list__card-rating">
                ⭐ {mc.raiting || 0}
              </div>
              <p className="master-class-list__card-price">{mc.price} ₽</p>
              <button className="master-class-list__card-button">
                Записаться
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="master-class-list__pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            className={`master-class-list__pagination-button ${
              currentPage === number
                ? "master-class-list__pagination-button--active"
                : ""
            }`}
            onClick={() => paginate(number)}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MasterClassList;
