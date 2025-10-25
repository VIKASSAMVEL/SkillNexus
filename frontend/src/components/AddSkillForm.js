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
  Typography,
  Box
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
      <DialogTitle sx={{ 
        bgcolor: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(15, 118, 110, 0.1) 100%)',
        borderBottom: '2px solid #14B8A6',
        color: '#14B8A6',
        fontWeight: 800,
        fontSize: '1.75rem',
        letterSpacing: '0.5px',
        py: 2.5
      }}>
        ✨ Add New Skill
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ bgcolor: '#0F172A', pt: 4, pb: 4, px: 3 }}>
          {error && (
            <Alert severity="error" sx={{ 
              mb: 3, 
              bgcolor: 'rgba(239, 68, 68, 0.15)', 
              color: '#FCA5A5', 
              border: '1.5px solid #DC2626',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ 
              mb: 3, 
              bgcolor: 'rgba(34, 197, 94, 0.15)', 
              color: '#86EFAC', 
              border: '1.5px solid #16A34A',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>
              ✓ Skill created successfully!
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Skill Name */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                📝 Skill Name
              </Typography>
              <TextField
                fullWidth
                label="Skill Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., Web Development, Graphic Design, etc."
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderRadius: '8px',
                    py: 1.8,
                    px: 2,
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#64748B',
                    opacity: 0.7
                  },
                  '& .MuiOutlinedInput-root': {
                    borderColor: '#1E293B',
                    '&:hover fieldset': {
                      borderColor: '#14B8A6',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#14B8A6',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    '&.Mui-focused': {
                      color: '#14B8A6',
                      fontWeight: 700
                    }
                  }
                }}
              />
            </Grid>

            {/* Category */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                🏷️ Category
              </Typography>
              <FormControl fullWidth required disabled={loading}>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  sx={{
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1E293B'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#14B8A6',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#14B8A6',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#14B8A6',
                      fontSize: '1.3rem'
                    },
                    '& .MuiOutlinedInput-input': {
                      py: 1.8
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
                        fontSize: '1rem',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: 'rgba(20, 184, 166, 0.2)',
                          borderLeft: '3px solid #14B8A6'
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(20, 184, 166, 0.25)',
                          borderLeft: '3px solid #14B8A6',
                          fontWeight: 700,
                          '&:hover': {
                            bgcolor: 'rgba(20, 184, 166, 0.35)'
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

            {/* Proficiency Level */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                🎯 Proficiency Level
              </Typography>
              <FormControl fullWidth disabled={loading}>
                <Select
                  value={formData.proficiency_level}
                  label="Proficiency Level"
                  onChange={(e) => handleInputChange('proficiency_level', e.target.value)}
                  sx={{
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1E293B'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#14B8A6',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#14B8A6',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#14B8A6',
                      fontSize: '1.3rem'
                    },
                    '& .MuiOutlinedInput-input': {
                      py: 1.8
                    }
                  }}
                >
                  <MenuItem value="beginner" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', fontSize: '1rem', fontWeight: 500, '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.2)', borderLeft: '3px solid #14B8A6' }, '&.Mui-selected': { bgcolor: 'rgba(20, 184, 166, 0.25)', borderLeft: '3px solid #14B8A6', fontWeight: 700 } }}>🌱 Beginner</MenuItem>
                  <MenuItem value="intermediate" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', fontSize: '1rem', fontWeight: 500, '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.2)', borderLeft: '3px solid #14B8A6' }, '&.Mui-selected': { bgcolor: 'rgba(20, 184, 166, 0.25)', borderLeft: '3px solid #14B8A6', fontWeight: 700 } }}>📈 Intermediate</MenuItem>
                  <MenuItem value="advanced" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', fontSize: '1rem', fontWeight: 500, '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.2)', borderLeft: '3px solid #14B8A6' }, '&.Mui-selected': { bgcolor: 'rgba(20, 184, 166, 0.25)', borderLeft: '3px solid #14B8A6', fontWeight: 700 } }}>🚀 Advanced</MenuItem>
                  <MenuItem value="expert" sx={{ bgcolor: '#1A2332', color: '#E2E8F0', fontSize: '1rem', fontWeight: 500, '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.2)', borderLeft: '3px solid #14B8A6' }, '&.Mui-selected': { bgcolor: 'rgba(20, 184, 166, 0.25)', borderLeft: '3px solid #14B8A6', fontWeight: 700 } }}>⭐ Expert</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Price per Hour */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                ⏰ Price per Hour
              </Typography>
              <TextField
                fullWidth
                label="Price per Hour ($)"
                type="number"
                value={formData.price_per_hour}
                onChange={(e) => handleInputChange('price_per_hour', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                disabled={loading}
                placeholder="0.00"
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderRadius: '8px',
                    py: 1.8,
                    px: 2,
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderColor: '#1E293B',
                    '&:hover fieldset': {
                      borderColor: '#14B8A6',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#14B8A6',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    '&.Mui-focused': {
                      color: '#14B8A6',
                      fontWeight: 700
                    }
                  }
                }}
              />
            </Grid>

            {/* Price per Session */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                💰 Price per Session
              </Typography>
              <TextField
                fullWidth
                label="Price per Session ($)"
                type="number"
                value={formData.price_per_session}
                onChange={(e) => handleInputChange('price_per_session', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                disabled={loading}
                placeholder="0.00"
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderRadius: '8px',
                    py: 1.8,
                    px: 2,
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderColor: '#1E293B',
                    '&:hover fieldset': {
                      borderColor: '#14B8A6',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#14B8A6',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    '&.Mui-focused': {
                      color: '#14B8A6',
                      fontWeight: 700
                    }
                  }
                }}
              />
            </Grid>

            {/* Availability */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                📅 Availability
              </Typography>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                bgcolor: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(15, 118, 110, 0.05) 100%)',
                borderRadius: '8px',
                border: '1.5px solid rgba(20, 184, 166, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1.5px solid #14B8A6',
                  bgcolor: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12) 0%, rgba(15, 118, 110, 0.08) 100%)'
                }
              }}>
                <Typography sx={{ 
                  color: '#E2E8F0', 
                  fontWeight: 700, 
                  fontSize: '1rem'
                }}>
                  {formData.is_available ? '✓ Available for booking' : '○ Not available'}
                </Typography>
                <Switch
                  checked={formData.is_available}
                  onChange={(e) => handleInputChange('is_available', e.target.checked)}
                  disabled={loading}
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      color: '#64748B'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#14B8A6'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#14B8A6'
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: '#1E293B'
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                📖 Description
              </Typography>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={5}
                placeholder="Describe your skill, expertise, and what you can offer..."
                disabled={loading}
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#E2E8F0',
                    bgcolor: '#1A2332',
                    borderRadius: '8px',
                    py: 1.8,
                    px: 2,
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    lineHeight: '1.6',
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#64748B',
                    opacity: 0.7
                  },
                  '& .MuiOutlinedInput-root': {
                    borderColor: '#1E293B',
                    '&:hover fieldset': {
                      borderColor: '#14B8A6',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#14B8A6',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    '&.Mui-focused': {
                      color: '#14B8A6',
                      fontWeight: 700
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          bgcolor: '#0F172A', 
          borderTop: '2px solid rgba(20, 184, 166, 0.2)', 
          p: 3, 
          gap: 2,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{
              color: '#14B8A6',
              borderColor: '#14B8A6',
              border: '1.5px solid #14B8A6',
              fontWeight: 700,
              fontSize: '0.95rem',
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(20, 184, 166, 0.15)',
                borderColor: '#14B8A6',
                boxShadow: '0 0 15px rgba(20, 184, 166, 0.3)'
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
              background: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)',
              color: '#0F172A',
              fontWeight: 800,
              fontSize: '0.95rem',
              px: 4,
              py: 1,
              borderRadius: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(20, 184, 166, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(20, 184, 166, 0.5)'
              },
              '&:disabled': {
                background: '#1E293B',
                color: '#64748B',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#14B8A6' }} /> : '✓ Add Skill'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddSkillForm;