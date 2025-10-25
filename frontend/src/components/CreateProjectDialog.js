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

// Inject dark theme animations
if (typeof document !== 'undefined' && !document.querySelector('style[data-dialog-animations]')) {
  const style = document.createElement('style');
  style.setAttribute('data-dialog-animations', 'true');
  style.innerHTML = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .MuiDialog-paper {
      animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;
  document.head.appendChild(style);
}

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

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      color: '#E2E8F0',
      backgroundColor: '#1A2332',
      borderRadius: 2,
      '& fieldset': { borderColor: '#1E293B' },
      '&:hover fieldset': { borderColor: '#14B8A6' },
      '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
    },
    '& .MuiOutlinedInput-input::placeholder': { color: '#64748B', opacity: 1 },
    '& .MuiInputBase-input': { color: '#E2E8F0' },
    '& .MuiInputLabel-root': {
      color: '#94A3B8',
      '&.Mui-focused': { color: '#14B8A6' }
    }
  };

  const selectSx = {
    borderRadius: 2,
    color: '#E2E8F0',
    backgroundColor: '#1A2332',
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: 2,
      borderColor: '#1E293B'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#14B8A6'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#14B8A6'
    },
    '& .MuiSvgIcon-root': { color: '#14B8A6' }
  };

  const menuItemSx = {
    color: '#E2E8F0',
    backgroundColor: '#1A2332',
    '&:hover': { backgroundColor: '#0F766E' },
    '&.Mui-selected': { backgroundColor: '#0F766E', color: '#14B8A6' }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#1A2332',
          border: '1px solid #1E293B',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#E2E8F0',
          borderBottom: '1px solid #1E293B',
          background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.1) 0%, rgba(20, 184, 166, 0.05) 100%)',
          py: 2.5,
          px: 3
        }}
      >
        Create New Community Project
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ bgcolor: '#0F172A', p: 3 }}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                bgcolor: '#dc2626',
                color: '#E2E8F0',
                '& .MuiAlert-icon': { color: '#E2E8F0' }
              }}
            >
              {error}
            </Alert>
          )}

          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.6 }}>
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
              sx={textFieldSx}
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
              sx={textFieldSx}
            />

            <Box display="flex" gap={2}>
              <FormControl fullWidth required>
                <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>
                  Category
                </InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  sx={selectSx}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category} sx={menuItemSx}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>
                  Project Type
                </InputLabel>
                <Select
                  value={formData.project_type}
                  label="Project Type"
                  onChange={(e) => handleInputChange('project_type', e.target.value)}
                  sx={selectSx}
                >
                  {projectTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value} sx={menuItemSx}>
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
              sx={textFieldSx}
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
                sx={textFieldSx}
              />

              <TextField
                label="Start Date (optional)"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                sx={textFieldSx}
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
                sx={textFieldSx}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            bgcolor: '#0F172A',
            borderTop: '1px solid #1E293B',
            p: 2,
            gap: 2
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: '#94A3B8',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#1A2332',
                color: '#E2E8F0'
              },
              '&.Mui-disabled': {
                color: '#475569'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.category}
            sx={{
              bgcolor: '#14B8A6',
              color: '#0F172A',
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
              '&:hover': {
                bgcolor: '#0F766E',
                color: '#E2E8F0',
                boxShadow: '0 6px 16px rgba(20, 184, 166, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&.Mui-disabled': {
                bgcolor: '#475569',
                color: '#94A3B8'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#14B8A6' }} /> : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateProjectDialog;