import React, { useState } from 'react';
import {
  Typography,
  Container,
  Button,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import SkillsList from '../components/SkillsList';
import AddSkillForm from '../components/AddSkillForm';
import SkillDetails from '../components/SkillDetails';
import BookingForm from '../components/BookingForm';

const Skills = () => {
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillDetailsOpen, setSkillDetailsOpen] = useState(false);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingSkill, setBookingSkill] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleAddSkill = () => {
    setAddSkillOpen(true);
  };

  const handleSkillAdded = (skillId) => {
    setSnackbar({
      open: true,
      message: 'Skill added successfully!',
      severity: 'success'
    });
    // The SkillsList component will automatically refresh
  };

  const handleViewSkillDetails = (skill) => {
    setSelectedSkill(skill);
    setSkillDetailsOpen(true);
  };

  const handleBookSkill = (skill) => {
    setBookingSkill(skill);
    setBookingFormOpen(true);
  };

  const handleBookingSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Booking created successfully!',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Skills Exchange
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover new skills, share your expertise, and connect with local talent
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddSkill}
          size="large"
        >
          Add Your Skill
        </Button>
      </Box>

      <SkillsList
        onBookSkill={handleBookSkill}
        onViewSkillDetails={handleViewSkillDetails}
      />

      {/* Add Skill Dialog */}
      <AddSkillForm
        open={addSkillOpen}
        onClose={() => setAddSkillOpen(false)}
        onSkillAdded={handleSkillAdded}
      />

      {/* Skill Details Dialog */}
      <SkillDetails
        open={skillDetailsOpen}
        onClose={() => setSkillDetailsOpen(false)}
        skillId={selectedSkill?.id}
        onBookSkill={handleBookSkill}
      />

      {/* Booking Form Dialog */}
      <BookingForm
        open={bookingFormOpen}
        onClose={() => setBookingFormOpen(false)}
        skill={bookingSkill}
        teacher={bookingSkill ? { id: bookingSkill.user_id, name: bookingSkill.user_name } : null}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Skills;