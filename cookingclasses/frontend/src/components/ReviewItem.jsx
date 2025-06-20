import PropTypes from "prop-types";
import { useState } from "react";
import { updateReview, deleteReview } from "../api/workshops";
import StarRating from "./StarRating";

function ReviewItem({ review, onDelete, onUpdate, currentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(review.comment);
  const [editedRating, setEditedRating] = useState(review.rating);

  // Отладка: логируем данные
  console.log("ReviewItem props:", {
    reviewId: review.id,
    reviewUser: review.user,
    currentUser: currentUser,
  });

  // Проверяем, может ли пользователь редактировать/удалять
  const canEdit =
    currentUser &&
    ((review.user && parseInt(currentUser.id) === parseInt(review.user.id)) ||
      currentUser.isAdmin ||
      currentUser.isStaff);

  console.log(
    "canEdit:",
    canEdit,
    "isAdmin:",
    currentUser?.isAdmin,
    "isStaff:",
    currentUser?.isStaff
  );

  const handleUpdate = async () => {
    try {
      const updatedReview = await updateReview(review.id, {
        comment: editedText,
        rating: editedRating,
      });
      onUpdate(review.id, updatedReview.comment, updatedReview.rating);
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка при обновлении отзыва:", error);
      alert("Не удалось обновить отзыв");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Удалить отзыв?")) {
      try {
        await deleteReview(review.id);
        onDelete(review.id);
      } catch (error) {
        console.error("Ошибка при удалении отзыва:", error);
        alert("Не удалось удалить отзыв");
      }
    }
  };

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="review-user">
          <img
            src={review.user?.avatar || "/static/images/placeholder.jpg"}
            alt={review.user?.username || "Аноним"}
            className="review-avatar"
          />
          <span className="review-username">
            {review.user?.username || "Аноним"}
          </span>
        </div>
        <div className="review-date">
          {new Date(review.created_at).toLocaleDateString("ru-RU")}
        </div>
      </div>

      {isEditing ? (
        <div className="edit-review">
          <StarRating
            rating={editedRating}
            onRatingChange={setEditedRating}
            editable={true}
          />
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="review-edit-textarea"
          />
          <div className="review-edit-actions">
            <button onClick={handleUpdate} className="btn-save">
              Сохранить
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-cancel">
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <>
          <StarRating rating={review.rating} editable={false} />
          <p className="review-text">{review.comment}</p>
          {canEdit && (
            <div className="review-actions">
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                Редактировать
              </button>
              <button onClick={handleDelete} className="btn-delete">
                Удалить
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

ReviewItem.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.number.isRequired,
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      username: PropTypes.string,
      avatar: PropTypes.string,
      isAdmin: PropTypes.bool,
      isStaff: PropTypes.bool,
    }),
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    username: PropTypes.string,
    isAdmin: PropTypes.bool,
    isStaff: PropTypes.bool,
  }),
};

ReviewItem.defaultProps = {
  currentUser: null,
};

export default ReviewItem;
