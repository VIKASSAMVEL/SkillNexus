import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';
import api from '../services/api';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(20, 184, 166, 0.1), 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(20, 184, 166, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

const NewTopic = () => {
  const navigate = useNavigate();

  // Helper function to check authentication
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'general', name: 'General Discussion', description: 'General topics and community discussions' },
    { id: 'skills', name: 'Skills & Learning', description: 'Questions about skills, learning techniques, and tutoring' },
    { id: 'projects', name: 'Projects & Collaboration', description: 'Project ideas, collaboration opportunities, and team formation' },
    { id: 'help', name: 'Help & Support', description: 'Get help with platform features and technical issues' },
    { id: 'announcements', name: 'Announcements', description: 'Official announcements and platform updates' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/forum/topics', formData);

      // Redirect to the newly created topic
      navigate(`/forum/topic/${response.data.topicId}`);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('You must be logged in to create a topic');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid data provided');
      } else {
        setError('Failed to create topic. Please try again.');
      }
      console.error('Create topic error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#0F172A',
      color: '#E2E8F0',
      py: 4,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(15, 118, 110, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 1
      }
    }}>
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%)',
            top: '-100px',
            left: '-100px',
            animation: `${glow} 4s ease-in-out infinite`,
            pointerEvents: 'none'
          }}
        />
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center', animation: `${fadeInUp} 0.6s ease-out` }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              color: '#14B8A6',
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.125rem' }
            }}
          >
            Create New Topic
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#94A3B8',
              maxWidth: 500,
              mx: 'auto',
              fontSize: '0.95rem'
            }}
          >
            Start a discussion with the SkillNexus community
          </Typography>
        </Box>

        {/* Form */}
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 0 20px rgba(20, 184, 166, 0.15)',
          bgcolor: '#1A2332',
          border: '1px solid #1E293B',
          animation: `${fadeInUp} 0.6s ease-out 0.1s backwards`,
          '&:hover': {
            borderColor: 'rgba(20, 184, 166, 0.3)',
            transition: 'border-color 0.3s ease'
          }
        }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: '#7F1D1D', color: '#FCA5A5' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Topic Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                sx={{
                  mb: 3,
                  animation: `${fadeInUp} 0.6s ease-out 0.2s backwards`,
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#1E293B',
                      transition: 'border-color 0.3s ease'
                    },
                    '&:hover fieldset': {
                      borderColor: '#14B8A6'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#14B8A6',
                      boxShadow: 'inset 0 0 10px rgba(20, 184, 166, 0.1)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 12px rgba(20, 184, 166, 0.15)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94A3B8',
                    '&.Mui-focused': {
                      color: '#14B8A6'
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#94A3B8'
                  }
                }}
                helperText="Choose a clear, descriptive title for your topic"
              />

              <FormControl fullWidth sx={{ mb: 3, animation: `${fadeInUp} 0.6s ease-out 0.25s backwards` }}>
                <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Category *</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleChange('category', e.target.value)}
                  required
                  sx={{
                    color: '#E2E8F0',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1E293B'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#14B8A6'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#14B8A6',
                      boxShadow: '0 0 12px rgba(20, 184, 166, 0.15)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#94A3B8'
                    }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id} sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: '#0F766E' } }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                          {category.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Content"
                multiline
                rows={8}
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                required
                sx={{
                  mb: 3,
                  animation: `${fadeInUp} 0.6s ease-out 0.3s backwards`,
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#1E293B',
                      transition: 'border-color 0.3s ease'
                    },
                    '&:hover fieldset': {
                      borderColor: '#14B8A6'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#14B8A6',
                      boxShadow: 'inset 0 0 10px rgba(20, 184, 166, 0.1)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 12px rgba(20, 184, 166, 0.15)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94A3B8',
                    '&.Mui-focused': {
                      color: '#14B8A6'
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#94A3B8'
                  }
                }}
                helperText="Describe your topic in detail. Be respectful and follow community guidelines."
                placeholder="What's on your mind? Share your thoughts, questions, or ideas with the community..."
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', animation: `${fadeInUp} 0.6s ease-out 0.35s backwards` }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/forum')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    color: '#94A3B8',
                    borderColor: '#1E293B',
                    '&:hover': {
                      borderColor: '#14B8A6',
                      bgcolor: 'rgba(20, 184, 166, 0.1)',
                      color: '#14B8A6'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    bgcolor: '#0F766E',
                    color: '#E2E8F0',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
                    '&:hover': {
                      bgcolor: '#14B8A6',
                      color: '#0F172A',
                      boxShadow: '0 6px 16px rgba(20, 184, 166, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      bgcolor: '#374151',
                      color: '#9CA3AF'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Creating...
                    </>
                  ) : (
                    'Create Topic'
                  )}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card sx={{
          mt: 4,
          borderRadius: 3,
          boxShadow: '0 0 20px rgba(20, 184, 166, 0.1)',
          bgcolor: '#1A2332',
          border: '1px solid #1E293B',
          animation: `${fadeInUp} 0.6s ease-out 0.2s backwards`
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#14B8A6', fontWeight: 600 }}>
              Community Guidelines
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1.5, color: '#CBD5E1' }}>
                Be respectful and considerate of other community members
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1.5, color: '#CBD5E1' }}>
                Use clear and descriptive titles for your topics
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1.5, color: '#CBD5E1' }}>
                Choose the most appropriate category for your topic
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1.5, color: '#CBD5E1' }}>
                Avoid spam, duplicate posts, and off-topic content
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0, color: '#CBD5E1' }}>
                Report inappropriate content using the flag option
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default NewTopic;