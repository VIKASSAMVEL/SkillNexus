import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Tabs,
  Tab,
  Paper,
  Collapse
} from '@mui/material';
import { Search, FilterList, Map as MapIcon, List as ListIcon } from '@mui/icons-material';
import SkillCard from './SkillCard';
import SkillsMap from './SkillsMap';
import LocationSearch from './LocationSearch';
import api from '../services/api';

const SkillsList = ({ onBookSkill, onViewSkillDetails }) => {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [filters, setFilters] = useState({
    category: '',
    proficiency_level: '',
    search: '',
    latitude: null,
    longitude: null,
    radius: 10
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.proficiency_level) params.proficiency_level = filters.proficiency_level;
      if (filters.search) params.search = filters.search;
      if (filters.latitude && filters.longitude) {
        params.latitude = filters.latitude;
        params.longitude = filters.longitude;
        params.radius = filters.radius;
      }

      const response = await api.get('/skills', { params });
      setSkills(response.data.skills);
      setError(null);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to load skills. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/skills/meta/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSearch = (locationData) => {
    setFilters(prev => ({
      ...prev,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      radius: locationData.radius
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      proficiency_level: '',
      search: '',
      latitude: null,
      longitude: null,
      radius: 10
    });
  };

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  const handleSkillSelect = (skill) => {
    setViewMode('list'); // Switch to list view when selecting from map
    if (onViewSkillDetails) {
      onViewSkillDetails(skill);
    }
  };

  const handleBookSkill = (skill) => {
    if (onBookSkill) {
      onBookSkill(skill);
    }
  };

  const handleViewDetails = (skill) => {
    if (onViewSkillDetails) {
      onViewSkillDetails(skill);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: '#14B8A6' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2, bgcolor: '#7F1D1D', color: '#FCA5A5', border: '1px solid #DC2626' }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* View Mode Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          bgcolor: '#1A2332',
          border: '1px solid #1E293B',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Tabs 
          value={viewMode} 
          onChange={handleViewModeChange}
          sx={{
            '& .MuiTab-root': {
              color: '#94A3B8',
              fontWeight: 600,
              py: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#14B8A6',
                bgcolor: 'rgba(20, 184, 166, 0.05)'
              },
              '&.Mui-selected': {
                color: '#14B8A6'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#14B8A6'
            }
          }}
        >
          <Tab
            icon={<ListIcon />}
            label="List View"
            value="list"
            iconPosition="start"
          />
          <Tab
            icon={<MapIcon />}
            label="Map View"
            value="map"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Location Search */}
      <Box mb={4}>
        <LocationSearch onLocationSearch={handleLocationSearch} />
      </Box>

      {/* Filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" component="h2" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
            Available Skills ({skills.length})
          </Typography>
          {filters.latitude && (
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
              Within {filters.radius} miles of your location
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            borderColor: '#1E293B',
            color: '#14B8A6',
            fontWeight: 600,
            bgcolor: '#1A2332',
            '&:hover': {
              borderColor: '#14B8A6',
              bgcolor: 'rgba(20, 184, 166, 0.1)'
            }
          }}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>

      {/* Advanced Filters */}
      <Collapse in={showFilters} timeout={300}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ color: '#14B8A6', fontWeight: 600, mb: 2.5 }}>
            Advanced Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Search skills"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#14B8A6' }} />
                }}
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
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  sx={{
                    color: '#E2E8F0',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '& .MuiSvgIcon-root': { color: '#14B8A6' }
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Proficiency Level</InputLabel>
                <Select
                  value={filters.proficiency_level}
                  label="Proficiency Level"
                  onChange={(e) => handleFilterChange('proficiency_level', e.target.value)}
                  sx={{
                    color: '#E2E8F0',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                    '& .MuiSvgIcon-root': { color: '#14B8A6' }
                  }}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button 
                variant="outlined" 
                onClick={clearFilters} 
                fullWidth
                sx={{
                  borderColor: '#1E293B',
                  color: '#14B8A6',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#14B8A6',
                    bgcolor: 'rgba(20, 184, 166, 0.1)'
                  }
                }}
              >
                Clear All
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        <>
          {skills.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                bgcolor: '#1A2332',
                border: '2px dashed #1E293B',
                borderRadius: 2
              }}
            >
              <Typography variant="h5" sx={{ color: '#E2E8F0', fontWeight: 600, mb: 1 }}>
                No skills found
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4 }}>
                Try adjusting your filters or expanding your search radius.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#0F766E',
                  color: '#E2E8F0',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#14B8A6',
                    color: '#0F172A'
                  }
                }}
                onClick={clearFilters}
              >
                Reset Filters
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {skills.map((skill) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={skill.id}>
                  <SkillCard
                    skill={skill}
                    onBook={handleBookSkill}
                    onViewDetails={handleViewDetails}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <SkillsMap
          skills={skills}
          onSkillSelect={handleSkillSelect}
        />
      )}

      <style jsx global>{`
        .MuiMenuItem-root {
          color: #E2E8F0 !important;
        }
        .MuiPopover-paper,
        .MuiMenu-paper {
          background-color: #1A2332 !important;
          border: 1px solid #1E293B !important;
        }
      `}</style>
    </Box>
  );
};

export default SkillsList;