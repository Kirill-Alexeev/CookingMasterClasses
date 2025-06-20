import { useState, useEffect } from "react";
import {
  getReviews,
  deleteReview,
  getComments,
  deleteComment,
  getLikes,
  deleteLike,
} from "../api/workshops";
import "../styles/components/_user-reviews-comments-likes.scss"


const UserReviewsCommentsLikes = () => {
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsData, commentsData, likesData] = await Promise.all([
          getReviews(),
          getComments(),
          getLikes(),
        ]);
        console.log("Reviews:", reviewsData);
        console.log("Comments:", commentsData);
        console.log("Likes:", likesData);
        setReviews(reviewsData);
        setComments(commentsData);
        setLikes(likesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Не удалось загрузить данные");
      }
    };
    fetchData();
  }, []);

  const handleDeleteReview = async (id) => {
    if (window.confirm("Удалить отзыв?")) {
      try {
        await deleteReview(id);
        setReviews(reviews.filter((r) => r.id !== id));
      } catch {
        setError("Не удалось удалить отзыв");
      }
    }
  };

  const handleDeleteComment = async (id) => {
    if (window.confirm("Удалить комментарий?")) {
      try {
        await deleteComment(id);
        setComments(comments.filter((c) => c.id !== id));
      } catch {
        setError("Не удалось удалить комментарий");
      }
    }
  };

  const handleDeleteLike = async (id) => {
    if (window.confirm("Удалить лайк?")) {
      try {
        await deleteLike(id);
        setLikes(likes.filter((l) => l.id !== id));
      } catch {
        setError("Не удалось удалить лайк");
      }
    }
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-reviews-comments-likes">
      <h2>Ваши отзывы, комментарии и лайки</h2>
      <div className="user-reviews-comments-likes__section">
        <h3>Отзывы</h3>
        {reviews.length ? (
          <ul className="user-reviews-comments-likes__list">
            {reviews.map((review) => (
              <li key={review.id} className="user-reviews-comments-likes__item">
                <p>
                  <strong>Мастер-класс:</strong> {review.master_class__title}
                </p>
                <p>
                  <strong>Рейтинг:</strong> {review.rating}
                </p>
                <p>
                  <strong>Комментарий:</strong> {review.comment}
                </p>
                <button
                  className="user-reviews-comments-likes__button"
                  onClick={() => handleDeleteReview(review.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Отзывов нет</p>
        )}
      </div>
      <div className="user-reviews-comments-likes__section">
        <h3>Комментарии</h3>
        {comments.length ? (
          <ul className="user-reviews-comments-likes__list">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="user-reviews-comments-likes__item"
              >
                <p>
                  <strong>Видео ID:</strong> {comment.video}
                </p>
                <p>
                  <strong>Текст:</strong> {comment.text}
                </p>
                <button
                  className="user-reviews-comments-likes__button"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Комментариев нет</p>
        )}
      </div>
      <div className="user-reviews-comments-likes__section">
        <h3>Лайки</h3>
        {likes.length ? (
          <ul className="user-reviews-comments-likes__list">
            {likes.map((like) => (
              <li key={like.id} className="user-reviews-comments-likes__item">
                <p>
                  <strong>Видео:</strong> {like.video__title}
                </p>
                <button
                  className="user-reviews-comments-likes__button"
                  onClick={() => handleDeleteLike(like.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Лайков нет</p>
        )}
      </div>
    </div>
  );
};

export default UserReviewsCommentsLikes;
