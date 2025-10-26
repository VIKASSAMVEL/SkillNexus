import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button
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
    cssLink.onload = () => {};
    cssLink.onerror = () => {};
    document.head.appendChild(cssLink);

    // Add minimal custom CSS for React integration
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-container {
        height: 100% !important;
        width: 100% !important;
      }
      .skills-map-container {
        height: 500px !important;
        width: 100% !important;
        position: relative !important;
        display: block !important;
        min-height: 500px !important;
      }
      .skills-map-container .leaflet-container {
        height: 100% !important;
        width: 100% !important;
        background: #ffffff !important; /* Temporary white background */
      }
      .user-location-marker {
        background: transparent !important;
        border: none !important;
      }
      .user-location-marker div {
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.8;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      /* Dark mode styling for Leaflet - temporarily disabled
      .leaflet-tile {
        filter: invert(1) hue-rotate(180deg) brightness(0.95) !important;
      }
      .leaflet-popup-content-wrapper {
        background-color: #1A2332 !important;
        border: 2px solid #14B8A6 !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3) !important;
      }
      .leaflet-popup-content {
        color: #E2E8F0 !important;
        font-family: inherit !important;
      }
      .leaflet-popup-tip {
        background-color: #1A2332 !important;
        border-left: 8px solid transparent !important;
        border-right: 8px solid transparent !important;
        border-top: 8px solid #14B8A6 !important;
      }
      .leaflet-control {
        background-color: #1A2332 !important;
        border: 1px solid #1E293B !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
      }
      .leaflet-control-zoom-in,
      .leaflet-control-zoom-out,
      .leaflet-control button {
        background-color: #1A2332 !important;
        color: #E2E8F0 !important;
        border-bottom: 1px solid #1E293B !important;
      }
      .leaflet-control-zoom-in:hover,
      .leaflet-control-zoom-out:hover,
      .leaflet-control button:hover {
        background-color: #14B8A6 !important;
        color: #0F172A !important;
      }
      .leaflet-control-attribution {
        background-color: rgba(26, 35, 50, 0.9) !important;
        color: #94A3B8 !important;
      }
      .leaflet-control-attribution a {
        color: #14B8A6 !important;
      }
      .leaflet-container a {
        color: #14B8A6 !important;
      }
    `;
    document.head.appendChild(style);

    // Load JS with error handling
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      resolve(window.L);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Leaflet library'));
    };
    document.head.appendChild(script);
  });
};

const SkillsMap = ({ skills, onSkillSelect }) => {
  
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationMarker, setUserLocationMarker] = useState(null);
  const mapRef = useRef(null);
  const mapInitialized = useRef(false);
  const isUnmounted = useRef(false);
  const leafletLoaded = useRef(false);

  // Load Leaflet library only once
  useEffect(() => {
    if (leafletLoaded.current) return;

    loadLeaflet()
      .then(() => {
        leafletLoaded.current = true;
      })
      .catch((error) => {
        if (!isUnmounted.current) {
          setError('Failed to load map library');
        }
      });
  }, []);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Don't set error state for geolocation failure, just log it
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.warn('Geolocation not supported by this browser');
    }
  }, []);

  // Initialize map when Leaflet is loaded and container is ready
  useEffect(() => {
    if (!leafletLoaded.current || !mapRef.current || mapInitialized.current || map || !window.L) {
      return;
    }

    const initializeMap = () => {
      try {
        mapInitialized.current = true;

        // Clear any existing content in the container
        const container = mapRef.current;
        if (!container) {
          console.error('Map container not found!');
          return;
        }

        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          console.error('Container has zero dimensions! Forcing dimensions...');
          container.style.height = '500px';
          container.style.width = '100%';
          container.style.display = 'block';
          container.style.position = 'relative';
          void container.offsetHeight;
        }

        const newMap = window.L.map(container, {
          center: [20.1461, 85.6740], // Default center, will be updated when user location is available
          zoom: 10,
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: true
        });

        // Add OpenStreetMap tiles
        const tileLayer = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 2
        });

        tileLayer.addTo(newMap);

        // Listen for tile load events
        tileLayer.on('load', () => {});
        tileLayer.on('tileload', () => {});
        tileLayer.on('tileerror', (e) => {});

        // Set map as loaded
        setMapLoaded(true);
        setMap(newMap);

        // Force size calculation after a short delay
        setTimeout(() => {
          if (newMap) {
            newMap.invalidateSize();
          }
        }, 100);

      } catch (err) {
        console.error('Map initialization error:', err);
        setError(err.message);
        mapInitialized.current = false;
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeMap, 100);

    return () => clearTimeout(timer);
  }, [leafletLoaded.current]); // Only depend on leafletLoaded, not userLocation

  // Add user location marker when user location is available and map is ready
  useEffect(() => {
    if (map && userLocation && window.L && !userLocationMarker) {
      try {
        const userMarker = window.L.marker([userLocation.lat, userLocation.lng], {
          icon: window.L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background-color: #14B8A6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #0F172A; box-shadow: 0 0 10px rgba(20, 184, 166, 0.8);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        })
          .addTo(map)
          .bindPopup('<b>You are here</b><br/>Your current location');

        setUserLocationMarker(userMarker);

        // Center map on user location
        map.setView([userLocation.lat, userLocation.lng], 13);
      } catch (e) {
        console.warn('Error creating user location marker:', e);
      }
    }
  }, [map, userLocation, userLocationMarker]);

  // Update markers when skills change
  useEffect(() => {
    if (map && skills && skills.length > 0 && window.L) {
      // Clear existing markers
      markers.forEach(marker => {
        try {
          map.removeLayer(marker);
        } catch (e) {
          console.warn('Error removing marker:', e);
        }
      });

      const newMarkers = skills
        .filter(skill => skill.latitude && skill.longitude)
        .map(skill => {
          try {
            const lat = parseFloat(skill.latitude);
            const lng = parseFloat(skill.longitude);

            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
              console.warn(`Invalid coordinates for skill ${skill.name}: lat=${skill.latitude}, lng=${skill.longitude}`);
              return null;
            }

            const marker = window.L.marker([lat, lng])
              .addTo(map)
              .bindPopup(`<b>${skill.name}</b><br/>${skill.user_name || 'Unknown'}`)
              .on('click', () => {
                if (onSkillSelect) {
                  onSkillSelect(skill);
                }
              });

            return marker;
          } catch (e) {
            console.error('Error creating marker for skill:', skill.name, e);
            return null;
          }
        })
        .filter(marker => marker !== null);

      setMarkers(newMarkers);

      // Fit bounds to show all markers
      if (newMarkers.length > 0) {
        try {
          const group = new window.L.featureGroup(newMarkers);
          map.fitBounds(group.getBounds().pad(0.1));

          // Don't zoom in too much for single markers
          if (newMarkers.length === 1 && map.getZoom() > 15) {
            map.setZoom(15);
          }
        } catch (e) {
          console.warn('Error fitting bounds:', e);
        }
      }
    }
  }, [map, skills, onSkillSelect]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      isUnmounted.current = true;
      if (map) {
        try {
          map.remove();
        } catch (e) {
          console.warn('Error during map cleanup:', e);
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!leafletLoaded.current) {
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
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', minHeight: '500px' }}>
      <Box
        ref={mapRef}
        className="skills-map-container"
        sx={{
          height: '500px',
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #1E293B',
          backgroundColor: '#ffffff', // Temporary white background to see if container is visible
          display: 'block'
        }}
        data-testid="map-container"
      >
        {!mapLoaded && !error && (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress sx={{ color: '#14B8A6' }} />
          </Box>
        )}
      </Box>
      {mapLoaded && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(20, 184, 166, 0.9)',
            color: '#0F172A',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.7rem',
            zIndex: 1000,
            pointerEvents: 'none',
            fontWeight: 600
          }}
        >
          Map Loaded ✓ {userLocation ? '📍' : ''}
        </Typography>
      )}
    </Box>
  );
};

export default SkillsMap;