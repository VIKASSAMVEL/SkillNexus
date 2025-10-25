const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Get user notification preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId;

    const [preferences] = await pool.execute(
      'SELECT * FROM user_notification_preferences WHERE user_id = ?',
      [userId]
    );

    let prefs = preferences[0];
    if (!prefs) {
      // Create default preferences
      await pool.execute(`
        INSERT INTO user_notification_preferences (user_id) VALUES (?)
      `, [userId]);

      const [newPrefs] = await pool.execute(
        'SELECT * FROM user_notification_preferences WHERE user_id = ?',
        [userId]
      );
      prefs = newPrefs[0];
    }

    res.json({
      success: true,
      preferences: prefs
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences'
    });
  }
});

// Update user notification preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId;
    const {
      email_reminders,
      sms_reminders,
      reminder_24h,
      reminder_1h,
      reminder_15m,
      conflict_alerts,
      reschedule_suggestions,
      follow_up_emails,
      emergency_contacts,
      timezone
    } = req.body;

    // Check if preferences exist
    const [existing] = await pool.execute(
      'SELECT id FROM user_notification_preferences WHERE user_id = ?',
      [userId]
    );

    if (existing.length === 0) {
      // Insert new preferences
      await pool.execute(`
        INSERT INTO user_notification_preferences (
          user_id, email_reminders, sms_reminders, reminder_24h, reminder_1h, reminder_15m,
          conflict_alerts, reschedule_suggestions, follow_up_emails, emergency_contacts, timezone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId, email_reminders ?? true, sms_reminders ?? false, reminder_24h ?? true,
        reminder_1h ?? true, reminder_15m ?? true, conflict_alerts ?? true,
        reschedule_suggestions ?? true, follow_up_emails ?? true, emergency_contacts ?? false,
        timezone ?? 'UTC'
      ]);
    } else {
      // Update existing preferences
      await pool.execute(`
        UPDATE user_notification_preferences SET
          email_reminders = ?, sms_reminders = ?, reminder_24h = ?, reminder_1h = ?, reminder_15m = ?,
          conflict_alerts = ?, reschedule_suggestions = ?, follow_up_emails = ?, emergency_contacts = ?,
          timezone = ?, updated_at = NOW()
        WHERE user_id = ?
      `, [
        email_reminders ?? true, sms_reminders ?? false, reminder_24h ?? true,
        reminder_1h ?? true, reminder_15m ?? true, conflict_alerts ?? true,
        reschedule_suggestions ?? true, follow_up_emails ?? true, emergency_contacts ?? false,
        timezone ?? 'UTC', userId
      ]);
    }

    res.json({
      success: true,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
});

// Get emergency contacts
router.get('/emergency-contacts', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId;

    const [contacts] = await pool.execute(
      'SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY is_primary DESC, created_at ASC',
      [userId]
    );

    res.json({
      success: true,
      contacts: contacts
    });
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency contacts'
    });
  }
});

// Add emergency contact
router.post('/emergency-contacts', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId;
    const { contact_name, contact_email, contact_phone, relationship, is_primary } = req.body;

    // Validate required fields
    if (!contact_name) {
      return res.status(400).json({
        success: false,
        message: 'Contact name is required'
      });
    }

    if (!contact_email && !contact_phone) {
      return res.status(400).json({
        success: false,
        message: 'Either email or phone number is required'
      });
    }

    // If setting as primary, unset other primary contacts
    if (is_primary) {
      await pool.execute(
        'UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = ?',
        [userId]
      );
    }

    // Insert new contact
    const [result] = await pool.execute(`
      INSERT INTO emergency_contacts (
        user_id, contact_name, contact_email, contact_phone, relationship, is_primary
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userId, contact_name, contact_email || null, contact_phone || null,
      relationship || null, is_primary || false
    ]);

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      contactId: result.insertId
    });
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add emergency contact'
    });
  }
});

