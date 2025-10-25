import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import BookingsList from '../components/BookingsList';
import AvailabilityManager from '../components/AvailabilityManager';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Bookings & Availability
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="My Bookings" />
        <Tab label="Manage Availability" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && <BookingsList />}
        {activeTab === 1 && <AvailabilityManager />}
      </Box>
    </Container>
  );
};

export default Bookings;