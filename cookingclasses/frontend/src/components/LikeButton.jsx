import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import likeIcon from "../assets/icons/like.png";
import { createLike, deleteLike, getLikes } from "../api/workshops";

function LikeButton({ videoId, likesCount, currentUser }) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const checkLike = async () => {
        try {
          const likes = await getLikes({
            video: parseInt(videoId), // Приводим к числу
            user: currentUser.id,
          });
          console.log("Likes response:", likes); // Отладка
          setIsLiked(likes.length > 0);
        } catch (error) {
          console.error("Ошибка при проверке лайка:", error);
          setError("Не удалось проверить лайк");
        }
      };
      checkLike();
    } else {
      setIsLiked(false); // Сбрасываем, если пользователь не авторизован
    }
  }, [videoId, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      alert("Войдите, чтобы поставить лайк");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (isLiked) {
        await deleteLike({ video: parseInt(videoId), user: currentUser.id });
        setIsLiked(false);
        setCurrentLikes(currentLikes - 1);
      } else {
        await createLike({ video: parseInt(videoId), user: currentUser.id });
        setIsLiked(true);
        setCurrentLikes(currentLikes + 1);
      }
    } catch (error) {
      console.error("Ошибка при обработке лайка:", error);
      setError(error.error || "Ошибка при изменении лайка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="like-button">
      {error && <div className="error-message">{error}</div>}
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`like-button__btn ${isLiked ? "liked" : ""}`}
      >
        <img src={likeIcon} alt="Лайк" className="like-button__icon" />
        <span>{currentLikes}</span>
      </button>
    </div>
  );
}

LikeButton.propTypes = {
  videoId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  likesCount: PropTypes.number.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    username: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool,
  }),
};

LikeButton.defaultProps = {
  currentUser: null,
};

export default LikeButton;
