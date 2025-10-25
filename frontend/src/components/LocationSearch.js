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
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Location Search
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Enter location"
            value={location}
            onChange={handleLocationChange}
            placeholder="City, address, or zip code"
            disabled={loading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Radius</InputLabel>
            <Select
              value={radius}
              label="Radius"
              onChange={handleRadiusChange}
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
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} /> : <MyLocation />}
              onClick={handleGetCurrentLocation}
              disabled={loading}
              fullWidth
            >
              Current
            </Button>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleLocationSearch}
              disabled={loading || !location.trim()}
              fullWidth
            >
              Search
            </Button>
          </Box>
        </Grid>
      </Grid>

      {currentLocation && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Current location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
        </Typography>
      )}
    </Box>
  );
};

export default LocationSearch;