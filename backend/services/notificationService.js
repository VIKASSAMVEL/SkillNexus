const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cron = require('node-cron');
const { getPool } = require('../config/database');

class NotificationService {
  constructor() {
    // Email transporter setup
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Twilio setup for SMS
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }

    // Start the reminder scheduler
    this.startReminderScheduler();
  }

  // Start the cron job for processing reminders
  startReminderScheduler() {
    // Run every 5 minutes to check for pending reminders
    cron.schedule('*/5 * * * *', async () => {
      await this.processPendingReminders();
    });

    console.log('Reminder scheduler started');
  }

  // Process pending reminders that are due
  async processPendingReminders() {
    try {
      const pool = getPool();
      const now = new Date();

      // Get reminders that are due (within the next 5 minutes)
      const [reminders] = await pool.execute(`
        SELECT sr.*, sk.name as skill_name, s.scheduled_at, s.duration_minutes,
               u1.name as learner_name, u1.email as learner_email,
               u2.name as provider_name, u2.email as provider_email,
               unp.email_reminders, unp.sms_reminders, unp.timezone
        FROM scheduled_reminders sr
        JOIN sessions s ON sr.session_id = s.id
        JOIN users u1 ON s.learner_id = u1.id
        JOIN users u2 ON s.provider_id = u2.id
        LEFT JOIN skills sk ON s.skill_id = sk.id
        LEFT JOIN user_notification_preferences unp ON sr.user_id = unp.user_id
        WHERE sr.delivery_status = 'pending'
        AND sr.scheduled_time <= DATE_ADD(NOW(), INTERVAL 5 MINUTE)
        AND sr.scheduled_time >= NOW()
      `);

      for (const reminder of reminders) {
        try {
          await this.sendReminder(reminder);
        } catch (error) {
          console.error(`Failed to send reminder ${reminder.id}:`, error);
          await this.updateReminderStatus(reminder.id, 'failed', error.message);
        }
      }
    } catch (error) {
      console.error('Error processing pending reminders:', error);
    }
  }

  // Send a reminder notification
  async sendReminder(reminder) {
    const { reminder_type, delivery_method, user_id } = reminder;

    // Get user preferences
    const preferences = await this.getUserPreferences(user_id);

    // Determine delivery methods based on preferences and reminder type
    const shouldSendEmail = preferences.email_reminders &&
      (delivery_method === 'email' || delivery_method === 'both');
    const shouldSendSMS = preferences.sms_reminders &&
      (delivery_method === 'sms' || delivery_method === 'both');

    let emailSent = false;
    let smsSent = false;

    // Send email if enabled
    if (shouldSendEmail) {
      try {
        await this.sendEmailReminder(reminder);
        emailSent = true;
      } catch (error) {
        console.error(`Email reminder failed for ${reminder.id}:`, error);
      }
    }

    // Send SMS if enabled
    if (shouldSendSMS) {
      try {
        await this.sendSMSReminder(reminder);
        smsSent = true;
      } catch (error) {
        console.error(`SMS reminder failed for ${reminder.id}:`, error);
      }
    }

    // Update reminder status
    if (emailSent || smsSent) {
      await this.updateReminderStatus(reminder.id, 'sent');
    } else {
      await this.updateReminderStatus(reminder.id, 'failed', 'No delivery method succeeded');
    }
  }

  // Send email reminder
  async sendEmailReminder(reminder) {
    const { reminder_type, learner_email, provider_email, user_id, skill_name,
            scheduled_at, duration_minutes, learner_name, provider_name } = reminder;

    // Determine recipient and content based on user type
    const isLearner = learner_email === reminder.email;
    const recipientEmail = isLearner ? learner_email : provider_email;
    const recipientName = isLearner ? learner_name : provider_name;

    let subject = '';
    let html = '';

    switch (reminder_type) {
      case '24h':
        subject = `Session Reminder: ${skill_name} in 24 hours`;
        html = this.generateReminderEmail(recipientName, skill_name, scheduled_at, duration_minutes, '24 hours', isLearner);
        break;
      case '1h':
        subject = `Session Reminder: ${skill_name} in 1 hour`;
        html = this.generateReminderEmail(recipientName, skill_name, scheduled_at, duration_minutes, '1 hour', isLearner);
        break;
      case '15m':
        subject = `Session Starting Soon: ${skill_name} in 15 minutes`;
        html = this.generateReminderEmail(recipientName, skill_name, scheduled_at, duration_minutes, '15 minutes', isLearner);
        break;
      case 'follow_up':
        subject = `How was your ${skill_name} session?`;
        html = this.generateFollowUpEmail(recipientName, skill_name, scheduled_at);
        break;
      case 'conflict':
        subject = `Scheduling Conflict Alert`;
        html = this.generateConflictEmail(recipientName, reminder);
        break;
      case 'reschedule':
        subject = `Session Rescheduling Suggestion`;
        html = this.generateRescheduleEmail(recipientName, reminder);
        break;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@skillnexus.com',
      to: recipientEmail,
      subject: subject,
      html: html
    };

    await this.emailTransporter.sendMail(mailOptions);
  }

  // Send SMS reminder
  async sendSMSReminder(reminder) {
    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    const { reminder_type, contact_phone, skill_name, scheduled_at } = reminder;

    let message = '';

    switch (reminder_type) {
      case '24h':
        message = `Reminder: Your ${skill_name} session is in 24 hours (${new Date(scheduled_at).toLocaleString()})`;
        break;
      case '1h':
        message = `Reminder: Your ${skill_name} session starts in 1 hour`;
        break;
      case '15m':
        message = `Your ${skill_name} session starts in 15 minutes`;
        break;
      case 'follow_up':
        message = `How was your ${skill_name} session? Please rate and review at skillnexus.com`;
        break;
    }

    await this.twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: contact_phone
    });
  }

  // Generate HTML email for reminders
  generateReminderEmail(recipientName, skillName, scheduledAt, duration, timeUntil, isLearner) {
    const sessionTime = new Date(scheduledAt).toLocaleString();
    const role = isLearner ? 'learner' : 'provider';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0F766E 0%, #14B8A6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Session Reminder</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1A2332; margin-top: 0;">Hi ${recipientName}!</h2>

          <p style="color: #64748B; line-height: 1.6;">
            This is a reminder that your <strong>${skillName}</strong> session is scheduled to start in <strong>${timeUntil}</strong>.
          </p>

          <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1A2332; margin-top: 0;">Session Details:</h3>
            <p style="margin: 5px 0;"><strong>Skill:</strong> ${skillName}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${sessionTime}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration} minutes</p>
            <p style="margin: 5px 0;"><strong>Your Role:</strong> ${role}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/sessions"
               style="background: #14B8A6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Session Details
            </a>
          </div>

          <p style="color: #64748B; font-size: 14px; text-align: center;">
            Need to reschedule? Contact your ${isLearner ? 'skill provider' : 'learner'} or visit your dashboard.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #94A3B8; font-size: 12px;">
          <p>You're receiving this because you have sessions scheduled on SkillNexus.</p>
          <p><a href="#" style="color: #14B8A6;">Unsubscribe</a> | <a href="#" style="color: #14B8A6;">Update Preferences</a></p>
        </div>
      </div>
    `;
  }

  // Generate follow-up email
  generateFollowUpEmail(recipientName, skillName, sessionTime) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0F766E 0%, #14B8A6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Session Complete!</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1A2332; margin-top: 0;">Hi ${recipientName}!</h2>

          <p style="color: #64748B; line-height: 1.6;">
            How was your <strong>${skillName}</strong> session? Your feedback helps improve our community!
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/sessions"
               style="background: #14B8A6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Rate & Review Session
            </a>
          </div>

          <p style="color: #64748B; font-size: 14px; text-align: center;">
            Your feedback helps other learners find the best skill providers.
          </p>
        </div>
      </div>
    `;
  }

  // Generate conflict alert email
  generateConflictEmail(recipientName, conflictData) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Scheduling Conflict Alert</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1A2332; margin-top: 0;">Hi ${recipientName}!</h2>

          <p style="color: #64748B; line-height: 1.6;">
            We've detected a potential scheduling conflict with your upcoming sessions.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/sessions"
               style="background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Conflicts
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Generate reschedule suggestion email
  generateRescheduleEmail(recipientName, rescheduleData) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Rescheduling Suggestion</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1A2332; margin-top: 0;">Hi ${recipientName}!</h2>

          <p style="color: #64748B; line-height: 1.6;">
            We have some suggestions to help you avoid scheduling conflicts.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/sessions"
               style="background: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Suggestions
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Get user notification preferences
  async getUserPreferences(userId) {
    try {
      const pool = getPool();
      const [preferences] = await pool.execute(
        'SELECT * FROM user_notification_preferences WHERE user_id = ?',
        [userId]
      );

      if (preferences.length === 0) {
        // Return default preferences
        return {
          email_reminders: true,
          sms_reminders: false,
          reminder_24h: true,
          reminder_1h: true,
          reminder_15m: true,
          conflict_alerts: true,
          reschedule_suggestions: true,
          follow_up_emails: true,
          emergency_contacts: false,
          timezone: 'UTC'
        };
      }

      return preferences[0];
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        email_reminders: true,
        sms_reminders: false,
        timezone: 'UTC'
      };
    }
  }

  // Update reminder status
  async updateReminderStatus(reminderId, status, errorMessage = null) {
    try {
      const pool = getPool();
      const updateData = {
        delivery_status: status,
        sent_at: status === 'sent' ? new Date() : null,
        error_message: errorMessage
      };

      await pool.execute(
        'UPDATE scheduled_reminders SET delivery_status = ?, sent_at = ?, error_message = ? WHERE id = ?',
        [updateData.delivery_status, updateData.sent_at, updateData.error_message, reminderId]
      );
    } catch (error) {
      console.error('Error updating reminder status:', error);
    }
  }

  // Schedule reminders for a new session
  async scheduleSessionReminders(sessionId) {
    try {
      const pool = getPool();
      const [sessions] = await pool.execute(`
        SELECT s.*, u1.email as learner_email, u2.email as provider_email
        FROM sessions s
        JOIN users u1 ON s.learner_id = u1.id
        JOIN users u2 ON s.provider_id = u2.id
        WHERE s.id = ?
      `, [sessionId]);

      if (sessions.length === 0) return;

      const session = sessions[0];
      const sessionTime = new Date(session.scheduled_at);

      // Get user preferences for both participants
      const learnerPrefs = await this.getUserPreferences(session.learner_id);
      const providerPrefs = await this.getUserPreferences(session.provider_id);

      const reminders = [];

      // Schedule reminders for learner
      if (learnerPrefs.email_reminders || learnerPrefs.sms_reminders) {
        reminders.push(
          this.createReminder(sessionId, session.learner_id, '24h', new Date(sessionTime.getTime() - 24 * 60 * 60 * 1000)),
          this.createReminder(sessionId, session.learner_id, '1h', new Date(sessionTime.getTime() - 60 * 60 * 1000)),
          this.createReminder(sessionId, session.learner_id, '15m', new Date(sessionTime.getTime() - 15 * 60 * 1000))
        );
      }

      // Schedule reminders for provider
      if (providerPrefs.email_reminders || providerPrefs.sms_reminders) {
        reminders.push(
          this.createReminder(sessionId, session.provider_id, '24h', new Date(sessionTime.getTime() - 24 * 60 * 60 * 1000)),
          this.createReminder(sessionId, session.provider_id, '1h', new Date(sessionTime.getTime() - 60 * 60 * 1000)),
          this.createReminder(sessionId, session.provider_id, '15m', new Date(sessionTime.getTime() - 15 * 60 * 1000))
        );
      }

      // Schedule follow-up email (24 hours after session end)
      const followUpTime = new Date(sessionTime.getTime() + (session.duration_minutes + 24 * 60) * 60 * 1000);
      reminders.push(
        this.createReminder(sessionId, session.learner_id, 'follow_up', followUpTime),
        this.createReminder(sessionId, session.provider_id, 'follow_up', followUpTime)
      );

      // Insert reminders into database
      for (const reminder of reminders) {
        await pool.execute(`
          INSERT INTO scheduled_reminders (
            session_id, user_id, reminder_type, scheduled_time, delivery_method
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          reminder.session_id,
          reminder.user_id,
          reminder.reminder_type,
          reminder.scheduled_time,
          reminder.delivery_method
        ]);
      }

      console.log(`Scheduled ${reminders.length} reminders for session ${sessionId}`);
    } catch (error) {
      console.error('Error scheduling session reminders:', error);
    }
  }

  // Create reminder object
  createReminder(sessionId, userId, type, scheduledTime, deliveryMethod = 'email') {
    return {
      session_id: sessionId,
      user_id: userId,
      reminder_type: type,
      scheduled_time: scheduledTime,
      delivery_method: deliveryMethod
    };
  }

  // Check for scheduling conflicts
  async checkSchedulingConflicts(userId, sessionTime, duration, excludeSessionId = null) {
    try {
      const pool = getPool();
      const sessionStart = new Date(sessionTime);
      const sessionEnd = new Date(sessionStart.getTime() + duration * 60 * 1000);

      let query = `
        SELECT s.*, u1.name as learner_name, u2.name as provider_name, sk.name as skill_name
        FROM sessions s
        JOIN users u1 ON s.learner_id = u1.id
        JOIN users u2 ON s.provider_id = u2.id
        JOIN skills sk ON s.skill_id = sk.id
        WHERE (s.learner_id = ? OR s.provider_id = ?)
        AND s.status IN ('scheduled', 'in-progress')
        AND (
          (s.scheduled_at <= ? AND DATE_ADD(s.scheduled_at, INTERVAL s.duration_minutes MINUTE) > ?) OR
          (s.scheduled_at < ? AND DATE_ADD(s.scheduled_at, INTERVAL s.duration_minutes MINUTE) >= ?)
        )
      `;

      const params = [userId, userId, sessionStart, sessionStart, sessionEnd, sessionEnd];

      if (excludeSessionId) {
        query += ' AND s.id != ?';
        params.push(excludeSessionId);
      }

      const [conflicts] = await pool.execute(query, params);

      return conflicts;
    } catch (error) {
      console.error('Error checking scheduling conflicts:', error);
      return [];
    }
  }

  // Create conflict alert
  async createConflictAlert(userId, sessionId, conflictingSessionId, conflictType, conflictDetails) {
    try {
      const pool = getPool();
      await pool.execute(`
        INSERT INTO conflict_alerts (
          user_id, session_id, conflicting_session_id, conflict_type, conflict_details
        ) VALUES (?, ?, ?, ?, ?)
      `, [userId, sessionId, conflictingSessionId, conflictType, JSON.stringify(conflictDetails)]);

      // Schedule conflict notification
      await pool.execute(`
        INSERT INTO scheduled_reminders (
          session_id, user_id, reminder_type, scheduled_time, delivery_method
        ) VALUES (?, ?, 'conflict', NOW(), 'email')
      `, [sessionId, userId]);

      console.log(`Created conflict alert for user ${userId}, session ${sessionId}`);
    } catch (error) {
      console.error('Error creating conflict alert:', error);
    }
  }

  // Get emergency contacts for a user
  async getEmergencyContacts(userId) {
    try {
      const pool = getPool();
      const [contacts] = await pool.execute(
        'SELECT * FROM emergency_contacts WHERE user_id = ? AND notification_enabled = TRUE ORDER BY is_primary DESC',
        [userId]
      );
      return contacts;
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      return [];
    }
  }

  // Send emergency notification for no-show
  async sendNoShowNotification(sessionId) {
    try {
      const pool = getPool();
      const [sessions] = await pool.execute(`
        SELECT s.*, u1.name as learner_name, u1.email as learner_email,
               u2.name as provider_name, u2.email as provider_email, sk.name as skill_name
        FROM sessions s
        JOIN users u1 ON s.learner_id = u1.id
        JOIN users u2 ON s.provider_id = u2.id
        JOIN skills sk ON s.skill_id = sk.id
        WHERE s.id = ?
      `, [sessionId]);

      if (sessions.length === 0) return;

      const session = sessions[0];

      // Get emergency contacts for both participants
      const learnerContacts = await this.getEmergencyContacts(session.learner_id);
      const providerContacts = await this.getEmergencyContacts(session.provider_id);

      const allContacts = [...learnerContacts, ...providerContacts];

      for (const contact of allContacts) {
        try {
          const subject = `Emergency: No-show for ${session.skill_name} session`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Emergency Notification</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p>One of your contacts has missed their scheduled session. Please check on them.</p>
                <p><strong>Session:</strong> ${session.skill_name}</p>
                <p><strong>Scheduled:</strong> ${new Date(session.scheduled_at).toLocaleString()}</p>
              </div>
            </div>
          `;

          await this.emailTransporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@skillnexus.com',
            to: contact.contact_email,
            subject: subject,
            html: html
          });
        } catch (error) {
          console.error(`Failed to notify emergency contact ${contact.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error sending no-show notifications:', error);
    }
  }
}

module.exports = new NotificationService();