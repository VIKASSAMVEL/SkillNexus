import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  Typography,
  Box,
  Avatar,
  Chip
} from '@mui/material';
import { Star } from '@mui/icons-material';
import api from '../services/api';

const ReviewDialog = ({ open, onClose, session, currentUser }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Early return if required props are missing
  if (!session || !currentUser) {
    return null;
  }

  // Determine if current user is learner or provider
  const isLearner = session.learner_id === currentUser.id;
  const revieweeId = isLearner ? session.provider_id : session.learner_id;
  const revieweeName = isLearner ? session.provider_name : session.learner_name;
  const revieweeRole = isLearner ? 'teacher' : 'student';

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        session_id: session.id,
        reviewee_id: revieweeId,
        rating: rating,
        review_text: reviewText.trim(),
        review_type: 'skill_session',
        is_anonymous: false
      };

      await api.post('/reviews', reviewData);
      alert('Review submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReviewText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar>
            {revieweeName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">
              Rate your {revieweeRole}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {revieweeName}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            How would you rate this session?
          </Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
            icon={<Star fontSize="inherit" />}
            emptyIcon={<Star fontSize="inherit" />}
            sx={{ mb: 1 }}
          />
          {rating > 0 && (
            <Chip
              label={
                rating === 1 ? 'Poor' :
                rating === 2 ? 'Fair' :
                rating === 3 ? 'Good' :
                rating === 4 ? 'Very Good' : 'Excellent'
              }
              color={
                rating === 1 ? 'error' :
                rating === 2 ? 'warning' :
                rating === 3 ? 'default' :
                rating === 4 ? 'info' : 'success'
              }
              size="small"
            />
          )}
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Share your feedback (optional)"
          placeholder={`Tell others about your experience with ${revieweeName}...`}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary">
          Your review will help other users choose the right teacher and improve the quality of sessions on our platform.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Skip
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;