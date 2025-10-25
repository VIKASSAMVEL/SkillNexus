import React, { useState } from 'react';
import StarRating from './StarRating';
import './ReviewForm.css';

const ReviewForm = ({ bookingId, projectId, onSubmit, onCancel, isLoading = false }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!reviewText.trim()) {
      newErrors.reviewText = 'Please write a review';
    } else if (reviewText.trim().length < 10) {
      newErrors.reviewText = 'Review must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        booking_id: bookingId,
        project_id: projectId,
        rating,
        review_text: reviewText.trim(),
        is_anonymous: isAnonymous,
        review_type: bookingId ? 'skill_session' : 'project_participation'
      });

      // Reset form
      setRating(0);
      setReviewText('');
      setIsAnonymous(false);
      setErrors({});
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="review-form">
      <div className="review-form__header">
        <h3>Write a Review</h3>
        <p>Share your experience to help others make informed decisions</p>
      </div>

      <form onSubmit={handleSubmit} className="review-form__content">
        <div className="review-form__rating-section">
          <label className="review-form__label">
            Overall Rating <span className="review-form__required">*</span>
          </label>
          <StarRating
            rating={rating}
            interactive={true}
            onRatingChange={setRating}
            size="large"
          />
          {errors.rating && (
            <span className="review-form__error">{errors.rating}</span>
          )}
        </div>

        <div className="review-form__text-section">
          <label className="review-form__label" htmlFor="review-text">
            Your Review <span className="review-form__required">*</span>
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell others about your experience. What did you like? What could be improved?"
            className={`review-form__textarea ${errors.reviewText ? 'review-form__textarea--error' : ''}`}
            rows={6}
            maxLength={1000}
          />
          <div className="review-form__textarea-footer">
            {errors.reviewText && (
              <span className="review-form__error">{errors.reviewText}</span>
            )}
            <span className="review-form__char-count">
              {reviewText.length}/1000
            </span>
          </div>
        </div>

        <div className="review-form__privacy-section">
          <label className="review-form__checkbox-label">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="review-form__checkbox"
            />
            <span className="review-form__checkbox-text">
              Post this review anonymously
            </span>
          </label>
          <p className="review-form__privacy-help">
            Your name and profile picture will be hidden from other users.
            The skill provider will still know who wrote the review.
          </p>
        </div>

        <div className="review-form__guidelines">
          <h4>Review Guidelines</h4>
          <ul>
            <li>Be honest and constructive</li>
            <li>Focus on your experience and facts</li>
            <li>Avoid personal attacks or inappropriate content</li>
            <li>Keep it relevant to the skill-sharing experience</li>
          </ul>
        </div>

        <div className="review-form__actions">
          <button
            type="button"
            onClick={onCancel}
            className="review-form__cancel-btn"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="review-form__submit-btn"
            disabled={isLoading || rating === 0}
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;