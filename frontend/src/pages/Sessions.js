import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  VideoCall,
  Chat,
  Schedule,
  Group,
  PlayArrow,
  Stop,
  CheckCircle,
  Cancel,
  AccessTime
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
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
    id={`sessions-tabpanel-${index}`}
    aria-labelledby={`sessions-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
    fetchSkills();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sessions');
      setSessions(response.data.sessions || []);
    } catch (error) {
      setError('Failed to load sessions');
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills');
      setSkills(response.data.skills || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateSession = () => {
    setCreateDialogOpen(true);
  };

  const handleJoinSession = (session) => {
    setSelectedSession(session);
    setJoinDialogOpen(true);
  };

  const handleStartSession = async (sessionId) => {
    try {
      await api.post(`/sessions/${sessionId}/start`);
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      await api.post(`/sessions/${sessionId}/end`);
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#F59E0B';
      case 'in-progress': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      case 'no-show': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Schedule />;
      case 'in-progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      case 'no-show': return <AccessTime />;
      default: return <Schedule />;
    }
  };

  const filteredSessions = sessions.filter(session => {
    const now = new Date();
    const sessionDate = new Date(session.scheduled_at);

    switch (activeTab) {
      case 0: return true; // All sessions
      case 1: return session.status === 'scheduled' && sessionDate > now; // Upcoming
      case 2: return session.status === 'in-progress'; // Active
      case 3: return session.status === 'completed'; // Completed
      default: return true;
    }
  });

  if (loading) {
    return (
      <StyledContainer>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress
            size={60}
            sx={{ color: '#14B8A6', mb: 3 }}
          />
          <Typography variant="h6" sx={{ color: '#94A3B8' }}>
            Loading your sessions...
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
              Live Sessions
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
              Connect in real-time with skill providers through video calls, chat, and collaborative tools.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleCreateSession}
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
              Schedule New Session
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              bgcolor: '#dc2626',
              color: '#E2E8F0',
              '& .MuiAlert-icon': { color: '#E2E8F0' }
            }}
          >
            {error}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #1E293B',
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
            <Tab label="All Sessions" />
            <Tab label="Upcoming" />
            <Tab label="Active Now" />
            <Tab label="Completed" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <SessionList
              sessions={filteredSessions}
              onJoinSession={handleJoinSession}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <SessionList
              sessions={filteredSessions}
              onJoinSession={handleJoinSession}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <SessionList
              sessions={filteredSessions}
              onJoinSession={handleJoinSession}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <SessionList
              sessions={filteredSessions}
              onJoinSession={handleJoinSession}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
            />
          </TabPanel>
        </Paper>

        {/* Create Session Dialog */}
        <CreateSessionDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          skills={skills}
          onSessionCreated={fetchSessions}
        />

        {/* Join Session Dialog */}
        <JoinSessionDialog
          open={joinDialogOpen}
          onClose={() => setJoinDialogOpen(false)}
          session={selectedSession}
        />
      </Container>

      <Footer />
    </Box>
  );
};

// Session List Component
const SessionList = ({ sessions, onJoinSession, onStartSession, onEndSession }) => {
  if (sessions.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 3,
            bgcolor: '#0F766E'
          }}
        >
          <VideoCall sx={{ fontSize: 40, color: '#14B8A6' }} />
        </Avatar>
        <Typography variant="h6" gutterBottom sx={{ color: '#E2E8F0' }}>
          No sessions found
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Schedule your first session to get started with live learning.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {sessions.map((session) => (
        <Grid item xs={12} md={6} lg={4} key={session.id}>
          <SessionCard
            session={session}
            onJoinSession={onJoinSession}
            onStartSession={onStartSession}
            onEndSession={onEndSession}
          />
        </Grid>
      ))}
    </Grid>
  );
};

// Session Card Component
const SessionCard = ({ session, onJoinSession, onStartSession, onEndSession }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#F59E0B';
      case 'in-progress': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      case 'no-show': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Schedule />;
      case 'in-progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      case 'no-show': return <AccessTime />;
      default: return <Schedule />;
    }
  };

  const canJoin = session.status === 'in-progress' || session.status === 'scheduled';
  const canStart = session.status === 'scheduled';
  const canEnd = session.status === 'in-progress';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid #1E293B',
        bgcolor: '#1A2332',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(20, 184, 166, 0.15)',
          borderColor: '#14B8A6'
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
          {session.skill_name}
        </Typography>
        <Chip
          icon={getStatusIcon(session.status)}
          label={session.status.replace('-', ' ')}
          sx={{
            bgcolor: `${getStatusColor(session.status)}20`,
            color: getStatusColor(session.status),
            textTransform: 'capitalize',
            fontSize: '0.75rem'
          }}
          size="small"
        />
      </Box>

      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
        with {session.provider_name}
      </Typography>

      <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 2 }}>
        {new Date(session.scheduled_at).toLocaleDateString()} at{' '}
        {new Date(session.scheduled_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Typography>

      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
        Duration: {session.duration_minutes} minutes
      </Typography>

      <Box display="flex" gap={1} flexWrap="wrap">
        {canJoin && (
          <Button
            variant="contained"
            size="small"
            startIcon={<VideoCall />}
            onClick={() => onJoinSession(session)}
            sx={{
              bgcolor: '#0F766E',
              '&:hover': { bgcolor: '#14B8A6' }
            }}
          >
            Join Session
          </Button>
        )}

        {canStart && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PlayArrow />}
            onClick={() => onStartSession(session.id)}
            sx={{
              borderColor: '#10B981',
              color: '#10B981',
              '&:hover': {
                borderColor: '#059669',
                bgcolor: 'rgba(16, 185, 129, 0.1)'
              }
            }}
          >
            Start
          </Button>
        )}

        {canEnd && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Stop />}
            onClick={() => onEndSession(session.id)}
            sx={{
              borderColor: '#EF4444',
              color: '#EF4444',
              '&:hover': {
                borderColor: '#DC2626',
                bgcolor: 'rgba(239, 68, 68, 0.1)'
              }
            }}
          >
            End
          </Button>
        )}
      </Box>
    </Paper>
  );
};

// Create Session Dialog Component
const CreateSessionDialog = ({ open, onClose, skills, onSessionCreated }) => {
  const [formData, setFormData] = useState({
    skill_id: '',
    provider_id: '',
    scheduled_at: '',
    duration_minutes: 60,
    session_type: 'one-on-one',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      // Find the selected skill to get provider_id
      const selectedSkill = skills.find(skill => skill.id === parseInt(formData.skill_id));
      if (!selectedSkill) {
        setError('Please select a valid skill');
        return;
      }

      const sessionData = {
        ...formData,
        provider_id: selectedSkill.provider_id
      };

      // Check for scheduling conflicts before creating the session
      const conflictCheckResponse = await api.post('/sessions/check-conflicts', {
        scheduled_at: sessionData.scheduled_at,
        duration_minutes: sessionData.duration_minutes,
        provider_id: sessionData.provider_id
      });

      if (conflictCheckResponse.data.has_conflicts) {
        setError(`Scheduling conflict detected: ${conflictCheckResponse.data.conflict_reason}. Please choose a different time or check your conflicts page.`);
        return;
      }

      await api.post('/sessions', sessionData);
      onSessionCreated();
      onClose();
      setFormData({
        skill_id: '',
        provider_id: '',
        scheduled_at: '',
        duration_minutes: 60,
        session_type: 'one-on-one',
        notes: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        Schedule New Session
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#1A2332', color: '#E2E8F0' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: '#7F1D1D', color: '#FCA5A5' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Skill"
                name="skill_id"
                value={formData.skill_id}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#14B8A6' },
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94A3B8',
                    '&.Mui-focused': { color: '#14B8A6' }
                  },
                  '& .MuiSelect-icon': { color: '#14B8A6' }
                }}
              >
                {skills.map((skill) => (
                  <MenuItem key={skill.id} value={skill.id}>
                    {skill.skill_name} - by {skill.provider_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date & Time"
                name="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#14B8A6' },
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94A3B8',
                    '&.Mui-focused': { color: '#14B8A6' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                name="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#14B8A6' },
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94A3B8',
                    '&.Mui-focused': { color: '#14B8A6' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Session Type"
                name="session_type"
                value={formData.session_type}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#14B8A6' },
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94A3B8',
                    '&.Mui-focused': { color: '#14B8A6' }
                  },
                  '& .MuiSelect-icon': { color: '#14B8A6' }
                }}
              >
                <MenuItem value="one-on-one">One-on-One</MenuItem>
                <MenuItem value="group">Group Session</MenuItem>
                <MenuItem value="workshop">Workshop</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (optional)"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special requirements or topics you'd like to cover..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#14B8A6' },
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94A3B8',
                    '&.Mui-focused': { color: '#14B8A6' }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#1A2332', borderTop: '1px solid #1E293B' }}>
        <Button
          onClick={onClose}
          sx={{ color: '#94A3B8', '&:hover': { color: '#E2E8F0' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#0F766E',
            '&:hover': { bgcolor: '#14B8A6' }
          }}
        >
          {loading ? 'Creating...' : 'Create Session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Join Session Dialog Component
const JoinSessionDialog = ({ open, onClose, session }) => {
  if (!session) return null;

  const handleJoin = () => {
    // Navigate to the session room
    window.open(`/session/${session.id}`, '_blank');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        Join Session
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#1A2332', color: '#E2E8F0' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#E2E8F0' }}>
          {session.skill_name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
          with {session.provider_name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
          {new Date(session.scheduled_at).toLocaleDateString()} at{' '}
          {new Date(session.scheduled_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>

        <Alert
          severity="info"
          sx={{
            mt: 3,
            bgcolor: '#0f172a',
            color: '#E2E8F0',
            border: '1px solid #1E293B',
            '& .MuiAlert-icon': { color: '#14B8A6' }
          }}
        >
          Make sure you have a stable internet connection and enable camera/microphone permissions when prompted.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#1A2332', borderTop: '1px solid #1E293B' }}>
        <Button
          onClick={onClose}
          sx={{ color: '#94A3B8', '&:hover': { color: '#E2E8F0' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleJoin}
          variant="contained"
          startIcon={<VideoCall />}
          sx={{
            bgcolor: '#0F766E',
            '&:hover': { bgcolor: '#14B8A6' }
          }}
        >
          Join Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Sessions;