import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import api from '../services/api';

const AddSkillForm = ({ open, onClose, onSkillAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    proficiency_level: 'beginner',
    is_available: true,
    price_per_hour: '',
    price_per_session: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
      resetForm();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/skills/meta/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      proficiency_level: 'beginner',
      is_available: true,
      price_per_hour: '',
      price_per_session: ''
    });
    setError(null);
    setSuccess(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert price fields to numbers if provided
      const submitData = {
        ...formData,
        price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : null,
        price_per_session: formData.price_per_session ? parseFloat(formData.price_per_session) : null
      };

      const response = await api.post('/skills', submitData);
      setSuccess(true);

      if (onSkillAdded) {
        onSkillAdded(response.data.skillId);
      }

      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error creating skill:', error);
      setError(error.response?.data?.message || 'Failed to create skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0F172A',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'rgba(20, 184, 166, 0.1)', borderBottom: '1px solid #1E293B', color: '#14B8A6', fontWeight: 700, fontSize: '1.5rem' }}>
        Add New Skill
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ bgcolor: '#0F172A', pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', border: '1px solid #DC2626' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#86EFAC', border: '1px solid #16A34A' }}>
              Skill created successfully!
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Skill Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                disabled={loading}
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderRadius: 1
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#94A3B8',
                    opacity: 0.7
                  },
                  '& .MuiOutlinedInput-root': {
                    borderColor: '#1E293B',
                    '&:hover fieldset': {
                      borderColor: '#475569'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#14B8A6'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CBD5E1',
                    '&.Mui-focused': {
                      color: '#14B8A6'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel sx={{ color: '#CBD5E1', '&.Mui-focused': { color: '#14B8A6' } }}>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  sx={{
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderColor: '#1E293B',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1E293B'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#475569'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#14B8A6'
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#14B8A6'
                    }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem 
                      key={category.id} 
                      value={category.name}
                      sx={{
                        bgcolor: '#1A2332',
                        color: '#E2E8F0',
                        '&:hover': {
                          bgcolor: 'rgba(20, 184, 166, 0.15)'
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(20, 184, 166, 0.2)',
                          '&:hover': {
                            bgcolor: 'rgba(20, 184, 166, 0.3)'
                          }
                        }
                      }}
                    >
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                placeholder="Describe your skill and what you can offer..."
                disabled={loading}
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderRadius: 1
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#94A3B8',
                    opacity: 0.7
                  },
                  '& .MuiOutlinedInput-root': {
                    borderColor: '#1E293B',
                    '&:hover fieldset': {
                      borderColor: '#475569'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#14B8A6'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CBD5E1',
                    '&.Mui-focused': {
                      color: '#14B8A6'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel sx={{ color: '#CBD5E1', '&.Mui-focused': { color: '#14B8A6' } }}>Proficiency Level</InputLabel>
                <Select
                  value={formData.proficiency_level}
                  label="Proficiency Level"
                  onChange={(e) => handleInputChange('proficiency_level', e.target.value)}
                  sx={{
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderColor: '#1E293B',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1E293B'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#475569'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#14B8A6'
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#14B8A6'
                    }
                  }}
                >
                  <MenuItem value="beginner" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.15)' } }}>Beginner</MenuItem>
                  <MenuItem value="intermediate" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.15)' } }}>Intermediate</MenuItem>
                  <MenuItem value="advanced" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.15)' } }}>Advanced</MenuItem>
                  <MenuItem value="expert" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.15)' } }}>Expert</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_available}
                    onChange={(e) => handleInputChange('is_available', e.target.checked)}
                    disabled={loading}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#14B8A6'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#14B8A6'
                      }
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: '#E2E8F0', fontWeight: 500 }}>
                    Available for booking
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Hour ($)"
                type="number"
                value={formData.price_per_hour}
                onChange={(e) => handleInputChange('price_per_hour', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                disabled={loading}
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderRadius: 1
                  },
                  '& .MuiOutlinedInput-root': {
                    borderColor: '#1E293B',
                    '&:hover fieldset': {
                      borderColor: '#475569'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#14B8A6'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CBD5E1',
                    '&.Mui-focused': {
                      color: '#14B8A6'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Session ($)"
                type="number"
                value={formData.price_per_session}
                onChange={(e) => handleInputChange('price_per_session', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                disabled={loading}
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderRadius: 1
                  },
                  '& .MuiOutlinedInput-root': {
                    borderColor: '#1E293B',
                    '&:hover fieldset': {
                      borderColor: '#475569'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#14B8A6'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CBD5E1',
                    '&.Mui-focused': {
                      color: '#14B8A6'
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ bgcolor: '#0F172A', borderTop: '1px solid #1E293B', p: 2, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{
              color: '#14B8A6',
              borderColor: '#14B8A6',
              border: '1px solid #14B8A6',
              '&:hover': {
                bgcolor: 'rgba(20, 184, 166, 0.1)',
                borderColor: '#14B8A6'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name || !formData.category}
            sx={{
              bgcolor: '#0F766E',
              color: '#E2E8F0',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#14B8A6',
                color: '#0F172A'
              },
              '&:disabled': {
                bgcolor: '#1E293B',
                color: '#64748B'
              }
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#14B8A6' }} /> : 'Add Skill'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddSkillForm;