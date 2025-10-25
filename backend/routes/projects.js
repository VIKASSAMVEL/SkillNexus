const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticateToken } = require('./auth');
const { getPool } = require('../config/database');

// Validation schemas
const createProjectSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(10).max(2000).required(),
  category: Joi.string().max(100).required(),
  location: Joi.string().max(255),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  max_participants: Joi.number().integer().min(1).max(100),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso().when('start_date', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('start_date'))
  }),
  project_type: Joi.string().valid('skill_sharing', 'community_service', 'educational', 'creative').default('skill_sharing')
});

const updateProjectSchema = Joi.object({
  title: Joi.string().min(3).max(255),
  description: Joi.string().min(10).max(2000),
  category: Joi.string().max(100),
  location: Joi.string().max(255),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  max_participants: Joi.number().integer().min(1).max(100),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso().when('start_date', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('start_date'))
  }),
  status: Joi.string().valid('planning', 'active', 'completed', 'cancelled'),
  project_type: Joi.string().valid('skill_sharing', 'community_service', 'educational', 'creative')
});

// Get all projects with optional filtering
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      project_type,
      creator_id,
      participant_id,
      location,
      limit = 20,
      offset = 0
    } = req.query;

    const pool = getPool();
    let query = `
      SELECT p.*,
             u.name as creator_name,
             u.email as creator_email,
             COUNT(pp.user_id) as current_participants
      FROM projects p
      JOIN users u ON p.creator_id = u.id
      LEFT JOIN project_participants pp ON p.id = pp.project_id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (project_type) {
      query += ' AND p.project_type = ?';
      params.push(project_type);
    }

    if (creator_id) {
      query += ' AND p.creator_id = ?';
      params.push(creator_id);
    }

    if (participant_id) {
      query += ` AND p.id IN (
        SELECT project_id FROM project_participants WHERE user_id = ?
      )`;
      params.push(participant_id);
    }

    if (location) {
      query += ' AND p.location LIKE ?';
      params.push(`%${location}%`);
    }

    query += ' GROUP BY p.id, u.name, u.email ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [projects] = await pool.execute(query, params);

    // Get participants for each project
    for (const project of projects) {
      const [participants] = await pool.execute(
        `SELECT u.id, u.name, u.email, pp.role, pp.joined_at
         FROM project_participants pp
         JOIN users u ON pp.user_id = u.id
         WHERE pp.project_id = ?
         ORDER BY pp.joined_at`,
        [project.id]
      );
      project.participants = participants;
    }

    res.json({ projects, total: projects.length });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single project by ID
router.get('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const pool = getPool();

    const [projects] = await pool.execute(
      `SELECT p.*,
              u.name as creator_name,
              u.email as creator_email
       FROM projects p
       JOIN users u ON p.creator_id = u.id
       WHERE p.id = ?`,
      [projectId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projects[0];

    // Get participants
    const [participants] = await pool.execute(
      `SELECT u.id, u.name, u.email, pp.role, pp.joined_at
       FROM project_participants pp
       JOIN users u ON pp.user_id = u.id
       WHERE pp.project_id = ?
       ORDER BY pp.joined_at`,
      [projectId]
    );

    project.participants = participants;
    project.current_participants = participants.length;

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const userId = req.user.userId;
    const projectData = { ...value, creator_id: userId };

    const pool = getPool();

    // Build dynamic insert query for optional fields
    const fields = ['title', 'description', 'creator_id', 'category', 'project_type'];
    const values = [
      projectData.title,
      projectData.description,
      projectData.creator_id,
      projectData.category,
      projectData.project_type
    ];

    // Add optional fields if they exist
    if (projectData.location !== undefined) {
      fields.push('location');
      values.push(projectData.location);
    }

    if (projectData.latitude !== undefined) {
      fields.push('latitude');
      values.push(projectData.latitude);
    }

    if (projectData.longitude !== undefined) {
      fields.push('longitude');
      values.push(projectData.longitude);
    }

    if (projectData.max_participants !== undefined) {
      fields.push('max_participants');
      values.push(projectData.max_participants);
    }

    if (projectData.start_date !== undefined) {
      fields.push('start_date');
      values.push(projectData.start_date);
    }

    if (projectData.end_date !== undefined) {
      fields.push('end_date');
      values.push(projectData.end_date);
    }

    const placeholders = fields.map(() => '?').join(', ');
    const query = `INSERT INTO projects (${fields.join(', ')}) VALUES (${placeholders})`;

    const [result] = await pool.execute(query, values);

    // Add creator as participant with 'creator' role
    await pool.execute(
      'INSERT INTO project_participants (project_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, userId, 'creator']
    );

    res.status(201).json({
      message: 'Project created successfully',
      projectId: result.insertId
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const projectId = req.params.id;
    const userId = req.user.userId;
    const pool = getPool();

    // Check if user is the creator
    const [projects] = await pool.execute(
      'SELECT creator_id FROM projects WHERE id = ?',
      [projectId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (projects[0].creator_id !== userId) {
      return res.status(403).json({ message: 'Only project creator can update the project' });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    Object.keys(value).forEach(key => {
      if (value[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(projectId);
    const query = `UPDATE projects SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    await pool.execute(query, updateValues);

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;
    const pool = getPool();

    // Check if user is the creator
    const [projects] = await pool.execute(
      'SELECT creator_id FROM projects WHERE id = ?',
      [projectId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (projects[0].creator_id !== userId) {
      return res.status(403).json({ message: 'Only project creator can delete the project' });
    }

    await pool.execute('DELETE FROM projects WHERE id = ?', [projectId]);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Join project
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;
    const pool = getPool();

    // Check if project exists
    const [projects] = await pool.execute(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projects[0];

    if (project.status !== 'planning' && project.status !== 'active') {
      return res.status(400).json({ message: 'Cannot join a completed or cancelled project' });
    }

    if (project.max_participants && project.current_participants >= project.max_participants) {
      return res.status(400).json({ message: 'Project is full' });
    }

    // Check if user is already a participant
    const [existing] = await pool.execute(
      'SELECT project_id FROM project_participants WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already a participant in this project' });
    }

    // Add user as participant
    await pool.execute(
      'INSERT INTO project_participants (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, userId, 'participant']
    );

    // Update participant count
    await pool.execute(
      'UPDATE projects SET current_participants = current_participants + 1 WHERE id = ?',
      [projectId]
    );

    res.json({ message: 'Successfully joined the project' });
  } catch (error) {
    console.error('Join project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Leave project
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;
    const pool = getPool();

    // Check if user is a participant (not creator)
    const [participants] = await pool.execute(
      'SELECT role FROM project_participants WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (participants.length === 0) {
      return res.status(400).json({ message: 'Not a participant in this project' });
    }

    if (participants[0].role === 'creator') {
      return res.status(400).json({ message: 'Project creator cannot leave the project' });
    }

    // Remove participant
    await pool.execute(
      'DELETE FROM project_participants WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    // Update participant count
    await pool.execute(
      'UPDATE projects SET current_participants = current_participants - 1 WHERE id = ?',
      [projectId]
    );

    res.json({ message: 'Successfully left the project' });
  } catch (error) {
    console.error('Leave project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get project categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    'Technology',
    'Community Service',
    'Education',
    'Arts & Crafts',
    'Sports & Fitness',
    'Music',
    'Cooking',
    'Business',
    'Health & Wellness',
    'Home & Garden',
    'Environmental',
    'Other'
  ];

  res.json({ categories });
});

// Get project types
router.get('/meta/types', (req, res) => {
  const types = [
    { value: 'skill_sharing', label: 'Skill Sharing' },
    { value: 'community_service', label: 'Community Service' },
    { value: 'educational', label: 'Educational' },
    { value: 'creative', label: 'Creative Project' }
  ];

  res.json({ types });
});

module.exports = router;