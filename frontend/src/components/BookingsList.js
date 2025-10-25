import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Avatar,
  Fade,
  Zoom
} from '@mui/material';
import {
  AccessTime,
  Person,
  CheckCircle,
  Schedule,
  Error
} from '@mui/icons-material';
import api from '../services/api';

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [statusDialog, setStatusDialog] = useState({ open: false, booking: null });
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const role = activeTab === 'all' ? 'both' : activeTab;
      const response = await api.get('/bookings/my-bookings', {
        params: { role }
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setUpdating(true);
      await api.put(`/bookings/${bookingId}/status`, {
        status: newStatus,
        notes: statusNotes
      });

      setStatusDialog({ open: false, booking: null });
      setStatusNotes('');
      fetchBookings(); // Refresh the list
    } catch (error) {
      setError('Failed to update booking status');
      console.error('Error updating booking:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: '#14B8A6' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
          My Bookings
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            bgcolor: 'rgba(239, 68, 68, 0.15)',
            color: '#FCA5A5',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            '& .MuiAlert-icon': { color: '#FCA5A5' }
          }}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          bgcolor: '#1A2332',
          border: '1px solid #1E293B',
          borderRadius: 2,
          mb: 3
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#94A3B8',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#14B8A6'
              },
              '&.Mui-selected': {
                color: '#14B8A6'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#14B8A6'
            }
          }}
        >
          <Tab label="All Bookings" value="all" />
          <Tab label="As Student" value="student" />
          <Tab label="As Teacher" value="teacher" />
        </Tabs>
      </Paper>

      {bookings.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 6,
            bgcolor: '#1A2332',
            border: '2px dashed #1E293B',
            borderRadius: 2
          }}
        >
          <Schedule sx={{ fontSize: 48, color: '#94A3B8', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ color: '#CBD5E1', mb: 1 }}>
            No bookings found
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Your bookings will appear here
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking, index) => (
            <Grid item xs={12} md={6} lg={6} key={booking.id}>
              <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#1A2332',
                    border: '1px solid #1E293B',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#14B8A6',
                      boxShadow: '0 8px 24px rgba(20, 184, 166, 0.2)'
                    }
                  }}
                >
                  <Box sx={{ bgcolor: 'rgba(20, 184, 166, 0.1)', p: 2, borderBottom: '1px solid #1E293B' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h2" sx={{ color: '#E2E8F0', fontWeight: 600, flex: 1 }}>
                        {booking.skill_name}
                      </Typography>
                      <Chip
                        label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        icon={booking.status === 'confirmed' ? <CheckCircle /> : booking.status === 'pending' ? <Schedule /> : <Error />}
                        size="small"
                        sx={{
                          bgcolor: booking.status === 'pending' ? 'rgba(251, 146, 60, 0.2)' :
                                  booking.status === 'confirmed' ? 'rgba(20, 184, 166, 0.2)' :
                                  booking.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' :
                                  'rgba(239, 68, 68, 0.2)',
                          color: booking.status === 'pending' ? '#FBBF24' :
                                 booking.status === 'confirmed' ? '#14B8A6' :
                                 booking.status === 'completed' ? '#22C55E' :
                                 '#EF4444',
                          border: `1px solid ${booking.status === 'pending' ? '#FBBF24' :
                                  booking.status === 'confirmed' ? '#14B8A6' :
                                  booking.status === 'completed' ? '#22C55E' :
                                  '#EF4444'}`,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: 'inherit !important'
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ '&:last-child': { pb: 2 }, px: 4, py: 1.5, width: '100%' }}>
                    <Box display="flex" alignItems="center" mb={1.5} sx={{ color: '#CBD5E1' }}>
                      <Person sx={{ mr: 2, fontSize: 20, color: '#14B8A6' }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {booking.student_id === parseInt(localStorage.getItem('userId'))
                          ? `Teacher: ${booking.teacher_name}`
                          : `Student: ${booking.student_name}`}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="flex-start" mb={1.5} sx={{ color: '#CBD5E1' }}>
                      <AccessTime sx={{ mr: 2, fontSize: 20, color: '#14B8A6', mt: 0.25, flexShrink: 0 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">
                          {new Date(booking.booking_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          {booking.start_time} - {booking.end_time}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: 'rgba(20, 184, 166, 0.05)', 
                      borderRadius: 1.5,
                      border: '1px solid rgba(20, 184, 166, 0.2)',
                      mb: 1.5,
                      width: '100%'
                    }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                        Duration
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#14B8A6', fontWeight: 600 }}>
                        {booking.duration_hours}h • ${booking.total_price}
                      </Typography>
                    </Box>

                    {booking.notes && (
                      <Box mb={1.5} sx={{ width: '100%' }}>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          Notes:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#CBD5E1', fontStyle: 'italic', mt: 0.5 }}>
                          "{booking.notes}"
                        </Typography>
                      </Box>
                    )}

                    <Box display="flex" gap={1} flexWrap="wrap">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <>
                          {booking.teacher_id === parseInt(localStorage.getItem('userId')) && booking.status === 'pending' && (
                            <Button
                              size="small"
                              variant="contained"
                              sx={{
                                bgcolor: '#22C55E',
                                color: '#0F172A',
                                fontWeight: 600,
                                '&:hover': {
                                  bgcolor: '#16A34A'
                                },
                                flex: 1
                              }}
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {booking.teacher_id === parseInt(localStorage.getItem('userId')) && (booking.status === 'confirmed' || booking.status === 'pending') && (
                            <Button
                              size="small"
                              variant="contained"
                              sx={{
                                bgcolor: '#14B8A6',
                                color: '#0F172A',
                                fontWeight: 600,
                                '&:hover': {
                                  bgcolor: '#0D9488'
                                },
                                flex: 1
                              }}
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              color: '#EF4444',
                              borderColor: '#EF4444',
                              '&:hover': {
                                borderColor: '#DC2626',
                                bgcolor: 'rgba(239, 68, 68, 0.1)'
                              },
                              flex: 1
                            }}
                            onClick={() => setStatusDialog({ open: true, booking })}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Status Update Dialog */}
      <Dialog 
        open={statusDialog.open} 
        onClose={() => setStatusDialog({ open: false, booking: null })}
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ color: '#E2E8F0', fontWeight: 600, borderBottom: '1px solid #1E293B' }}>
          Cancel Booking
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography sx={{ color: '#CBD5E1', mb: 2 }}>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation reason (optional)"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#E2E8F0',
                bgcolor: '#0F172A',
                border: '1px solid #1E293B',
                '& fieldset': { borderColor: '#1E293B' },
                '&:hover fieldset': { borderColor: '#14B8A6' },
                '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#94A3B8',
                opacity: 1
              },
              '& .MuiInputLabel-root': {
                color: '#94A3B8',
                '&.Mui-focused': { color: '#14B8A6' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #1E293B' }}>
          <Button 
            onClick={() => setStatusDialog({ open: false, booking: null })}
            sx={{ color: '#CBD5E1' }}
          >
            Keep Booking
          </Button>
          <Button
            onClick={() => handleStatusUpdate(statusDialog.booking?.id, 'cancelled')}
            variant="contained"
            disabled={updating}
            sx={{
              bgcolor: '#EF4444',
              color: '#FFF',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#DC2626'
              },
              '&.Mui-disabled': {
                bgcolor: '#7F1D1D',
                color: '#FCA5A5'
              }
            }}
          >
            {updating ? <CircularProgress size={20} sx={{ color: '#14B8A6' }} /> : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsList;