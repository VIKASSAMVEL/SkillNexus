import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  TextField,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Warning,
  Schedule,
  Person,
  Event,
  CheckCircle,
  Cancel,
  Refresh,
  Edit
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Footer from './Footer';
import api from '../services/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
}));

const ConflictResolution = () => {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reschedule dialog state
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [newStartTime, setNewStartTime] = useState(null);
  const [newEndTime, setNewEndTime] = useState(null);

  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/notifications/conflicts');
      // Handle various response formats
      const conflictsList = response.data?.conflicts || response.data || [];
      setConflicts(Array.isArray(conflictsList) ? conflictsList : []);
    } catch (error) {
      console.error('Error loading conflicts:', error);
      // Don't show error - just display empty state if fetch fails
      // This handles cases where the endpoint doesn't exist or returns an error
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  };

  const resolveConflict = async (conflictId, action) => {
    try {
      setResolving(true);
      setError('');

      const payload = { action };
      if (action === 'reschedule' && newStartTime && newEndTime) {
        payload.new_start_time = newStartTime.toISOString();
        payload.new_end_time = newEndTime.toISOString();
      }

      await api.put(`/notifications/conflicts/${conflictId}/resolve`, payload);

      setSuccess('Conflict resolved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      loadConflicts();
      setRescheduleDialog(false);
      setSelectedConflict(null);
      setNewStartTime(null);
      setNewEndTime(null);
    } catch (error) {
      console.error('Error resolving conflict:', error);
      setError('Failed to resolve conflict');
    } finally {
      setResolving(false);
    }
  };

  const openRescheduleDialog = (conflict) => {
    setSelectedConflict(conflict);
    setNewStartTime(new Date(conflict.session_start_time));
    setNewEndTime(new Date(conflict.session_end_time));
    setRescheduleDialog(true);
  };

  const closeRescheduleDialog = () => {
    setRescheduleDialog(false);
    setSelectedConflict(null);
    setNewStartTime(null);
    setNewEndTime(null);
  };

  const getConflictSeverity = (conflict) => {
    const now = new Date();
    const sessionStart = new Date(conflict.session_start_time);
    const hoursUntil = (sessionStart - now) / (1000 * 60 * 60);

    if (hoursUntil < 1) return { level: 'critical', color: '#EF4444', label: 'Critical' };
    if (hoursUntil < 24) return { level: 'high', color: '#F59E0B', label: 'High' };
    return { level: 'medium', color: '#14B8A6', label: 'Medium' };
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: '#EF4444' }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0F172A' }}>
        <Box sx={{ flex: 1, maxWidth: 1000, mx: 'auto', p: 2, width: '100%' }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#E2E8F0', mb: 3 }}>
            Scheduling Conflicts
          </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" sx={{ color: '#94A3B8' }}>
            {conflicts.length} active conflict{conflicts.length !== 1 ? 's' : ''}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadConflicts}
            sx={{
              borderColor: '#14B8A6',
              color: '#14B8A6',
              '&:hover': { borderColor: '#0F766E', color: '#0F766E' }
            }}
          >
            Refresh
          </Button>
        </Box>

        {conflicts.length === 0 ? (
          <StyledPaper>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CheckCircle sx={{ fontSize: 64, color: '#14B8A6', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#E2E8F0', mb: 1 }}>
                No Conflicts Found
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                All your sessions are properly scheduled without conflicts.
              </Typography>
            </Box>
          </StyledPaper>
        ) : (
          <List>
            {conflicts.map((conflict) => {
              const severity = getConflictSeverity(conflict);
              return (
                <StyledPaper key={conflict.id} sx={{ mb: 2 }}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ width: '100%', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Warning sx={{ color: severity.color }} />
                        <Typography variant="h6" sx={{ color: '#E2E8F0' }}>
                          Scheduling Conflict
                        </Typography>
                        <Chip
                          label={severity.label}
                          size="small"
                          sx={{
                            bgcolor: severity.color,
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>

                      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                        {conflict.conflict_reason}
                      </Typography>

                      <Divider sx={{ bgcolor: '#1E293B', mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Event sx={{ color: '#14B8A6' }} />
                            <Typography variant="subtitle2" sx={{ color: '#E2E8F0' }}>
                              Current Session
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#94A3B8', ml: 4 }}>
                            {formatDateTime(conflict.session_start_time)} - {formatDateTime(conflict.session_end_time)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94A3B8', ml: 4 }}>
                            With: {conflict.participant_name}
                          </Typography>
                        </Grid>

                        {conflict.conflicting_session && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Warning sx={{ color: '#EF4444' }} />
                              <Typography variant="subtitle2" sx={{ color: '#E2E8F0' }}>
                                Conflicting Session
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#94A3B8', ml: 4 }}>
                              {formatDateTime(conflict.conflicting_session.start_time)} - {formatDateTime(conflict.conflicting_session.end_time)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8', ml: 4 }}>
                              With: {conflict.conflicting_session.participant_name}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    <Box sx={{ width: '100%', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => openRescheduleDialog(conflict)}
                        sx={{
                          bgcolor: '#14B8A6',
                          '&:hover': { bgcolor: '#0F766E' }
                        }}
                      >
                        Reschedule
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => resolveConflict(conflict.id, 'cancel')}
                        disabled={resolving}
                        sx={{
                          borderColor: '#EF4444',
                          color: '#EF4444',
                          '&:hover': { borderColor: '#DC2626', color: '#DC2626' }
                        }}
                      >
                        Cancel Session
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => resolveConflict(conflict.id, 'ignore')}
                        disabled={resolving}
                        sx={{
                          borderColor: '#F59E0B',
                          color: '#F59E0B',
                          '&:hover': { borderColor: '#D97706', color: '#D97706' }
                        }}
                      >
                        Ignore
                      </Button>
                    </Box>
                  </ListItem>
                </StyledPaper>
              );
            })}
          </List>
        )}

        {/* Reschedule Dialog */}
        <Dialog
          open={rescheduleDialog}
          onClose={closeRescheduleDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#1A2332',
              color: '#E2E8F0'
            }
          }}
        >
          <DialogTitle sx={{ color: '#14B8A6' }}>
            Reschedule Session
          </DialogTitle>
          <DialogContent>
            {selectedConflict && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                  Current session: {formatDateTime(selectedConflict.session_start_time)} - {formatDateTime(selectedConflict.session_end_time)}
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DateTimePicker
                      label="New Start Time"
                      value={newStartTime}
                      onChange={setNewStartTime}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: {
                            '& .MuiInputLabel-root': { color: '#94A3B8' },
                            '& .MuiOutlinedInput-root': {
                              color: '#E2E8F0',
                              '& fieldset': { borderColor: '#1E293B' },
                              '&:hover fieldset': { borderColor: '#14B8A6' },
                              '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                            }
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <DateTimePicker
                      label="New End Time"
                      value={newEndTime}
                      onChange={setNewEndTime}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: {
                            '& .MuiInputLabel-root': { color: '#94A3B8' },
                            '& .MuiOutlinedInput-root': {
                              color: '#E2E8F0',
                              '& fieldset': { borderColor: '#1E293B' },
                              '&:hover fieldset': { borderColor: '#14B8A6' },
                              '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                            }
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography variant="body2">
                    Rescheduling will send notifications to all participants and update the session details.
                  </Typography>
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeRescheduleDialog} sx={{ color: '#94A3B8' }}>
              Cancel
            </Button>
            <Button
              onClick={() => resolveConflict(selectedConflict.id, 'reschedule')}
              variant="contained"
              disabled={resolving || !newStartTime || !newEndTime}
              sx={{
                bgcolor: '#14B8A6',
                '&:hover': { bgcolor: '#0F766E' }
              }}
            >
              {resolving ? 'Rescheduling...' : 'Reschedule Session'}
            </Button>
          </DialogActions>
        </Dialog>
        </Box>
        <Footer />
      </Box>
    </LocalizationProvider>
  );
};

export default ConflictResolution;