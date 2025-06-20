import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import LikeButton from "../components/LikeButton";
import CommentForm from "../components/CommentForm";
import CommentList from "../components/CommentList";
import { getVideoDetail, getComments } from "../api/workshops";
import { getCurrentUser } from "../api/users";

function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [videoData, commentsData, userData] = await Promise.all([
          getVideoDetail(id),
          getComments({ video: id }),
          getCurrentUser().catch(() => null),
        ]);
        setVideo(videoData);
        setComments(commentsData);
        setCurrentUser(userData);
        console.log("Current user:", userData);
        setLoading(false);
      } catch (err) {
        setError(err.error || "Ошибка загрузки данных");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
  };

  const handleCommentUpdated = (commentId, updatedText) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, text: updatedText } : comment
      )
    );
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  const formatDuration = (duration) => {
    if (!duration) return "0с";
    const [hours, minutes, seconds] = duration.split(":").map(Number);
    let result = "";
    if (hours > 0) result += `${hours}ч `;
    if (minutes > 0 || hours > 0) result += `${minutes}мин `;
    if (seconds > 0 || result === "") result += `${seconds}с`;
    return result.trim();
  };

  if (loading) return <div className="video-detail__loading">Загрузка...</div>;
  if (error) return <div className="video-detail__error">{error}</div>;

  return (
    <div className="video-detail" id="main-content">
      <div className="video-detail__wrapper">
        <Breadcrumbs />
        <video
          src={video.video}
          controls
          className="video-detail__video"
        />
        <div className="video-detail__info">
          <h1 className="video-detail__title">{video.title}</h1>
          <p className="video-detail__date">
            {new Date(video.created_at).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <p className="video-detail__duration">
          {formatDuration(video.duration)}
        </p>
        <div className="video-detail__description">
          <h2>О видео</h2>
          <p>{video.description || "Описание отсутствует"}</p>
        </div>
        <div className="video-detail__actions">
          <LikeButton
            videoId={id}
            likesCount={video.likes_count || "0"}
            currentUser={currentUser}
          />
        </div>
        <div className="video-detail__comments-section">
          <CommentForm
            videoId={id}
            onCommentAdded={handleCommentAdded}
            currentUser={currentUser}
          />
          <CommentList
            comments={comments}
            onDelete={handleCommentDeleted}
            onUpdate={handleCommentUpdated}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
}

export default VideoDetail;
