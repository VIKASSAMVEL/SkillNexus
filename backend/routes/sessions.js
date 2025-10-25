const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const notificationService = require('../services/notificationService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'audio/mp3',
      'audio/wav',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Check for scheduling conflicts
router.post('/check-conflicts', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { scheduled_at, duration_minutes, provider_id } = req.body;
    const userId = req.user.userId;

    // Check for scheduling conflicts
    const conflicts = await notificationService.checkSchedulingConflicts(
      userId,
      scheduled_at,
      duration_minutes
    );

    if (conflicts.length > 0) {
      return res.json({
        success: true,
        has_conflicts: true,
        conflict_reason: `You have a conflicting session: ${conflicts[0].skill_name} with ${conflicts[0].provider_name} at ${new Date(conflicts[0].scheduled_at).toLocaleString()}`,
        conflicts: conflicts
      });
    }

    // Also check provider availability
    if (provider_id) {
      const providerConflicts = await notificationService.checkSchedulingConflicts(
        provider_id,
        scheduled_at,
        duration_minutes
      );

      if (providerConflicts.length > 0) {
        return res.json({
          success: true,
          has_conflicts: true,
          conflict_reason: `The provider has a conflicting session at this time.`,
          conflicts: providerConflicts
        });
      }
    }

    res.json({
      success: true,
      has_conflicts: false,
      message: 'No conflicts detected'
    });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check for conflicts'
    });
  }
});

// Get all sessions for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId;
    const { status, type } = req.query;

    let query = `
      SELECT
        s.*,
        u1.name as learner_name,
        u1.email as learner_email,
        u2.name as provider_name,
        u2.email as provider_email,
        sk.name as skill_name,
        sk.category,
        sk.description as skill_description
      FROM sessions s
      LEFT JOIN users u1 ON s.learner_id = u1.id
      LEFT JOIN users u2 ON s.provider_id = u2.id
      LEFT JOIN skills sk ON s.skill_id = sk.id
      WHERE (s.learner_id = ? OR s.provider_id = ?)
    `;

    const params = [userId, userId];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND s.session_type = ?';
      params.push(type);
    }

    query += ' ORDER BY s.scheduled_at DESC';

    const [sessions] = await pool.execute(query, params);

    res.json({
      success: true,
      sessions: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions'
    });
  }
});

// Get a single session by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const sessionId = req.params.id;

    const [sessions] = await pool.execute(`
      SELECT
        s.*,
        u1.name as learner_name,
        u1.email as learner_email,
        u2.name as provider_name,
        u2.email as provider_email,
        sk.name as skill_name,
        sk.category,
        sk.description as skill_description
      FROM sessions s
      LEFT JOIN users u1 ON s.learner_id = u1.id
      LEFT JOIN users u2 ON s.provider_id = u2.id
      LEFT JOIN skills sk ON s.skill_id = sk.id
      WHERE s.id = ?
    `, [sessionId]);

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      session: sessions[0]
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session'
    });
  }
});

// Create a new session
router.post('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const {
      skill_id,
      provider_id,
      scheduled_at,
      duration_minutes,
      session_type = 'one-on-one',
      notes
    } = req.body;

    const learner_id = req.user.userId;

    // For booking, scheduled_at can be null, and status is 'booked'
    // Only check conflicts if scheduled_at is provided
    if (scheduled_at) {
      const conflicts = await notificationService.checkSchedulingConflicts(
        learner_id,
        scheduled_at,
        duration_minutes
      );

      if (conflicts.length > 0) {
        // Create conflict alert
        await notificationService.createConflictAlert(
          learner_id,
          null, // No session ID yet
          conflicts[0].id,
          'overlap',
          {
            new_session: { skill_id, scheduled_at, duration_minutes },
            conflicting_session: conflicts[0]
          }
        );

        return res.status(409).json({
          success: false,
          message: 'Scheduling conflict detected',
          conflicts: conflicts
        });
      }
    }

    // Validate that the skill and provider exist
    const [skills] = await pool.execute(
      'SELECT * FROM skills WHERE id = ? AND user_id = ?',
      [skill_id, provider_id]
    );

    if (skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill or provider'
      });
    }

    // Create the session as "booked" (pending provider scheduling)
    const [result] = await pool.execute(`
      INSERT INTO sessions (
        learner_id,
        provider_id,
        skill_id,
        scheduled_at,
        duration_minutes,
        session_type,
        status,
        notes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'booked', ?, NOW())
    `, [
      learner_id,
      provider_id,
      skill_id,
      scheduled_at || null,  // Allow NULL for booked state
      duration_minutes,
      session_type,
      notes || ''
    ]);

    const sessionId = result.insertId;

    // Notify provider about the booking (optional: integrate with notificationService)
    // await notificationService.notifyProviderOfBooking(sessionId);

    res.status(201).json({
      success: true,
      message: scheduled_at ? 'Session scheduled successfully' : 'Session booked successfully. The provider will schedule it soon.',
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session'
    });
  }
});

