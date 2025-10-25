import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Paper, Box, TextField, Button, Alert, Avatar, Divider, Chip, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon, Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';
import api, { reviewsAPI } from '../services/api';
import Footer from '../components/Footer';
import UserReputation from '../components/UserReputation';
import ReviewCard from '../components/ReviewCard';

// Add global animation styles
const globalStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(20, 184, 166, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(20, 184, 166, 0.5);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reputationData, setReputationData] = useState(null);
  const [endorsements, setEndorsements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
      setFormData({
        name: response.data.user.name || '',
        phone: response.data.user.phone || '',
        location: response.data.user.location || '',
        bio: response.data.user.bio || ''
      });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchReputationData = useCallback(async (userId) => {
    try {
      const [reputationRes, endorsementsRes, reviewsRes] = await Promise.all([
        reviewsAPI.getUserReputation(userId),
        reviewsAPI.getUserEndorsements(userId),
        reviewsAPI.getUserReviews(userId)
      ]);

      setReputationData(reputationRes.data);
      setEndorsements(endorsementsRes.data.endorsements || []);
      setReviews(reviewsRes.data.reviews || []);
    } catch (err) {
      console.error('Failed to load reputation data:', err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user?.id) {
      fetchReputationData(user.id);
    }
  }, [user, fetchReputationData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put('/auth/profile', formData);
      setSuccess('Profile updated successfully');
      setEditing(false);
      fetchProfile(); // Refresh data
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        bgcolor: '#0F172A', 
        color: '#E2E8F0', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        m: 0,
        p: 0
      }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#14B8A6',
                animation: 'pulse 2s ease-in-out infinite',
                fontWeight: 700,
                fontSize: 32
              }} 
            >
              ⏳
            </Avatar>
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTop: '3px solid #14B8A6',
                borderRight: '3px solid #0F766E',
                animation: 'rotate 2s linear infinite',
                '@keyframes rotate': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' }
                }
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 500 }}>Loading your profile...</Typography>
          <LinearProgress 
            sx={{ 
              width: '200px', 
              bgcolor: '#1E293B', 
              borderRadius: 1,
              '& .MuiLinearProgress-bar': { 
                bgcolor: '#14B8A6',
                animation: 'shimmer 2s infinite'
              } 
            }} 
          />
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ 
        bgcolor: '#0F172A', 
        color: '#E2E8F0', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        m: 0,
        p: 0
      }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#7F1D1D' }}>!</Avatar>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#E2E8F0', mb: 1 }}>Profile Not Found</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>We couldn't load your profile. Please try logging in again.</Typography>
          </Box>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#0F172A', 
      color: '#E2E8F0', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      m: 0,
      p: 0
    }}>
      <Box sx={{ flex: 1, py: 4, px: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          {/* Header Section */}
          <Box sx={{ mb: 4, animation: 'fadeInUp 0.6s ease-out' }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                color: '#E2E8F0', 
                fontWeight: 700, 
                mb: 1,
                background: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                letterSpacing: '-0.02em'
              }}
            >
              My Profile
            </Typography>
            <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 500, letterSpacing: '0.3px' }}>
              Manage your account information and reputation
            </Typography>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError('')}
              sx={{ 
                mb: 3,
                animation: 'slideInLeft 0.4s ease-out',
                bgcolor: 'rgba(127, 29, 29, 0.15)',
                color: '#FCA5A5',
                border: '1px solid rgba(252, 165, 165, 0.3)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                '& .MuiAlert-icon': {
                  color: '#FCA5A5'
                }
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              onClose={() => setSuccess('')}
              sx={{ 
                mb: 3,
                animation: 'slideInLeft 0.4s ease-out',
                bgcolor: 'rgba(6, 95, 70, 0.15)',
                color: '#86EFAC',
                border: '1px solid rgba(134, 239, 172, 0.3)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                '& .MuiAlert-icon': {
                  color: '#86EFAC'
                }
              }}
            >
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Profile Card - expanded horizontally */}
            <Grid item xs={12} md={reputationData ? 6 : 8} sx={{ display: 'flex' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  bgcolor: '#1A2332',
                  border: '1px solid #1E293B',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #1A2332 0%, #263549 100%)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'fadeInUp 0.6s ease-out 0.1s both',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.1), transparent)',
                    animation: 'shimmer 3s infinite',
                  },
                  '&:hover': {
                    borderColor: '#14B8A6',
                    boxShadow: '0 12px 40px rgba(20, 184, 166, 0.15), inset 0 1px 0 rgba(20, 184, 166, 0.1)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                {/* User Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, pb: 3, borderBottom: '2px solid rgba(20, 184, 166, 0.2)', transition: 'all 0.3s ease' }}>
                  <Avatar
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      mr: 3,
                      bgcolor: '#0F766E',
                      fontSize: 40,
                      fontWeight: 700,
                      border: '3px solid #14B8A6',
                      boxShadow: '0 0 30px rgba(20, 184, 166, 0.4)',
                      animation: 'fadeInUp 0.6s ease-out 0.2s both',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 0 40px rgba(20, 184, 166, 0.6)'
                      }
                    }}
                    src={user.profile_image}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                      <Typography variant="h4" sx={{ color: '#E2E8F0', fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {user.name}
                      </Typography>
                      {user.is_verified && (
                        <Chip
                          label="✓ Verified"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(20, 184, 166, 0.15)',
                            color: '#14B8A6',
                            border: '1.5px solid #14B8A6',
                            fontWeight: 700,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'rgba(20, 184, 166, 0.25)',
                              boxShadow: '0 0 12px rgba(20, 184, 166, 0.3)'
                            }
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, fontWeight: 500 }}>
                      <EmailIcon sx={{ fontSize: 16, color: '#14B8A6' }} /> {user.email}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                      Member since {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </Typography>
                  </Box>
                </Box>

                {/* Form / View Mode */}
                {editing ? (
                  <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6" sx={{ color: '#E2E8F0', mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, animation: 'fadeInUp 0.6s ease-out both' }}>
                      <EditIcon sx={{ color: '#14B8A6' }} /> Edit Profile Information
                    </Typography>

                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      variant="outlined"
                      sx={{ 
                        mb: 2.5,
                        animation: 'fadeInUp 0.6s ease-out 0.1s both',
                        '& .MuiOutlinedInput-root': {
                          color: '#E2E8F0',
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '& fieldset': {
                            borderColor: '#1E293B'
                          },
                          '&:hover fieldset': {
                            borderColor: '#14B8A6',
                            boxShadow: 'inset 0 0 8px rgba(20, 184, 166, 0.1)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#14B8A6',
                            boxShadow: '0 0 16px rgba(20, 184, 166, 0.3), inset 0 0 8px rgba(20, 184, 166, 0.1)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94A3B8',
                          fontWeight: 500,
                          '&.Mui-focused': {
                            color: '#14B8A6'
                          }
                        }
                      }}
                      onChange={handleChange}
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      variant="outlined"
                      sx={{ 
                        mb: 2.5,
                        animation: 'fadeInUp 0.6s ease-out 0.15s both',
                        '& .MuiOutlinedInput-root': {
                          color: '#E2E8F0',
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '& fieldset': {
                            borderColor: '#1E293B'
                          },
                          '&:hover fieldset': {
                            borderColor: '#14B8A6',
                            boxShadow: 'inset 0 0 8px rgba(20, 184, 166, 0.1)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#14B8A6',
                            boxShadow: '0 0 16px rgba(20, 184, 166, 0.3), inset 0 0 8px rgba(20, 184, 166, 0.1)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94A3B8',
                          fontWeight: 500,
                          '&.Mui-focused': {
                            color: '#14B8A6'
                          }
                        }
                      }}
                      onChange={handleChange}
                    />
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={formData.location}
                      variant="outlined"
                      sx={{ 
                        mb: 2.5,
                        animation: 'fadeInUp 0.6s ease-out 0.2s both',
                        '& .MuiOutlinedInput-root': {
                          color: '#E2E8F0',
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '& fieldset': {
                            borderColor: '#1E293B'
                          },
                          '&:hover fieldset': {
                            borderColor: '#14B8A6',
                            boxShadow: 'inset 0 0 8px rgba(20, 184, 166, 0.1)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#14B8A6',
                            boxShadow: '0 0 16px rgba(20, 184, 166, 0.3), inset 0 0 8px rgba(20, 184, 166, 0.1)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94A3B8',
                          fontWeight: 500,
                          '&.Mui-focused': {
                            color: '#14B8A6'
                          }
                        }
                      }}
                      onChange={handleChange}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Bio"
                      name="bio"
                      value={formData.bio}
                      variant="outlined"
                      helperText={`${formData.bio.length}/500 characters`}
                      sx={{ 
                        mb: 3,
                        animation: 'fadeInUp 0.6s ease-out 0.25s both',
                        '& .MuiOutlinedInput-root': {
                          color: '#E2E8F0',
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '& fieldset': {
                            borderColor: '#1E293B'
                          },
                          '&:hover fieldset': {
                            borderColor: '#14B8A6',
                            boxShadow: 'inset 0 0 8px rgba(20, 184, 166, 0.1)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#14B8A6',
                            boxShadow: '0 0 16px rgba(20, 184, 166, 0.3), inset 0 0 8px rgba(20, 184, 166, 0.1)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94A3B8',
                          fontWeight: 500,
                          '&.Mui-focused': {
                            color: '#14B8A6'
                          }
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#64748B',
                          fontWeight: 500,
                          marginTop: '0.5rem'
                        }
                      }}
                      onChange={handleChange}
                    />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
                      <Button 
                        onClick={() => setEditing(false)} 
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        sx={{ 
                          borderColor: '#1E293B',
                          color: '#94A3B8',
                          fontWeight: 600,
                          textTransform: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#14B8A6',
                            color: '#E2E8F0',
                            bgcolor: 'rgba(20, 184, 166, 0.1)',
                            boxShadow: '0 0 12px rgba(20, 184, 166, 0.2)'
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained"
                        startIcon={<SaveIcon />}
                        sx={{ 
                          bgcolor: '#14B8A6',
                          color: '#0F172A',
                          fontWeight: 600,
                          textTransform: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': { 
                            bgcolor: '#0F766E',
                            boxShadow: '0 12px 32px rgba(20, 184, 166, 0.4)',
                            transform: 'translateY(-2px)'
                          },
                          '&:active': {
                            transform: 'translateY(0)'
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2.5, 
                          bgcolor: '#0F172A', 
                          borderRadius: 1.5,
                          border: '1px solid #1E293B',
                          transition: 'all 0.3s ease',
                          animation: 'fadeInUp 0.6s ease-out 0.2s both',
                          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            borderColor: '#14B8A6',
                            bgcolor: 'rgba(20, 184, 166, 0.05)',
                            transform: 'translateX(4px)'
                          }
                        }}>
                          <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                            Phone
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#E2E8F0', mt: 0.75, display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 500 }}>
                            <PhoneIcon sx={{ fontSize: 18, color: '#14B8A6' }} />
                            {user.phone || <span style={{ color: '#64748B', fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2.5, 
                          bgcolor: '#0F172A', 
                          borderRadius: 1.5,
                          border: '1px solid #1E293B',
                          transition: 'all 0.3s ease',
                          animation: 'fadeInUp 0.6s ease-out 0.3s both',
                          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            borderColor: '#14B8A6',
                            bgcolor: 'rgba(20, 184, 166, 0.05)',
                            transform: 'translateX(4px)'
                          }
                        }}>
                          <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                            Location
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#E2E8F0', mt: 0.75, display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 500 }}>
                            <LocationOnIcon sx={{ fontSize: 18, color: '#14B8A6' }} />
                            {user.location || <span style={{ color: '#64748B', fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2.5, 
                          bgcolor: '#0F172A', 
                          borderRadius: 1.5,
                          border: '1px solid #1E293B',
                          transition: 'all 0.3s ease',
                          animation: 'fadeInUp 0.6s ease-out 0.4s both',
                          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            borderColor: '#14B8A6',
                            bgcolor: 'rgba(20, 184, 166, 0.05)',
                            transform: 'translateX(4px)'
                          }
                        }}>
                          <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                            Bio
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#CBD5E1', mt: 0.75, lineHeight: 1.7, fontWeight: 400 }}>
                            {user.bio || <span style={{ color: '#64748B', fontStyle: 'italic' }}>No bio yet</span>}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Button 
                      onClick={() => setEditing(true)} 
                      variant="contained"
                      startIcon={<EditIcon />}
                      sx={{ 
                        bgcolor: '#0F766E',
                        color: '#E2E8F0',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        px: 3,
                        py: 1.2,
                        borderRadius: 1.5,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { 
                          bgcolor: '#14B8A6',
                          color: '#0F172A',
                          boxShadow: '0 12px 28px rgba(20, 184, 166, 0.3)',
                          transform: 'translateY(-2px)'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Reputation Sidebar - Split into 2 columns, expanded */}
            {reputationData && (
              <>
                <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      bgcolor: '#1A2332',
                      border: '1px solid #1E293B',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1A2332 0%, #263549 100%)',
                      animation: 'fadeInUp 0.6s ease-out 0.2s both',
                      transition: 'all 0.3s ease',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      minHeight: '500px',
                      '&:hover': {
                        borderColor: '#14B8A6',
                        boxShadow: '0 12px 40px rgba(20, 184, 166, 0.15)',
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 3, height: 20, bgcolor: '#14B8A6', borderRadius: 1 }} />
                      Trust Score
                    </Typography>
                    
                    {/* Display only Trust Score metrics */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                      <Box sx={{ 
                        p: 2.5, 
                        bgcolor: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: 1.5,
                        border: '1px solid rgba(20, 184, 166, 0.2)',
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#14B8A6',
                          bgcolor: 'rgba(20, 184, 166, 0.08)'
                        }
                      }}>
                        <Typography variant="h4" sx={{ color: '#14B8A6', fontWeight: 700, mb: 0.5 }}>
                          {reputationData?.trust_score ? reputationData.trust_score.toFixed(1) : '0.0'}/5.0
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>Trust Score</Typography>
                      </Box>

                      <Box sx={{ 
                        p: 2.5, 
                        bgcolor: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: 1.5,
                        border: '1px solid rgba(20, 184, 166, 0.2)',
                        backdropFilter: 'blur(10px)',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#14B8A6',
                          bgcolor: 'rgba(20, 184, 166, 0.08)'
                        }
                      }}>
                        <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'uppercase', fontWeight: 700, mb: 1.5, display: 'block' }}>Score Breakdown</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 500 }}>Average Rating (50%)</Typography>
                              <Typography variant="caption" sx={{ color: '#14B8A6', fontWeight: 600 }}>{reputationData?.average_rating ? reputationData.average_rating.toFixed(1) : '0.0'}★</Typography>
                            </Box>
                            <Box sx={{ height: 4, bgcolor: 'rgba(30, 41, 59, 0.8)', borderRadius: 2, overflow: 'hidden' }}>
                              <Box sx={{ height: '100%', width: `${(reputationData?.average_rating || 0) * 20}%`, bgcolor: '#14B8A6', transition: 'width 0.3s ease' }} />
                            </Box>
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 500 }}>Completion Rate (30%)</Typography>
                              <Typography variant="caption" sx={{ color: '#14B8A6', fontWeight: 600 }}>{reputationData?.completion_rate ? reputationData.completion_rate.toFixed(1) : '0.0'}%</Typography>
                            </Box>
                            <Box sx={{ height: 4, bgcolor: 'rgba(30, 41, 59, 0.8)', borderRadius: 2, overflow: 'hidden' }}>
                              <Box sx={{ height: '100%', width: `${reputationData?.completion_rate || 0}%`, bgcolor: '#14B8A6', transition: 'width 0.3s ease' }} />
                            </Box>
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 500 }}>Other Factors (20%)</Typography>
                              <Typography variant="caption" sx={{ color: '#14B8A6', fontWeight: 600 }}>Auto</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      bgcolor: '#1A2332',
                      border: '1px solid #1E293B',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1A2332 0%, #263549 100%)',
                      animation: 'fadeInUp 0.6s ease-out 0.25s both',
                      transition: 'all 0.3s ease',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      minHeight: '500px',
                      '&:hover': {
                        borderColor: '#14B8A6',
                        boxShadow: '0 12px 40px rgba(20, 184, 166, 0.15)',
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 3, height: 20, bgcolor: '#14B8A6', borderRadius: 1 }} />
                      Reputation
                    </Typography>
                    
                    {/* Display only Reputation metrics */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                      <Box sx={{ 
                        p: 2.5, 
                        bgcolor: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: 1.5,
                        border: '1px solid rgba(20, 184, 166, 0.2)',
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#14B8A6',
                          bgcolor: 'rgba(20, 184, 166, 0.08)'
                        }
                      }}>
                        <Typography variant="h4" sx={{ color: '#14B8A6', fontWeight: 700, mb: 0.5 }}>
                          ★★★★★ {reputationData?.average_rating ? reputationData.average_rating.toFixed(1) : '0.0'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                          Average Rating ({reputationData?.total_reviews || 0} reviews)
                        </Typography>
                      </Box>

                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(15, 23, 42, 0.6)',
                            borderRadius: 1.5,
                            border: '1px solid rgba(20, 184, 166, 0.2)',
                            textAlign: 'center',
                            backdropFilter: 'blur(10px)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: '#14B8A6',
                              bgcolor: 'rgba(20, 184, 166, 0.08)',
                              transform: 'translateY(-2px)'
                            }
                          }}>
                            <Typography variant="h5" sx={{ color: '#14B8A6', fontWeight: 700, mb: 0.5 }}>
                              {reputationData?.skill_endorsements || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>Endorsements</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(15, 23, 42, 0.6)',
                            borderRadius: 1.5,
                            border: '1px solid rgba(20, 184, 166, 0.2)',
                            textAlign: 'center',
                            backdropFilter: 'blur(10px)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: '#14B8A6',
                              bgcolor: 'rgba(20, 184, 166, 0.08)',
                              transform: 'translateY(-2px)'
                            }
                          }}>
                            <Typography variant="h5" sx={{ color: '#14B8A6', fontWeight: 700, mb: 0.5 }}>
                              {reputationData?.total_sessions || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>Sessions</Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ 
                        p: 2.5, 
                        bgcolor: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: 1.5,
                        border: '1px solid rgba(20, 184, 166, 0.2)',
                        backdropFilter: 'blur(10px)',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#14B8A6',
                          bgcolor: 'rgba(20, 184, 166, 0.08)'
                        }
                      }}>
                        <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'uppercase', fontWeight: 700, mb: 1.5, display: 'block' }}>Completion Rate</Typography>
                        <Typography variant="h5" sx={{ color: '#14B8A6', fontWeight: 700, mb: 1.5 }}>
                          {reputationData?.completion_rate ? reputationData.completion_rate.toFixed(1) : '0.0'}%
                        </Typography>
                        <Box sx={{ height: 6, bgcolor: 'rgba(30, 41, 59, 0.8)', borderRadius: 2, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${reputationData?.completion_rate || 0}%`, bgcolor: 'linear-gradient(90deg, #14B8A6, #0F766E)', transition: 'width 0.3s ease' }} />
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <Box sx={{ mt: 8, animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#E2E8F0', 
                  fontWeight: 700,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  fontSize: { xs: '1.4rem', md: '1.5rem' }
                }}
              >
                <Box 
                  sx={{ 
                    width: 4, 
                    height: 28, 
                    bgcolor: '#14B8A6',
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 0 16px rgba(20, 184, 166, 0.3)'
                  }} 
                />
                Recent Reviews 
                <Chip 
                  label={reviews.length} 
                  size="small" 
                  variant="outlined" 
                  sx={{ 
                    borderColor: '#14B8A6', 
                    color: '#14B8A6',
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(20, 184, 166, 0.1)',
                      boxShadow: '0 0 12px rgba(20, 184, 166, 0.3)'
                    }
                  }} 
                />
              </Typography>
              
              <Grid container spacing={2.5}>
                {reviews.slice(0, 3).map((review, index) => (
                  <Grid item xs={12} key={review.id} sx={{ animation: `fadeInUp 0.6s ease-out ${0.4 + index * 0.1}s both` }}>
                    <ReviewCard
                      review={review}
                      currentUserId={user.id}
                      onVote={async (reviewId, helpful) => {
                        await reviewsAPI.voteOnReview(reviewId, helpful ? 'helpful' : 'not_helpful');
                        fetchReputationData(user.id);
                      }}
                      onReport={async (reviewId, reason, details) => {
                        await reviewsAPI.reportReview(reviewId, { reason, details });
                      }}
                      onRespond={async (reviewId, responseText) => {
                        await reviewsAPI.respondToReview(reviewId, { response_text: responseText });
                        fetchReputationData(user.id);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              {reviews.length > 3 && (
                <Box sx={{ 
                  mt: 4, 
                  p: 3, 
                  textAlign: 'center', 
                  bgcolor: 'rgba(20, 184, 166, 0.05)', 
                  borderRadius: 2, 
                  border: '1.5px dashed rgba(20, 184, 166, 0.2)',
                  transition: 'all 0.3s ease',
                  animation: 'fadeInUp 0.6s ease-out 0.7s both',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    borderColor: 'rgba(20, 184, 166, 0.4)'
                  }
                }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                    And <strong style={{ color: '#14B8A6', fontSize: '1.1em' }}>{reviews.length - 3}</strong> more review{reviews.length - 3 !== 1 ? 's' : ''}...
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Profile;