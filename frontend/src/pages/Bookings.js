import React from 'react';
import { Typography, Container } from '@mui/material';

const Bookings = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookings
      </Typography>
      <Typography variant="body1">
        Manage your skill exchange bookings - Coming soon!
      </Typography>
    </Container>
  );
};

export default Bookings;