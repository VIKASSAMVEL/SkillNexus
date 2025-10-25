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
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Learning Preferences & Interests
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Help us personalize your skill recommendations by sharing your learning preferences
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Preferences saved successfully! Your recommendations will be updated.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Learning Style */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Learning Style</InputLabel>
                <Select
                  value={preferences.learning_style}
                  label="Learning Style"
                  onChange={(e) => handleInputChange('learning_style', e.target.value)}
                >
                  <MenuItem value="visual">Visual (diagrams, videos)</MenuItem>
                  <MenuItem value="auditory">Auditory (listening, discussion)</MenuItem>
                  <MenuItem value="kinesthetic">Kinesthetic (hands-on, practice)</MenuItem>
                  <MenuItem value="reading_writing">Reading/Writing (books, notes)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Experience Level */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  value={preferences.experience_level}
                  label="Experience Level"
                  onChange={(e) => handleInputChange('experience_level', e.target.value)}
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Session Preferences */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Preferred Session Duration</InputLabel>
                <Select
                  value={preferences.preferred_session_duration}
                  label="Preferred Session Duration"
                  onChange={(e) => handleInputChange('preferred_session_duration', e.target.value)}
                >
                  <MenuItem value="30min">30 minutes</MenuItem>
                  <MenuItem value="1hour">1 hour</MenuItem>
                  <MenuItem value="2hours">2 hours</MenuItem>
                  <MenuItem value="flexible">Flexible</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Preferred Session Frequency</InputLabel>
                <Select
                  value={preferences.preferred_session_frequency}
                  label="Preferred Session Frequency"
                  onChange={(e) => handleInputChange('preferred_session_frequency', e.target.value)}
                >
                  <MenuItem value="once">One-time sessions</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="biweekly">Bi-weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Budget Range */}
            <Grid size={{ xs: 12 }}>
              <Typography gutterBottom>Budget Range (per hour)</Typography>
              <Box px={2}>
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
                    { value: 0, label: '$0' },
                    { value: 50, label: '$50' },
                    { value: 100, label: '$100+' }
                  ]}
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
              />
            </Grid>

            {/* Availability Preferences */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Availability Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.availability_preferences.weekdays}
                        onChange={(e) => handleAvailabilityChange('weekdays', e.target.checked)}
                      />
                    }
                    label="Weekdays"
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.availability_preferences.weekends}
                        onChange={(e) => handleAvailabilityChange('weekends', e.target.checked)}
                      />
                    }
                    label="Weekends"
                  />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.availability_preferences.mornings}
                        onChange={(e) => handleAvailabilityChange('mornings', e.target.checked)}
                      />
                    }
                    label="Mornings"
                  />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.availability_preferences.afternoons}
                        onChange={(e) => handleAvailabilityChange('afternoons', e.target.checked)}
                      />
                    }
                    label="Afternoons"
                  />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.availability_preferences.evenings}
                        onChange={(e) => handleAvailabilityChange('evenings', e.target.checked)}
                      />
                    }
                    label="Evenings"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Skill Interests */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
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
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      onDelete={() => handleSkillInterestRemove(option.id)}
                    />
                  ))
                }
              />

              {/* Skill Interest Details */}
              {preferences.skill_interests.map((interest) => {
                const category = skillCategories.find(cat => cat.id === interest.skill_category_id);
                return (
                  <Box key={interest.skill_category_id} mt={2} p={2} border={1} borderRadius={1} borderColor="grey.300">
                    <Typography variant="subtitle1" mb={2}>
                      {category?.name}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Interest Level</InputLabel>
                          <Select
                            value={interest.interest_level}
                            label="Interest Level"
                            onChange={(e) => handleSkillInterestUpdate(interest.skill_category_id, 'interest_level', e.target.value)}
                          >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Current Proficiency</InputLabel>
                          <Select
                            value={interest.current_proficiency}
                            label="Current Proficiency"
                            onChange={(e) => handleSkillInterestUpdate(interest.skill_category_id, 'current_proficiency', e.target.value)}
                          >
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="beginner">Beginner</MenuItem>
                            <MenuItem value="intermediate">Intermediate</MenuItem>
                            <MenuItem value="advanced">Advanced</MenuItem>
                            <MenuItem value="expert">Expert</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Target Proficiency</InputLabel>
                          <Select
                            value={interest.target_proficiency}
                            label="Target Proficiency"
                            onChange={(e) => handleSkillInterestUpdate(interest.skill_category_id, 'target_proficiency', e.target.value)}
                          >
                            <MenuItem value="beginner">Beginner</MenuItem>
                            <MenuItem value="intermediate">Intermediate</MenuItem>
                            <MenuItem value="advanced">Advanced</MenuItem>
                            <MenuItem value="expert">Expert</MenuItem>
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
                  sx={{ minWidth: 200 }}
                >
                  {saving ? <CircularProgress size={24} /> : 'Save Preferences'}
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