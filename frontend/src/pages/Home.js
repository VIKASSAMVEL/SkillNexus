import React, { useEffect, useRef } from 'react';
import {
  Typography,
  Button,
  Grid,
  Box,
  Paper,
  Avatar,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Search as SearchIcon,
  Share as ShareIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Footer from '../components/Footer';

const Home = () => {
  const isLoggedIn = localStorage.getItem('token');
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const currentRefs = cardRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <Box sx={{ 
      bgcolor: '#0F172A', 
      color: '#E2E8F0', 
      width: '100%',
      m: 0, 
      p: 0, 
      overflow: 'hidden'
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.3) 0%, rgba(20, 184, 166, 0.1) 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }
        }}
      >
        <Box sx={{ width: '100%', px: { xs: 0, sm: 0 }, position: 'relative', zIndex: 2 }}>
          <Box textAlign="center" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, gap: '16px' }}>
              <img
                src="/logo.jpg"
                alt="SkillNexus Logo"
                style={{
                  height: '100px',
                  width: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.9) 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                SkillNexus
              </Typography>
            </Box>
            <Typography
              variant="h5"
              component="p"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                mb: 5,
                opacity: 0.9,
                maxWidth: 900,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Connect with local talent, share skills, and build community projects that make a difference
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              {isLoggedIn ? (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/skills"
                    sx={{
                      bgcolor: '#14B8A6',
                      '&:hover': {
                        bgcolor: '#0F766E',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease',
                      minWidth: { xs: 200, sm: 'auto' }
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Explore Skills
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    to="/projects"
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        borderColor: '#14B8A6',
                        bgcolor: 'rgba(20, 184, 166, 0.2)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease',
                      minWidth: { xs: 200, sm: 'auto' }
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    View Projects
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/register"
                    sx={{
                      bgcolor: '#14B8A6',
                      '&:hover': {
                        bgcolor: '#0F766E',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease',
                      minWidth: { xs: 200, sm: 'auto' }
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    to="/login"
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        borderColor: '#1DB584',
                        bgcolor: 'rgba(29, 181, 132, 0.1)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease',
                      minWidth: { xs: 200, sm: 'auto' }
                    }}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Decorative Geometric Shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'rgba(245, 158, 11, 0.2)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '5%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: 'rgba(192, 132, 252, 0.2)',
            animation: 'float 4s ease-in-out infinite reverse'
          }}
        />

        {/* Animated Teal Lines/Strokes */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '15%',
            width: '2px',
            height: '150px',
            background: 'linear-gradient(to bottom, rgba(20, 184, 166, 0.8), rgba(20, 184, 166, 0))',
            animation: 'slideDown 3s ease-in-out infinite',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            right: '12%',
            width: '150px',
            height: '2px',
            background: 'linear-gradient(to right, rgba(20, 184, 166, 0), rgba(20, 184, 166, 0.6))',
            animation: 'slideRight 3.5s ease-in-out infinite',
            zIndex: 0
          }}
        />

        {/* Geometric Triangle Accent */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '0',
            height: '0',
            borderLeft: '30px solid transparent',
            borderRight: '30px solid transparent',
            borderBottom: '50px solid rgba(20, 184, 166, 0.2)',
            animation: 'float 5s ease-in-out infinite',
            zIndex: 0
          }}
        />
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#0F172A', width: '100%' }}>
        <Box textAlign="center" mb={6} sx={{ px: { xs: 2, md: 4 } }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 600,
              mb: 3,
              color: '#14B8A6'
            }}
          >
            How It Works
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 700, mx: 'auto', color: '#94A3B8', lineHeight: 1.6 }}>
            Join our community-driven platform where skills meet opportunity
          </Typography>
        </Box>

        {/* Zig-Zag Layout Container */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: { xs: 4, md: 6 },
          px: { xs: 2, md: 4 },
          maxWidth: 1200,
          mx: 'auto',
          width: '100%'
        }}>
          {/* Card 1 - Left Align */}
          <Box
            ref={(el) => (cardRefs.current[0] = el)}
            className="fade-in-card"
            sx={{
              width: { xs: '100%', md: '70%' },
              ml: { xs: 0, md: 'auto' },
              mr: { xs: 0, md: 0 },
              opacity: 0,
              transform: 'translateY(40px)',
              transition: 'all 0.6s ease'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                border: '1px solid #1E293B',
                bgcolor: '#1A2332',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(20, 184, 166, 0.15)',
                  borderColor: '#14B8A6'
                }
              }}
            >
              <Box textAlign="center" mb={3}>
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: '#0F766E',
                    boxShadow: '0 6px 18px rgba(15, 118, 110, 0.3)'
                  }}
                >
                  <SearchIcon sx={{ fontSize: 35, color: 'white' }} />
                </Avatar>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, color: '#14B8A6' }}>
                  Find Skills
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 2, lineHeight: 1.5 }} paragraph>
                Discover and connect with skilled individuals in your neighborhood. From coding to cooking,
                find the expertise you need.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip label="Local Talent" size="small" sx={{ bgcolor: '#164E63', color: '#14B8A6', fontSize: '0.7rem' }} />
                <Chip label="Verified Skills" size="small" sx={{ bgcolor: '#134E4A', color: '#14B8A6', fontSize: '0.7rem' }} />
              </Box>
              {isLoggedIn ? (
                <Button
                  variant="contained"
                  fullWidth
                  component={Link}
                  to="/skills"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#0F766E',
                    '&:hover': { bgcolor: '#14B8A6' },
                    py: 1
                  }}
                >
                  Browse Skills
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/register"
                  sx={{
                    borderColor: '#14B8A6',
                    color: '#14B8A6',
                    '&:hover': { bgcolor: '#0F766E', color: 'white' },
                    py: 1
                  }}
                >
                  Join to Browse
                </Button>
              )}
            </Paper>
          </Box>

          {/* Card 2 - Right Align */}
          <Box
            ref={(el) => (cardRefs.current[1] = el)}
            className="fade-in-card"
            sx={{
              width: { xs: '100%', md: '70%' },
              ml: { xs: 0, md: 0 },
              mr: { xs: 0, md: 'auto' },
              opacity: 0,
              transform: 'translateY(40px)',
              transition: 'all 0.6s ease'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                border: '1px solid #1E293B',
                bgcolor: '#1A2332',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(20, 184, 166, 0.15)',
                  borderColor: '#14B8A6'
                }
              }}
            >
              <Box textAlign="center" mb={3}>
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: '#14B8A6',
                    boxShadow: '0 6px 18px rgba(20, 184, 166, 0.3)'
                  }}
                >
                  <ShareIcon sx={{ fontSize: 35, color: 'white' }} />
                </Avatar>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, color: '#14B8A6' }}>
                  Share Your Skills
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 2, lineHeight: 1.5 }} paragraph>
                Offer your expertise and help others learn new things. Teach, mentor, and give back
                to your community.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip label="Teach & Learn" size="small" sx={{ bgcolor: '#134E4A', color: '#14B8A6', fontSize: '0.7rem' }} />
                <Chip label="Build Community" size="small" sx={{ bgcolor: '#164E63', color: '#14B8A6', fontSize: '0.7rem' }} />
              </Box>
              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/register"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#14B8A6',
                  '&:hover': { bgcolor: '#0F766E' },
                  py: 1
                }}
              >
                Start Sharing
              </Button>
            </Paper>
          </Box>

          {/* Card 3 - Left Align */}
          <Box
            ref={(el) => (cardRefs.current[2] = el)}
            className="fade-in-card"
            sx={{
              width: { xs: '100%', md: '70%' },
              ml: { xs: 0, md: 'auto' },
              mr: { xs: 0, md: 0 },
              opacity: 0,
              transform: 'translateY(40px)',
              transition: 'all 0.6s ease'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                border: '1px solid #1E293B',
                bgcolor: '#1A2332',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(20, 184, 166, 0.15)',
                  borderColor: '#14B8A6'
                }
              }}
            >
              <Box textAlign="center" mb={3}>
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: '#0F766E',
                    boxShadow: '0 6px 18px rgba(15, 118, 110, 0.3)'
                  }}
                >
                  <GroupIcon sx={{ fontSize: 35, color: 'white' }} />
                </Avatar>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, color: '#14B8A6' }}>
                  Community Projects
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 2, lineHeight: 1.5 }} paragraph>
                Join or create collaborative projects for community benefit. Work together on
                initiatives that make a real difference.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip label="Team Projects" size="small" sx={{ bgcolor: '#134E4A', color: '#14B8A6', fontSize: '0.7rem' }} />
                <Chip label="Community Impact" size="small" sx={{ bgcolor: '#164E63', color: '#14B8A6', fontSize: '0.7rem' }} />
              </Box>
              {isLoggedIn ? (
                <Button
                  variant="contained"
                  fullWidth
                  component={Link}
                  to="/projects"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#0F766E',
                    '&:hover': { bgcolor: '#14B8A6' },
                    py: 1
                  }}
                >
                  Explore Projects
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/register"
                  sx={{
                    borderColor: '#14B8A6',
                    color: '#14B8A6',
                    '&:hover': { bgcolor: '#0F766E', color: 'white' },
                    py: 1
                  }}
                >
                  Join Community
                </Button>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ height: '2px', bgcolor: '#1E293B', width: '100%' }} />

      {/* Stats Section */}
      <Box sx={{ bgcolor: '#0F172A', py: { xs: 8, md: 10 }, width: '100%' }}>
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={0} justifyContent="center" sx={{ width: '100%', m: 0 }}>
          <Grid sx={{ xs: 6, md: 3, p: { xs: 2, md: 4 } }}>
              <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F766E', mb: 1 }}>
                  1000+
                </Typography>
                <Typography variant="h6" sx={{ color: '#94A3B8' }}>
                  Active Members
                </Typography>
              </Box>
            </Grid>
            <Grid sx={{ xs: 6, md: 3, p: { xs: 2, md: 4 } }}>
              <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#14B8A6', mb: 1 }}>
                  500+
                </Typography>
                <Typography variant="h6" sx={{ color: '#94A3B8' }}>
                  Skills Shared
                </Typography>
              </Box>
            </Grid>
            <Grid sx={{ xs: 6, md: 3, p: { xs: 2, md: 4 } }}>
              <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#0D9488', mb: 1 }}>
                  200+
                </Typography>
                <Typography variant="h6" sx={{ color: '#94A3B8' }}>
                  Projects Completed
                </Typography>
              </Box>
            </Grid>
            <Grid sx={{ xs: 6, md: 3, p: { xs: 2, md: 4 } }}>
              <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#06B6D4', mb: 1 }}>
                  50+
                </Typography>
                <Typography variant="h6" sx={{ color: '#94A3B8' }}>
                  Communities
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
          color: 'white',
          py: { xs: 8, md: 10 },
          textAlign: 'center',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.3) 0%, rgba(20, 184, 166, 0.1) 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }
        }}
      >
        {/* Animated Teal Lines */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: '180px',
            height: '2px',
            background: 'linear-gradient(to right, rgba(20, 184, 166, 0.7), rgba(20, 184, 166, 0))',
            animation: 'slideLeft 4s ease-in-out infinite',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%',
            right: '8%',
            width: '2px',
            height: '140px',
            background: 'linear-gradient(to top, rgba(20, 184, 166, 0.7), rgba(20, 184, 166, 0))',
            animation: 'slideUp 3.5s ease-in-out infinite',
            zIndex: 0
          }}
        />

        {/* Geometric Diamond Shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            width: '40px',
            height: '40px',
            background: 'rgba(20, 184, 166, 0.15)',
            transform: 'rotate(45deg)',
            animation: 'float 6s ease-in-out infinite',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '12%',
            width: '50px',
            height: '50px',
            background: 'rgba(20, 184, 166, 0.15)',
            transform: 'rotate(45deg)',
            animation: 'float 5s ease-in-out infinite reverse',
            zIndex: 0
          }}
        />

        <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, md: 4 }, position: 'relative', zIndex: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, opacity: 0.95, lineHeight: 1.6 }}>
            Join our growing community of skill sharers and project builders
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/register"
            sx={{
              bgcolor: '#FFFFFF',
              color: '#0F766E',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#F0FDFA',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease',
              borderRadius: 3
            }}
            endIcon={<ArrowForwardIcon />}
          >
            Join SkillNexus
          </Button>
        </Box>
      </Box>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slideDown {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(150px); opacity: 0; }
        }

        @keyframes slideRight {
          0%, 100% { transform: translateX(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(150px); opacity: 0; }
        }

        @keyframes slideLeft {
          0%, 100% { transform: translateX(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(-180px); opacity: 0; }
        }

        @keyframes slideUp {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-140px); opacity: 0; }
        }
        
        .fade-in-card {
          opacity: 0 !important;
          transform: translateY(40px) !important;
          transition: all 0.6s ease !important;
        }
        
        .fade-in-card.fade-in-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Home;