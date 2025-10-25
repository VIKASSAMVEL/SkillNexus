import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../services/api';

const CreateProjectDialog = ({ open, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    project_type: 'skill_sharing',
    location: '',
    max_participants: '',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Technology',
    'Community Service',
    'Education',
    'Arts & Crafts',
    'Sports & Fitness',
    'Music',
    'Cooking',
    'Business',
    'Health & Wellness',
    'Home & Garden',
    'Environmental',
    'Other'
  ];

  const projectTypes = [
    { value: 'skill_sharing', label: 'Skill Sharing' },
    { value: 'community_service', label: 'Community Service' },
    { value: 'educational', label: 'Educational' },
    { value: 'creative', label: 'Creative Project' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const projectData = {
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      await api.post('/projects', projectData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        project_type: 'skill_sharing',
        location: '',
        max_participants: '',
        start_date: '',
        end_date: ''
      });

      onProjectCreated();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: '',
        description: '',
        category: '',
        project_type: 'skill_sharing',
        location: '',
        max_participants: '',
        start_date: '',
        end_date: ''
      });
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Community Project</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" mb={3}>
            Create a collaborative project for your community. Bring people together to share skills,
            work on community initiatives, or pursue creative endeavors.
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Project Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              fullWidth
              placeholder="e.g., Community Garden Planning, Coding Workshop"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your project goals, what participants will do, and what they'll learn..."
            />

            <Box display="flex" gap={2}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={formData.project_type}
                  label="Project Type"
                  onChange={(e) => handleInputChange('project_type', e.target.value)}
                >
                  {projectTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Location (optional)"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              fullWidth
              placeholder="Where will this project take place?"
            />

            <Box display="flex" gap={2}>
              <TextField
                label="Max Participants (optional)"
                type="number"
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', e.target.value)}
                fullWidth
                inputProps={{ min: 1, max: 100 }}
                placeholder="Leave empty for unlimited"
              />

              <TextField
                label="Start Date (optional)"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />

              <TextField
                label="End Date (optional)"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: formData.start_date || new Date().toISOString().split('T')[0]
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.category}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateProjectDialog;