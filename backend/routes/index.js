const express = require('express');
const router = express.Router();

// Import route modules
const { router: authRoutes } = require('./auth');
// const userRoutes = require('./users');
// const skillRoutes = require('./skills');

// Mount routes
router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/skills', skillRoutes);

// Placeholder route
router.get('/test', (req, res) => {
  res.json({ message: 'API routes working' });
});

module.exports = router;