import React, { useState } from 'react';
import {
  Typography,
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
import Footer from '../components/Footer';

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
      <Box sx={{ flex: 1, py: 4, px: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ color: '#14B8A6', fontWeight: 600 }}
              >
                Skills Exchange
              </Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8' }}>
                Discover new skills, share your expertise, and connect with local talent
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSkill}
              size="large"
              sx={{ 
                bgcolor: '#0F766E',
                '&:hover': { 
                  bgcolor: '#14B8A6'
                },
                whiteSpace: 'nowrap'
              }}
            >
              Add Your Skill
            </Button>
          </Box>

          <SkillsList
            onBookSkill={handleBookSkill}
            onViewSkillDetails={handleViewSkillDetails}
          />
        </Box>
      </Box>

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
      
      <Footer />
    </Box>
  );
};

export default Skills;