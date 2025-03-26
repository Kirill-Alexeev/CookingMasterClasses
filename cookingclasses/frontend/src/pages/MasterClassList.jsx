import { useState, useEffect, useCallback } from "react";
import { getMasterClasses } from "../api/workshops";
import Breadcrumbs from "../components/Breadcrumbs";
import Sort from "../components/Sort";
import Filter from "../components/Filter";

function MasterClassList() {
  const [masterClasses, setMasterClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ field: "title", direction: "asc" });

  const fetchMasterClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMasterClasses(filters, sort);
      setMasterClasses(data);
      setLoading(false);
    } catch (err) {
      setError(err.error);
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    fetchMasterClasses();
  }, [fetchMasterClasses]);

  const handleSortChange = (sortParams) => {
    setSort(sortParams);
  };

  const handleFilterChange = (filterParams) => {
    setFilters(filterParams);
  };

  if (loading)
    return <div className="master-classes__loading">Загрузка...</div>;
  if (error) return <div className="master-classes__error">{error}</div>;

  return (
    <div className="master-classes">
      <Breadcrumbs />
      <h1 className="master-classes__title">Мастер-классы</h1>
      <Sort onSortChange={handleSortChange} />
      <div className="catalog">
        <Filter
          masterClasses={masterClasses}
          onFilterChange={handleFilterChange}
        />
        <div className="catalog__list">
          {masterClasses.map((mc) => (
            <div key={mc.id} className="card">
              <img
                src={mc.image}
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
