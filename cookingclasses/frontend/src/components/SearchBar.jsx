import { useState } from "react";
import axios from "axios";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("query", query);

      const response = await axios.post("/api/workshops/search/", formData, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "multipart/form-data",
        },
      });

      setResults(response.data);
    } catch (error) {
      console.error("Ошибка поиска:", error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите запрос..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Идет поиск..." : "Найти"}
        </button>
      </form>

      {results && (
        <div className="results">
          <h3>Мастер-классы:</h3>
          <ul>
            {results.master_classes?.map((item) => (
              <li key={item.id}>
                {item.title} ({item.type})
              </li>
            ))}
          </ul>

          <h3>Шеф-повара:</h3>
          <ul>
            {results.chefs?.map((item) => (
              <li key={item.id}>
                {item.name} ({item.type})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
