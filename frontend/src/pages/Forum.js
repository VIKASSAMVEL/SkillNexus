import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Fab
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const Forum = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    sort: 'latest',
    page: 1
  });
  const [categories] = useState([
    { id: 'all', name: 'All Categories' },
    { id: 'general', name: 'General Discussion' },
    { id: 'skills', name: 'Skills & Learning' },
    { id: 'projects', name: 'Projects & Collaboration' },
    { id: 'help', name: 'Help & Support' },
    { id: 'announcements', name: 'Announcements' }
  ]);

  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
  };

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        category: filters.category === 'all' ? undefined : filters.category,
        search: filters.search || undefined,
        sort: filters.sort,
        limit: 20,
        offset: (filters.page - 1) * 20
      };

      const response = await api.get('/forum/topics', { params });
      setTopics(response.data.topics);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError('Failed to load forum topics');
      console.error('Fetch topics error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1
    }));
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      handleFilterChange('search', event.target.value);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      announcements: '#14B8A6',
      skills: '#0F172A',
      projects: '#1A2332',
      help: '#64748B',
      general: '#94A3B8'
    };
    return colors[category] || '#94A3B8';
  };

  if (loading && topics.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress sx={{ color: '#14B8A6' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#0F172A',
      color: '#E2E8F0',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              color: '#14B8A6',
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Community Forum
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#94A3B8',
              mb: 3,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Connect, share knowledge, and collaborate with the SkillNexus community
          </Typography>
        </Box>

        {/* Filters and Search */}
        <Card sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          bgcolor: '#1A2332',
          border: '1px solid #1E293B',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search topics..."
                onKeyPress={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#0F172A',
                    border: '1px solid #1E293B',
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: 'none' }
                  },
                  '& .MuiInputBase-input': {
                    color: '#E2E8F0'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A3B8' }}>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#0F172A',
                    border: '1px solid #1E293B',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSelect-select': { color: '#E2E8F0' }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id} sx={{ bgcolor: '#0F172A', color: '#E2E8F0' }}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A3B8' }}>Sort By</InputLabel>
                <Select
                  value={filters.sort}
                  label="Sort By"
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#0F172A',
                    border: '1px solid #1E293B',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSelect-select': { color: '#E2E8F0' }
                  }}
                >
                  <MenuItem value="latest" sx={{ bgcolor: '#0F172A', color: '#E2E8F0' }}>Latest Activity</MenuItem>
                  <MenuItem value="oldest" sx={{ bgcolor: '#0F172A', color: '#E2E8F0' }}>Oldest First</MenuItem>
                  <MenuItem value="most_replies" sx={{ bgcolor: '#0F172A', color: '#E2E8F0' }}>Most Replies</MenuItem>
                  <MenuItem value="most_likes" sx={{ bgcolor: '#0F172A', color: '#E2E8F0' }}>Most Likes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              {isAuthenticated() ? (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/forum/new-topic')}
                  sx={{
                    height: 56,
                    borderRadius: 2,
                    fontWeight: 600,
                    bgcolor: '#14B8A6',
                    '&:hover': { bgcolor: '#0F766E' },
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(20, 184, 166, 0.4)',
                    }
                  }}
                >
                  New Topic
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/login')}
                  sx={{
                    height: 56,
                    borderRadius: 2,
                    fontWeight: 600,
                    borderWidth: 2,
                    borderColor: '#14B8A6',
                    color: '#14B8A6',
                    '&:hover': {
                      borderColor: '#0F766E',
                      bgcolor: 'rgba(20, 184, 166, 0.1)',
                      color: '#14B8A6'
                    }
                  }}
                >
                  Login to Post
                </Button>
              )}
            </Grid>
          </Grid>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: '#1A2332', color: '#F87171', border: '1px solid #DC2626' }}>
            {error}
          </Alert>
        )}

        {/* Topics List */}
        {topics.length === 0 && !loading ? (
          <Card sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <Typography variant="h6" sx={{ color: '#E2E8F0', mb: 2 }}>
              No topics found
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
              {filters.search || filters.category !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Be the first to start a discussion!'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/forum/new-topic')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                bgcolor: '#14B8A6',
                '&:hover': { bgcolor: '#0F766E' },
                boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(20, 184, 166, 0.4)',
                }
              }}
            >
              Create First Topic
            </Button>
          </Card>
        ) : (
          <Box>
            {topics.map((topic) => (
              <Card
                key={topic.id}
                sx={{
                  mb: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 3,
                  bgcolor: '#1A2332',
                  border: '1px solid #1E293B',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    transform: 'translateY(-4px)',
                    borderColor: '#14B8A6'
                  },
                  ...(topic.is_pinned && {
                    border: '2px solid #14B8A6',
                    bgcolor: '#0F172A'
                  })
                }}
                onClick={() => navigate(`/forum/topic/${topic.id}`)}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Avatar
                      src={topic.author_image}
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'primary.main',
                        fontSize: '1.25rem',
                        fontWeight: 600
                      }}
                    >
                      {topic.author_name?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {topic.is_pinned && (
                          <Chip
                            label="📌 Pinned"
                            size="small"
                            sx={{
                              bgcolor: '#14B8A6',
                              color: '#0F172A',
                              fontWeight: 'bold',
                              borderRadius: 1
                            }}
                          />
                        )}
                        <Chip
                          label={topic.category}
                          size="small"
                          sx={{
                            bgcolor: getCategoryColor(topic.category),
                            color: 'white',
                            borderRadius: 1,
                            fontWeight: 500
                          }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          color: '#E2E8F0',
                          fontWeight: 'bold',
                          fontSize: '1.25rem',
                          lineHeight: 1.3
                        }}
                      >
                        {topic.title}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          color: '#94A3B8',
                          mb: 3,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.6
                        }}
                      >
                        {topic.content}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                            by {topic.author_name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748B' }}>
                            {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                              👁️ {topic.view_count || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                              💬 {topic.reply_count || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                              ❤️ {topic.like_count || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {pagination.hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={Math.ceil(pagination.total / pagination.limit)}
              page={filters.page}
              onChange={(e, page) => handleFilterChange('page', page)}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 500,
                  color: '#E2E8F0',
                  '&.Mui-selected': {
                    bgcolor: '#14B8A6',
                    color: '#0F172A',
                    boxShadow: '0 2px 8px rgba(20, 184, 166, 0.3)',
                    '&:hover': {
                      bgcolor: '#0F766E'
                    }
                  },
                  '&:hover': {
                    bgcolor: '#1A2332'
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Floating Action Button for Mobile */}
        {isAuthenticated() && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 64,
              height: 64,
              bgcolor: '#14B8A6',
              boxShadow: '0 4px 16px rgba(20, 184, 166, 0.4)',
              '&:hover': {
                bgcolor: '#0F766E',
                boxShadow: '0 6px 20px rgba(20, 184, 166, 0.5)',
              },
              display: { xs: 'flex', md: 'none' }
            }}
            onClick={() => navigate('/forum/new-topic')}
          >
            <AddIcon sx={{ fontSize: '1.75rem' }} />
          </Fab>
        )}
      </Container>
    </Box>
  );
};

export default Forum;