// Schedule a booked session (for providers)
router.put('/:id/schedule', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const sessionId = req.params.id;
    const userId = req.user.userId;
    const { scheduled_at, duration_minutes, notes } = req.body;

    // Verify user is the provider and session is booked
    const [sessions] = await pool.execute(
      'SELECT * FROM sessions WHERE id = ? AND provider_id = ? AND status = "booked"',
      [sessionId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booked session not found or access denied'
      });
    }

    // Check for conflicts before scheduling
    const conflicts = await notificationService.checkSchedulingConflicts(
      userId,
      scheduled_at,
      duration_minutes
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Scheduling conflict detected',
        conflicts: conflicts
      });
    }

    // Update to scheduled
    await pool.execute(`
      UPDATE sessions
      SET status = 'scheduled', scheduled_at = ?, duration_minutes = ?, notes = CONCAT(IFNULL(notes, ''), '\n', ?), updated_at = NOW()
      WHERE id = ?
    `, [scheduled_at, duration_minutes, notes || '', sessionId]);

    // Schedule reminders
    await notificationService.scheduleSessionReminders(sessionId);

    res.json({
      success: true,
      message: 'Session scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule session'
    });
  }
});

// Update session status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const sessionId = req.params.id;
    const userId = req.user.userId;
    const { status, notes } = req.body;

    // Verify user has access to this session
    const [sessions] = await pool.execute(
      'SELECT * FROM sessions WHERE id = ? AND (learner_id = ? OR provider_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update session status
    await pool.execute(`
      UPDATE sessions
      SET status = ?, notes = CONCAT(IFNULL(notes, ''), '\n', ?), updated_at = NOW()
      WHERE id = ?
    `, [status, notes || '', sessionId]);

    res.json({
      success: true,
      message: 'Session status updated successfully'
    });
  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session status'
    });
  }
});

// Start session (mark as in-progress)
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const sessionId = req.params.id;
    const userId = req.user.userId;

    // Verify user has access to this session
    const [sessions] = await pool.execute(
      'SELECT * FROM sessions WHERE id = ? AND (learner_id = ? OR provider_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update session to in-progress
    await pool.execute(`
      UPDATE sessions
      SET status = 'in-progress', started_at = NOW(), updated_at = NOW()
      WHERE id = ?
    `, [sessionId]);

    res.json({
      success: true,
      message: 'Session started successfully'
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session'
    });
  }
});

// End session
router.post('/:id/end', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const sessionId = req.params.id;
    const userId = req.user.userId;

    // Verify user has access to this session
    const [sessions] = await pool.execute(
      'SELECT * FROM sessions WHERE id = ? AND (learner_id = ? OR provider_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update session to completed
    await pool.execute(`
      UPDATE sessions
      SET status = 'completed', ended_at = NOW(), updated_at = NOW()
      WHERE id = ?
    `, [sessionId]);

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session'
    });
  }
});

// Upload file to session
router.post('/:id/files', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const pool = getPool();
    const sessionId = req.params.id;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Verify user has access to this session
    const [sessions] = await pool.execute(
      'SELECT * FROM sessions WHERE id = ? AND (learner_id = ? OR provider_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Save file info to database
    const [result] = await pool.execute(`
      INSERT INTO session_files (
        session_id,
        uploaded_by,
        filename,
        original_filename,
        file_path,
        file_size,
        file_type,
        uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      sessionId,
      userId,
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype
    ]);

    const fileId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: fileId,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/sessions/${sessionId}/files/${fileId}/download`,
        uploadedBy: req.user.name || 'You',
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
});

// Get files for a session
router.get('/:id/files', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const sessionId = req.params.id;
    const userId = req.user.userId;

    // Verify user has access to this session
    const [sessions] = await pool.execute(
      'SELECT * FROM sessions WHERE id = ? AND (learner_id = ? OR provider_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Get files for this session
    const [files] = await pool.execute(`
      SELECT
        sf.*,
        u.name as uploader_name
      FROM session_files sf
      LEFT JOIN users u ON sf.uploaded_by = u.id
      WHERE sf.session_id = ?
      ORDER BY sf.uploaded_at DESC
    `, [sessionId]);

    const formattedFiles = files.map(file => ({
      id: file.id,
      name: file.original_filename,
      size: file.file_size,
      type: file.file_type,
      url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/sessions/${sessionId}/files/${file.id}/download`,
      uploadedBy: file.uploader_name || 'Unknown',
      uploadedAt: file.uploaded_at
    }));

    res.json({
      success: true,
      files: formattedFiles
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files'
    });
  }
});

// Download file
router.get('/:sessionId/files/:fileId/download', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { sessionId, fileId } = req.params;
    const userId = req.user.userId;

    // Verify user has access to this session
    const [sessions] = await pool.execute(
      'SELECT * FROM sessions WHERE id = ? AND (learner_id = ? OR provider_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Get file info
    const [files] = await pool.execute(
      'SELECT * FROM session_files WHERE id = ? AND session_id = ?',
      [fileId, sessionId]
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = files[0];

    // Check if file exists on disk
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    // Send file
    res.download(file.file_path, file.original_filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file'
    });
  }
});

// Delete file
router.delete('/:sessionId/files/:fileId', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { sessionId, fileId } = req.params;
    const userId = req.user.userId;

    // Verify user has access to this session
    const [sessions] = await pool.execute(
      'SELECT * FROM sessions WHERE id = ? AND (learner_id = ? OR provider_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Get file info
    const [files] = await pool.execute(
      'SELECT * FROM session_files WHERE id = ? AND session_id = ?',
      [fileId, sessionId]
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = files[0];

    // Delete file from disk
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    // Delete file from database
    await pool.execute(
      'DELETE FROM session_files WHERE id = ?',
      [fileId]
    );

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

module.exports = router;