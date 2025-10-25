const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'urban_skill_exchange'
  });

  try {
    // Create user_notification_preferences table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_notification_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email_reminders BOOLEAN DEFAULT TRUE,
        sms_reminders BOOLEAN DEFAULT FALSE,
        reminder_24h BOOLEAN DEFAULT TRUE,
        reminder_1h BOOLEAN DEFAULT TRUE,
        reminder_15m BOOLEAN DEFAULT TRUE,
        conflict_alerts BOOLEAN DEFAULT TRUE,
        reschedule_suggestions BOOLEAN DEFAULT TRUE,
        follow_up_emails BOOLEAN DEFAULT TRUE,
        emergency_contacts BOOLEAN DEFAULT FALSE,
        timezone VARCHAR(50) DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_prefs (user_id)
      )
    `);

    // Create scheduled_reminders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS scheduled_reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        user_id INT NOT NULL,
        reminder_type ENUM('24h', '1h', '15m', 'follow_up', 'conflict', 'reschedule') NOT NULL,
        scheduled_time DATETIME NOT NULL,
        sent BOOLEAN DEFAULT FALSE,
        sent_at DATETIME,
        delivery_status ENUM('pending', 'sent', 'failed', 'cancelled') DEFAULT 'pending',
        delivery_method ENUM('email', 'sms', 'both') DEFAULT 'email',
        retry_count INT DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_session (session_id),
        INDEX idx_user (user_id),
        INDEX idx_scheduled (scheduled_time),
        INDEX idx_status (delivery_status)
      )
    `);

    // Create conflict_alerts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS conflict_alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_id INT NOT NULL,
        conflicting_session_id INT,
        conflict_type ENUM('overlap', 'double_booking', 'timezone_issue') DEFAULT 'overlap',
        conflict_details JSON,
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at DATETIME,
        resolution_action ENUM('cancelled', 'rescheduled', 'ignored', 'contacted') DEFAULT 'ignored',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (conflicting_session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_session (session_id),
        INDEX idx_resolved (resolved)
      )
    `);

    // Create emergency_contacts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        contact_name VARCHAR(100) NOT NULL,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(20),
        relationship VARCHAR(50),
        is_primary BOOLEAN DEFAULT FALSE,
        notification_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_primary (is_primary)
      )
    `);

    console.log('Notification and reminder tables created successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await connection.end();
  }
}

runMigration();