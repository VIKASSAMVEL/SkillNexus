import React, { useState } from 'react';
import { Typography, TextField, Button, Paper, Box, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        location: formData.location
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 'sm', px: { xs: 2, sm: 4 } }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              bgcolor: '#1A2332',
              border: '1px solid #1E293B',
              borderRadius: 2
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              align="center"
              sx={{ color: '#14B8A6', fontWeight: 600, mb: 3 }}
            >
              Register
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#7F1D1D', color: '#FCA5A5' }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
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
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
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
              />

              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
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
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
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
              />

              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
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
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  mb: 2,
                  bgcolor: '#0F766E',
                  '&:hover': { 
                    bgcolor: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>

              <Typography align="center" sx={{ color: '#CBD5E1' }}>
                Already have an account? <Link to="/login" style={{ color: '#14B8A6', textDecoration: 'none', fontWeight: 600 }}>Login here</Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;