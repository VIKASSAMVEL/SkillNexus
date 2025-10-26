import React, { useState } from 'react';
import { Typography, TextField, Button, Paper, Box, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { keyframes } from '@mui/system';
import api from '../services/api';
import Footer from '../components/Footer';

// Animations
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

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
      p: 0,
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
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        py: 4,
        position: 'relative',
        zIndex: 2
      }}>
        <Box sx={{ width: '100%', maxWidth: 'sm', px: { xs: 2, sm: 4 } }}>
          {/* Animated decorative elements */}
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
          <Box
            sx={{
              position: 'absolute',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(15, 118, 110, 0.1) 0%, transparent 70%)',
              bottom: '-75px',
              right: '-75px',
              animation: `${glow} 5s ease-in-out infinite reverse`,
              pointerEvents: 'none'
            }}
          />

          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              bgcolor: '#1A2332',
              border: '1px solid #1E293B',
              borderRadius: 2,
              animation: `${fadeInUp} 0.6s ease-out`,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: 'rgba(20, 184, 166, 0.3)',
                transition: 'border-color 0.3s ease'
              }
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3, animation: `${fadeInUp} 0.8s ease-out 0.1s backwards` }}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: '#14B8A6', 
                  fontWeight: 700, 
                  mb: 1,
                  fontSize: { xs: '1.8rem', sm: '2.125rem' }
                }}
              >
                Welcome Back
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#94A3B8',
                  fontSize: '0.9rem',
                  letterSpacing: '0.5px'
                }}
              >
                Access your SkillNexus account
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#7F1D1D', color: '#FCA5A5', animation: `${fadeInUp} 0.3s ease-out` }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                sx={{ 
                  mb: 2,
                  animation: `${fadeInUp} 0.6s ease-out 0.2s backwards`,
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    transition: 'all 0.3s ease',
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
                  '& .MuiInputBase-input::placeholder': {
                    color: '#94A3B8',
                    opacity: 0.7
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
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                sx={{ 
                  mb: 3,
                  animation: `${fadeInUp} 0.6s ease-out 0.3s backwards`,
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    transition: 'all 0.3s ease',
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
                  '& .MuiInputBase-input::placeholder': {
                    color: '#94A3B8',
                    opacity: 0.7
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
                  animation: `${fadeInUp} 0.6s ease-out 0.4s backwards`,
                  bgcolor: '#0F766E',
                  fontWeight: 600,
                  fontSize: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    animation: `${shimmer} 2s infinite`,
                    transition: 'left 0.3s ease'
                  },
                  '&:hover': { 
                    bgcolor: '#14B8A6',
                    color: '#0F172A',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(20, 184, 166, 0.3)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Typography 
                align="center" 
                sx={{ 
                  color: '#CBD5E1',
                  animation: `${fadeInUp} 0.6s ease-out 0.5s backwards`,
                  fontSize: '0.95rem'
                }}
              >
                Don't have an account? <Link to="/register" style={{ color: '#14B8A6', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.target.style.color = '#10B981'} onMouseLeave={(e) => e.target.style.color = '#14B8A6'}>Register here</Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;