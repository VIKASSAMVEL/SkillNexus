import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Slider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { recommendationsAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 800,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  backgroundColor: '#1A2332',
  border: '1px solid #1E293B',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
}));

const UserPreferencesForm = ({ userId, onPreferencesUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [skillCategories, setSkillCategories] = useState([]);

  const [preferences, setPreferences] = useState({
    learning_style: '',
    preferred_session_duration: '1hour',
    preferred_session_frequency: 'once',
    skill_goals: '',
    experience_level: 'beginner',
    availability_preferences: {
      weekdays: true,
      weekends: false,
      mornings: true,
      afternoons: true,
      evenings: false
    },
    budget_range_min: 0,
    budget_range_max: 50,
    skill_interests: []
  });

  useEffect(() => {
    fetchSkillCategories();
    fetchCurrentPreferences();
  }, [userId]);

  const fetchSkillCategories = async () => {
    try {
      // This would typically come from an API endpoint
      // For now, using mock data
      setSkillCategories([
        { id: 1, name: 'Programming' },
        { id: 2, name: 'Design' },
        { id: 3, name: 'Languages' },
        { id: 4, name: 'Music' },
        { id: 5, name: 'Cooking' },
        { id: 6, name: 'Photography' },
        { id: 7, name: 'Writing' },
        { id: 8, name: 'Business' },
        { id: 9, name: 'Fitness' },
        { id: 10, name: 'Arts & Crafts' }
      ]);
    } catch (err) {
      console.error('Error fetching skill categories:', err);
    }
  };

  const fetchCurrentPreferences = async () => {
    try {
      setLoading(true);
      // This would fetch current user preferences
      // For now, we'll start with empty preferences
    } catch (err) {
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvailabilityChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      availability_preferences: {
        ...prev.availability_preferences,
        [field]: value
      }
    }));
  };

  const handleSkillInterestAdd = (skillCategory) => {
    if (!preferences.skill_interests.find(si => si.skill_category_id === skillCategory.id)) {
      setPreferences(prev => ({
        ...prev,
        skill_interests: [
          ...prev.skill_interests,
          {
            skill_category_id: skillCategory.id,
            interest_level: 'medium',
            current_proficiency: 'none',
            target_proficiency: 'intermediate'
          }
        ]
      }));
    }
  };

  const handleSkillInterestUpdate = (skillCategoryId, field, value) => {
    setPreferences(prev => ({
      ...prev,
      skill_interests: prev.skill_interests.map(si =>
        si.skill_category_id === skillCategoryId
          ? { ...si, [field]: value }
          : si
      )
    }));
  };

  const handleSkillInterestRemove = (skillCategoryId) => {
    setPreferences(prev => ({
      ...prev,
      skill_interests: prev.skill_interests.filter(si => si.skill_category_id !== skillCategoryId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await recommendationsAPI.updateUserPreferences(userId, preferences);

      setSuccess(true);
      if (onPreferencesUpdated) {
        onPreferencesUpdated(preferences);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StyledCard>
      <CardContent sx={{ backgroundColor: '#0F172A', color: '#E2E8F0' }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#14B8A6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚙️ Update Your Learning Preferences
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.6 }}>
          Help us personalize your skill recommendations by sharing your learning preferences
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: '#dc2626', color: '#E2E8F0', '& .MuiAlert-icon': { color: '#E2E8F0' } }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2, bgcolor: '#10B981', color: '#E2E8F0', '& .MuiAlert-icon': { color: '#E2E8F0' } }}>
            Preferences saved successfully! Your recommendations will be updated.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Learning Style */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Learning Style</InputLabel>
                <Select
                  value={preferences.learning_style}
                  label="Learning Style"
                  onChange={(e) => handleInputChange('learning_style', e.target.value)}
                  sx={{
                    color: '#E2E8F0',
                    backgroundColor: '#1A2332',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '& .MuiSvgIcon-root': { color: '#14B8A6' }
                  }}
                >
                  <MenuItem value="visual" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Visual (diagrams, videos)</MenuItem>
                  <MenuItem value="auditory" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Auditory (listening, discussion)</MenuItem>
                  <MenuItem value="kinesthetic" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Kinesthetic (hands-on, practice)</MenuItem>
                  <MenuItem value="reading_writing" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Reading/Writing (books, notes)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Experience Level */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Experience Level</InputLabel>
                <Select
                  value={preferences.experience_level}
                  label="Experience Level"
                  onChange={(e) => handleInputChange('experience_level', e.target.value)}
                  sx={{
                    color: '#E2E8F0',
                    backgroundColor: '#1A2332',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '& .MuiSvgIcon-root': { color: '#14B8A6' }
                  }}
                >
                  <MenuItem value="beginner" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Beginner</MenuItem>
                  <MenuItem value="intermediate" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Intermediate</MenuItem>
                  <MenuItem value="advanced" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Session Preferences */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Preferred Session Duration</InputLabel>
                <Select
                  value={preferences.preferred_session_duration}
                  label="Preferred Session Duration"
                  onChange={(e) => handleInputChange('preferred_session_duration', e.target.value)}
                  sx={{
                    color: '#E2E8F0',
                    backgroundColor: '#1A2332',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '& .MuiSvgIcon-root': { color: '#14B8A6' }
                  }}
                >
                  <MenuItem value="30min" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>30 minutes</MenuItem>
                  <MenuItem value="1hour" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>1 hour</MenuItem>
                  <MenuItem value="2hours" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>2 hours</MenuItem>
                  <MenuItem value="flexible" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Flexible</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Preferred Session Frequency</InputLabel>
                <Select
                  value={preferences.preferred_session_frequency}
                  label="Preferred Session Frequency"
                  onChange={(e) => handleInputChange('preferred_session_frequency', e.target.value)}
                  sx={{
                    color: '#E2E8F0',
                    backgroundColor: '#1A2332',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '& .MuiSvgIcon-root': { color: '#14B8A6' }
                  }}
                >
                  <MenuItem value="once" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>One-time sessions</MenuItem>
                  <MenuItem value="weekly" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Weekly</MenuItem>
                  <MenuItem value="biweekly" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Bi-weekly</MenuItem>
                  <MenuItem value="monthly" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Budget Range */}
            <Grid size={{ xs: 12 }}>
              <Typography gutterBottom sx={{ color: '#E2E8F0', fontWeight: 600 }}>Budget Range (per hour)</Typography>
              <Box px={2} sx={{ backgroundColor: '#1A2332', borderRadius: 2, p: 2, border: '1px solid #1E293B' }}>
                <Slider
                  value={[preferences.budget_range_min, preferences.budget_range_max]}
                  onChange={(e, newValue) => {
                    handleInputChange('budget_range_min', newValue[0]);
                    handleInputChange('budget_range_max', newValue[1]);
                  }}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  step={5}
                  marks={[
                    { value: 0, label: '₹0' },
                    { value: 50, label: '₹50' },
                    { value: 100, label: '₹100+' }
                  ]}
                  sx={{
                    color: '#14B8A6',
                    '& .MuiSlider-mark': { backgroundColor: '#1E293B' },
                    '& .MuiSlider-markLabel': { color: '#94A3B8' },
                    '& .MuiSlider-valueLabel': { backgroundColor: '#0F766E', color: '#E2E8F0' }
                  }}
                />
              </Box>
            </Grid>

            {/* Skill Goals */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Skill Goals"
                placeholder="What do you want to learn? Any specific goals or projects?"
                value={preferences.skill_goals}
                onChange={(e) => handleInputChange('skill_goals', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    backgroundColor: '#1A2332',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#14B8A6' },
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                  },
                  '& .MuiOutlinedInput-input::placeholder': { color: '#64748B', opacity: 1 },
                  '& .MuiInputLabel-root': { color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }
                }}
              />
            </Grid>

            {/* Availability Preferences */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#14B8A6', fontWeight: 600 }}>
                Availability Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.availability_preferences.weekdays}
                        onChange={(e) => handleAvailabilityChange('weekdays', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#14B8A6' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#14B8A6' }
                        }}
                      />
                    }
                    label={<Typography sx={{ color: '#E2E8F0' }}>Weekdays</Typography>}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.availability_preferences.weekends}
                        onChange={(e) => handleAvailabilityChange('weekends', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#14B8A6' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#14B8A6' }
                        }}
                      />
                    }
                    label={<Typography sx={{ color: '#E2E8F0' }}>Weekends</Typography>}
                  />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.availability_preferences.mornings}
                        onChange={(e) => handleAvailabilityChange('mornings', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#14B8A6' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#14B8A6' }
                        }}
                      />
                    }
                    label={<Typography sx={{ color: '#E2E8F0' }}>Mornings</Typography>}
                  />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.availability_preferences.afternoons}
                        onChange={(e) => handleAvailabilityChange('afternoons', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#14B8A6' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#14B8A6' }
                        }}
                      />
                    }
                    label={<Typography sx={{ color: '#E2E8F0' }}>Afternoons</Typography>}
                  />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.availability_preferences.evenings}
                        onChange={(e) => handleAvailabilityChange('evenings', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#14B8A6' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#14B8A6' }
                        }}
                      />
                    }
                    label={<Typography sx={{ color: '#E2E8F0' }}>Evenings</Typography>}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Skill Interests */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#14B8A6', fontWeight: 600 }}>
                Skill Interests
              </Typography>
              <Autocomplete
                multiple
                options={skillCategories}
                getOptionLabel={(option) => option.name}
                value={skillCategories.filter(cat =>
                  preferences.skill_interests.some(si => si.skill_category_id === cat.id)
                )}
                onChange={(e, newValue) => {
                  // Remove interests not in newValue
                  preferences.skill_interests.forEach(si => {
                    if (!newValue.find(cat => cat.id === si.skill_category_id)) {
                      handleSkillInterestRemove(si.skill_category_id);
                    }
                  });
                  // Add new interests
                  newValue.forEach(cat => {
                    handleSkillInterestAdd(cat);
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select skills you're interested in"
                    placeholder="Add skills..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#E2E8F0',
                        backgroundColor: '#1A2332',
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#1E293B' },
                        '&:hover fieldset': { borderColor: '#14B8A6' },
                        '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                      },
                      '& .MuiInputLabel-root': { color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      onDelete={() => handleSkillInterestRemove(option.id)}
                      sx={{
                        backgroundColor: '#0F766E',
                        color: '#E2E8F0',
                        '& .MuiChip-deleteIcon': { color: '#14B8A6', '&:hover': { color: '#E2E8F0' } }
                      }}
                    />
                  ))
                }
              />

              {/* Skill Interest Details */}
              {preferences.skill_interests.map((interest) => {
                const category = skillCategories.find(cat => cat.id === interest.skill_category_id);
                return (
                  <Box key={interest.skill_category_id} mt={2} p={2} borderRadius={2} sx={{ border: '1px solid #1E293B', backgroundColor: '#1A2332' }}>
                    <Typography variant="subtitle1" mb={2} sx={{ color: '#14B8A6', fontWeight: 600 }}>
                      {category?.name}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Interest Level</InputLabel>
                          <Select
                            value={interest.interest_level}
                            label="Interest Level"
                            onChange={(e) => handleSkillInterestUpdate(interest.skill_category_id, 'interest_level', e.target.value)}
                            sx={{
                              color: '#E2E8F0',
                              backgroundColor: '#0F172A',
                              borderRadius: 1,
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                              '& .MuiSvgIcon-root': { color: '#14B8A6' }
                            }}
                          >
                            <MenuItem value="low" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Low</MenuItem>
                            <MenuItem value="medium" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Medium</MenuItem>
                            <MenuItem value="high" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>High</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Current Proficiency</InputLabel>
                          <Select
                            value={interest.current_proficiency}
                            label="Current Proficiency"
                            onChange={(e) => handleSkillInterestUpdate(interest.skill_category_id, 'current_proficiency', e.target.value)}
                            sx={{
                              color: '#E2E8F0',
                              backgroundColor: '#0F172A',
                              borderRadius: 1,
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                              '& .MuiSvgIcon-root': { color: '#14B8A6' }
                            }}
                          >
                            <MenuItem value="none" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>None</MenuItem>
                            <MenuItem value="beginner" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Beginner</MenuItem>
                            <MenuItem value="intermediate" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Intermediate</MenuItem>
                            <MenuItem value="advanced" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Advanced</MenuItem>
                            <MenuItem value="expert" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Expert</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Target Proficiency</InputLabel>
                          <Select
                            value={interest.target_proficiency}
                            label="Target Proficiency"
                            onChange={(e) => handleSkillInterestUpdate(interest.skill_category_id, 'target_proficiency', e.target.value)}
                            sx={{
                              color: '#E2E8F0',
                              backgroundColor: '#0F172A',
                              borderRadius: 1,
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                              '& .MuiSvgIcon-root': { color: '#14B8A6' }
                            }}
                          >
                            <MenuItem value="beginner" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Beginner</MenuItem>
                            <MenuItem value="intermediate" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Intermediate</MenuItem>
                            <MenuItem value="advanced" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Advanced</MenuItem>
                            <MenuItem value="expert" sx={{ color: '#E2E8F0', backgroundColor: '#1A2332', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' } }}>Expert</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Grid>

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="center" mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={saving}
                  sx={{
                    minWidth: 200,
                    bgcolor: '#14B8A6',
                    color: '#0F172A',
                    fontWeight: 600,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
                    '&:hover': {
                      bgcolor: '#0F766E',
                      color: '#E2E8F0',
                      boxShadow: '0 6px 16px rgba(20, 184, 166, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#475569',
                      color: '#94A3B8'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {saving ? <CircularProgress size={24} sx={{ color: '#14B8A6' }} /> : 'Save Preferences'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </StyledCard>
  );
};

export default UserPreferencesForm;