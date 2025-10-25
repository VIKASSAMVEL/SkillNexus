import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Paper,
  Typography
} from '@mui/material';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const SkillsMap = ({ skills, onSkillSelect }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);

  // Google Maps API Key - should be in environment variables
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  const updateMarkers = useCallback(() => {
    // Clear existing markers
    markers.forEach(marker => marker.map = null);

    const newMarkers = skills
      .filter(skill => skill.latitude && skill.longitude)
      .map(skill => {
        // Convert latitude and longitude to numbers
        const lat = parseFloat(skill.latitude);
        const lng = parseFloat(skill.longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.warn(`Invalid coordinates for skill ${skill.name}: lat=${skill.latitude}, lng=${skill.longitude}`);
          return null;
        }

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: lat, lng: lng },
          map: map,
          title: `${skill.name} - ${skill.user_name}`,
          content: new window.google.maps.marker.PinElement({
            background: '#dc004e',
            borderColor: 'white',
            glyphColor: 'white',
          }).element
        });

        // Add click listener
        marker.addListener('gmp-click', () => {
          if (onSkillSelect) {
            onSkillSelect(skill);
          }
        });

        return marker;
      })
      .filter(marker => marker !== null); // Remove null markers

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.position);
      });
      map.fitBounds(bounds);

      // Don't zoom in too much for single markers
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, skills, onSkillSelect, markers]);

  useEffect(() => {
    if (map && skills.length > 0) {
      updateMarkers();
    }
  }, [map, skills, updateMarkers]);

  const renderMap = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        );
      case Status.FAILURE:
        return (
          <Alert severity="error" sx={{ m: 2 }}>
            <Typography variant="h6" gutterBottom>
              Google Maps Failed to Load
            </Typography>
            <Typography variant="body2" paragraph>
              This is usually caused by one of these issues:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <li><strong>Maps JavaScript API not enabled</strong> - Enable it in Google Cloud Console</li>
              <li><strong>API key restrictions</strong> - Allow localhost:3000 in HTTP referrers</li>
              <li><strong>Billing not enabled</strong> - Required even for free tier</li>
              <li><strong>Invalid API key</strong> - Check your Google Cloud Console</li>
            </Box>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
              API Key: {apiKey ? `${apiKey.substring(0, 20)}...` : 'Not configured'}
            </Typography>
          </Alert>
        );
      case Status.SUCCESS:
        return (
          <Box
            ref={mapRef}
            sx={{
              height: '400px',
              width: '100%',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          />
        );
      default:
        return null;
    }
  };

  const MapComponent = () => {
    useEffect(() => {
      if (mapRef.current && !map) {
        try {
          const newMap = new window.google.maps.Map(mapRef.current, {
            center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
            zoom: 10,
            styles: [
              {
                featureType: 'poi',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          setMap(newMap);
        } catch (error) {
          console.error('Error initializing Google Maps:', error);
          // The Wrapper component will handle the failure status
        }
      }
    }, []);

    return renderMap(Status.SUCCESS);
  };

  if (apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Map Unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Google Maps API key not configured. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your environment variables.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Wrapper apiKey={apiKey} libraries={['marker']} render={renderMap}>
        <MapComponent />
      </Wrapper>
    </Box>
  );
};

export default SkillsMap;