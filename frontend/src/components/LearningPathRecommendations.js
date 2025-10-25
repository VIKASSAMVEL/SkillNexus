import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { recommendationsAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: '#1A2332',
  borderColor: '#1E293B',
  border: '1px solid #1E293B',
  borderRadius: '12px',
  '&:hover': {
    boxShadow: '0 20px 40px rgba(20, 184, 166, 0.15)',
    borderColor: '#14B8A6',
    transform: 'translateY(-4px)',
    transition: 'all 0.3s ease'
  },
}));

const StepIcon = ({ completed }) => (
  completed ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="disabled" />
);

const LearningPathRecommendations = ({ userId }) => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLearningPaths();
  }, [userId]);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await recommendationsAPI.getLearningPathRecommendations(userId);
      setLearningPaths(response.data.learning_paths || []);
    } catch (err) {
      console.error('Error fetching learning paths:', err);
      setError(err.response?.data?.message || 'Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPath = (pathId) => {
    // Navigate to learning path page or save to user's active paths
    console.log('Start learning path:', pathId);
  };

  const calculateProgress = (steps) => {
    const completedSteps = steps.filter(step => step.is_completed).length;
    return (completedSteps / steps.length) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: '#14B8A6' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{
        mb: 2,
        backgroundColor: '#7F1D1D',
        color: '#FCA5A5',
        border: '1px solid #DC2626',
        borderRadius: 2
      }}>
        {error}
      </Alert>
    );
  }

  if (learningPaths.length === 0) {
    return (
      <Alert severity="info" sx={{
        mb: 2,
        backgroundColor: '#164E63',
        color: '#A5F3FC',
        border: '1px solid #06B6D4',
        borderRadius: 2
      }}>
        No learning paths available. Add skill interests to your profile to get personalized learning recommendations.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: '#E2E8F0', fontWeight: 600 }}>
        Personalized Learning Paths
      </Typography>
      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
        Structured learning journeys based on your interests and goals
      </Typography>

      {learningPaths.map((path, index) => (
        <StyledCard key={index}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h6" component="div" mb={1} sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                  {path.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 2 }}>
                  {path.description}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Chip
                  label={`${path.estimated_duration_weeks} weeks`}
                  sx={{
                    mb: 1,
                    backgroundColor: '#0F766E',
                    color: '#14B8A6',
                    fontWeight: 600
                  }}
                  size="small"
                />
                <br />
                <Chip
                  label={path.difficulty_level}
                  sx={{
                    borderColor: '#14B8A6',
                    color: '#14B8A6',
                    backgroundColor: 'transparent'
                  }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" mb={1} sx={{ color: '#CBD5E1' }}>
                Progress: {calculateProgress(path.steps).toFixed(0)}% Complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculateProgress(path.steps)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#0F766E',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#14B8A6',
                    borderRadius: 4
                  }
                }}
              />
            </Box>

            <Box mb={2}>
              <Typography variant="body2" fontWeight="bold" mb={1} sx={{ color: '#E2E8F0' }}>
                Based on your interest in: {path.based_on_interest}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                {path.total_steps} steps • {path.steps.reduce((sum, step) => sum + step.estimated_hours, 0)} hours total
              </Typography>
            </Box>

            <Accordion sx={{
              backgroundColor: '#0F766E',
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#14B8A6' }} />}>
                <Typography variant="body1" fontWeight="bold" sx={{ color: '#E2E8F0' }}>
                  View Learning Steps ({path.steps.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, backgroundColor: '#1A2332' }}>
                <Stepper orientation="vertical" sx={{ width: '100%' }}>
                  {path.steps.map((step, stepIndex) => (
                    <Step key={stepIndex} active={true} completed={step.is_completed}>
                      <StepLabel
                        StepIconComponent={() => <StepIcon completed={step.is_completed} />}
                        sx={{
                          '& .MuiStepLabel-label': {
                            color: '#CBD5E1'
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight="medium" sx={{ color: '#E2E8F0' }}>
                            Step {step.step_order}: {step.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            {step.description}
                          </Typography>
                          <Box mt={1}>
                            <Chip
                              label={`${step.estimated_hours} hours`}
                              size="small"
                              variant="outlined"
                              sx={{
                                mr: 1,
                                borderColor: '#14B8A6',
                                color: '#14B8A6'
                              }}
                            />
                            {step.skill_category_id && (
                              <Chip
                                label="Skill Focus"
                                size="small"
                                sx={{
                                  backgroundColor: '#0F766E',
                                  color: '#14B8A6'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                          {step.is_completed ? 'Completed' : 'Not started'}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </AccordionDetails>
            </Accordion>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#14B8A6',
                  color: '#14B8A6',
                  '&:hover': {
                    backgroundColor: '#0F766E',
                    borderColor: '#14B8A6'
                  }
                }}
                onClick={() => {/* Navigate to detailed view */}}
              >
                View Details
              </Button>
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#0F766E',
                  color: '#E2E8F0',
                  '&:hover': {
                    backgroundColor: '#14B8A6',
                    color: '#0F172A'
                  }
                }}
                onClick={() => handleStartPath(path.id)}
              >
                Start This Path
              </Button>
            </Box>
          </CardContent>
        </StyledCard>
      ))}

      {learningPaths.length > 0 && (
        <Box textAlign="center" mt={3}>
          <Button
            variant="outlined"
            sx={{
              borderColor: '#14B8A6',
              color: '#14B8A6',
              '&:hover': {
                backgroundColor: '#0F766E',
                borderColor: '#14B8A6'
              }
            }}
          >
            Create Custom Learning Path
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LearningPathRecommendations;