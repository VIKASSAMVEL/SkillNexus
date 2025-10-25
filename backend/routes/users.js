const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all teachers (users who have skills available)
router.get('/teachers', async (req, res) => {
  try {
    const pool = getPool();

    const [teachers] = await pool.execute(`
      SELECT DISTINCT u.id, u.name, u.email, u.phone, u.location,
             u.created_at, u.updated_at
      FROM users u
      JOIN skills s ON u.id = s.user_id
      WHERE s.is_available = TRUE
      ORDER BY u.name
    `);

    res.json({ teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single user by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const pool = getPool();

    const [users] = await pool.execute(
      'SELECT id, name, email, phone, location, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile (authenticated)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, location } = req.body;

    const pool = getPool();

    let updateFields = [];
    let updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(userId);
    const query = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    await pool.execute(query, updateValues);

    // Get updated user
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, location FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;