import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { MyLocation, Search } from '@mui/icons-material';

const LocationSearch = ({ onLocationSearch, onLocationChange }) => {
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const handleGetCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });

        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.results && data.results[0]) {
            const address = data.results[0].formatted_address;
            setLocation(address);

            if (onLocationChange) {
              onLocationChange({
                latitude,
                longitude,
                address,
                radius
              });
            }
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }

        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please check your browser permissions.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleLocationSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location or use current location.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Geocode the entered location
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        const address = data.results[0].formatted_address;

        if (onLocationSearch) {
          onLocationSearch({
            latitude: lat,
            longitude: lng,
            address,
            radius
          });
        }
      } else {
        setError('Location not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      setError('Error searching for location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setError(null);
  };

  const handleRadiusChange = (e) => {
    setRadius(e.target.value);
  };

  return (
    <Box sx={{ 
      mb: 4,
      p: 3,
      bgcolor: '#1A2332',
      border: '1px solid #1E293B',
      borderRadius: 2
    }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#14B8A6', fontWeight: 600, mb: 2.5 }}>
        📍 Location Search
      </Typography>

      {error && (
        <Alert severity="error" sx={{ 
          mb: 2.5, 
          bgcolor: '#7F1D1D', 
          color: '#FCA5A5',
          border: '1px solid #DC2626',
          '& .MuiAlert-icon': { color: '#FCA5A5' }
        }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} alignItems="center">
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Enter location"
            value={location}
            onChange={handleLocationChange}
            placeholder="City, address, or zip code"
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#E2E8F0',
                '& fieldset': { borderColor: '#1E293B' },
                '&:hover fieldset': { borderColor: '#14B8A6' },
                '&.Mui-focused fieldset': { borderColor: '#14B8A6' },
                '&.Mui-disabled': { color: '#94A3B8' }
              },
              '& .MuiInputBase-input::placeholder': { color: '#64748B', opacity: 0.7 },
              '& .MuiInputLabel-root': {
                color: '#94A3B8',
                '&.Mui-focused': { color: '#14B8A6' }
              }
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Radius</InputLabel>
            <Select
              value={radius}
              label="Radius"
              onChange={handleRadiusChange}
              sx={{
                color: '#E2E8F0',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E293B' },
                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6' },
                '& .MuiSvgIcon-root': { color: '#14B8A6' }
              }}
            >
              <MenuItem value={1}>1 mile</MenuItem>
              <MenuItem value={5}>5 miles</MenuItem>
              <MenuItem value={10}>10 miles</MenuItem>
              <MenuItem value={25}>25 miles</MenuItem>
              <MenuItem value={50}>50 miles</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} sx={{ color: '#14B8A6' }} /> : <MyLocation />}
              onClick={handleGetCurrentLocation}
              disabled={loading}
              fullWidth
              sx={{
                borderColor: '#1E293B',
                color: '#14B8A6',
                fontWeight: 600,
                bgcolor: '#0F172A',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#14B8A6',
                  bgcolor: 'rgba(20, 184, 166, 0.1)',
                  boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                },
                '&.Mui-disabled': {
                  color: '#64748B',
                  borderColor: '#0F766E'
                }
              }}
            >
              Current
            </Button>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleLocationSearch}
              disabled={loading || !location.trim()}
              fullWidth
              sx={{
                bgcolor: '#0F766E',
                color: '#E2E8F0',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#14B8A6',
                  color: '#0F172A',
                  boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                },
                '&.Mui-disabled': {
                  bgcolor: '#0F766E',
                  color: '#64748B'
                }
              }}
            >
              Search
            </Button>
          </Box>
        </Grid>
      </Grid>

      {currentLocation && (
        <Typography variant="caption" sx={{ 
          mt: 2.5, 
          display: 'block',
          color: '#94A3B8',
          fontWeight: 500,
          p: 1.5,
          bgcolor: 'rgba(20, 184, 166, 0.05)',
          borderLeft: '3px solid #14B8A6',
          borderRadius: '0 2px 2px 0',
          pl: 2
        }}>
          ✓ Current location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
        </Typography>
      )}
    </Box>
  );
};

export default LocationSearch;