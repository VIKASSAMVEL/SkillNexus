const express = require('express');
const Joi = require('joi');
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const skillSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  category: Joi.string().max(100).optional(),
  description: Joi.string().max(1000).optional(),
  proficiency_level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').optional(),
  is_available: Joi.boolean().optional(),
  price_per_hour: Joi.number().min(0).optional(),
  price_per_session: Joi.number().min(0).optional()
});

const skillQuerySchema = Joi.object({
  category: Joi.string().optional(),
  proficiency_level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').optional(),
  is_available: Joi.boolean().optional(),
  search: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  radius: Joi.number().min(1).max(100).default(10), // miles
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
}).options({ convert: true });

// Get all skills with optional filtering
router.get('/', async (req, res) => {
  try {
    const { error, value } = skillQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const { category, proficiency_level, is_available, search, latitude, longitude, radius, limit, offset } = value;
    const pool = getPool();

    let query = `
      SELECT s.*, u.name as user_name, u.location as user_location,
             s.latitude, s.longitude,
             COALESCE(uts.overall_score, 0) as trust_score,
             COALESCE(uts.average_rating, 0) as average_rating,
             COALESCE(uts.rating_count, 0) as rating_count
      FROM skills s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_trust_scores uts ON uts.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND s.category = ?';
      params.push(category);
    }

    if (proficiency_level) {
      query += ' AND s.proficiency_level = ?';
      params.push(proficiency_level);
    }

    if (is_available !== undefined) {
      query += ' AND s.is_available = ?';
      params.push(is_available);
    }

    if (search) {
      query += ' AND (s.name LIKE ? OR s.description LIKE ? OR u.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Location-based filtering using Haversine formula
    if (latitude && longitude) {
      query += ` AND (
        3959 * acos(
          cos(radians(?)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(u.latitude))
        )
      ) <= ?`;
      params.push(latitude, longitude, latitude, radius);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [skills] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM skills s JOIN users u ON s.user_id = u.id LEFT JOIN user_trust_scores uts ON uts.user_id = u.id WHERE 1=1';
    const countParams = [];

    if (category) {
      countQuery += ' AND s.category = ?';
      countParams.push(category);
    }

    if (proficiency_level) {
      countQuery += ' AND s.proficiency_level = ?';
      countParams.push(proficiency_level);
    }

    if (is_available !== undefined) {
      countQuery += ' AND s.is_available = ?';
      countParams.push(is_available);
    }

    if (search) {
      countQuery += ' AND (s.name LIKE ? OR s.description LIKE ? OR u.name LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (latitude && longitude) {
      countQuery += ` AND (
        3959 * acos(
          cos(radians(?)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(u.latitude))
        )
      ) <= ?`;
      countParams.push(latitude, longitude, latitude, radius);
    }

    const [countResult] = await pool.execute(countQuery, countParams);

    res.json({
      skills,
      pagination: {
        total: countResult[0].total,
        limit,
        offset,
        hasMore: offset + limit < countResult[0].total
      }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get skills for authenticated user
router.get('/my-skills', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [skills] = await pool.execute(
      'SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({ skills });
  } catch (error) {
    console.error('Get user skills error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single skill by ID
router.get('/:id', async (req, res) => {
  try {
    const skillId = req.params.id;
    const pool = getPool();

    const [skills] = await pool.execute(
      `SELECT s.*, u.name as user_name, u.email as user_email, u.location as user_location,
              u.bio as user_bio, u.profile_image as user_profile_image, u.id as user_id
       FROM skills s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [skillId]
    );

    if (skills.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json({ skill: skills[0] });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new skill
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = skillSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const skillData = {
      ...value,
      user_id: req.user.userId,
      is_available: value.is_available !== undefined ? value.is_available : true
    };

    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO skills (user_id, name, category, description, proficiency_level,
                          is_available, price_per_hour, price_per_session)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        skillData.user_id,
        skillData.name,
        skillData.category || null,
        skillData.description || null,
        skillData.proficiency_level || 'beginner',
        skillData.is_available,
        skillData.price_per_hour || null,
        skillData.price_per_session || null
      ]
    );

    res.status(201).json({
      message: 'Skill created successfully',
      skillId: result.insertId
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update skill
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const skillId = req.params.id;
    const { error, value } = skillSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const pool = getPool();

    // Check if skill belongs to user
    const [existingSkills] = await pool.execute(
      'SELECT id FROM skills WHERE id = ? AND user_id = ?',
      [skillId, req.user.userId]
    );

    if (existingSkills.length === 0) {
      return res.status(404).json({ message: 'Skill not found or access denied' });
    }

    const updateData = value;
    const updateFields = [];
    const updateValues = [];

    if (updateData.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(updateData.name);
    }
    if (updateData.category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(updateData.category);
    }
    if (updateData.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updateData.description);
    }
    if (updateData.proficiency_level !== undefined) {
      updateFields.push('proficiency_level = ?');
      updateValues.push(updateData.proficiency_level);
    }
    if (updateData.is_available !== undefined) {
      updateFields.push('is_available = ?');
      updateValues.push(updateData.is_available);
    }
    if (updateData.price_per_hour !== undefined) {
      updateFields.push('price_per_hour = ?');
      updateValues.push(updateData.price_per_hour);
    }
    if (updateData.price_per_session !== undefined) {
      updateFields.push('price_per_session = ?');
      updateValues.push(updateData.price_per_session);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(skillId);

    const query = `UPDATE skills SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(query, updateValues);

    res.json({ message: 'Skill updated successfully' });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete skill
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const skillId = req.params.id;
    const pool = getPool();

    // Check if skill belongs to user
    const [existingSkills] = await pool.execute(
      'SELECT id FROM skills WHERE id = ? AND user_id = ?',
      [skillId, req.user.userId]
    );

    if (existingSkills.length === 0) {
      return res.status(404).json({ message: 'Skill not found or access denied' });
    }

    await pool.execute('DELETE FROM skills WHERE id = ?', [skillId]);

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get skill categories
router.get('/meta/categories', async (req, res) => {
  try {
    const pool = getPool();
    const [categories] = await pool.execute(
      'SELECT * FROM skill_categories ORDER BY name'
    );

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;