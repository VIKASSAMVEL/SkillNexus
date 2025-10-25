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
import api from '../services/api';

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
      bgcolor: 'background.default',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              color: 'text.primary',
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Create New Topic
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            Start a discussion with the SkillNexus community
          </Typography>
        </Box>

        {/* Form */}
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
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
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                helperText="Choose a clear, descriptive title for your topic"
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleChange('category', e.target.value)}
                  required
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
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
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                helperText="Describe your topic in detail. Be respectful and follow community guidelines."
                placeholder="What's on your mind? Share your thoughts, questions, or ideas with the community..."
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/forum')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    color: 'text.secondary',
                    borderColor: 'grey.300',
                    '&:hover': {
                      borderColor: 'text.secondary',
                      bgcolor: 'grey.50'
                    }
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
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(20, 184, 166, 0.4)',
                    },
                    '&:disabled': {
                      bgcolor: 'grey.400'
                    }
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
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          bgcolor: 'grey.50'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
              Community Guidelines
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                Be respectful and considerate of other community members
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                Use clear and descriptive titles for your topics
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                Choose the most appropriate category for your topic
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                Avoid spam, duplicate posts, and off-topic content
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0, color: 'text.secondary' }}>
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