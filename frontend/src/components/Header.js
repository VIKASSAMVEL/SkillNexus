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
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
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
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
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
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
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
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
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
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
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
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
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
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
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
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
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
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Credits
              </Button>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{
                  color: '#E2E8F0',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
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
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/register"
                sx={{
                  color: '#E2E8F0',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
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