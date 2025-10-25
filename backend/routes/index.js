const express = require('express');
const router = express.Router();

// Import route modules
const { router: authRoutes } = require('./auth');
const skillsRoutes = require('./skills');
const bookingsRoutes = require('./bookings');
const projectsRoutes = require('./projects');
// const userRoutes = require('./users');
// const skillRoutes = require('./skills');

// Mount routes
router.use('/auth', authRoutes);
router.use('/skills', skillsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/projects', projectsRoutes);
// router.use('/users', userRoutes);
// router.use('/skills', skillRoutes);

// Placeholder route
router.get('/test', (req, res) => {
  res.json({ message: 'API routes working' });
});

module.exports = router;