import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import BookingsList from '../components/BookingsList';
import AvailabilityManager from '../components/AvailabilityManager';
import Footer from '../components/Footer';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ 
      bgcolor: '#0F172A', 
      color: '#E2E8F0', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      m: 0,
      p: 0
    }}>
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, color: '#14B8A6', fontWeight: 600 }}>
          Bookings & Availability
        </Typography>

        <Paper
          elevation={0}
          sx={{
            bgcolor: '#1A2332',
            border: '1px solid #1E293B',
            borderRadius: 2,
            mb: 3
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ 
              borderBottom: 1, 
              borderColor: '#1E293B',
              '& .MuiTab-root': {
                color: '#94A3B8',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#14B8A6'
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
            <Tab label="My Bookings" />
            <Tab label="Manage Availability" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && <BookingsList />}
          {activeTab === 1 && <AvailabilityManager />}
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Bookings;