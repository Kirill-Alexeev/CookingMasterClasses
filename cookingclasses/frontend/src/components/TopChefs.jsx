import { useState, useEffect } from "react";
import { getChefs } from "../api/workshops";
import { Link } from "react-router-dom";

const TopChefs = () => {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { search: searchQuery || undefined };
        const data = await getChefs(params);
        const sortedChefs = [...data].sort(
          (a, b) => (b.master_classes_count || 0) - (a.master_classes_count || 0)
        );
        console.log("TopChefs data:", data); // Отладка
        setChefs(sortedChefs.slice(0, 5)); // Top 5
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chefs:", error);
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
      <h2 className="widget-title">Лучшие шеф-повара</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Поиск шеф-поваров..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Найти</button>
      </form>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <ol className="widget-list">
          {chefs.map((chef) => (
            <li key={chef.id} className="widget-item">
              <Link to={`/chef-detail/${chef.id}`} className="widget-link">
                {chef.first_name} {chef.last_name}
              </Link>
              <div className="widget-details">
                <span>Профессия: {chef.profession}</span>
                <span>Ресторан: {chef.restaurant_data?.name || "Не указан"}</span>
                <span>Мастер-классов: {chef.master_classes_count || 0}</span>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Link to="/chef-list" className="widget-more-link">
        Все шеф-повара →
      </Link>
    </div>
  );
};

export default TopChefs;