// Update emergency contact
router.put('/emergency-contacts/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId;
    const contactId = req.params.id;
    const { contact_name, contact_email, contact_phone, relationship, is_primary, notification_enabled } = req.body;

    // Verify contact belongs to user
    const [contacts] = await pool.execute(
      'SELECT * FROM emergency_contacts WHERE id = ? AND user_id = ?',
      [contactId, userId]
    );

    if (contacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    // If setting as primary, unset other primary contacts
    if (is_primary) {
      await pool.execute(
        'UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = ? AND id != ?',
        [userId, contactId]
      );
    }

    // Update contact
    await pool.execute(`
      UPDATE emergency_contacts SET
        contact_name = ?, contact_email = ?, contact_phone = ?, relationship = ?,
        is_primary = ?, notification_enabled = ?
      WHERE id = ? AND user_id = ?
    `, [
      contact_name, contact_email || null, contact_phone || null, relationship || null,
      is_primary || false, notification_enabled ?? true, contactId, userId
    ]);

    res.json({
      success: true,
      message: 'Emergency contact updated successfully'
    });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update emergency contact'
    });
  }
});

// Delete emergency contact
router.delete('/emergency-contacts/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId;
    const contactId = req.params.id;

    // Verify contact belongs to user
    const [contacts] = await pool.execute(
      'SELECT * FROM emergency_contacts WHERE id = ? AND user_id = ?',
      [contactId, userId]
    );

    if (contacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    // Delete contact
    await pool.execute(
      'DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?',
      [contactId, userId]
    );

    res.json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete emergency contact'
    });
  }
});

// Get reminder history
router.get('/reminders', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const [reminders] = await pool.execute(`
      SELECT sr.*, s.skill_name, s.scheduled_at
      FROM scheduled_reminders sr
      JOIN sessions s ON sr.session_id = s.id
      WHERE sr.user_id = ?
      ORDER BY sr.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      reminders: reminders
    });
  } catch (error) {
    console.error('Error fetching reminder history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminder history'
    });
  }
});

// Get conflict alerts
router.get('/conflicts', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId;
    const { resolved = false } = req.query;

    const [conflicts] = await pool.execute(`
      SELECT ca.*, s.skill_name, s.scheduled_at,
             cs.skill_name as conflicting_skill_name, cs.scheduled_at as conflicting_scheduled_at
      FROM conflict_alerts ca
      JOIN sessions s ON ca.session_id = s.id
      LEFT JOIN sessions cs ON ca.conflicting_session_id = cs.id
      WHERE ca.user_id = ? AND ca.resolved = ?
      ORDER BY ca.created_at DESC
    `, [userId, resolved]);

    res.json({
      success: true,
      conflicts: conflicts
    });
  } catch (error) {
    console.error('Error fetching conflict alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conflict alerts'
    });
  }
});

// Resolve conflict alert
router.put('/conflicts/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId;
    const conflictId = req.params.id;
    const { resolution_action } = req.body;

    // Verify conflict belongs to user
    const [conflicts] = await pool.execute(
      'SELECT * FROM conflict_alerts WHERE id = ? AND user_id = ?',
      [conflictId, userId]
    );

    if (conflicts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conflict alert not found'
      });
    }

    // Update conflict as resolved
    await pool.execute(`
      UPDATE conflict_alerts SET
        resolved = TRUE, resolved_at = NOW(), resolution_action = ?
      WHERE id = ?
    `, [resolution_action || 'resolved', conflictId]);

    res.json({
      success: true,
      message: 'Conflict alert resolved successfully'
    });
  } catch (error) {
    console.error('Error resolving conflict alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve conflict alert'
    });
  }
});

// Check for scheduling conflicts (utility endpoint)
router.post('/check-conflicts', authenticateToken, async (req, res) => {
  try {
    const { session_time, duration, exclude_session_id } = req.body;
    const userId = req.user.userId;

    if (!session_time || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Session time and duration are required'
      });
    }

    const conflicts = await notificationService.checkSchedulingConflicts(
      userId,
      session_time,
      duration,
      exclude_session_id
    );

    res.json({
      success: true,
      has_conflicts: conflicts.length > 0,
      conflicts: conflicts
    });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check for conflicts'
    });
  }
});

// Test notification (development endpoint)
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { type, email } = req.body;
    const testEmail = email || req.user.email;

    if (type === 'email') {
      const testHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Notification</h2>
          <p>This is a test notification from SkillNexus.</p>
          <p>If you received this, your email notifications are working correctly!</p>
        </div>
      `;

      await notificationService.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@skillnexus.com',
        to: testEmail,
        subject: 'SkillNexus - Test Notification',
        html: testHtml
      });

      res.json({
        success: true,
        message: 'Test email sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid test type. Use "email"'
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

module.exports = router;