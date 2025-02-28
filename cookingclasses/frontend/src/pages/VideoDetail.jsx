import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getVideoDetail } from "../api/workshops";

function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getVideoDetail(id)
      .then((data) => {
        setVideo(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>{video.title || "Видео"}</h1>
      <p>Здесь будет плеер для видео.</p>
    </div>
  );
}

export default VideoDetail;
