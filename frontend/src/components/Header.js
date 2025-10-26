import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Book as BookIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  AccountBalanceWallet as WalletIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Forum as ForumIcon,
  SmartToy as SmartToyIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // State for user profile dropdown
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const profileOpen = Boolean(profileAnchorEl);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    setMobileOpen(false);
  };

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
  };

  const getUserInitials = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
      } catch {
        return 'U';
      }
    }
    return 'U';
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const handleProfileMenuClick = (path) => {
    navigate(path);
    handleProfileClose();
    handleMobileClose();
  };

  // Primary navigation items
  const primaryNavItems = [
    { path: '/skills', label: 'Skills', icon: WorkIcon },
    { path: '/projects', label: 'Projects', icon: HomeIcon },
    { path: '/sessions', label: 'Sessions', icon: ScheduleIcon }
  ];

  // Secondary navigation items
  const secondaryNavItems = [
    { path: '/recommendations', label: 'AI Recommendations', icon: SmartToyIcon },
    { path: '/forum', label: 'Forum', icon: ForumIcon }
  ];

  // Account navigation items
  const accountNavItems = [
    { path: '/profile', label: 'Profile', icon: PersonIcon },
    { path: '/bookings', label: 'Bookings', icon: BookIcon },
    { path: '/notifications', label: 'Notifications', icon: NotificationsIcon },
    { path: '/conflicts', label: 'Conflicts', icon: WarningIcon },
    { path: '/credits', label: 'Credits', icon: WalletIcon }
  ];

  const NavButton = ({ to, children, icon: Icon, isActive, onClick }) => (
    <Button
      component={Link}
      to={to}
      onClick={onClick}
      startIcon={Icon && <Icon sx={{ fontSize: '1.1rem' }} />}
      sx={{
        color: isActive ? '#14B8A6' : '#E2E8F0',
        border: isActive ? '1px solid #14B8A6' : '1px solid rgba(226, 232, 240, 0.2)',
        borderRadius: '8px',
        px: 2,
        py: 1,
        mx: 0.5,
        fontWeight: isActive ? 600 : 500,
        textTransform: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: isActive ? '80%' : '0%',
          height: '2px',
          bgcolor: '#14B8A6',
          transition: 'all 0.3s ease',
          transform: 'translateX(-50%)'
        },
        '&:hover': {
          bgcolor: 'rgba(20, 184, 166, 0.15)',
          color: '#14B8A6',
          borderColor: 'rgba(20, 184, 166, 0.5)',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)',
          '&::after': {
            width: '80%'
          }
        }
      }}
    >
      {children}
    </Button>
  );

  const MobileNavItem = ({ item, onClick }) => (
    <ListItemButton
      component={Link}
      to={item.path}
      onClick={onClick}
      sx={{
        color: isActiveRoute(item.path) ? '#14B8A6' : '#E2E8F0',
        bgcolor: isActiveRoute(item.path) ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
        '&:hover': {
          bgcolor: 'rgba(20, 184, 166, 0.1)',
          color: '#14B8A6'
        }
      }}
    >
      <ListItemIcon sx={{ color: isActiveRoute(item.path) ? '#14B8A6' : '#E2E8F0' }}>
        <item.icon />
      </ListItemIcon>
      <ListItemText primary={item.label} />
    </ListItemButton>
  );

  const drawer = (
    <Box sx={{ width: 280, bgcolor: '#0F172A', height: '100%', color: '#E2E8F0' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ color: '#14B8A6', fontWeight: 700 }}>
          SkillNexus
        </Typography>
        <IconButton onClick={handleMobileClose} sx={{ color: '#E2E8F0' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ bgcolor: '#1E293B' }} />

      {/* Primary Navigation */}
      <List>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#94A3B8', fontWeight: 600 }}>
          MAIN
        </Typography>
        {primaryNavItems.map((item) => (
          <MobileNavItem key={item.path} item={item} onClick={handleMobileClose} />
        ))}
      </List>

      <Divider sx={{ bgcolor: '#1E293B' }} />

      {/* Secondary Navigation */}
      <List>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#94A3B8', fontWeight: 600 }}>
          DISCOVER
        </Typography>
        {secondaryNavItems.map((item) => (
          <MobileNavItem key={item.path} item={item} onClick={handleMobileClose} />
        ))}
      </List>

      <Divider sx={{ bgcolor: '#1E293B' }} />

      {/* Account Navigation */}
      <List>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#94A3B8', fontWeight: 600 }}>
          ACCOUNT
        </Typography>
        {accountNavItems.map((item) => (
          <MobileNavItem key={item.path} item={item} onClick={handleMobileClose} />
        ))}
      </List>

      <Divider sx={{ bgcolor: '#1E293B' }} />

      {/* Logout */}
      <List>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            color: '#EF4444',
            '&:hover': {
              bgcolor: 'rgba(239, 68, 68, 0.1)'
            }
          }}
        >
          <ListItemIcon sx={{ color: '#EF4444' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: '#0F172A',
          boxShadow: '0 4px 12px rgba(20, 184, 166, 0.15)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(20, 184, 166, 0.1)'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: '64px !important' }}>
          {/* Logo Section */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Go to Dashboard" arrow>
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  gap: '12px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Box
                  sx={{
                    height: '48px',
                    width: '48px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#14B8A6',
                      boxShadow: '0 0 20px rgba(20, 184, 166, 0.3)'
                    }
                  }}
                >
                  <img
                    src="/logo.jpg"
                    alt="SkillNexus Logo"
                    style={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#14B8A6',
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#0F766E'
                    }
                  }}
                >
                  SkillNexus
                </Typography>
              </Link>
            </Tooltip>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && isLoggedIn() && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Primary Navigation */}
              {primaryNavItems.map((item) => (
                <NavButton
                  key={item.path}
                  to={item.path}
                  isActive={isActiveRoute(item.path)}
                >
                  {item.label}
                </NavButton>
              ))}

              {/* Secondary Navigation */}
              <Box sx={{ mx: 1 }}>
                <Divider orientation="vertical" sx={{ bgcolor: 'rgba(226, 232, 240, 0.2)', height: 24 }} />
              </Box>
              {secondaryNavItems.map((item) => (
                <NavButton
                  key={item.path}
                  to={item.path}
                  isActive={isActiveRoute(item.path)}
                >
                  {item.label}
                </NavButton>
              ))}

              {/* Account Section */}
              <Box sx={{ mx: 1 }}>
                <Divider orientation="vertical" sx={{ bgcolor: 'rgba(226, 232, 240, 0.2)', height: 24 }} />
              </Box>

              {/* User Profile Dropdown */}
              <Tooltip title="Account Menu" arrow>
                <IconButton
                  onClick={handleProfileClick}
                  sx={{
                    color: '#E2E8F0',
                    border: '1px solid rgba(226, 232, 240, 0.2)',
                    borderRadius: '8px',
                    p: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(20, 184, 166, 0.15)',
                      borderColor: 'rgba(20, 184, 166, 0.5)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: '#14B8A6',
                      color: '#0F172A',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
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
            </Box>
          )}

          {/* Mobile Navigation */}
          {isMobile && isLoggedIn() && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleMobileToggle}
              sx={{
                color: '#E2E8F0',
                '&:hover': {
                  bgcolor: 'rgba(20, 184, 166, 0.15)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Auth Buttons for non-logged in users */}
          {!isLoggedIn() && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: '#E2E8F0',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
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
                component={Link}
                to="/register"
                sx={{
                  bgcolor: '#14B8A6',
                  color: '#0F172A',
                  border: '1px solid #14B8A6',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
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
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            bgcolor: '#0F172A',
            borderLeft: '1px solid #1E293B'
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Profile Dropdown Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={profileOpen}
        onClose={handleProfileClose}
        onClick={handleProfileClose}
        PaperProps={{
          elevation: 0,
          sx: {
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            overflow: 'visible',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: '#1A2332',
              borderTop: '1px solid #1E293B',
              borderLeft: '1px solid #1E293B',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {accountNavItems.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => handleProfileMenuClick(item.path)}
            sx={{
              color: '#E2E8F0',
              '&:hover': {
                bgcolor: 'rgba(20, 184, 166, 0.1)',
                color: '#14B8A6'
              },
              '& .MuiListItemIcon-root': {
                color: '#94A3B8'
              },
              '&:hover .MuiListItemIcon-root': {
                color: '#14B8A6'
              }
            }}
          >
            <ListItemIcon>
              <item.icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Header;