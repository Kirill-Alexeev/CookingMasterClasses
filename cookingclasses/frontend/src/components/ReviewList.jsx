import PropTypes from "prop-types";
import ReviewItem from "./ReviewItem";

function ReviewList({ reviews, onDelete, onUpdate, currentUser }) {
  console.log("ReviewList reviews:", reviews); // Отладка

  // Фильтруем отзывы, чтобы исключить некорректные
  const validReviews = reviews.filter((review) => review && review.id);

  return (
    <div className="review-list">
      <h3 className="review-list-title">Отзывы ({validReviews.length})</h3>

      {validReviews.length === 0 ? (
        <p className="no-reviews">Пока нет отзывов. Будьте первым!</p>
      ) : (
        <div className="reviews-container">
          {validReviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              onDelete={onDelete}
              onUpdate={onUpdate}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

ReviewList.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        username: PropTypes.string,
      }), // user теперь необязательный
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    username: PropTypes.string,
    isAdmin: PropTypes.bool,
  }),
};

ReviewList.defaultProps = {
  currentUser: null,
};

export default ReviewList;
