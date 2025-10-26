import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  Paper,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Slide,
  Zoom,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Psychology,
  School,
  People,
  Settings,
  TrendingUp,
  Star
} from '@mui/icons-material';
import SkillRecommendations from '../components/SkillRecommendations';
import LearningPathRecommendations from '../components/LearningPathRecommendations';
import UserPreferencesForm from '../components/UserPreferencesForm';
import Footer from '../components/Footer';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  minHeight: '100vh',
  backgroundColor: '#0F172A',
  color: '#E2E8F0'
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`recommendations-tabpanel-${index}`}
    aria-labelledby={`recommendations-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [userId, setUserId] = useState(null);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);
  const [preferencesUpdated, setPreferencesUpdated] = useState(false);

  useEffect(() => {
    // Get current user ID from localStorage or context
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePreferencesUpdated = (preferences) => {
    setPreferencesUpdated(true);
    setPreferencesDialogOpen(false);
    // Refresh recommendations
    setTimeout(() => setPreferencesUpdated(false), 3000);
  };

  if (!userId) {
    return (
      <StyledContainer>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          sx={{
            background: 'radial-gradient(circle at top right, rgba(20, 184, 166, 0.1), rgba(15, 23, 42, 0.5))',
            bgcolor: '#0F172A',
            borderRadius: 4,
            p: 4,
            border: '1px solid #1E293B'
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
              bgcolor: '#0F766E',
              boxShadow: '0 8px 24px rgba(20, 184, 166, 0.3)'
            }}
          >
            <Psychology sx={{ fontSize: 40, color: '#14B8A6' }} />
          </Avatar>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#E2E8F0' }}>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="#94A3B8" mb={4} sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
            Please log in to access your personalized AI-powered recommendations and discover skills tailored to your interests.
          </Typography>
        </Box>
      </StyledContainer>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0F766E 0%, #0D5656 50%, #14B8A6 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.9) 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              AI-Powered Recommendations
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                mb: 4,
                opacity: 0.95,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.6,
                color: '#E2E8F0'
              }}
            >
              Discover skills and learning paths tailored to your interests and goals using our intelligent matching system.
            </Typography>

            <Slide direction="up" in={true} timeout={800}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Settings />}
                onClick={() => setPreferencesDialogOpen(true)}
                sx={{
                  bgcolor: '#14B8A6',
                  color: '#0F172A',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(20, 184, 166, 0.3)',
                  '&:hover': {
                    bgcolor: '#0F766E',
                    color: '#E2E8F0',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(20, 184, 166, 0.4)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Customize Your Preferences
              </Button>
            </Slide>
          </Box>
        </Container>

        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            right: '8%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(20, 184, 166, 0.15)',
            animation: 'float 8s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%',
            left: '6%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: 'rgba(20, 184, 166, 0.15)',
            animation: 'float 6s ease-in-out infinite reverse'
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {preferencesUpdated && (
          <Fade in={true}>
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)',
                bgcolor: '#16a34a',
                color: '#E2E8F0',
                '& .MuiAlert-icon': { color: '#E2E8F0' }
              }}
            >
              Preferences updated! Your recommendations have been refreshed.
            </Alert>
          </Fade>
        )}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: '#1E293B',
            overflow: 'hidden',
            bgcolor: '#1A2332'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#94A3B8',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#0F766E',
                  color: '#14B8A6',
                  transform: 'translateY(-1px)'
                },
                '&.Mui-selected': {
                  bgcolor: '#0F766E',
                  color: '#14B8A6',
                  boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                bgcolor: '#14B8A6'
              }
            }}
          >
            <Tab
              icon={<Psychology />}
              label="Skill Recommendations"
              iconPosition="start"
            />
            <Tab
              icon={<School />}
              label="Learning Paths"
              iconPosition="start"
            />
            <Tab
              icon={<People />}
              label="Compatibility Insights"
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <SkillRecommendations userId={userId} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <LearningPathRecommendations userId={userId} />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    mr: 2,
                    bgcolor: '#0F766E',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                  }}
                >
                  <TrendingUp sx={{ color: '#14B8A6' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#E2E8F0' }}>
                    Provider Compatibility Analysis
                  </Typography>
                  <Typography variant="body2" color="#94A3B8">
                    See how well you match with different skill providers based on learning styles, experience levels, and shared interests.
                  </Typography>
                </Box>
              </Box>
              <Alert
                severity="info"
                sx={{
                  borderRadius: 2,
                  bgcolor: '#0f172a',
                  color: '#E2E8F0',
                  border: '1px solid #1E293B',
                  '& .MuiAlert-icon': { color: '#14B8A6' }
                }}
              >
                Compatibility scores are calculated in real-time when viewing provider profiles or booking skills.
                Higher scores indicate better matches for effective learning experiences.
              </Alert>
            </Box>
          </TabPanel>
        </Paper>

        {/* Preferences Dialog */}
        <Dialog
          open={preferencesDialogOpen}
          onClose={() => setPreferencesDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: '#1A2332',
              border: '1px solid #1E293B'
            }
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: '#0F766E',
              color: '#E2E8F0',
              borderRadius: '12px 12px 0 0'
            }}
          >
            <Box display="flex" alignItems="center">
              <Settings sx={{ mr: 1, color: '#14B8A6' }} />
              Update Your Learning Preferences
            </Box>
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#1A2332', color: '#E2E8F0' }}>
            <UserPreferencesForm
              userId={userId}
              onPreferencesUpdated={handlePreferencesUpdated}
            />
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#1A2332', borderTop: '1px solid #1E293B' }}>
            <Button
              onClick={() => setPreferencesDialogOpen(false)}
              sx={{
                color: '#94A3B8',
                '&:hover': {
                  color: '#E2E8F0',
                  bgcolor: '#0F766E'
                }
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Footer />
    </Box>
  );
};

export default Recommendations;