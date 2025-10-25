import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import api from '../services/api';

const AvailabilityManager = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    day_of_week: 'monday',
    start_time: '',
    end_time: '',
    is_available: true
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/availability/my');
      setAvailability(response.data.availability || []);
    } catch (error) {
      setError('Failed to load availability');
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingSlot) {
        await api.put(`/bookings/availability/${editingSlot.id}`, formData);
        setSuccess('Availability updated successfully');
      } else {
        await api.post('/bookings/availability', formData);
        setSuccess('Availability added successfully');
      }

      fetchAvailability();
      handleCloseDialog();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save availability');
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      await api.delete(`/bookings/availability/${slotId}`);
      setSuccess('Availability deleted successfully');
      fetchAvailability();
    } catch (error) {
      setError('Failed to delete availability');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: slot.is_available
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSlot(null);
    setFormData({
      day_of_week: 'monday',
      start_time: '',
      end_time: '',
      is_available: true
    });
    setError('');
  };

  const getDayName = (day) => {
    const days = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };
    return days[day] || day;
  };

  const groupedAvailability = availability.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {});

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Manage Availability
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Availability
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {Object.keys(groupedAvailability).length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No availability slots set up yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your available time slots so students can book sessions with you.
          </Typography>
        </Box>
      ) : (
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
          const daySlots = groupedAvailability[day] || [];
          return (
            <Card key={day} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {getDayName(day)}
                </Typography>

                {daySlots.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No availability set for this day
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {daySlots.map((slot) => (
                      <Grid item xs={12} sm={6} md={4} key={slot.id}>
                        <Box
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: slot.is_available ? 'success.light' : 'grey.100'
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body1" fontWeight="bold">
                              {slot.start_time} - {slot.end_time}
                            </Typography>
                            <Chip
                              label={slot.is_available ? 'Available' : 'Unavailable'}
                              color={slot.is_available ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>

                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => handleEdit(slot)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleDelete(slot.id)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSlot ? 'Edit Availability' : 'Add Availability'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={formData.day_of_week}
                onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: e.target.value }))}
                label="Day of Week"
              >
                <MenuItem value="monday">Monday</MenuItem>
                <MenuItem value="tuesday">Tuesday</MenuItem>
                <MenuItem value="wednesday">Wednesday</MenuItem>
                <MenuItem value="thursday">Thursday</MenuItem>
                <MenuItem value="friday">Friday</MenuItem>
                <MenuItem value="saturday">Saturday</MenuItem>
                <MenuItem value="sunday">Sunday</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" gap={2} mb={2}>
              <TextField
                type="time"
                label="Start Time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                type="time"
                label="End Time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_available}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                />
              }
              label="Available for booking"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSlot ? 'Update' : 'Add'} Availability
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AvailabilityManager;