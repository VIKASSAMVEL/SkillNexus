import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Rating,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { recommendationsAPI } from '../services/api';
import StarRating from './StarRating';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const RecommendationScore = styled(Box)(({ theme, score }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: score > 0.8 ? '#4caf50' : score > 0.6 ? '#ff9800' : '#f44336',
  color: 'white',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  fontSize: '0.75rem',
  fontWeight: 'bold',
}));

const SkillRecommendations = ({ userId, limit = 10, category = null }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, category, limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await recommendationsAPI.getSkillRecommendations(userId, {
        limit,
        category
      });

      setRecommendations(response.data.recommendations || []);
      setUserPreferences(response.data.user_preferences);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSkill = (skillId) => {
    // Navigate to booking page or open booking dialog
    console.log('Book skill:', skillId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No recommendations available. Complete your profile to get personalized skill suggestions.
      </Alert>
    );
  }

  return (
    <Box>
      {userPreferences && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Personalized Recommendations
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Based on your {userPreferences.learning_style} learning style and {userPreferences.experience_level} experience level
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {recommendations.map((recommendation) => (
          <Grid item xs={12} md={6} key={recommendation.id}>
            <StyledCard>
              <CardContent>
                <RecommendationScore score={recommendation.recommendation_score}>
                  {Math.round(recommendation.recommendation_score * 100)}% Match
                </RecommendationScore>

                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={recommendation.provider_image}
                    alt={recommendation.provider_name}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6" component="div">
                      {recommendation.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      by {recommendation.provider_name}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Chip
                    label={recommendation.category_name}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={`$${recommendation.price_per_hour}/hr`}
                    size="small"
                    color="secondary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  {recommendation.difficulty_level && (
                    <Chip
                      label={recommendation.difficulty_level}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {recommendation.description}
                </Typography>

                {/* Match Reasons */}
                {recommendation.match_reasons && recommendation.match_reasons.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" fontWeight="bold" mb={1}>
                      Why this matches you:
                    </Typography>
                    {recommendation.match_reasons.map((reason, index) => (
                      <Chip
                        key={index}
                        label={reason}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1, fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                )}

                {/* Provider Stats */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <StarRating value={recommendation.average_rating || 0} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({recommendation.review_count || 0} reviews)
                    </Typography>
                  </Box>
                  {recommendation.provider_trust_score > 0 && (
                    <Typography variant="body2" color="success.main">
                      Trust Score: {Math.round(recommendation.provider_trust_score)}
                    </Typography>
                  )}
                </Box>

                {/* Compatibility Score */}
                {recommendation.compatibility_score > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" mb={1}>
                      Compatibility: {Math.round(recommendation.compatibility_score * 100)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={recommendation.compatibility_score * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {/* Navigate to skill details */}}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleBookSkill(recommendation.id)}
                  >
                    Book Now
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {recommendations.length === limit && (
        <Box textAlign="center" mt={3}>
          <Button variant="outlined">
            Load More Recommendations
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SkillRecommendations;