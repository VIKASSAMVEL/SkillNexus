import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
  };

  return (
    <AppBar 
      position="static"
      sx={{
        bgcolor: '#0F172A',
        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.15)'
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '12px' }}>
            <img
              src="/logo.jpg"
              alt="SkillNexus Logo"
              style={{
                height: '48px',
                width: '48px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <Typography variant="h6" sx={{ color: '#14B8A6', fontWeight: 700 }}>
              SkillNexus
            </Typography>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isLoggedIn() && (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/skills"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }
                }}
              >
                Skills
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/projects"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }
                }}
              >
                Projects
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/sessions"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }
                }}
              >
                Sessions
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/recommendations"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }
                }}
              >
                AI Recommendations
              </Button>
            </>
          )}
          {isLoggedIn() ? (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/profile"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }
                }}
              >
                Profile
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/bookings"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }
                }}
              >
                Bookings
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/notifications"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }
                }}
              >
                Notifications
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/conflicts"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }
                }}
              >
                Conflicts
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/credits"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }
                }}
              >
                Credits
              </Button>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }
                }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/register"
                sx={{
                  bgcolor: '#14B8A6',
                  color: '#0F172A',
                  border: '1px solid #14B8A6',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#0F766E',
                    borderColor: '#0F766E',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.4)'
                  }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;