import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Paper,
  Typography
} from '@mui/material';

// Load Leaflet CSS and JS
const loadLeaflet = () => {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }

    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const SkillsMap = ({ skills, onSkillSelect }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef(null);

  // Load Leaflet
  useEffect(() => {
    loadLeaflet()
      .then(() => {
        console.log('Leaflet loaded successfully');
        setLeafletLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load Leaflet:', error);
      });
  }, []);

  useEffect(() => {
    if (map && skills.length > 0) {
      // Clear existing markers
      markers.forEach(marker => map.removeLayer(marker));

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

          const marker = window.L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`<b>${skill.name}</b><br/>${skill.user_name}`)
            .on('click', () => {
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
        const group = new window.L.featureGroup(newMarkers);
        map.fitBounds(group.getBounds().pad(0.1));

        // Don't zoom in too much for single markers
        if (newMarkers.length === 1 && map.getZoom() > 15) {
          map.setZoom(15);
        }
      }
    }
  }, [map, skills, onSkillSelect]); // Removed markers from dependencies to prevent infinite loop

  const MapComponent = () => {
    const [error, setError] = useState(null);

    useEffect(() => {
      if (mapRef.current && !map && leafletLoaded && window.L) {
        try {
          console.log('Initializing map...');
          const newMap = window.L.map(mapRef.current).setView([40.7128, -74.0060], 10); // Default to NYC

          // Add OpenStreetMap tiles
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(newMap);

          console.log('Map initialized successfully');
          setMap(newMap);
        } catch (error) {
          console.error('Map initialization error:', error);
          setError(error.message);
        }
      } else {
        console.log('Map init conditions not met:', {
          hasRef: !!mapRef.current,
          hasMap: !!map,
          leafletLoaded,
          hasWindowL: !!window.L
        });
      }
    }, [leafletLoaded, map]);

    if (!leafletLoaded) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          <Typography variant="h6" gutterBottom>
            OpenStreetMap Failed to Load
          </Typography>
          <Typography variant="body2" paragraph>
            Error: {error}
          </Typography>
          <Typography variant="body2" paragraph>
            This is usually caused by network connectivity issues. Please check your internet connection and try again.
          </Typography>
        </Alert>
      );
    }

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
  };

  return (
    <Box>
      <MapComponent />
    </Box>
  );
};

export default SkillsMap;