import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Reply as ReplyIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

const TopicDetail = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [userLikes, setUserLikes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  // Helper function to format dates
  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
  };

  const fetchTopic = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/forum/topics/${topicId}`);
      setTopic(response.data.topic);
      setReplies(response.data.replies);
      setUserLikes(response.data.userLikes);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Topic not found');
      } else {
        setError('Failed to load topic');
      }
      console.error('Fetch topic error:', err);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      setSubmittingReply(true);
      await api.post(`/forum/topics/${topicId}/replies`, {
        content: replyContent,
        parent_reply_id: replyingTo?.id
      });

      setReplyContent('');
      setReplyingTo(null);
      setShowReplyForm(false);
      fetchTopic(); // Refresh to show new reply
    } catch (err) {
      setError('Failed to post reply');
      console.error('Reply error:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLike = async (contentType, contentId, likeType) => {
    try {
      await api.post('/forum/like', {
        content_type: contentType,
        content_id: contentId,
        like_type: likeType
      });

      // Update local state
      const key = `${contentType}_${contentId}`;
      const currentLike = userLikes[key];

      if (currentLike === likeType) {
        // Remove like
        setUserLikes(prev => {
          const newLikes = { ...prev };
          delete newLikes[key];
          return newLikes;
        });
      } else {
        // Add or change like
        setUserLikes(prev => ({
          ...prev,
          [key]: likeType
        }));
      }

      fetchTopic(); // Refresh counts
    } catch (err) {
      setError('Failed to update like');
      console.error('Like error:', err);
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

  const renderReply = (reply, depth = 0) => {
    const isLiked = reply.likes?.some(like => like.user_id === currentUser?.id);
    const likeCount = reply.likes?.length || 0;

    return (
      <Box key={reply.id} sx={{ mb: 3, ml: depth * 6 }}>
        <Card sx={{
          borderRadius: 3,
          bgcolor: '#1A2332',
          border: '1px solid #1E293B',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          border: depth > 0 ? '1px solid #1E293B' : 'none',
          borderColor: depth > 0 ? '#1E293B' : 'transparent'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{
                width: 40,
                height: 40,
                mr: 2,
                bgcolor: '#14B8A6',
                fontSize: '1rem',
                fontWeight: 600
              }}>
                {reply.author_name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#E2E8F0' }}>
                  {reply.author_name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap', color: '#E2E8F0', lineHeight: 1.6 }}>
              {reply.content}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isAuthenticated() ? (
                <>
                  <IconButton
                    size="small"
                    onClick={() => handleLike('reply', reply.id, 'like')}
                    sx={{
                      color: isLiked ? '#14B8A6' : '#94A3B8',
                      '&:hover': { color: '#14B8A6' },
                      borderRadius: 2,
                      p: 1
                    }}
                  >
                    <ThumbUpIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                    {likeCount}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={() => {
                      setReplyingTo(reply);
                      setShowReplyForm(true);
                      setReplyContent('');
                    }}
                    sx={{
                      color: '#94A3B8',
                      '&:hover': { color: '#14B8A6' },
                      borderRadius: 2,
                      p: 1
                    }}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <Button
                  size="small"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#14B8A6',
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'rgba(20, 184, 166, 0.1)',
                      color: '#14B8A6'
                    }
                  }}
                >
                  Login to Reply
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {reply.replies && reply.replies.map(childReply => renderReply(childReply, depth + 1))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#0F172A',
        color: '#E2E8F0',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress sx={{ color: '#14B8A6' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#0F172A',
        color: '#E2E8F0',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: '#1A2332', color: '#F87171', border: '1px solid #DC2626' }}>
            {error}
          </Alert>
          <Button
            onClick={() => navigate('/forum')}
            variant="contained"
            sx={{ borderRadius: 2, bgcolor: '#14B8A6', '&:hover': { bgcolor: '#0F766E' } }}
          >
            Back to Forum
          </Button>
        </Container>
      </Box>
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
        {/* Topic Header */}
        {topic && (
          <Card sx={{
            mb: 4,
            borderRadius: 3,
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
                <Avatar
                  src={topic.author_image}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                    fontWeight: 600
                  }}
                >
                  {topic.author_name?.charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
                    {topic.is_pinned && (
                      <Chip
                        label="📌 Pinned"
                        size="small"
                        sx={{
                          bgcolor: '#14B8A6',
                          color: '#0F172A',
                          borderRadius: 1,
                          fontWeight: 600
                        }}
                      />
                    )}
                    {topic.is_locked && (
                      <Chip
                        label="🔒 Locked"
                        size="small"
                        sx={{
                          bgcolor: '#DC2626',
                          color: 'white',
                          borderRadius: 1,
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      mb: 2,
                      color: '#E2E8F0',
                      fontWeight: 'bold',
                      fontSize: '2rem',
                      lineHeight: 1.2
                    }}
                  >
                    {topic.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                    <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                      by {topic.author_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        👁️ {topic.view_count || 0} views
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: '#E2E8F0',
                  whiteSpace: 'pre-wrap',
                  mb: 3,
                  fontSize: '1.1rem',
                  lineHeight: 1.7
                }}
              >
                {topic.content}
              </Typography>

              {(() => {
                const isLiked = topic.likes?.some(like => like.user_id === currentUser?.id);
                const likeCount = topic.likes?.length || 0;
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
                    {isAuthenticated() ? (
                      <>
                        <IconButton
                          onClick={() => handleLike('topic', topic.id, 'like')}
                          sx={{
                            color: isLiked ? '#14B8A6' : '#94A3B8',
                            '&:hover': { color: '#14B8A6' },
                            borderRadius: 2,
                            p: 1
                          }}
                        >
                          <ThumbUpIcon />
                        </IconButton>
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                          {likeCount} likes
                        </Typography>

                        <Button
                          onClick={() => {
                            setReplyingTo(null);
                            setShowReplyForm(true);
                            setReplyContent('');
                          }}
                          startIcon={<ReplyIcon />}
                          sx={{
                            color: '#14B8A6',
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            fontWeight: 500,
                            '&:hover': {
                              bgcolor: 'rgba(20, 184, 166, 0.1)',
                              color: '#14B8A6'
                            }
                          }}
                        >
                          Reply
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => navigate('/login')}
                        startIcon={<ReplyIcon />}
                        sx={{
                          color: '#14B8A6',
                          textTransform: 'none',
                          borderRadius: 2,
                          px: 2,
                          py: 1,
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: 'rgba(20, 184, 166, 0.1)',
                            color: '#14B8A6'
                          }
                        }}
                      >
                        Login to Reply
                      </Button>
                    )}
                  </Box>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Reply Form */}
        {showReplyForm && isAuthenticated() && (
          <Card sx={{
            mb: 4,
            borderRadius: 3,
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#E2E8F0', fontWeight: 600 }}>
                {replyingTo ? `Reply to ${replyingTo.author_name}` : 'Post a Reply'}
              </Typography>

              {replyingTo && (
                <Box sx={{
                  p: 3,
                  bgcolor: '#0F172A',
                  borderRadius: 2,
                  mb: 3,
                  border: '1px solid #1E293B'
                }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>
                    "{replyingTo.content.substring(0, 100)}{replyingTo.content.length > 100 ? '...' : ''}"
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                sx={{
                  mb: 3,
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

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleReply}
                  disabled={submittingReply || !replyContent.trim()}
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
                    },
                    '&:disabled': {
                      bgcolor: '#64748B'
                    }
                  }}
                >
                  {submittingReply ? <CircularProgress size={20} /> : 'Post Reply'}
                </Button>

                <Button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    color: '#94A3B8'
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Replies */}
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            color: '#E2E8F0',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          💬 {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </Typography>

        {replies.length === 0 ? (
          <Card sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <Typography variant="h6" sx={{ color: '#E2E8F0', mb: 2 }}>
              No replies yet
            </Typography>
            <Typography variant="body1" sx={{ color: '#94A3B8', mb: 3 }}>
              Be the first to join the conversation!
            </Typography>
            <Button
              variant="contained"
              startIcon={<ReplyIcon />}
              onClick={() => setShowReplyForm(true)}
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
              Post First Reply
            </Button>
          </Card>
        ) : (
          replies.map((reply) => renderReply(reply))
        )}

        {/* Menu for reply actions - TODO: Implement moderation features */}
        {/* <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => {
            setMenuAnchor(null);
          }}
        >
          <MenuItem onClick={() => {
            // Handle report reply
            setMenuAnchor(null);
          }}>
            <FlagIcon sx={{ mr: 1 }} />
            Report Reply
          </MenuItem>
        </Menu> */}
      </Container>
    </Box>
  );
};

export default TopicDetail;