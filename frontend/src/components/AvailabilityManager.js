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
  Chip,
  Paper,
  Fade
} from '@mui/material';
import { Add, Delete, Edit, Schedule } from '@mui/icons-material';
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: '#14B8A6' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
          Manage Availability
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{
            bgcolor: '#14B8A6',
            color: '#0F172A',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#0D9488'
            }
          }}
        >
          Add Availability
        </Button>
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

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            bgcolor: 'rgba(34, 197, 94, 0.15)',
            color: '#86EFAC',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            '& .MuiAlert-icon': { color: '#86EFAC' }
          }}
        >
          {success}
        </Alert>
      )}

      {Object.keys(groupedAvailability).length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            p: 4,
            bgcolor: '#1A2332',
            border: '2px dashed #1E293B',
            borderRadius: 3
          }}
        >
          <Schedule sx={{ fontSize: 48, color: '#94A3B8', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ color: '#CBD5E1' }}>
            No availability slots yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Add your available time slots so students can book sessions with you.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
            const daySlots = groupedAvailability[day] || [];
            return (
              <Paper
                key={day}
                elevation={0}
                sx={{
                  mb: 2,
                  bgcolor: '#1A2332',
                  border: '1px solid #1E293B',
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#14B8A6'
                  }
                }}
              >
                <Box sx={{ 
                  p: 2.5, 
                  bgcolor: 'rgba(20, 184, 166, 0.1)', 
                  borderBottom: '1px solid #1E293B'
                }}>
                  <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                    {getDayName(day)}
                  </Typography>
                </Box>

                <CardContent>
                  {daySlots.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      No availability set for this day
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {daySlots.map((slot, index) => (
                        <Grid item xs={12} sm={6} md={4} key={slot.id}>
                          <Fade in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                bgcolor: slot.is_available ? 'rgba(20, 184, 166, 0.05)' : 'rgba(107, 114, 128, 0.05)',
                                border: `1px solid ${slot.is_available ? 'rgba(20, 184, 166, 0.2)' : 'rgba(107, 114, 128, 0.2)'}`,
                                borderRadius: 1.5,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  borderColor: slot.is_available ? '#14B8A6' : '#6B7280',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#E2E8F0' }}>
                                  {slot.start_time} - {slot.end_time}
                                </Typography>
                                <Chip
                                  label={slot.is_available ? 'Available' : 'Unavailable'}
                                  size="small"
                                  sx={{
                                    bgcolor: slot.is_available ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                                    color: slot.is_available ? '#86EFAC' : '#D1D5DB',
                                    border: `1px solid ${slot.is_available ? '#86EFAC' : '#D1D5DB'}`,
                                    fontWeight: 600
                                  }}
                                />
                              </Box>

                              <Box display="flex" gap={1}>
                                <Button
                                  size="small"
                                  startIcon={<Edit />}
                                  onClick={() => handleEdit(slot)}
                                  sx={{
                                    color: '#14B8A6',
                                    borderColor: '#14B8A6',
                                    flex: 1,
                                    fontWeight: 600,
                                    '&:hover': {
                                      bgcolor: 'rgba(20, 184, 166, 0.1)',
                                      borderColor: '#0D9488'
                                    }
                                  }}
                                  variant="outlined"
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<Delete />}
                                  onClick={() => handleDelete(slot.id)}
                                  sx={{
                                    color: '#EF4444',
                                    borderColor: '#EF4444',
                                    flex: 1,
                                    fontWeight: 600,
                                    '&:hover': {
                                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                                      borderColor: '#DC2626'
                                    }
                                  }}
                                  variant="outlined"
                                >
                                  Delete
                                </Button>
                              </Box>
                            </Paper>
                          </Fade>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ color: '#E2E8F0', fontWeight: 600, borderBottom: '1px solid #1E293B' }}>
          {editingSlot ? 'Edit Availability' : 'Add Availability'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#94A3B8' }}>Day of Week</InputLabel>
              <Select
                value={formData.day_of_week}
                onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: e.target.value }))}
                label="Day of Week"
                sx={{
                  color: '#E2E8F0',
                  bgcolor: '#0F172A',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                  '& .MuiSvgIcon-root': { color: '#14B8A6' }
                }}
              >
                <MenuItem value="monday" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: '#0F172A' } }}>Monday</MenuItem>
                <MenuItem value="tuesday" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: '#0F172A' } }}>Tuesday</MenuItem>
                <MenuItem value="wednesday" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: '#0F172A' } }}>Wednesday</MenuItem>
                <MenuItem value="thursday" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: '#0F172A' } }}>Thursday</MenuItem>
                <MenuItem value="friday" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: '#0F172A' } }}>Friday</MenuItem>
                <MenuItem value="saturday" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: '#0F172A' } }}>Saturday</MenuItem>
                <MenuItem value="sunday" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: '#0F172A' } }}>Sunday</MenuItem>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    bgcolor: '#0F172A',
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

              <TextField
                type="time"
                label="End Time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    bgcolor: '#0F172A',
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
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_available}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#14B8A6',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#14B8A6'
                      }
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: '#1E293B'
                    }
                  }}
                />
              }
              label={<Typography sx={{ color: '#CBD5E1' }}>Available for booking</Typography>}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #1E293B' }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: '#CBD5E1' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              bgcolor: '#14B8A6',
              color: '#0F172A',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#0D9488'
              }
            }}
          >
            {editingSlot ? 'Update' : 'Add'} Availability
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvailabilityManager;