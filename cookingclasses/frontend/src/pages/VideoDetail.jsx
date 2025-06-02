import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import likeIcon from "../assets/icons/like.png";
import { getVideoDetail, getComments } from "../api/workshops";

function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const [videoData, commentsData] = await Promise.all([
          getVideoDetail(id),
          getComments({ video: id }),
        ]);
        setVideo(videoData);
        setComments(commentsData);
        setLoading(false);
      } catch (err) {
        setError(err.error || "Ошибка загрузки видео");
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const formatDuration = (duration) => {
    if (!duration) return "0мин";
    const [hours, minutes] = duration.split(":").map(Number);
    return `${hours > 0 ? hours + "ч " : ""}${minutes}мин`;
  };

  if (loading) return <div className="video-detail__loading">Загрузка...</div>;
  if (error) return <div className="video-detail__error">{error}</div>;

  return (
    <div className="video-detail">
      <div className="video-detail__header">
        <Breadcrumbs />
        <div className="video-detail__info">
          <div className="video-detail__info-top">
            <video
              src={video.video}
              controls
              className="video-detail__video"
              poster="/placeholder.jpg"
            />
            <h1 className="video-detail__title">{video.title}</h1>
          </div>
          <div className="video-detail__info-bottom">
            <p className="video-detail__likes">
              <img
                src={likeIcon}
                className="video-detail__rating-star"
                alt="Лайки"
              />
              {video.likes_count || 0}
            </p>
            <p className="video-detail__comments">
              Комментариев: {video.comments_count || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="video-detail__event-info">
        <div className="video-detail__event-left">
          <p className="video-detail__event-duration">
            {formatDuration(video.duration)}
          </p>
          <p className="video-detail__event-date">
            Загружено:{" "}
            {new Date(video.created_at).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="video-detail__description">
        <h2>О видео</h2>
        <p>{video.description || "Описание отсутствует"}</p>
      </div>

      <div className="video-detail__comments">
        <h2>Комментарии</h2>
        {comments.length > 0 ? (
          <div className="video-detail__comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="video-detail__comment">
                <p className="video-detail__comment-user">{comment.user}</p>
                <p className="video-detail__comment-text">{comment.text}</p>
                <p className="video-detail__comment-date">
                  {new Date(comment.created_at).toLocaleDateString("ru-RU")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="video-detail__comment-nothing">Комментариев нет.</p>
        )}
      </div>
    </div>
  );
}

export default VideoDetail;
