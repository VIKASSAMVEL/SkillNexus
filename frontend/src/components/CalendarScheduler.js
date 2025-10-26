import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
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
  Chip,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Fab
} from '@mui/material';
import {
  DateCalendar,
  LocalizationProvider,
  TimePicker
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ViewWeek,
  ViewDay,
  ViewModule,
  AccessTime,
  Person,
  CheckCircle,
  Schedule,
  Event,
  Add,
  Refresh,
  LocationOn,
  Videocam,
  Phone
} from '@mui/icons-material';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, parseISO, isWithinInterval, addHours } from 'date-fns';
import moment from 'moment-timezone';
import api from '../services/api';

const CalendarScheduler = ({ teacherId, skillId, onBookingCreated }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'month', 'week', 'day'
  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingDialog, setBookingDialog] = useState({ open: false, slot: null });
  const [bookingForm, setBookingForm] = useState({
    startTime: null,
    endTime: null,
    duration: 1,
    notes: '',
    sessionType: 'in-person', // 'in-person', 'virtual', 'phone'
    isRecurring: false,
    recurrencePattern: 'weekly', // 'daily', 'weekly', 'monthly'
    recurrenceEndDate: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [creating, setCreating] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [skillInfo, setSkillInfo] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(teacherId || '');
  const [selectedSkillId, setSelectedSkillId] = useState(skillId || '');
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Fetch teachers and skills
  const fetchTeachersAndSkills = useCallback(async () => {
    try {
      setLoadingTeachers(true);
      setLoadingSkills(true);

      const [teachersResponse, skillsResponse] = await Promise.all([
        api.get('/users/teachers'),
        api.get('/skills')
      ]);

      setTeachers(teachersResponse.data.teachers || []);
      setSkills(skillsResponse.data.skills || []);
    } catch (error) {
      console.error('Error fetching teachers and skills:', error);
    } finally {
      setLoadingTeachers(false);
      setLoadingSkills(false);
    }
  }, []);

  // Fetch teacher availability and bookings for selected date range
  const fetchCalendarData = useCallback(async () => {
    if (!selectedTeacherId) return;

    try {
      setLoading(true);

      // Fetch teacher info and skill info
      if (!teacherInfo || teacherInfo.id !== parseInt(selectedTeacherId)) {
        const [teacherResponse, skillResponse] = await Promise.all([
          api.get(`/users/${selectedTeacherId}`),
          selectedSkillId ? api.get(`/skills/${selectedSkillId}`) : Promise.resolve({ data: null })
        ]);
        setTeacherInfo(teacherResponse.data.user);
        setSkillInfo(skillResponse.data?.skill);
      }

      // Calculate date range based on view mode
      let startDate, endDate;
      if (viewMode === 'day') {
        startDate = endDate = selectedDate;
      } else if (viewMode === 'week') {
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
      } else {
        // Month view - get full month
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      }

      // Fetch availability for the date range
      const availabilityPromises = [];
      for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
        availabilityPromises.push(
          api.get(`/bookings/availability/${selectedTeacherId}`, {
            params: { date: format(date, 'yyyy-MM-dd'), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
          })
        );
      }

      const availabilityResponses = await Promise.all(availabilityPromises);
      const allAvailability = availabilityResponses.flatMap(response => response.data.availability || []);
      const allBookings = availabilityResponses.flatMap(response => response.data.bookings || []);

      setAvailability(allAvailability);
      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTeacherId, selectedSkillId, selectedDate, viewMode, teacherInfo]);

  useEffect(() => {
    fetchTeachersAndSkills();
  }, [fetchTeachersAndSkills]);

  useEffect(() => {
    if (selectedTeacherId) {
      fetchCalendarData();
    }
  }, [fetchCalendarData]);

  // Update selected teacher/skill when props change
  useEffect(() => {
    if (teacherId) setSelectedTeacherId(teacherId);
    if (skillId) setSelectedSkillId(skillId);
  }, [teacherId, skillId]);

  // Generate time slots for a given date
  const generateTimeSlots = (date) => {
    const slots = [];
    const dayOfWeek = format(date, 'EEEE').toLowerCase();

    // Get availability for this day
    const dayAvailability = availability.filter(slot => slot.day_of_week === dayOfWeek);

    dayAvailability.forEach(avail => {
      const [startHour, startMin] = avail.start_time.split(':').map(Number);
      const [endHour, endMin] = avail.end_time.split(':').map(Number);

      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMin, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHour, endMin, 0, 0);

      // Generate 30-minute slots
      while (currentTime < endTime) {
        const slotEnd = addHours(currentTime, 0.5);

        // Check if this slot conflicts with existing bookings
        const conflictingBooking = bookings.find(booking => {
          const bookingStart = parseISO(`${format(date, 'yyyy-MM-dd')}T${booking.start_time}`);
          const bookingEnd = parseISO(`${format(date, 'yyyy-MM-dd')}T${booking.end_time}`);

          return isWithinInterval(currentTime, { start: bookingStart, end: bookingEnd }) ||
                 isWithinInterval(slotEnd, { start: bookingStart, end: bookingEnd });
        });

        slots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
          available: !conflictingBooking,
          booking: conflictingBooking
        });

        currentTime = slotEnd;
      }
    });

    return slots;
  };

  // Generate recurring bookings
  const generateRecurringBookings = (baseBookingData) => {
    const bookings = [];
    const { booking_date, recurrence_pattern, recurrence_end_date } = baseBookingData;
    
    let currentDate = new Date(booking_date);
    const endDate = recurrence_end_date ? new Date(recurrence_end_date) : addDays(currentDate, 30); // Default 30 days if no end date
    
    while (currentDate <= endDate) {
      const bookingData = {
        ...baseBookingData,
        booking_date: format(currentDate, 'yyyy-MM-dd')
      };
      
      bookings.push(bookingData);
      
      // Increment based on recurrence pattern
      switch (recurrence_pattern) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addDays(currentDate, 7);
          break;
        case 'monthly':
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
          break;
        default:
          currentDate = addDays(currentDate, 7); // Default to weekly
      }
    }
    
    return bookings;
  };

  // Handle booking creation
  const handleCreateBooking = async () => {
    if (!bookingDialog.slot || !bookingForm.startTime || !bookingForm.endTime) return;

    try {
      setCreating(true);

      const baseBookingData = {
        teacher_id: selectedTeacherId,
        skill_id: selectedSkillId,
        start_time: format(bookingForm.startTime, 'HH:mm'),
        end_time: format(bookingForm.endTime, 'HH:mm'),
        duration_hours: bookingForm.duration,
        notes: `${bookingForm.sessionType}: ${bookingForm.notes}`.trim(),
        timezone: bookingForm.timezone,
        is_recurring: bookingForm.isRecurring,
        recurrence_pattern: bookingForm.isRecurring ? bookingForm.recurrencePattern : null,
        recurrence_end_date: bookingForm.isRecurring && bookingForm.recurrenceEndDate ? format(bookingForm.recurrenceEndDate, 'yyyy-MM-dd') : null
      };

      if (bookingForm.isRecurring) {
        // Create recurring bookings
        const recurringBookings = generateRecurringBookings(baseBookingData);
        const response = await api.post('/bookings/recurring', { bookings: recurringBookings });
        
        // Refresh calendar data
        await fetchCalendarData();

        // Close dialog and reset form
        setBookingDialog({ open: false, slot: null });
        setBookingForm({
          startTime: null,
          endTime: null,
          duration: 1,
          notes: '',
          sessionType: 'in-person',
          isRecurring: false,
          recurrencePattern: 'weekly',
          recurrenceEndDate: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        if (onBookingCreated) {
          onBookingCreated(response.data);
        }
      } else {
        // Create single booking
        const bookingData = {
          ...baseBookingData,
          booking_date: format(selectedDate, 'yyyy-MM-dd')
        };

        const response = await api.post('/bookings', bookingData);

        // Refresh calendar data
        await fetchCalendarData();

        // Close dialog and reset form
        setBookingDialog({ open: false, slot: null });
        setBookingForm({
          startTime: null,
          endTime: null,
          duration: 1,
          notes: '',
          sessionType: 'in-person',
          isRecurring: false,
          recurrencePattern: 'weekly',
          recurrenceEndDate: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        if (onBookingCreated) {
          onBookingCreated(response.data);
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setCreating(false);
    }
  };

  // Handle slot click
  const handleSlotClick = (slot) => {
    if (!slot.available) return;

    setBookingDialog({ open: true, slot });
    setBookingForm({
      startTime: slot.start,
      endTime: slot.end,
      duration: 1,
      notes: '',
      sessionType: 'in-person',
      isRecurring: false,
      recurrencePattern: 'weekly',
      recurrenceEndDate: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  // Render time slots for day/week view
  const renderTimeSlots = (date) => {
    const slots = generateTimeSlots(date);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1 }}>
        {slots.map((slot, index) => (
          <Box
            key={index}
            onClick={() => handleSlotClick(slot)}
            sx={{
              p: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: slot.available ? '#14B8A6' : '#EF4444',
              bgcolor: slot.available ? 'rgba(20, 184, 166, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              cursor: slot.available ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              '&:hover': slot.available ? {
                bgcolor: 'rgba(20, 184, 166, 0.2)',
                transform: 'scale(1.02)'
              } : {},
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime sx={{ fontSize: 16, color: slot.available ? '#14B8A6' : '#EF4444' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
              </Typography>
            </Box>

            {slot.booking && (
              <Chip
                label="Booked"
                size="small"
                sx={{
                  bgcolor: 'rgba(239, 68, 68, 0.2)',
                  color: '#EF4444',
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });

    return (
      <Grid container spacing={1}>
        {weekDays.map((day, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 12/7 }} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: isSameDay(day, new Date()) ? 'rgba(20, 184, 166, 0.1)' : '#1A2332',
                border: '1px solid #1E293B',
                borderRadius: 2,
                minHeight: 300
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#E2E8F0',
                  fontWeight: 600,
                  mb: 2,
                  textAlign: 'center'
                }}
              >
                {format(day, 'EEE dd')}
              </Typography>
              {renderTimeSlots(day)}
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render day view
  const renderDayView = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: '#1A2332',
        border: '1px solid #1E293B',
        borderRadius: 2,
        minHeight: 500
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: '#E2E8F0',
          fontWeight: 600,
          mb: 3,
          textAlign: 'center'
        }}
      >
        {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
      </Typography>
      {renderTimeSlots(selectedDate)}
    </Paper>
  );

  // Render month view
  const renderMonthView = () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ flex: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={selectedDate}
            onChange={setSelectedDate}
            sx={{
              bgcolor: '#1A2332',
              border: '1px solid #1E293B',
              borderRadius: 2,
              '& .MuiPickersCalendarHeader-label': {
                color: '#E2E8F0'
              },
              '& .MuiDayCalendar-weekDayLabel': {
                color: '#94A3B8'
              },
              '& .MuiPickersDay-root': {
                color: '#E2E8F0',
                '&.Mui-selected': {
                  bgcolor: '#14B8A6',
                  '&:hover': {
                    bgcolor: '#0D9488'
                  }
                },
                '&:hover': {
                  bgcolor: 'rgba(20, 184, 166, 0.2)'
                }
              }
            }}
          />
        </LocalizationProvider>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            borderRadius: 2,
            minHeight: 400
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#E2E8F0',
              fontWeight: 600,
              mb: 2
            }}
          >
            {format(selectedDate, 'EEEE, MMMM dd')}
          </Typography>
          {renderTimeSlots(selectedDate)}
        </Paper>
      </Box>
    </Box>
  );

  if (!teacherId && !skillId) {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="xl" sx={{ py: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                Schedule Session
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#94A3B8', mt: 1 }}>
                Select a teacher and skill to view their availability
              </Typography>
            </Box>
          </Box>

          {/* Teacher and Skill Selection */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: '#1A2332',
                  border: '1px solid #1E293B',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 600, mb: 2 }}>
                  Select Teacher
                </Typography>
                {loadingTeachers ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress sx={{ color: '#14B8A6' }} />
                  </Box>
                ) : (
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#14B8A6', fontWeight: 600 }}>Choose a teacher</InputLabel>
                    <Select
                      value={selectedTeacherId}
                      onChange={(e) => {
                        setSelectedTeacherId(e.target.value);
                        setTeacherInfo(null);
                        setSkillInfo(null);
                        setSelectedSkillId('');
                      }}
                      sx={{
                        color: '#E2E8F0',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#0F766E' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                        '& .MuiSelect-icon': { color: '#14B8A6' },
                        border: '2px solid #0F766E',
                        borderRadius: 2
                      }}
                    >
                      {teachers.map((teacher) => (
                        <MenuItem 
                          key={teacher.id} 
                          value={teacher.id}
                          sx={{
                            bgcolor: '#1A2332',
                            color: '#E2E8F0',
                            '&:hover': {
                              bgcolor: '#0F766E',
                              color: '#14B8A6'
                            },
                            '&.Mui-selected': {
                              bgcolor: '#0F766E',
                              color: '#14B8A6',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: '#0F766E'
                              }
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#14B8A6' }}>
                              {teacher.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                                {teacher.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                {teacher.email}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: '#1A2332',
                  border: '1px solid #1E293B',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 600, mb: 2 }}>
                  Select Skill
                </Typography>
                {loadingSkills ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress sx={{ color: '#14B8A6' }} />
                  </Box>
                ) : (
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#14B8A6', fontWeight: 600 }}>Choose a skill</InputLabel>
                    <Select
                      value={selectedSkillId}
                      onChange={(e) => {
                        setSelectedSkillId(e.target.value);
                        setSkillInfo(null);
                      }}
                      disabled={!selectedTeacherId}
                      sx={{
                        color: '#E2E8F0',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#0F766E' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                        '& .MuiSelect-icon': { color: '#14B8A6' },
                        border: '2px solid #0F766E',
                        borderRadius: 2
                      }}
                    >
                      {skills
                        .filter(skill => !selectedTeacherId || skill.user_id === parseInt(selectedTeacherId))
                        .map((skill) => (
                        <MenuItem 
                          key={skill.id} 
                          value={skill.id}
                          sx={{
                            bgcolor: '#1A2332',
                            color: '#E2E8F0',
                            '&:hover': {
                              bgcolor: '#0F766E',
                              color: '#14B8A6'
                            },
                            '&.Mui-selected': {
                              bgcolor: '#0F766E',
                              color: '#14B8A6',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: '#0F766E'
                              }
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: skill.is_available ? '#22C55E' : '#EF4444'
                            }} />
                            <Box>
                              <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                                {skill.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                {skill.category} • ${skill.price_per_hour}/hr
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Teacher Info Preview */}
          {teacherInfo && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: '#1A2332',
                border: '1px solid #1E293B',
                borderRadius: 2,
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: '#14B8A6' }}>
                  {teacherInfo.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                    {teacherInfo.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    {teacherInfo.email}
                  </Typography>
                </Box>
              </Box>
              {skillInfo && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(20, 184, 166, 0.1)', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#14B8A6', fontWeight: 600 }}>
                    Selected Skill: {skillInfo.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mt: 1 }}>
                    {skillInfo.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
                    Category: {skillInfo.category} • Price: ${skillInfo.price_per_hour}/hour
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Container>
      </LocalizationProvider>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
              Schedule Session
            </Typography>
            {teacherInfo && (
              <Typography variant="subtitle1" sx={{ color: '#94A3B8', mt: 1 }}>
                with {teacherInfo.name}
                {skillInfo && ` • ${skillInfo.name}`}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              sx={{
                '& .MuiToggleButton-root': {
                  color: '#94A3B8',
                  borderColor: '#1E293B',
                  '&.Mui-selected': {
                    color: '#14B8A6',
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(20, 184, 166, 0.2)'
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.05)'
                  }
                }
              }}
            >
              <ToggleButton value="month">
                <ViewModule sx={{ mr: 1 }} />
                Month
              </ToggleButton>
              <ToggleButton value="week">
                <ViewWeek sx={{ mr: 1 }} />
                Week
              </ToggleButton>
              <ToggleButton value="day">
                <ViewDay sx={{ mr: 1 }} />
                Day
              </ToggleButton>
            </ToggleButtonGroup>

            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchCalendarData}
                disabled={loading}
                sx={{
                  color: '#14B8A6',
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)'
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress sx={{ color: '#14B8A6' }} />
          </Box>
        )}

        {/* Calendar Views */}
        <Box sx={{ mb: 3 }}>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </Box>

        {/* Legend */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 600, mb: 2 }}>
            Legend
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: 'rgba(20, 184, 166, 0.2)', border: '1px solid #14B8A6', borderRadius: 1 }} />
              <Typography variant="body2" sx={{ color: '#CBD5E1' }}>Available</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', borderRadius: 1 }} />
              <Typography variant="body2" sx={{ color: '#CBD5E1' }}>Booked</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Booking Dialog */}
        <Dialog
          open={bookingDialog.open}
          onClose={() => setBookingDialog({ open: false, slot: null })}
          maxWidth="md"
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
            Book Session
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {teacherInfo && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#14B8A6' }}>
                    {teacherInfo.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                      {teacherInfo.name}
                    </Typography>
                    {skillInfo && (
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        {skillInfo.name} • {skillInfo.category}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Divider sx={{ bgcolor: '#1E293B' }} />
              </Box>
            )}

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 600, mb: 1 }}>
                  Session Date & Time
                </Typography>
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 2 }}>
                  {bookingDialog.slot && format(bookingDialog.slot.start, 'EEEE, MMMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  {bookingDialog.slot && `${format(bookingDialog.slot.start, 'HH:mm')} - ${format(bookingDialog.slot.end, 'HH:mm')}`}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: '#94A3B8' }}>Session Type</InputLabel>
                  <Select
                    value={bookingForm.sessionType}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, sessionType: e.target.value }))}
                    sx={{
                      color: '#E2E8F0',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                      '& .MuiSelect-icon': { color: '#94A3B8' }
                    }}
                  >
                    <MenuItem value="in-person">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 18 }} />
                        In-Person
                      </Box>
                    </MenuItem>
                    <MenuItem value="virtual">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Videocam sx={{ fontSize: 18 }} />
                        Virtual
                      </Box>
                    </MenuItem>
                    <MenuItem value="phone">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 18 }} />
                        Phone Call
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#94A3B8' }}>Duration</InputLabel>
                  <Select
                    value={bookingForm.duration}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, duration: e.target.value }))}
                    sx={{
                      color: '#E2E8F0',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                      '& .MuiSelect-icon': { color: '#94A3B8' }
                    }}
                  >
                    <MenuItem value={0.5}>30 minutes</MenuItem>
                    <MenuItem value={1}>1 hour</MenuItem>
                    <MenuItem value={1.5}>1.5 hours</MenuItem>
                    <MenuItem value={2}>2 hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: '#94A3B8' }}>Timezone</InputLabel>
                  <Select
                    value={bookingForm.timezone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, timezone: e.target.value }))}
                    sx={{
                      color: '#E2E8F0',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                      '& .MuiSelect-icon': { color: '#94A3B8' }
                    }}
                  >
                    <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                    <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                    <MenuItem value="Europe/London">London (GMT)</MenuItem>
                    <MenuItem value="Europe/Paris">Paris (CET)</MenuItem>
                    <MenuItem value="Asia/Tokyo">Tokyo (JST)</MenuItem>
                    <MenuItem value="Asia/Shanghai">Shanghai (CST)</MenuItem>
                    <MenuItem value="Australia/Sydney">Sydney (AEST)</MenuItem>
                    <MenuItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                      Local Time ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                    </MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={bookingForm.isRecurring}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    style={{ accentColor: '#14B8A6' }}
                  />
                  <label htmlFor="isRecurring" style={{ color: '#E2E8F0', fontSize: '14px' }}>
                    Make this a recurring session
                  </label>
                </Box>

                {bookingForm.isRecurring && (
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ color: '#94A3B8' }}>Repeat</InputLabel>
                      <Select
                        value={bookingForm.recurrencePattern}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, recurrencePattern: e.target.value }))}
                        sx={{
                          color: '#E2E8F0',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                          '& .MuiSelect-icon': { color: '#94A3B8' }
                        }}
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={bookingForm.recurrenceEndDate ? format(bookingForm.recurrenceEndDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setBookingForm(prev => ({
                          ...prev,
                          recurrenceEndDate: e.target.value ? parseISO(e.target.value) : null
                        }))}
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
                          },
                          '& .MuiOutlinedInput-input': { color: '#E2E8F0' }
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes (optional)"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific topics you'd like to cover or special requirements..."
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
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #1E293B' }}>
            <Button
              onClick={() => setBookingDialog({ open: false, slot: null })}
              sx={{ color: '#CBD5E1' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBooking}
              variant="contained"
              disabled={creating}
              sx={{
                bgcolor: '#14B8A6',
                color: '#0F172A',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#0D9488'
                },
                '&.Mui-disabled': {
                  bgcolor: '#7F1D1D',
                  color: '#FCA5A5'
                }
              }}
            >
              {creating ? <CircularProgress size={20} sx={{ color: '#14B8A6' }} /> : 'Book Session'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default CalendarScheduler;