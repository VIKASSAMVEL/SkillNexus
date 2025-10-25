import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({
  rating = 0,
  maxRating = 5,
  size = 'medium',
  interactive = false,
  onRatingChange,
  showValue = true
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`star-rating star-rating--${size}`}>
      <div className="star-rating__stars">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isPartial = starValue - 0.5 <= displayRating && displayRating < starValue;

          return (
            <span
              key={index}
              className={`star-rating__star ${
                interactive ? 'star-rating__star--interactive' : ''
              } ${
                isFilled ? 'star-rating__star--filled' :
                isPartial ? 'star-rating__star--partial' : ''
              }`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
            >
              ★
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="star-rating__value">
          {Number(rating)?.toFixed(1) || '0.0'}
        </span>
      )}
    </div>
  );
};

export default StarRating;