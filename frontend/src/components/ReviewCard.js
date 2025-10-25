import React, { useState } from 'react';
import StarRating from './StarRating';
import './ReviewCard.css';

const ReviewCard = ({
  review,
  currentUserId,
  onVote,
  onReport,
  onRespond,
  showResponse = true
}) => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [userVote, setUserVote] = useState(null);

  const handleVote = async (helpful) => {
    try {
      await onVote(review.id, helpful);
      setUserVote(helpful);
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;

    try {
      await onReport(review.id, reportReason, reportDetails);
      setShowReportForm(false);
      setReportReason('');
      setReportDetails('');
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const handleResponse = async () => {
    if (!responseText.trim()) return;

    try {
      await onRespond(review.id, responseText);
      setShowResponseForm(false);
      setResponseText('');
    } catch (error) {
      console.error('Error responding to review:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isReviewee = currentUserId === review.reviewee_id;
  const canRespond = isReviewee && !review.response_text;

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__user">
          {!review.is_anonymous && review.reviewer_name ? (
            <div className="review-card__user-info">
              {review.reviewer_image && (
                <img
                  src={review.reviewer_image}
                  alt={review.reviewer_name}
                  className="review-card__avatar"
                />
              )}
              <div>
                <h4 className="review-card__name">{review.reviewer_name}</h4>
                <span className="review-card__date">{formatDate(review.created_at)}</span>
              </div>
            </div>
          ) : (
            <div className="review-card__user-info">
              <div className="review-card__avatar review-card__avatar--anonymous">
                <span>?</span>
              </div>
              <div>
                <h4 className="review-card__name">Anonymous</h4>
                <span className="review-card__date">{formatDate(review.created_at)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="review-card__rating">
          <StarRating rating={review.rating} size="small" showValue={false} />
          <span className="review-card__rating-value">{review.rating}/5</span>
        </div>
      </div>

      <div className="review-card__content">
        {review.review_text && (
          <p className="review-card__text">{review.review_text}</p>
        )}

        {review.booking_date && (
          <div className="review-card__context">
            <span className="review-card__context-label">Session:</span>
            <span className="review-card__context-value">
              {formatDate(review.booking_date)} at {review.start_time}
            </span>
          </div>
        )}

        {review.project_title && (
          <div className="review-card__context">
            <span className="review-card__context-label">Project:</span>
            <span className="review-card__context-value">{review.project_title}</span>
          </div>
        )}
      </div>

      {review.response_text && showResponse && (
        <div className="review-card__response">
          <div className="review-card__response-header">
            <span className="review-card__response-label">Response from provider:</span>
            {review.response_created_at && (
              <span className="review-card__response-date">
                {formatDate(review.response_created_at)}
              </span>
            )}
          </div>
          <p className="review-card__response-text">{review.response_text}</p>
        </div>
      )}

      <div className="review-card__actions">
        <div className="review-card__helpful">
          <span className="review-card__helpful-label">
            Was this review helpful? ({review.helpful_votes || 0})
          </span>
          <div className="review-card__helpful-buttons">
            <button
              className={`review-card__helpful-btn ${
                userVote === true ? 'review-card__helpful-btn--active' : ''
              }`}
              onClick={() => handleVote(true)}
            >
              Yes
            </button>
            <button
              className={`review-card__helpful-btn ${
                userVote === false ? 'review-card__helpful-btn--active' : ''
              }`}
              onClick={() => handleVote(false)}
            >
              No
            </button>
          </div>
        </div>

        <div className="review-card__secondary-actions">
          <button
            className="review-card__report-btn"
            onClick={() => setShowReportForm(true)}
          >
            Report
          </button>

          {canRespond && (
            <button
              className="review-card__respond-btn"
              onClick={() => setShowResponseForm(true)}
            >
              Respond
            </button>
          )}
        </div>
      </div>

      {showReportForm && (
        <div className="review-card__report-form">
          <h4>Report this review</h4>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="review-card__report-select"
          >
            <option value="">Select reason</option>
            <option value="spam">Spam</option>
            <option value="inappropriate">Inappropriate content</option>
            <option value="fake">Fake review</option>
            <option value="harassment">Harassment</option>
            <option value="other">Other</option>
          </select>
          <textarea
            placeholder="Additional details (optional)"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            className="review-card__report-textarea"
            rows={3}
          />
          <div className="review-card__report-actions">
            <button
              onClick={() => setShowReportForm(false)}
              className="review-card__cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleReport}
              className="review-card__submit-btn"
              disabled={!reportReason}
            >
              Submit Report
            </button>
          </div>
        </div>
      )}

      {showResponseForm && (
        <div className="review-card__response-form">
          <h4>Respond to this review</h4>
          <textarea
            placeholder="Write your response..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            className="review-card__response-textarea"
            rows={4}
          />
          <div className="review-card__response-actions">
            <button
              onClick={() => setShowResponseForm(false)}
              className="review-card__cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleResponse}
              className="review-card__submit-btn"
              disabled={!responseText.trim()}
            >
              Submit Response
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;