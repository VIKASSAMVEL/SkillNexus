import React from 'react';
import { Typography, Container } from '@mui/material';

const Profile = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      <Typography variant="body1">
        Profile management page - Coming soon!
      </Typography>
    </Container>
  );
};

export default Profile;