import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Schedule,
  CalendarToday,
  Settings
} from '@mui/icons-material';
import BookingsList from '../components/BookingsList';
import AvailabilityManager from '../components/AvailabilityManager';
import CalendarScheduler from '../components/CalendarScheduler';
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
      <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, color: '#14B8A6', fontWeight: 600 }}>
          Bookings & Scheduling
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
                minHeight: 64,
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
            <Tab
              label="My Bookings"
              icon={<Schedule />}
              iconPosition="start"
            />
            <Tab
              label="Schedule Session"
              icon={<CalendarToday />}
              iconPosition="start"
            />
            <Tab
              label="Manage Availability"
              icon={<Settings />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && <BookingsList />}
          {activeTab === 1 && <CalendarScheduler />}
          {activeTab === 2 && <AvailabilityManager />}
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Bookings;