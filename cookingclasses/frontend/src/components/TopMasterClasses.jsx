import { useState, useEffect } from "react";
import { masterClassesApi } from "../api/workshops";
import { Link } from "react-router-dom";

const TopMasterClasses = () => {
  const [masterClasses, setMasterClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          ordering: "-rating",
          seats_available__gt: 0,
          date_event__gte: new Date().toISOString(),
          search: searchQuery || undefined,
        };
        const data = await masterClassesApi.getList(params);
        console.log("TopMasterClasses data:", data); // Отладка
        setMasterClasses(data.slice(0, 5)); // Top 5
        setLoading(false);
      } catch (error) {
        console.error("Error fetching master classes:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.querySelector("input").value);
  };

  return (
    <div className="widget">
      <h2 className="widget-title">Топ мастер-классов</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Поиск мастер-классов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Найти</button>
      </form>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <ol className="widget-list">
          {masterClasses.map((mc) => (
            <li key={mc.id} className="widget-item">
              <Link
                to={`/master-class-detail/${mc.id}`}
                className="widget-link"
              >
                {mc.title}
              </Link>
              <div className="widget-details">
                <span>Рейтинг: {mc.rating}</span>
                <span>Цена: {mc.price} руб.</span>
                <span>
                  Дата: {new Date(mc.date_event).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Link to="/master-class-list" className="widget-more-link">
        Все мастер-классы →
      </Link>
    </div>
  );
};

export default TopMasterClasses;
