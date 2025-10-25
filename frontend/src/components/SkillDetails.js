import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  MonetizationOn,
  Person,
  Email
} from '@mui/icons-material';
import api, { reviewsAPI } from '../services/api';
import ReviewCard from './ReviewCard';
import UserReputation from './UserReputation';

const SkillDetails = ({ open, onClose, skillId, onBookSkill }) => {
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reputationData, setReputationData] = useState(null);
  const [endorsements, setEndorsements] = useState([]);

  const fetchSkillDetails = useCallback(async () => {
    if (!skillId) return;

    try {
      setLoading(true);
      const response = await api.get(`/skills/${skillId}`);
      setSkill(response.data.skill);
      setError(null);

      // Fetch reviews and reputation for the skill provider
      if (response.data.skill?.user_id) {
        const userId = response.data.skill.user_id;
        const [reviewsRes, reputationRes, endorsementsRes] = await Promise.all([
          reviewsAPI.getUserReviews(userId),
          reviewsAPI.getUserReputation(userId),
          reviewsAPI.getUserEndorsements(userId)
        ]);

        setReviews(reviewsRes.data.reviews || []);
        setReputationData(reputationRes.data);
        setEndorsements(endorsementsRes.data.endorsements || []);
      }
    } catch (error) {
      console.error('Error fetching skill details:', error);
      setError('Failed to load skill details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    if (open && skillId) {
      fetchSkillDetails();
    }
  }, [open, skillId, fetchSkillDetails]);

  const getProficiencyColor = (level) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'info';
      case 'expert': return 'error';
      default: return 'default';
    }
  };

  const handleBookSkill = () => {
    if (onBookSkill && skill) {
      onBookSkill(skill);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Skill Details</DialogTitle>
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {skill && !loading && (
          <Box>
            {/* Skill Header */}
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
                {skill.user_name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2">
                  {skill.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Offered by {skill.user_name}
                </Typography>
              </Box>
            </Box>

            {/* Skill Categories and Level */}
            <Box mb={3}>
              <Chip
                label={skill.category}
                color="primary"
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                label={skill.proficiency_level}
                color={getProficiencyColor(skill.proficiency_level)}
                variant="outlined"
              />
            </Box>

            {/* Description */}
            <Typography variant="body1" paragraph>
              {skill.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Pricing Information */}
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>
                Pricing
              </Typography>
              {skill.price_per_hour && (
                <Box display="flex" alignItems="center" mb={1}>
                  <MonetizationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    ${skill.price_per_hour} per hour
                  </Typography>
                </Box>
              )}
              {skill.price_per_session && (
                <Box display="flex" alignItems="center" mb={1}>
                  <MonetizationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    ${skill.price_per_session} per session
                  </Typography>
                </Box>
              )}
              {!skill.price_per_hour && !skill.price_per_session && (
                <Typography variant="body2" color="text.secondary">
                  Pricing not specified - contact provider for details
                </Typography>
              )}
            </Box>

            {/* Availability */}
            <Box display="flex" alignItems="center" mb={2}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                {skill.is_available ? 'Available for booking' : 'Currently unavailable'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Provider Information */}
            <Typography variant="h6" gutterBottom>
              Provider Information
            </Typography>

            <Box display="flex" alignItems="center" mb={1}>
              <Person sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                {skill.user_name}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" mb={1}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                {skill.user_location}
              </Typography>
            </Box>

            {skill.user_email && (
              <Box display="flex" alignItems="center" mb={1}>
                <Email sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {skill.user_email}
                </Typography>
              </Box>
            )}

            {skill.user_bio && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  About the Provider
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {skill.user_bio}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Reputation Section */}
            {reputationData && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Provider Reputation
                </Typography>
                <UserReputation
                  reputationData={reputationData}
                  endorsements={endorsements}
                  badges={[]} // We'll fetch badges separately if needed
                />
              </Box>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Recent Reviews ({reviews.length})
                </Typography>
                <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {reviews.slice(0, 5).map((review) => (
                    <Box key={review.id} mb={2}>
                      <ReviewCard
                        review={review}
                        currentUserId={parseInt(localStorage.getItem('userId'))}
                        onVote={async (reviewId, helpful) => {
                          await reviewsAPI.voteOnReview(reviewId, helpful ? 'helpful' : 'not_helpful');
                          fetchSkillDetails(); // Refresh data
                        }}
                        onReport={async (reviewId, reason, details) => {
                          await reviewsAPI.reportReview(reviewId, { reason, details });
                        }}
                        onRespond={async (reviewId, responseText) => {
                          await reviewsAPI.respondToReview(reviewId, { response_text: responseText });
                          fetchSkillDetails(); // Refresh data
                        }}
                      />
                    </Box>
                  ))}
                </Box>
                {reviews.length > 5 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    And {reviews.length - 5} more reviews...
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        {skill?.is_available && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleBookSkill}
          >
            Book Session
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SkillDetails;