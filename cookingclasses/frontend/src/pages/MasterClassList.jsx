import { useState, useEffect } from "react";
import { getMasterClasses } from "../api/workshops";

function MasterClassList() {
  const [masterClasses, setMasterClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return <div className="master-classes__loading">Загрузка...</div>;
  if (error) return <div className="master-classes__error">{error}</div>;

  return (
    <div className="master-classes">
      <h1 className="master-classes__title">Мастер-классы</h1>
      <div className="master-classes__catalog">
        <div className="master-classes__filters">
          <h2 className="master-classes__filters-title">Фильтры</h2>
          <div className="master-classes__filter-group">
            <label className="master-classes__filter-label">
              <input type="checkbox" className="master-classes__filter-input" />{" "}
              Новичок
            </label>
            <label className="master-classes__filter-label">
              <input type="checkbox" className="master-classes__filter-input" />{" "}
              Любитель
            </label>
            <label className="master-classes__filter-label">
              <input type="checkbox" className="master-classes__filter-input" />{" "}
              Опытный
            </label>
            <label className="master-classes__filter-label">
              <input type="checkbox" className="master-classes__filter-input" />{" "}
              Профессионал
            </label>
          </div>
          <div className="master-classes__filter-group">
            <label className="master-classes__filter-label">
              <input type="checkbox" className="master-classes__filter-input" />{" "}
              Русская
            </label>
            <label className="master-classes__filter-label">
              <input type="checkbox" className="master-classes__filter-input" />{" "}
              Итальянская
            </label>
            <label className="master-classes__filter-label">
              <input type="checkbox" className="master-classes__filter-input" />{" "}
              Французская
            </label>
            <label className="master-classes__filter-label">
              <input type="checkbox" className="master-classes__filter-input" />{" "}
              Европейская
            </label>
          </div>
          <button className="master-classes__filter-submit">
            Смотреть все фильтры
          </button>
        </div>
        <div className="master-classes__grid">
          {masterClasses.map((mc) => (
            <div key={mc.id} className="master-classes__card">
              <img
                src={mc.image || "https://via.placeholder.com/300x200"}
                alt={mc.title}
                className="master-classes__card-image"
              />
              <div className="master-classes__card-content">
                <h3 className="master-classes__card-title">{mc.title}</h3>
                <div className="master-classes__card-rating">
                  ⭐ {mc.raiting || 0}
                </div>
                <p className="master-classes__card-price">{mc.price} ₽</p>
                <button className="master-classes__card-button">
                  Записаться
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MasterClassList;
