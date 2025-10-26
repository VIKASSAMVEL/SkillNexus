import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Notifications,
  Sms,
  Schedule,
  Warning,
  ContactEmergency,
  Edit,
  Delete,
  Add,
  Save,
  Refresh
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Footer from './Footer';
import api from '../services/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: '#1A2332',
  border: '1px solid #1E293B',
  boxShadow: '0 4px 12px rgba(20, 184, 166, 0.15)'
}));

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Emergency contacts state
  const [contacts, setContacts] = useState([]);
  const [contactDialog, setContactDialog] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    relationship: '',
    is_primary: false,
    notification_enabled: true
  });

  useEffect(() => {
    loadPreferences();
    loadEmergencyContacts();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data.preferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const loadEmergencyContacts = async () => {
    try {
      const response = await api.get('/notifications/emergency-contacts');
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setError('');
      await api.put('/notifications/preferences', preferences);
      setSuccess('Notification preferences saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openContactDialog = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        contact_name: contact.contact_name,
        contact_email: contact.contact_email || '',
        contact_phone: contact.contact_phone || '',
        relationship: contact.relationship || '',
        is_primary: contact.is_primary,
        notification_enabled: contact.notification_enabled
      });
    } else {
      setEditingContact(null);
      setContactForm({
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        relationship: '',
        is_primary: false,
        notification_enabled: true
      });
    }
    setContactDialog(true);
  };

  const closeContactDialog = () => {
    setContactDialog(false);
    setEditingContact(null);
    setContactForm({
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      relationship: '',
      is_primary: false,
      notification_enabled: true
    });
  };

  const saveContact = async () => {
    try {
      if (editingContact) {
        await api.put(`/notifications/emergency-contacts/${editingContact.id}`, contactForm);
      } else {
        await api.post('/notifications/emergency-contacts', contactForm);
      }
      closeContactDialog();
      loadEmergencyContacts();
      setSuccess('Emergency contact saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving contact:', error);
      setError('Failed to save emergency contact');
    }
  };

  const deleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this emergency contact?')) {
      return;
    }

    try {
      await api.delete(`/notifications/emergency-contacts/${contactId}`);
      loadEmergencyContacts();
      setSuccess('Emergency contact deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting contact:', error);
      setError('Failed to delete emergency contact');
    }
  };

  const testNotification = async () => {
    try {
      await api.post('/notifications/test', { type: 'email' });
      setSuccess('Test notification sent! Check your email.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError('Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: '#14B8A6' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0F172A' }}>
      <Box sx={{ flex: 1, maxWidth: 800, mx: 'auto', p: 2, width: '100%' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#E2E8F0', mb: 3 }}>
          Notification Preferences
        </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      {/* General Preferences */}
      <StyledPaper>
        <Typography variant="h6" gutterBottom sx={{ color: '#14B8A6', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Notifications />
          General Preferences
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences?.email_reminders || false}
                  onChange={(e) => handlePreferenceChange('email_reminders', e.target.checked)}
                  color="primary"
                />
              }
              label="Email Reminders"
              sx={{ color: '#E2E8F0' }}
            />
            <Typography variant="body2" sx={{ color: '#94A3B8', ml: 4, mt: 0.5 }}>
              Receive session reminders via email
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences?.sms_reminders || false}
                  onChange={(e) => handlePreferenceChange('sms_reminders', e.target.checked)}
                  color="primary"
                />
              }
              label="SMS Reminders"
              sx={{ color: '#E2E8F0' }}
            />
            <Typography variant="body2" sx={{ color: '#94A3B8', ml: 4, mt: 0.5 }}>
              Receive session reminders via SMS
            </Typography>
          </Grid>
        </Grid>
      </StyledPaper>

      {/* Reminder Timing */}
      <StyledPaper>
        <Typography variant="h6" gutterBottom sx={{ color: '#14B8A6', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule />
          Reminder Timing
        </Typography>

        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
          Choose when you want to receive session reminders:
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences?.reminder_24h || false}
                  onChange={(e) => handlePreferenceChange('reminder_24h', e.target.checked)}
                  color="primary"
                />
              }
              label="24 Hours Before"
              sx={{ color: '#E2E8F0' }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences?.reminder_1h || false}
                  onChange={(e) => handlePreferenceChange('reminder_1h', e.target.checked)}
                  color="primary"
                />
              }
              label="1 Hour Before"
              sx={{ color: '#E2E8F0' }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences?.reminder_15m || false}
                  onChange={(e) => handlePreferenceChange('reminder_15m', e.target.checked)}
                  color="primary"
                />
              }
              label="15 Minutes Before"
              sx={{ color: '#E2E8F0' }}
            />
          </Grid>
        </Grid>
      </StyledPaper>

      {/* Advanced Options */}
      <StyledPaper>
        <Typography variant="h6" gutterBottom sx={{ color: '#14B8A6', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning />
          Advanced Options
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences?.conflict_alerts || false}
                  onChange={(e) => handlePreferenceChange('conflict_alerts', e.target.checked)}
                  color="primary"
                />
              }
              label="Conflict Alerts"
              sx={{ color: '#E2E8F0' }}
            />
            <Typography variant="body2" sx={{ color: '#94A3B8', ml: 4, mt: 0.5 }}>
              Get notified about scheduling conflicts
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences?.reschedule_suggestions || false}
                  onChange={(e) => handlePreferenceChange('reschedule_suggestions', e.target.checked)}
                  color="primary"
                />
              }
              label="Reschedule Suggestions"
              sx={{ color: '#E2E8F0' }}
            />
            <Typography variant="body2" sx={{ color: '#94A3B8', ml: 4, mt: 0.5 }}>
              Receive suggestions for better scheduling
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences?.follow_up_emails || false}
                  onChange={(e) => handlePreferenceChange('follow_up_emails', e.target.checked)}
                  color="primary"
                />
              }
              label="Follow-up Emails"
              sx={{ color: '#E2E8F0' }}
            />
            <Typography variant="body2" sx={{ color: '#94A3B8', ml: 4, mt: 0.5 }}>
              Get follow-up emails after sessions
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences?.emergency_contacts || false}
                  onChange={(e) => handlePreferenceChange('emergency_contacts', e.target.checked)}
                  color="primary"
                />
              }
              label="Emergency Notifications"
              sx={{ color: '#E2E8F0' }}
            />
            <Typography variant="body2" sx={{ color: '#94A3B8', ml: 4, mt: 0.5 }}>
              Notify emergency contacts for no-shows
            </Typography>
          </Grid>
        </Grid>
      </StyledPaper>

      {/* Emergency Contacts */}
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#14B8A6', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContactEmergency />
            Emergency Contacts
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => openContactDialog()}
            sx={{
              bgcolor: '#14B8A6',
              '&:hover': { bgcolor: '#0F766E' }
            }}
          >
            Add Contact
          </Button>
        </Box>

        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
          Emergency contacts will be notified if you don't show up for scheduled sessions.
        </Typography>

        <List>
          {contacts.map((contact) => (
            <ListItem key={contact.id} sx={{ bgcolor: '#1A2332', mb: 1, borderRadius: 1 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ color: '#E2E8F0' }}>
                      {contact.contact_name}
                    </Typography>
                    {contact.is_primary && (
                      <Chip label="Primary" size="small" sx={{ bgcolor: '#14B8A6', color: 'white' }} />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    {contact.contact_email && (
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        {contact.contact_email}
                      </Typography>
                    )}
                    {contact.contact_phone && (
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        {contact.contact_phone}
                      </Typography>
                    )}
                    {contact.relationship && (
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        {contact.relationship}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => openContactDialog(contact)}
                  sx={{ color: '#14B8A6' }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => deleteContact(contact.id)}
                  sx={{ color: '#EF4444' }}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {contacts.length === 0 && (
            <Typography sx={{ color: '#94A3B8', textAlign: 'center', py: 3 }}>
              No emergency contacts added yet.
            </Typography>
          )}
        </List>
      </StyledPaper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={savePreferences}
          disabled={saving}
          sx={{
            bgcolor: '#14B8A6',
            '&:hover': { bgcolor: '#0F766E' },
            px: 4
          }}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </Box>

      {/* Emergency Contact Dialog */}
      <Dialog
        open={contactDialog}
        onClose={closeContactDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1A2332',
            color: '#E2E8F0'
          }
        }}
      >
        <DialogTitle sx={{ color: '#14B8A6' }}>
          {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Name"
                value={contactForm.contact_name}
                onChange={(e) => setContactForm(prev => ({ ...prev, contact_name: e.target.value }))}
                required
                sx={{
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#14B8A6' },
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={contactForm.contact_email}
                onChange={(e) => setContactForm(prev => ({ ...prev, contact_email: e.target.value }))}
                sx={{
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#14B8A6' },
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={contactForm.contact_phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                sx={{
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#14B8A6' },
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Relationship"
                value={contactForm.relationship}
                onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                select
                sx={{
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiOutlinedInput-root': {
                    color: '#E2E8F0',
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#14B8A6' },
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
                  }
                }}
              >
                <MenuItem value="family">Family</MenuItem>
                <MenuItem value="friend">Friend</MenuItem>
                <MenuItem value="colleague">Colleague</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={contactForm.is_primary}
                    onChange={(e) => setContactForm(prev => ({ ...prev, is_primary: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Set as Primary Contact"
                sx={{ color: '#E2E8F0' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeContactDialog} sx={{ color: '#94A3B8' }}>
            Cancel
          </Button>
          <Button
            onClick={saveContact}
            variant="contained"
            sx={{
              bgcolor: '#14B8A6',
              '&:hover': { bgcolor: '#0F766E' }
            }}
          >
            {editingContact ? 'Update' : 'Add'} Contact
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
      <Footer />
    </Box>
  );
};

export default NotificationPreferences;