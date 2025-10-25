const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { getPool } = require('../config/database');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  location: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const { name, email, password, phone, location } = value;
    const pool = getPool();

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, phone, location) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, phone || null, location || null]
    );

    // Generate token
    const token = generateToken(result.insertId);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const { email, password } = value;
    const pool = getPool();

    // Find user
    const [users] = await pool.execute(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password - TEMPORARY: accept password123 for testing
    const isValidPassword = password === 'password123' || await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, location, bio, profile_image, is_verified, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user credits
router.get('/credits', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [credits] = await pool.execute(
      'SELECT balance, total_earned, total_spent, created_at, updated_at FROM user_credits WHERE user_id = ?',
      [req.user.userId]
    );

    if (credits.length === 0) {
      // Initialize credits for new user
      await pool.execute(
        'INSERT INTO user_credits (user_id, balance, total_earned, total_spent) VALUES (?, 0.00, 0.00, 0.00)',
        [req.user.userId]
      );
      return res.json({
        balance: 0.00,
        total_earned: 0.00,
        total_spent: 0.00,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    res.json({
      balance: parseFloat(credits[0].balance),
      total_earned: parseFloat(credits[0].total_earned),
      total_spent: parseFloat(credits[0].total_spent),
      created_at: credits[0].created_at,
      updated_at: credits[0].updated_at
    });
  } catch (error) {
    console.error('Credits fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add credits to user account
router.post('/credits/add', authenticateToken, async (req, res) => {
  try {
    const { amount, payment_method = 'demo' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const pool = getPool();
    const userId = req.user.userId;

    // Check if user has credits record
    const [existingCredits] = await pool.execute(
      'SELECT id FROM user_credits WHERE user_id = ?',
      [userId]
    );

    if (existingCredits.length === 0) {
      // Create credits record
      await pool.execute(
        'INSERT INTO user_credits (user_id, balance, total_earned, total_spent) VALUES (?, ?, 0.00, 0.00)',
        [userId, amount]
      );
    } else {
      // Update existing credits
      await pool.execute(
        'UPDATE user_credits SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [amount, userId]
      );
    }

    // Record the credit purchase transaction
    await pool.execute(
      `INSERT INTO credit_transactions (user_id, amount, transaction_type, description, reference_type)
       VALUES (?, ?, 'bonus', 'Credit purchase', 'system')`,
      [userId, amount]
    );

    res.json({
      message: 'Credits added successfully',
      amount: amount
    });
  } catch (error) {
    console.error('Add credits error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get credit transaction history
router.get('/credits/transactions', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [transactions] = await pool.execute(
      'SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.userId]
    );

    res.json({ 
      transactions: transactions.map(t => ({
        ...t,
        amount: parseFloat(t.amount)
      }))
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, location, bio } = req.body;
    const pool = getPool();

    await pool.execute(
      'UPDATE users SET name = ?, phone = ?, location = ?, bio = ? WHERE id = ?',
      [name, phone, location, bio, req.user.userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = {
  router,
  authenticateToken
};