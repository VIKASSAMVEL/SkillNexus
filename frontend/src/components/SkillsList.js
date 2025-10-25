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
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Search, FilterList, Map as MapIcon, List as ListIcon, ExpandMore } from '@mui/icons-material';
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* View Mode Tabs */}
      <Box display="flex" justifyContent="center" mb={3}>
        <Tabs value={viewMode} onChange={handleViewModeChange} centered>
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
      </Box>

      {/* Location Search */}
      <LocationSearch onLocationSearch={handleLocationSearch} />

      {/* Filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Available Skills ({skills.length})
          {filters.latitude && (
            <Typography variant="caption" display="block" color="text.secondary">
              Within {filters.radius} miles of your location
            </Typography>
          )}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>

      {/* Advanced Filters */}
      <Accordion expanded={showFilters} onChange={() => setShowFilters(!showFilters)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Advanced Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Search skills"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
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
                <InputLabel>Proficiency Level</InputLabel>
                <Select
                  value={filters.proficiency_level}
                  label="Proficiency Level"
                  onChange={(e) => handleFilterChange('proficiency_level', e.target.value)}
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
              <Button variant="outlined" onClick={clearFilters} fullWidth>
                Clear All Filters
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        <>
          {skills.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No skills found matching your criteria.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or expanding your search radius.
              </Typography>
            </Box>
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
    </Box>
  );
};

export default SkillsList;