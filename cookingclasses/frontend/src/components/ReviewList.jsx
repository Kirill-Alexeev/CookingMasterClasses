import PropTypes from "prop-types";
import ReviewItem from "./ReviewItem";

function ReviewList({ reviews, onDelete, onUpdate, currentUser }) {
  return (
    <div className="review-list">
      <h3 className="review-list-title">Отзывы ({reviews.length})</h3>

      {reviews.length === 0 ? (
        <p className="no-reviews">Пока нет отзывов. Будьте первым!</p>
      ) : (
        <div className="reviews-container">
          {reviews.map((review) => (
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
        id: PropTypes.number.isRequired,
        username: PropTypes.string.isRequired,
      }).isRequired,
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool,
  }),
};

ReviewList.defaultProps = {
  currentUser: null,
};

export default ReviewList;
