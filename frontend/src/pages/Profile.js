import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Paper, Box, TextField, Button, Alert, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>Loading profile...</Typography>
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
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>Profile not found</Typography>
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
        <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ color: '#14B8A6', fontWeight: 600, mb: 3 }}
          >
            My Profile
          </Typography>

          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              bgcolor: '#1A2332',
              border: '1px solid #1E293B',
              borderRadius: 2
            }}
          >
            {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#7F1D1D', color: '#FCA5A5' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#065F46', color: '#86EFAC' }}>{success}</Alert>}

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mr: 3,
                  bgcolor: '#0F766E'
                }}
                src={user.profile_image}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ color: '#E2E8F0', fontWeight: 600 }}>{user.name}</Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  {user.email}
                </Typography>
                {user.is_verified && (
                  <Typography variant="body2" sx={{ color: '#14B8A6' }}>
                    ✓ Verified User
                  </Typography>
                )}
              </Box>
            </Box>

            {editing ? (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: '#E2E8F0',
                      '& fieldset': {
                        borderColor: '#1E293B'
                      },
                      '&:hover fieldset': {
                        borderColor: '#14B8A6'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#14B8A6'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#94A3B8',
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
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: '#E2E8F0',
                      '& fieldset': {
                        borderColor: '#1E293B'
                      },
                      '&:hover fieldset': {
                        borderColor: '#14B8A6'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#14B8A6'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#94A3B8',
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
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: '#E2E8F0',
                      '& fieldset': {
                        borderColor: '#1E293B'
                      },
                      '&:hover fieldset': {
                        borderColor: '#14B8A6'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#14B8A6'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#94A3B8',
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
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: '#E2E8F0',
                      '& fieldset': {
                        borderColor: '#1E293B'
                      },
                      '&:hover fieldset': {
                        borderColor: '#14B8A6'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#14B8A6'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#94A3B8',
                      '&.Mui-focused': {
                        color: '#14B8A6'
                      }
                    }
                  }}
                  onChange={handleChange}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    type="submit" 
                    variant="contained"
                    sx={{ 
                      bgcolor: '#0F766E',
                      '&:hover': { 
                        bgcolor: '#14B8A6'
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    onClick={() => setEditing(false)} 
                    variant="outlined"
                    sx={{ 
                      borderColor: '#14B8A6',
                      color: '#14B8A6',
                      '&:hover': {
                        borderColor: '#0F766E',
                        bgcolor: 'rgba(20, 184, 166, 0.1)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" sx={{ mb: 1, color: '#CBD5E1' }}>
                  <strong>Phone:</strong> {user.phone || 'Not provided'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, color: '#CBD5E1' }}>
                  <strong>Location:</strong> {user.location || 'Not provided'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#CBD5E1' }}>
                  <strong>Bio:</strong> {user.bio || 'No bio yet'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#94A3B8' }}>
                  Member since: {new Date(user.created_at).toLocaleDateString()}
                </Typography>
                <Button 
                  onClick={() => setEditing(true)} 
                  variant="contained"
                  sx={{ 
                    bgcolor: '#0F766E',
                    '&:hover': { 
                      bgcolor: '#14B8A6'
                    }
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Profile;