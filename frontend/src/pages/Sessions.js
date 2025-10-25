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
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    scheduled_at: '',
    duration_minutes: 60,
    notes: ''
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
    fetchUser();
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

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleJoinSession = async (session) => {
    // If session is booked and user is provider, start it first
    if (session.status === 'booked' && user && user.id === session.provider_id) {
      try {
        await api.post(`/sessions/${session.id}/start`);
        // Refresh sessions to update status
        await fetchSessions();
        // Update the session object
        session.status = 'in-progress';
      } catch (error) {
        console.error('Error starting session:', error);
        return;
      }
    }

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

  const handleScheduleSession = (session) => {
    setSelectedSession(session);
    setScheduleForm({
      scheduled_at: '',
      duration_minutes: session.duration_minutes || 60,
      notes: ''
    });
    setScheduleDialogOpen(true);
  };

  const handleScheduleSubmit = async () => {
    try {
      await api.put(`/sessions/${selectedSession.id}/schedule`, scheduleForm);
      setScheduleDialogOpen(false);
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error('Error scheduling session:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#F59E0B';
      case 'in-progress': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      case 'no-show': return '#6B7280';
      case 'booked': return '#8B5CF6'; // Purple for booked
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
      case 'booked': return <Schedule />; // Use Schedule for booked too
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
              onScheduleSession={handleScheduleSession}
              user={user}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <SessionList
              sessions={filteredSessions}
              onJoinSession={handleJoinSession}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              onScheduleSession={handleScheduleSession}
              user={user}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <SessionList
              sessions={filteredSessions}
              onJoinSession={handleJoinSession}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              onScheduleSession={handleScheduleSession}
              user={user}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <SessionList
              sessions={filteredSessions}
              onJoinSession={handleJoinSession}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              onScheduleSession={handleScheduleSession}
              user={user}
            />
          </TabPanel>
        </Paper>

        {/* Join Session Dialog */}
        <JoinSessionDialog
          open={joinDialogOpen}
          onClose={() => setJoinDialogOpen(false)}
          session={selectedSession}
        />

        {/* Schedule Session Dialog */}
        <ScheduleSessionDialog
          open={scheduleDialogOpen}
          onClose={() => setScheduleDialogOpen(false)}
          session={selectedSession}
          form={scheduleForm}
          setForm={setScheduleForm}
          onSubmit={handleScheduleSubmit}
        />
      </Container>

      <Footer />
    </Box>
  );
};

// Session List Component
const SessionList = ({ sessions, onJoinSession, onStartSession, onEndSession, onScheduleSession, user }) => {
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
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={session.id}>
          <SessionCard
            session={session}
            onJoinSession={onJoinSession}
            onStartSession={onStartSession}
            onEndSession={onEndSession}
            onScheduleSession={onScheduleSession}
            user={user}
          />
        </Grid>
      ))}
    </Grid>
  );
};

// Session Card Component
const SessionCard = ({ session, onJoinSession, onStartSession, onEndSession, onScheduleSession, user }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#F59E0B';
      case 'in-progress': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      case 'no-show': return '#6B7280';
      case 'booked': return '#8B5CF6'; // Purple for booked
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
      case 'booked': return <Schedule />; // Use Schedule for booked too
      default: return <Schedule />;
    }
  };

  const isSessionTime = (session) => {
    if (!session.scheduled_at) return false;
    const now = new Date();
    const sessionStart = new Date(session.scheduled_at);
    const sessionEnd = new Date(sessionStart.getTime() + (session.duration_minutes || 60) * 60000);
    // Allow joining 15 minutes before to 15 minutes after
    const earlyJoin = new Date(sessionStart.getTime() - 15 * 60000);
    const lateJoin = new Date(sessionEnd.getTime() + 15 * 60000);
    return now >= earlyJoin && now <= lateJoin;
  };

  const canJoin = session.status === 'in-progress' ||
    (session.status === 'scheduled' && isSessionTime(session)) ||
    (session.status === 'booked' && user && user.id === session.provider_id);
  const canStart = (session.status === 'scheduled' && user && user.id === session.provider_id) ||
    (session.status === 'booked' && user && user.id === session.provider_id);
  const canEnd = session.status === 'in-progress';
  const canSchedule = session.status === 'booked' && user && user.id === session.provider_id;

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
        {session.status === 'booked' ? (
          user && user.id === session.provider_id ? 
            'Ready to start - click Start Session to begin' : 
            'Waiting for provider to start the session'
        ) : (
          <>
            {new Date(session.scheduled_at).toLocaleDateString()} at{' '}
            {new Date(session.scheduled_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </>
        )}
      </Typography>

      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
        Duration: {session.duration_minutes} minutes
      </Typography>

      <Box display="flex" gap={1} flexWrap="wrap">
        {canSchedule && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Schedule />}
            onClick={() => onScheduleSession(session)}
            sx={{
              borderColor: '#F59E0B',
              color: '#F59E0B',
              '&:hover': {
                borderColor: '#D97706',
                bgcolor: 'rgba(245, 158, 11, 0.1)'
              }
            }}
          >
            Schedule
          </Button>
        )}

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
            {session.status === 'booked' && user && user.id === session.provider_id ? 'Start Session' : 'Join Session'}
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

// Join Session Dialog Component
const JoinSessionDialog = ({ open, onClose, session }) => {
  if (!session) return null;

  const handleJoin = () => {
    // Navigate to the session room in the same tab to preserve authentication
    window.location.href = `/session/${session.id}`;
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

// Schedule Session Dialog Component
const ScheduleSessionDialog = ({ open, onClose, session, form, setForm, onSubmit }) => {
  if (!session) return null;

  const handleSubmit = () => {
    if (!form.scheduled_at) {
      alert('Please select a date and time');
      return;
    }
    onSubmit();
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
        Schedule Session
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#1A2332', color: '#E2E8F0', pt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#E2E8F0' }}>
          {session.skill_name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
          with {session.learner_name}
        </Typography>

        <TextField
          fullWidth
          label="Date & Time"
          type="datetime-local"
          value={form.scheduled_at}
          onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
          sx={{
            mb: 2,
            '& .MuiInputLabel-root': { color: '#94A3B8' },
            '& .MuiOutlinedInput-root': {
              color: '#E2E8F0',
              '& fieldset': { borderColor: '#1E293B' },
              '&:hover fieldset': { borderColor: '#14B8A6' },
              '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
            }
          }}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          fullWidth
          label="Duration (minutes)"
          type="number"
          value={form.duration_minutes}
          onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
          sx={{
            mb: 2,
            '& .MuiInputLabel-root': { color: '#94A3B8' },
            '& .MuiOutlinedInput-root': {
              color: '#E2E8F0',
              '& fieldset': { borderColor: '#1E293B' },
              '&:hover fieldset': { borderColor: '#14B8A6' },
              '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
            }
          }}
        />

        <TextField
          fullWidth
          label="Notes (optional)"
          multiline
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          sx={{
            '& .MuiInputLabel-root': { color: '#94A3B8' },
            '& .MuiOutlinedInput-root': {
              color: '#E2E8F0',
              '& fieldset': { borderColor: '#1E293B' },
              '&:hover fieldset': { borderColor: '#14B8A6' },
              '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
            }
          }}
        />
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
          startIcon={<Schedule />}
          sx={{
            bgcolor: '#0F766E',
            '&:hover': { bgcolor: '#14B8A6' }
          }}
        >
          Schedule Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Sessions;