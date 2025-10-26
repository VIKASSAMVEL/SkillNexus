import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../services/api';
import { formatCurrency, safeNumber } from '../utils/formatters';

const BookingForm = ({ open, onClose, skill, teacher }) => {
  const [formData, setFormData] = useState({
    booking_date: null,
    start_time: null,
    end_time: null,
    notes: ''
  });
  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userCredits, setUserCredits] = useState(null);

  const fetchAvailability = useCallback(async () => {
    try {
      const response = await api.get(`/bookings/availability/${teacher.id}`);
      setAvailability(response.data.availability || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  }, [teacher?.id]);

  const fetchUserCredits = useCallback(async () => {
    try {
      const response = await api.get('/auth/credits');
      setUserCredits(response.data);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  }, []);

  useEffect(() => {
    if (open && teacher?.id) {
      fetchAvailability();
      fetchUserCredits();
    }
  }, [open, teacher?.id, fetchAvailability, fetchUserCredits]);

  const fetchBookingsForDate = async (date) => {
    if (!date) return;

    try {
      const dateStr = date;
      const response = await api.get(`/bookings/availability/${teacher.id}?date=${dateStr}`);
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setFormData(prev => ({ ...prev, booking_date: date }));
    if (date) {
      fetchBookingsForDate(date);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Calculate scheduled_at from date and start_time
      const scheduledAt = formData.booking_date && formData.start_time 
        ? `${formData.booking_date}T${formData.start_time}` 
        : null;

      // Calculate duration
      const start = formData.start_time ? new Date(`1970-01-01T${formData.start_time}`) : null;
      const end = formData.end_time ? new Date(`1970-01-01T${formData.end_time}`) : null;
      const durationMinutes = start && end ? (end - start) / (1000 * 60) : 60;

      const sessionData = {
        skill_id: skill.id,
        provider_id: teacher.id,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        session_type: 'one-on-one',
        notes: formData.notes
      };

      await api.post('/sessions', sessionData);

      setSuccess('Booking created successfully!');
      setTimeout(() => {
        onClose();
        setFormData({
          booking_date: '',
          start_time: '',
          end_time: '',
          notes: ''
        });
        setSuccess('');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const isTimeSlotAvailable = (startTime, endTime) => {
    if (!formData.booking_date || !startTime || !endTime) return false;

    const date = new Date(formData.booking_date + 'T00:00:00'); // Add time to ensure proper date parsing
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

    // Check if teacher has availability for this day
    const dayAvailability = availability.filter(slot => slot.day_of_week === dayOfWeek);
    const hasAvailability = dayAvailability.some(slot => {
      return startTime >= slot.start_time && endTime <= slot.end_time;
    });

    if (!hasAvailability) return false;

    // Check for conflicting bookings
    const hasConflict = bookings.some(booking => {
      return (startTime < booking.end_time && endTime > booking.start_time);
    });

    return !hasConflict;
  };

  const generateAvailableTimeSlots = () => {
    if (!formData.booking_date || !availability.length) return [];

    const date = new Date(formData.booking_date + 'T00:00:00');
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

    // Get availability for this day
    const dayAvailability = availability.filter(slot => slot.day_of_week === dayOfWeek);
    if (!dayAvailability.length) return [];

    const slots = [];
    const slotDuration = 60; // 1 hour slots

    dayAvailability.forEach(slot => {
      const startHour = parseInt(slot.start_time.split(':')[0]);
      const startMinute = parseInt(slot.start_time.split(':')[1]);
      const endHour = parseInt(slot.end_time.split(':')[0]);
      const endMinute = parseInt(slot.end_time.split(':')[1]);

      let currentHour = startHour;
      let currentMinute = startMinute;

      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const slotStart = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const slotEndHour = currentHour + Math.floor((currentMinute + slotDuration) / 60);
        const slotEndMinute = (currentMinute + slotDuration) % 60;
        const slotEnd = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;

        // Check if this slot fits within availability and doesn't conflict
        if (slotEnd <= slot.end_time && isTimeSlotAvailable(slotStart, slotEnd)) {
          slots.push({
            start: slotStart,
            end: slotEnd,
            label: `${slotStart} - ${slotEnd}`
          });
        }

        currentMinute += slotDuration;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
      }
    });

    return slots;
  };

  const handleTimeSlotSelect = (slot) => {
    setFormData(prev => ({
      ...prev,
      start_time: slot.start,
      end_time: slot.end
    }));
  };

  const calculatePrice = () => {
    if (!formData.start_time || !formData.end_time || !skill) return 0;

    const start = new Date(`1970-01-01T${formData.start_time}`);
    const end = new Date(`1970-01-01T${formData.end_time}`);
    const duration = (end - start) / (1000 * 60 * 60); // hours
    return skill.price_per_hour ? skill.price_per_hour * duration : skill.price_per_session || 0;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1A2332',
          backgroundImage: 'none',
          border: '1px solid #0F766E',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#0F766E',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '1.3rem',
          borderBottom: '2px solid #14B8A6'
        }}
      >
        Book Session: {skill?.name}
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: '#1A2332',
          color: '#e0e7ff'
        }}
      >
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom
            sx={{
              color: '#14B8A6',
              fontWeight: 500
            }}
          >
            Teacher: {teacher?.name}
          </Typography>

          {userCredits && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#0F172A', borderRadius: 1, border: '1px solid #14B8A6' }}>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                Your Credit Balance: <strong style={{ color: '#14B8A6' }}>{formatCurrency(userCredits.balance)}</strong>
              </Typography>
            </Box>
          )}

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

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              type="date"
              label="Booking Date"
              value={formData.booking_date || ''}
              onChange={handleDateChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ 
                min: new Date().toISOString().split('T')[0],
                max: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
              }}
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  color: '#e0e7ff',
                  '& fieldset': {
                    borderColor: '#0F766E'
                  },
                  '&:hover fieldset': {
                    borderColor: '#14B8A6'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#14B8A6'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#e0e7ff'
                },
                '& .MuiInputLabel-root': {
                  color: '#cbd5e1',
                  '&.Mui-focused': {
                    color: '#14B8A6'
                  }
                }
              }}
            />
          </Box>

          {formData.booking_date && (
            <>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ color: '#14B8A6', fontWeight: 600 }}
              >
                Available Time Slots
              </Typography>
              {generateAvailableTimeSlots().length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {generateAvailableTimeSlots().map((slot, index) => (
                    <Button
                      key={index}
                      variant={formData.start_time === slot.start && formData.end_time === slot.end ? "contained" : "outlined"}
                      size="small"
                      onClick={() => handleTimeSlotSelect(slot)}
                      sx={{ 
                        minWidth: '120px',
                        color: formData.start_time === slot.start && formData.end_time === slot.end ? '#ffffff' : '#14B8A6',
                        borderColor: '#14B8A6',
                        backgroundColor: formData.start_time === slot.start && formData.end_time === slot.end ? '#0F766E' : 'transparent',
                        '&:hover': {
                          backgroundColor: formData.start_time === slot.start && formData.end_time === slot.end ? '#0F766E' : '#0F172A',
                          borderColor: '#14B8A6'
                        }
                      }}
                    >
                      {slot.label}
                    </Button>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                  No available time slots for this date.
                </Typography>
              )}

              <Typography 
                variant="subtitle2" 
                gutterBottom 
                sx={{ mt: 2, color: '#14B8A6', fontWeight: 500 }}
              >
                Or enter custom times:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  type="time"
                  label="Start Time"
                  value={formData.start_time || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ 
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      color: '#e0e7ff',
                      '& fieldset': {
                        borderColor: '#0F766E'
                      },
                      '&:hover fieldset': {
                        borderColor: '#14B8A6'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#14B8A6'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#e0e7ff'
                    },
                    '& .MuiInputLabel-root': {
                      color: '#cbd5e1',
                      '&.Mui-focused': {
                        color: '#14B8A6'
                      }
                    }
                  }}
                />

                <TextField
                  type="time"
                  label="End Time"
                  value={formData.end_time || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ 
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      color: '#e0e7ff',
                      '& fieldset': {
                        borderColor: '#0F766E'
                      },
                      '&:hover fieldset': {
                        borderColor: '#14B8A6'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#14B8A6'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#e0e7ff'
                    },
                    '& .MuiInputLabel-root': {
                      color: '#cbd5e1',
                      '&.Mui-focused': {
                        color: '#14B8A6'
                      }
                    }
                  }}
                />
              </Box>
            </>
          )}

          {!isTimeSlotAvailable(formData.start_time, formData.end_time) && formData.start_time && formData.end_time && formData.booking_date && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2,
                bgcolor: '#7C2D12',
                color: '#FED7AA',
                '& .MuiAlert-icon': {
                  color: '#FED7AA'
                }
              }}
            >
              This time slot is not available. Please choose from the available slots above or select a different time.
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optional)"
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#e0e7ff',
                '& fieldset': {
                  borderColor: '#0F766E'
                },
                '&:hover fieldset': {
                  borderColor: '#14B8A6'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#14B8A6'
                }
              },
              '& .MuiInputBase-input': {
                color: '#e0e7ff'
              },
              '& .MuiInputLabel-root': {
                color: '#cbd5e1',
                '&.Mui-focused': {
                  color: '#14B8A6'
                }
              }
            }}
          />

          <Box sx={{ p: 2, bgcolor: '#0F172A', borderRadius: 1, border: '1px solid #14B8A6' }}>
            <Typography variant="h6" sx={{ color: '#14B8A6', fontWeight: 600 }}>
              Total Price: {formatCurrency(calculatePrice())}
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
              {skill?.price_per_hour ? `${formatCurrency(skill.price_per_hour)}/hour` : `${formatCurrency(skill?.price_per_session)} per session`}
            </Typography>
            {userCredits && calculatePrice() > safeNumber(userCredits.balance) && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 1,
                  bgcolor: '#7C2D12',
                  color: '#FED7AA',
                  '& .MuiAlert-icon': {
                    color: '#FED7AA'
                  }
                }}
              >
                Insufficient credits! You need {formatCurrency(calculatePrice())} but only have {formatCurrency(userCredits.balance)}.
                <Button
                  size="small"
                  component={Link}
                  to="/credits"
                  sx={{ ml: 1, color: '#FED7AA', '&:hover': { textDecoration: 'underline' } }}
                  onClick={onClose}
                >
                  Add Credits
                </Button>
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#1A2332', borderTop: '1px solid #0F766E', p: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ color: '#cbd5e1', '&:hover': { bgcolor: '#0F172A' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !isTimeSlotAvailable(formData.start_time, formData.end_time) || (userCredits && calculatePrice() > userCredits.balance)}
          sx={{
            backgroundColor: '#14B8A6',
            color: '#0F172A',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#0D9488'
            },
            '&:disabled': {
              backgroundColor: '#0F766E',
              color: '#64748b'
            }
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#0F172A' }} /> : 'Book Session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingForm;

BookingForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  skill: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price_per_hour: PropTypes.number,
    price_per_session: PropTypes.number
  }).isRequired,
  teacher: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired
};