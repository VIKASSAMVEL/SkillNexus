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
import { formatCurrency } from '../utils/formatters';

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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#1A2332',
          border: '1px solid #1E293B',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{
        bgcolor: '#0F766E',
        color: '#E2E8F0',
        fontWeight: 700,
        fontSize: '1.5rem',
        borderBottom: '2px solid #14B8A6'
      }}>
        Skill Details
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#1A2332', color: '#E2E8F0', pt: 3 }}>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress sx={{ color: '#14B8A6' }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: '#7F1D1D', color: '#FCA5A5', border: '1px solid #DC2626' }}>
            {error}
          </Alert>
        )}

        {skill && !loading && (
          <Box>
            {/* Skill Header */}
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: '#0F766E', color: '#14B8A6', fontWeight: 700 }}>
                {skill.user_name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2" sx={{ color: '#E2E8F0', fontWeight: 700 }}>
                  {skill.name}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#94A3B8' }}>
                  Offered by {skill.user_name}
                </Typography>
              </Box>
            </Box>

            {/* Skill Categories and Level */}
            <Box mb={3}>
              <Chip
                label={skill.category}
                sx={{ 
                  mr: 1, 
                  mb: 1,
                  bgcolor: '#0F766E',
                  color: '#14B8A6',
                  fontWeight: 600,
                  border: '1px solid #14B8A6'
                }}
              />
              <Chip
                label={skill.proficiency_level.charAt(0).toUpperCase() + skill.proficiency_level.slice(1)}
                sx={{
                  mb: 1,
                  bgcolor: '#14B8A6',
                  color: '#0F172A',
                  fontWeight: 600,
                  border: '1px solid #14B8A6'
                }}
              />
            </Box>

            {/* Description */}
            <Typography variant="body1" paragraph sx={{ color: '#CBD5E1', lineHeight: 1.8 }}>
              {skill.description}
            </Typography>

            <Divider sx={{ my: 2, borderColor: '#1E293B' }} />

            {/* Pricing Information */}
            <Box mb={2}>
              <Typography variant="h6" gutterBottom sx={{ color: '#14B8A6', fontWeight: 700 }}>
                Pricing
              </Typography>
              {skill.price_per_hour && (
                <Box display="flex" alignItems="center" mb={1}>
                  <MonetizationOn sx={{ mr: 1, color: '#14B8A6' }} />
                  <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                    ₹{skill.price_per_hour} per hour
                  </Typography>
                </Box>
              )}
              {skill.price_per_session && (
                <Box display="flex" alignItems="center" mb={1}>
                  <MonetizationOn sx={{ mr: 1, color: '#14B8A6' }} />
                  <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                    ₹{skill.price_per_session} per session
                  </Typography>
                </Box>
              )}
              {!skill.price_per_hour && !skill.price_per_session && (
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  Pricing not specified - contact provider for details
                </Typography>
              )}
            </Box>

            {/* Availability */}
            <Box display="flex" alignItems="center" mb={2}>
              <AccessTime sx={{ mr: 1, color: '#14B8A6' }} />
              <Typography variant="body1" sx={{ color: skill.is_available ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                {skill.is_available ? '✓ Available for booking' : '✗ Currently unavailable'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2, borderColor: '#1E293B' }} />

            {/* Provider Information */}
            <Typography variant="h6" gutterBottom sx={{ color: '#14B8A6', fontWeight: 700 }}>
              Provider Information
            </Typography>

            <Box display="flex" alignItems="center" mb={1}>
              <Person sx={{ mr: 1, color: '#14B8A6' }} />
              <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                {skill.user_name}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" mb={1}>
              <LocationOn sx={{ mr: 1, color: '#14B8A6' }} />
              <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                {skill.user_location}
              </Typography>
            </Box>

            {skill.user_email && (
              <Box display="flex" alignItems="center" mb={1}>
                <Email sx={{ mr: 1, color: '#14B8A6' }} />
                <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                  {skill.user_email}
                </Typography>
              </Box>
            )}

            {skill.user_bio && (
              <Box mt={2} p={2} sx={{ bgcolor: 'rgba(20, 184, 166, 0.05)', borderRadius: 2, border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#14B8A6', fontWeight: 700 }}>
                  About the Provider
                </Typography>
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  {skill.user_bio}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3, borderColor: '#1E293B' }} />

            {/* Reputation Section */}
            {reputationData && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom sx={{ color: '#14B8A6', fontWeight: 700 }}>
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
                <Typography variant="h6" gutterBottom sx={{ color: '#14B8A6', fontWeight: 700 }}>
                  Recent Reviews ({reviews.length})
                </Typography>
                <Box sx={{ maxHeight: '400px', overflowY: 'auto', bgcolor: 'rgba(15, 118, 110, 0.05)', borderRadius: 2, p: 2, border: '1px solid rgba(20, 184, 166, 0.1)' }}>
                  {reviews.slice(0, 5).map((review) => (
                    <Box key={review.id} mb={2}>
                      <ReviewCard
                        review={review}
                        currentUserId={(() => {
                          const userData = localStorage.getItem('user');
                          return userData ? JSON.parse(userData).id : null;
                        })()}
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
                  <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
                    And {reviews.length - 5} more reviews...
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#1A2332', borderTop: '1px solid #1E293B', p: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          sx={{ color: '#94A3B8', '&:hover': { color: '#E2E8F0', bgcolor: 'rgba(20, 184, 166, 0.1)' } }}
        >
          Close
        </Button>
        {skill?.is_available && (
          <Button
            variant="contained"
            onClick={handleBookSkill}
            sx={{
              bgcolor: '#0F766E',
              color: '#E2E8F0',
              fontWeight: 600,
              '&:hover': { 
                bgcolor: '#14B8A6',
                color: '#0F172A'
              }
            }}
          >
            Book Session
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SkillDetails;