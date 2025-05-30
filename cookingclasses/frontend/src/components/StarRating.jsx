import { useState } from "react";
import PropTypes from "prop-types";

function StarRating({ rating, onRatingChange, editable = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (editable && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (editable) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating || rating) >= star;
        return (
          <span
            key={star}
            className={`star ${isFilled ? "filled" : ""} ${
              editable ? "editable" : ""
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onRatingChange: PropTypes.func,
  editable: PropTypes.bool,
};

StarRating.defaultProps = {
  editable: false,
  onRatingChange: () => {},
};

export default StarRating;
