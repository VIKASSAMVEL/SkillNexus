-- Create sessions table for real-time chat and video sessions
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  learner_id INT NOT NULL,
  provider_id INT NOT NULL,
  skill_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  session_type ENUM('one-on-one', 'group', 'workshop') DEFAULT 'one-on-one',
  status ENUM('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
  notes TEXT,
  room_id VARCHAR(255) UNIQUE, -- For Socket.io room identification
  recording_url VARCHAR(500), -- URL for session recording if enabled
  started_at DATETIME,
  ended_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (learner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,

  INDEX idx_learner (learner_id),
  INDEX idx_provider (provider_id),
  INDEX idx_skill (skill_id),
  INDEX idx_scheduled (scheduled_at),
  INDEX idx_status (status),
  INDEX idx_room (room_id)
);

-- Create session_participants table for group sessions
CREATE TABLE IF NOT EXISTS session_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('learner', 'provider', 'observer') DEFAULT 'learner',
  joined_at DATETIME,
  left_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  UNIQUE KEY unique_participant (session_id, user_id)
);

-- Create session_messages table for chat history
CREATE TABLE IF NOT EXISTS session_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  sender_id INT NOT NULL,
  message_type ENUM('text', 'file', 'system') DEFAULT 'text',
  message_content TEXT,
  file_url VARCHAR(500), -- For file sharing
  file_name VARCHAR(255),
  file_size INT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_session (session_id),
  INDEX idx_sender (sender_id),
  INDEX idx_sent (sent_at)
);

-- Create session_whiteboard_strokes table for whiteboard collaboration
CREATE TABLE IF NOT EXISTS session_whiteboard_strokes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  stroke_data JSON NOT NULL, -- Store drawing data as JSON
  stroke_type ENUM('draw', 'erase', 'clear') DEFAULT 'draw',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_session (session_id),
  INDEX idx_user (user_id)
);

-- Create session_analytics table for tracking engagement
CREATE TABLE IF NOT EXISTS session_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  event_type ENUM('joined', 'left', 'message_sent', 'file_shared', 'screen_shared', 'whiteboard_used') NOT NULL,
  event_data JSON, -- Additional data about the event
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_session (session_id),
  INDEX idx_user (user_id),
  INDEX idx_event (event_type)
);

-- Create session_files table for file sharing
CREATE TABLE IF NOT EXISTS session_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  uploaded_by INT NOT NULL,
  filename VARCHAR(255) NOT NULL, -- Stored filename on disk
  original_filename VARCHAR(255) NOT NULL, -- Original filename
  file_path VARCHAR(500) NOT NULL, -- Full path to file on disk
  file_size INT NOT NULL, -- File size in bytes
  file_type VARCHAR(100) NOT NULL, -- MIME type
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_session (session_id),
  INDEX idx_uploader (uploaded_by),
  INDEX idx_uploaded (uploaded_at)
);

-- Create user_notification_preferences table for reminder settings
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
);

-- Create scheduled_reminders table for tracking reminder jobs
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
);

-- Create conflict_alerts table for tracking scheduling conflicts
CREATE TABLE IF NOT EXISTS conflict_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT NOT NULL,
  conflicting_session_id INT,
  conflict_type ENUM('overlap', 'double_booking', 'timezone_issue') DEFAULT 'overlap',
  conflict_details JSON, -- Store conflict information
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
);

-- Create emergency_contacts table for no-show notifications
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  relationship VARCHAR(50), -- e.g., 'family', 'friend', 'colleague'
  is_primary BOOLEAN DEFAULT FALSE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_user (user_id),
  INDEX idx_primary (is_primary)
);