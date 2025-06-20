import { useState, useEffect } from "react";
import { getVideos } from "../api/workshops";
import { Link } from "react-router-dom";

const PopularVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          min_likes: 0, // Убрали ограничение, чтобы показать все видео
          ordering: "-likes_count",
          search: searchQuery || undefined,
        };
        const data = await getVideos(params);
        console.log("PopularVideos data:", data); // Отладка
        setVideos(data.results.slice(0, 5)); // Top 5
        setLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error);
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
      <h2 className="widget-title">Популярные видео</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Поиск видео..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Найти</button>
      </form>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <ol className="widget-list">
          {videos.map((video) => (
            <li key={video.id} className="widget-item">
              <Link to={`/video-detail/${video.id}`} className="widget-link">
                {video.title}
              </Link>
              <div className="widget-details">
                <span>Лайков: {video.likes_count}</span>
                <span>Комментариев: {video.comments_count}</span>
                <span>Длительность: {video.duration}</span>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Link to="/video-list" className="widget-more-link">
        Все видео →
      </Link>
    </div>
  );
};

export default PopularVideos;
