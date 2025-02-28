import { useState, useEffect } from "react";
import { getVideos } from "../api/workshops";

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getVideos()
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Видео</h1>
      <ul>
        {videos.map((video) => (
          <li key={video.id}>{video.title || "Видео"}</li>
        ))}
      </ul>
    </div>
  );
}

export default VideoList;
