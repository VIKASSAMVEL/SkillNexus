import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Link,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Lock as LockIcon,
  VerifiedUser as VerifiedIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
  };

  // Handle link clicks for authenticated routes
  const handleLinkClick = (to) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    navigate(to);
  };

  return (
    <Box>
      {/* Trust and Safety Banner */}
      <Box
        sx={{
          bgcolor: '#1E3A8A',
          py: 1,
          borderTop: '1px solid #0F172A'
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ textAlign: 'center' }}
          >
            <Chip
              icon={<LockIcon sx={{ color: '#10B981' }} />}
              label="SSL Secured"
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                '& .MuiChip-icon': { color: '#10B981' }
              }}
            />
            <Chip
              icon={<VerifiedIcon sx={{ color: '#F59E0B' }} />}
              label="ID Verified Members"
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.1)',
                color: '#F59E0B',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                '& .MuiChip-icon': { color: '#F59E0B' }
              }}
            />
            <Chip
              icon={<StarIcon sx={{ color: '#C084FC' }} />}
              label="Community-Reviewed"
              sx={{
                bgcolor: 'rgba(192, 132, 252, 0.1)',
                color: '#C084FC',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                '& .MuiChip-icon': { color: '#C084FC' }
              }}
            />
            <Chip
              icon={<LocationIcon sx={{ color: '#10B981' }} />}
              label="Local & Vetted"
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                '& .MuiChip-icon': { color: '#10B981' }
              }}
            />
          </Stack>
        </Container>
      </Box>

      {/* Main Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#0F172A',
          borderTop: '1px solid #1E293B',
          py: { xs: 3, md: 4 },
          mt: 'auto',
          width: '100%'
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
          <Grid container spacing={2}>
            {/* Column 1: Platform & Mission */}
            <Grid item xs={12} md={3}>
              <Typography
                variant="h6"
                sx={{
                  color: '#14B8A6',
                  mb: 1,
                  fontWeight: 700
                }}
              >
                SkillNexus
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#CBD5E1',
                  mb: 1.5,
                  lineHeight: 1.5
                }}
              >
Connect with local talent, share skills, and build<br />
community projects that make a difference              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Link href="#" sx={{ color: '#94A3B8', '&:hover': { color: '#14B8A6' } }}>
                  <FacebookIcon />
                </Link>
                <Link href="#" sx={{ color: '#94A3B8', '&:hover': { color: '#14B8A6' } }}>
                  <TwitterIcon />
                </Link>
                <Link href="#" sx={{ color: '#94A3B8', '&:hover': { color: '#14B8A6' } }}>
                  <LinkedInIcon />
                </Link>
                <Link href="#" sx={{ color: '#94A3B8', '&:hover': { color: '#14B8A6' } }}>
                  <InstagramIcon />
                </Link>
              </Box>
            </Grid>

            {/* Column 2: Contact & Legal */}
            <Grid item xs={12} md={3}>
              <Typography
                variant="h6"
                sx={{
                  color: '#E2E8F0',
                  mb: 1,
                  fontWeight: 600
                }}
              >
                Get in Touch
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#CBD5E1',
                  mb: 1.5,
                  lineHeight: 1.5
                }}
              >
                Have questions or need support? We're here to help you connect with your community.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#94A3B8',
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  Email Support
                </Typography>
                <Link
                  href="mailto:support@skillnexus.com"
                  sx={{
                    color: '#14B8A6',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  support@skillnexus.com
                </Link>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#94A3B8',
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  Community Hotline
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#CBD5E1'
                  }}
                >
                  +91 98765 43210
                </Typography>
              </Box>
            </Grid>

            {/* Column 3: Quick Links */}
            <Grid item xs={12} md={3}>
              <Typography
                variant="h6"
                sx={{
                  color: '#E2E8F0',
                  mb: 1,
                  fontWeight: 600
                }}
              >
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Link
                  component={RouterLink}
                  to="/"
                  sx={{
                    color: '#CBD5E1',
                    textDecoration: 'none',
                    '&:hover': { color: '#14B8A6' }
                  }}
                >
                  Home
                </Link>
                <Link
                  component="button"
                  onClick={() => handleLinkClick('/skills')}
                  sx={{
                    color: '#CBD5E1',
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                    '&:hover': { color: '#14B8A6' }
                  }}
                >
                  Browse Skills
                </Link>
                <Link
                  component="button"
                  onClick={() => handleLinkClick('/projects')}
                  sx={{
                    color: '#CBD5E1',
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                    '&:hover': { color: '#14B8A6' }
                  }}
                >
                  Community Projects
                </Link>
                <Link
                  component="button"
                  onClick={() => handleLinkClick('/profile')}
                  sx={{
                    color: '#CBD5E1',
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                    '&:hover': { color: '#14B8A6' }
                  }}
                >
                  Become a Verified Member
                </Link>
              </Box>
            </Grid>

            {/* Column 4: Trust & Support */}
            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#E2E8F0',
                  mb: 1,
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                Trust & Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', width: '100%' }}>
                {/* Row 1 */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Link
                    component={RouterLink}
                    to="/faq"
                    sx={{
                      color: '#CBD5E1',
                      textDecoration: 'none',
                      '&:hover': { color: '#14B8A6' },
                      flex: '0 1 auto'
                    }}
                  >
                    FAQs
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/trust-safety"
                    sx={{
                      color: '#CBD5E1',
                      textDecoration: 'none',
                      '&:hover': { color: '#14B8A6' },
                      flex: '0 1 auto'
                    }}
                  >
                    Trust & Safety
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/community-guidelines"
                    sx={{
                      color: '#CBD5E1',
                      textDecoration: 'none',
                      '&:hover': { color: '#14B8A6' },
                      flex: '0 1 auto'
                    }}
                  >
                    Community Guidelines
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/report-user"
                    sx={{
                      color: '#CBD5E1',
                      textDecoration: 'none',
                      '&:hover': { color: '#14B8A6' },
                      flex: '0 1 auto'
                    }}
                  >
                    Report User
                  </Link>
                </Box>

                {/* Row 2 */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Link
                    component={RouterLink}
                    to="/verification-process"
                    sx={{
                      color: '#CBD5E1',
                      textDecoration: 'none',
                      '&:hover': { color: '#14B8A6' },
                      flex: '0 1 auto'
                    }}
                  >
                    Verification Process
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/terms-of-service"
                    sx={{
                      color: '#CBD5E1',
                      textDecoration: 'none',
                      '&:hover': { color: '#14B8A6' },
                      flex: '0 1 auto'
                    }}
                  >
                    Terms of Service
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/privacy-policy"
                    sx={{
                      color: '#CBD5E1',
                      textDecoration: 'none',
                      '&:hover': { color: '#14B8A6' },
                      flex: '0 1 auto'
                    }}
                  >
                    Privacy Policy
                  </Link>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2, bgcolor: '#1E293B' }} />

          {/* Bottom Section */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'center' },
            gap: 1
          }}>
            <Typography
              variant="body2"
              sx={{
                color: '#94A3B8',
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              © {currentYear} SkillNexus. All rights reserved.
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#64748B',
                textAlign: { xs: 'center', md: 'right' }
              }}
            >
              Built with ❤️ for community empowerment
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
