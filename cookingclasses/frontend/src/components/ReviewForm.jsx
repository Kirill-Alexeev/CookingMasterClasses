import { useState, useEffect } from "react";
import { createReview, getRecords } from "../api/workshops";
import StarRating from "./StarRating";
import PropTypes from "prop-types";

function ReviewForm({ masterClassId, onReviewAdded, currentUser }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasAttended, setHasAttended] = useState(null);

  useEffect(() => {
    const checkAttendance = async () => {
      if (!currentUser) {
        setHasAttended(false);
        return;
      }
      try {
        const records = await getRecords();
        const attended = records.some(
          (record) =>
            record.master_class__id === parseInt(masterClassId) &&
            record.payment_status === "Подтверждено"
        );
        setHasAttended(attended);
      } catch (err) {
        console.error("Ошибка при проверке записи:", err);
        setError(err.response?.data?.error || "Ошибка при проверке посещения");
        setHasAttended(false);
      }
    };
    checkAttendance();
  }, [masterClassId, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAttended) {
      setError(
        "Вы не можете оставить отзыв, так как не посещали это мероприятие"
      );
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const newReview = {
        master_class: parseInt(masterClassId),
        rating,
        comment,
      };
      console.log("Отправка отзыва:", newReview);
      const response = await createReview(newReview);
      console.log("Отзыв создан:", response);
      onReviewAdded(response);
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Ошибка при создании отзыва:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Ошибка при отправке отзыва";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="auth-required">
        <p>
          Чтобы оставить отзыв, пожалуйста, <a href="/login">войдите</a> или{" "}
          <a href="/register">зарегистрируйтесь</a>
        </p>
      </div>
    );
  }

  if (hasAttended === false) {
    return (
      <div className="error-message">
        Вы не можете оставить отзыв, так как не посещали это мероприятие
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3 className="review-form-title">Оставить отзыв</h3>
      <div className="form-group">
        <label>Ваша оценка:</label>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          editable={true}
        />
      </div>
      <div className="form-group">
        <label htmlFor="comment">Ваш отзыв:</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength="2"
          className="review-textarea"
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="submit-review-btn"
      >
        {isSubmitting ? "Отправка..." : "Отправить отзыв"}
      </button>
    </form>
  );
}

ReviewForm.propTypes = {
  masterClassId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onReviewAdded: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    username: PropTypes.string,
    isAdmin: PropTypes.bool,
    isStaff: PropTypes.bool,
  }),
};

ReviewForm.defaultProps = {
  currentUser: null,
};

export default ReviewForm;
