const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const skillsRoutes = require('./skills');
const bookingsRoutes = require('./bookings');
const projectsRoutes = require('./projects');
const usersRoutes = require('./users');
const reviewsRoutes = require('./reviews');
const recommendationsRoutes = require('./recommendations');
const sessionsRoutes = require('./sessions');
const notificationsRoutes = require('./notifications');

// Mount routes
router.use('/auth', authRoutes);
router.use('/skills', skillsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/projects', projectsRoutes);
router.use('/users', usersRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/recommendations', recommendationsRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/notifications', notificationsRoutes);

// Placeholder route
router.get('/test', (req, res) => {
  res.json({ message: 'API routes working' });
});

module.exports = router;