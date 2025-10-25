import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    localStorage.removeItem('token');
    navigate('/');
  };

  const isLoggedIn = localStorage.getItem('token');

  return (
    <AppBar 
      position="static"
      sx={{
        bgcolor: '#0F172A',
        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.15)'
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          <Link to="/" style={{ color: '#14B8A6', textDecoration: 'none' }}>
            Urban Skill Exchange
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isLoggedIn && (
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
            </>
          )}
          {isLoggedIn ? (
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