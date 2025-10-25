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
  Grid
} from '@mui/material';
import {
  AccessTime,
  Person
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="All Bookings" value="all" />
        <Tab label="As Student" value="student" />
        <Tab label="As Teacher" value="teacher" />
      </Tabs>

      {bookings.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No bookings found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} md={6} lg={4} key={booking.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2">
                      {booking.skill_name}
                    </Typography>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2">
                      {booking.student_id === parseInt(localStorage.getItem('userId'))
                        ? `Teacher: ${booking.teacher_name}`
                        : `Student: ${booking.student_name}`}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTime sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2">
                      {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time} - {booking.end_time}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Duration: {booking.duration_hours}h • Total: ${booking.total_price}
                  </Typography>

                  {booking.notes && (
                    <Box mb={2}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
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
                            color="success"
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.teacher_id === parseInt(localStorage.getItem('userId')) && (booking.status === 'confirmed' || booking.status === 'pending') && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => setStatusDialog({ open: true, booking })}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, booking: null })}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation reason (optional)"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, booking: null })}>
            Keep Booking
          </Button>
          <Button
            onClick={() => handleStatusUpdate(statusDialog.booking?.id, 'cancelled')}
            color="error"
            variant="contained"
            disabled={updating}
          >
            {updating ? <CircularProgress size={20} /> : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingsList;