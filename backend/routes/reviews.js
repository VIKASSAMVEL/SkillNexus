const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Validation schemas
const reviewSchema = Joi.object({
  booking_id: Joi.number().integer().optional(),
  project_id: Joi.number().integer().optional(),
  rating: Joi.number().integer().min(1).max(5).required(),
  review_text: Joi.string().max(1000).optional(),
  review_type: Joi.string().valid('skill_session', 'project_participation').required(),
  is_anonymous: Joi.boolean().default(false)
}).xor('booking_id', 'project_id'); // Must have either booking_id OR project_id, but not both

const endorsementSchema = Joi.object({
  skill_id: Joi.number().integer().required(),
  endorsement_text: Joi.string().max(500).optional(),
  is_public: Joi.boolean().default(true)
});

const reviewResponseSchema = Joi.object({
  response_text: Joi.string().max(1000).required()
});

const reviewReportSchema = Joi.object({
  report_reason: Joi.string().valid('spam', 'inappropriate', 'fake', 'harassment', 'other').required(),
  report_details: Joi.string().max(500).optional()
});

// Submit a review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const reviewer_id = req.user.userId;
    const { booking_id, project_id, rating, review_text, review_type, is_anonymous } = value;

    const pool = getPool();

    // Determine the reviewee based on booking or project
    let reviewee_id, booking_check, project_check;

    if (booking_id) {
      // Check if user participated in this booking
      [booking_check] = await pool.execute(
        'SELECT student_id, teacher_id FROM bookings WHERE id = ? AND (student_id = ? OR teacher_id = ?)',
        [booking_id, reviewer_id, reviewer_id]
      );

      if (booking_check.length === 0) {
        return res.status(403).json({ message: 'You can only review bookings you participated in' });
      }

      // Reviewee is the other participant
      reviewee_id = booking_check[0].student_id === reviewer_id ?
                   booking_check[0].teacher_id : booking_check[0].student_id;

      // Check if booking is completed
      if (booking_check[0].status !== 'completed') {
        return res.status(400).json({ message: 'You can only review completed bookings' });
      }
    } else if (project_id) {
      // Check if user participated in this project
      [project_check] = await pool.execute(
        'SELECT pp.user_id FROM project_participants pp WHERE pp.project_id = ? AND pp.user_id = ?',
        [project_id, reviewer_id]
      );

      if (project_check.length === 0) {
        return res.status(403).json({ message: 'You can only review projects you participated in' });
      }

      // For projects, reviewee would be project creator or all participants
      // For now, we'll allow reviewing the project creator
      const [project] = await pool.execute(
        'SELECT creator_id FROM projects WHERE id = ?',
        [project_id]
      );

      if (project.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }

      reviewee_id = project[0].creator_id;
    }

    // Check if user already reviewed this booking/project
    const [existingReview] = await pool.execute(
      'SELECT id FROM reviews WHERE reviewer_id = ? AND ((booking_id = ? AND ? IS NOT NULL) OR (project_id = ? AND ? IS NOT NULL))',
      [reviewer_id, booking_id, booking_id, project_id, project_id]
    );

    if (existingReview.length > 0) {
      return res.status(409).json({ message: 'You have already reviewed this item' });
    }

    // Insert the review
    const [result] = await pool.execute(
      `INSERT INTO reviews (reviewer_id, reviewee_id, booking_id, project_id, rating, review_text, review_type, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [reviewer_id, reviewee_id, booking_id || null, project_id || null, rating, review_text || null, review_type, is_anonymous]
    );

    // Update trust scores
    await updateUserTrustScore(reviewee_id);

    res.status(201).json({
      message: 'Review submitted successfully',
      reviewId: result.insertId
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 10, type } = req.query;

    const pool = getPool();
    let query = `
      SELECT r.*, u.name as reviewer_name, u.profile_image as reviewer_image,
             b.booking_date, b.start_time, b.end_time,
             p.title as project_title
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id AND r.is_anonymous = FALSE
      LEFT JOIN bookings b ON r.booking_id = b.id
      LEFT JOIN projects p ON r.project_id = p.id
      WHERE r.reviewee_id = ? AND r.moderation_status = 'approved'
    `;

    const params = [userId];

    if (type) {
      query += ' AND r.review_type = ?';
      params.push(type);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [reviews] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE reviewee_id = ? AND moderation_status = "approved"';
    const countParams = [userId];

    if (type) {
      countQuery += ' AND review_type = ?';
      countParams.push(type);
    }

    const [countResult] = await pool.execute(countQuery, countParams);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update review response (for reviewee)
router.put('/:reviewId/response', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { error, value } = reviewResponseSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const userId = req.user.userId;
    const { response_text } = value;

    const pool = getPool();

    // Check if user is the reviewee
    const [review] = await pool.execute(
      'SELECT reviewee_id FROM reviews WHERE id = ?',
      [reviewId]
    );

    if (review.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review[0].reviewee_id !== userId) {
      return res.status(403).json({ message: 'You can only respond to reviews about you' });
    }

    // Update the response
    await pool.execute(
      'UPDATE reviews SET response_text = ?, response_created_at = CURRENT_TIMESTAMP WHERE id = ?',
      [response_text, reviewId]
    );

    res.json({ message: 'Response added successfully' });
  } catch (error) {
    console.error('Update review response error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Vote on review helpfulness
router.post('/:reviewId/vote', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { vote_type } = req.body;
    const voterId = req.user.userId;

    if (!['helpful', 'not_helpful'].includes(vote_type)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const pool = getPool();

    // Check if review exists
    const [review] = await pool.execute(
      'SELECT id FROM reviews WHERE id = ?',
      [reviewId]
    );

    if (review.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Insert or update vote
    await pool.execute(
      `INSERT INTO review_votes (review_id, voter_id, vote_type)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE vote_type = VALUES(vote_type), created_at = CURRENT_TIMESTAMP`,
      [reviewId, voterId, vote_type]
    );

    // Update helpful votes count
    const [helpfulCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM review_votes WHERE review_id = ? AND vote_type = "helpful"',
      [reviewId]
    );

    await pool.execute(
      'UPDATE reviews SET helpful_votes = ? WHERE id = ?',
      [helpfulCount[0].count, reviewId]
    );

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Vote on review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Report a review
router.post('/:reviewId/report', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { error, value } = reviewReportSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const reporterId = req.user.userId;
    const { report_reason, report_details } = value;

    const pool = getPool();

    // Check if review exists
    const [review] = await pool.execute(
      'SELECT id FROM reviews WHERE id = ?',
      [reviewId]
    );

    if (review.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Insert report
    await pool.execute(
      `INSERT INTO review_reports (review_id, reporter_id, report_reason, report_details)
       VALUES (?, ?, ?, ?)`,
      [reviewId, reporterId, report_reason, report_details || null]
    );

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Moderate a review (admin/moderator only)
router.put('/:reviewId/moderate', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { moderation_status, moderator_notes } = req.body;
    const moderatorId = req.user.userId;

    if (!['approved', 'rejected'].includes(moderation_status)) {
      return res.status(400).json({ message: 'Invalid moderation status' });
    }

    const pool = getPool();

    // Check if user is a moderator (you might want to add a role system)
    // For now, we'll allow any authenticated user to moderate
    const [review] = await pool.execute(
      'SELECT id FROM reviews WHERE id = ?',
      [reviewId]
    );

    if (review.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update moderation status
    await pool.execute(
      'UPDATE reviews SET moderation_status = ?, moderator_id = ?, is_moderated = TRUE WHERE id = ?',
      [moderation_status, moderatorId, reviewId]
    );

    // If rejected, you might want to notify the reviewer
    // For now, just log the moderation action

    res.json({
      message: `Review ${moderation_status} successfully`,
      moderation_status,
      moderator_notes
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get reported reviews (moderator only)
router.get('/moderation/reports', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'pending' } = req.query;

    const pool = getPool();

    const [reports] = await pool.execute(
      `SELECT rr.*, r.review_text, r.rating, r.created_at as review_created_at,
              u.name as reporter_name, reviewer.name as reviewee_name
       FROM review_reports rr
       JOIN reviews r ON rr.review_id = r.id
       LEFT JOIN users u ON rr.reporter_id = u.id
       LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
       WHERE rr.status = ?
       ORDER BY rr.created_at DESC
       LIMIT ? OFFSET ?`,
      [status, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
    );

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM review_reports WHERE status = ?',
      [status]
    );

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Handle review report (moderator only)
router.put('/reports/:reportId', authenticateToken, async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const { status, resolution_notes } = req.body;
    const moderatorId = req.user.userId;

    if (!['investigated', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const pool = getPool();

    // Update report status
    await pool.execute(
      'UPDATE review_reports SET status = ?, moderator_id = ?, resolution_notes = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, moderatorId, resolution_notes || null, reportId]
    );

    res.json({
      message: 'Report updated successfully',
      status,
      resolution_notes
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's trust score and reputation
router.get('/trust-score/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const pool = getPool();

    const [trustScore] = await pool.execute(
      'SELECT * FROM user_trust_scores WHERE user_id = ?',
      [userId]
    );

    if (trustScore.length === 0) {
      return res.status(404).json({ message: 'Trust score not found' });
    }

    // Get badges
    const [badges] = await pool.execute(
      'SELECT * FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC',
      [userId]
    );

    // Get endorsement count
    const [endorsementCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM skill_endorsements WHERE endorsee_id = ? AND is_public = TRUE',
      [userId]
    );

    res.json({
      trustScore: trustScore[0],
      badges,
      endorsementCount: endorsementCount[0].count
    });
  } catch (error) {
    console.error('Get trust score error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create skill endorsement
router.post('/endorse/:userId', authenticateToken, async (req, res) => {
  try {
    const endorseeId = req.params.userId;
    const endorserId = req.user.userId;

    const { error, value } = endorsementSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const { skill_id, endorsement_text, is_public } = value;

    const pool = getPool();

    // Check if skill belongs to endorsee
    const [skill] = await pool.execute(
      'SELECT id FROM skills WHERE id = ? AND user_id = ?',
      [skill_id, endorseeId]
    );

    if (skill.length === 0) {
      return res.status(404).json({ message: 'Skill not found for this user' });
    }

    // Insert or update endorsement
    await pool.execute(
      `INSERT INTO skill_endorsements (endorser_id, endorsee_id, skill_id, endorsement_text, is_public)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE endorsement_text = VALUES(endorsement_text), is_public = VALUES(is_public), created_at = CURRENT_TIMESTAMP`,
      [endorserId, endorseeId, skill_id, endorsement_text || null, is_public]
    );

    res.status(201).json({ message: 'Endorsement added successfully' });
  } catch (error) {
    console.error('Create endorsement error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get endorsements for a user
router.get('/endorsements/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const pool = getPool();

    const [endorsements] = await pool.execute(
      `SELECT se.*, s.name as skill_name, s.category as skill_category,
              u.name as endorser_name, u.profile_image as endorser_image
       FROM skill_endorsements se
       JOIN skills s ON se.skill_id = s.id
       JOIN users u ON se.endorser_id = u.id
       WHERE se.endorsee_id = ? AND se.is_public = TRUE
       ORDER BY se.created_at DESC`,
      [userId]
    );

    res.json({ endorsements });
  } catch (error) {
    console.error('Get endorsements error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to update trust score
async function updateUserTrustScore(userId) {
  const pool = getPool();

  try {
    // Get all approved reviews for the user
    const [reviews] = await pool.execute(
      'SELECT rating FROM reviews WHERE reviewee_id = ? AND moderation_status = "approved"',
      [userId]
    );

    if (reviews.length === 0) {
      return; // No reviews yet
    }

    const ratingCount = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount;

    // Get completion rate (completed bookings / total bookings as teacher)
    const [completionStats] = await pool.execute(
      `SELECT
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_sessions
       FROM bookings WHERE teacher_id = ?`,
      [userId]
    );

    const totalSessions = completionStats[0].total_sessions || 0;
    const completedSessions = completionStats[0].completed_sessions || 0;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Calculate overall trust score (weighted average)
    // 50% rating, 30% completion rate, 20% other factors
    const trustScore = (averageRating * 0.5) + ((completionRate / 100) * 5 * 0.3) + (3.0 * 0.2);

    // Update trust score
    await pool.execute(
      `INSERT INTO user_trust_scores (user_id, overall_score, rating_count, average_rating, completion_rate, total_sessions, successful_sessions, last_calculated)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE
       overall_score = VALUES(overall_score),
       rating_count = VALUES(rating_count),
       average_rating = VALUES(average_rating),
       completion_rate = VALUES(completion_rate),
       total_sessions = VALUES(total_sessions),
       successful_sessions = VALUES(successful_sessions),
       last_calculated = CURRENT_TIMESTAMP`,
      [userId, trustScore, ratingCount, averageRating, completionRate, totalSessions, completedSessions]
    );

    // Check for badge achievements
    await checkBadgeAchievements(userId, trustScore, ratingCount, completedSessions);

  } catch (error) {
    console.error('Update trust score error:', error);
  }
}

// Helper function to check and award badges
async function checkBadgeAchievements(userId, trustScore, ratingCount, completedSessions) {
  const pool = getPool();

  try {
    // Bronze badges
    if (ratingCount >= 1 && !(await hasBadge(userId, 'First Review'))) {
      await awardBadge(userId, 'bronze', 'First Review', 'Received your first review');
    }

    if (completedSessions >= 1 && !(await hasBadge(userId, 'First Session'))) {
      await awardBadge(userId, 'bronze', 'First Session', 'Completed your first skill-sharing session');
    }

    if (ratingCount >= 5 && !(await hasBadge(userId, 'Reviewer'))) {
      await awardBadge(userId, 'bronze', 'Reviewer', 'Received 5 reviews');
    }

    // Silver badges
    if (trustScore >= 4.0 && !(await hasBadge(userId, 'Trusted Teacher'))) {
      await awardBadge(userId, 'silver', 'Trusted Teacher', 'Maintained a 4.0+ trust score');
    }

    if (completedSessions >= 10 && !(await hasBadge(userId, 'Experienced'))) {
      await awardBadge(userId, 'silver', 'Experienced', 'Completed 10 sessions');
    }

    // Gold badges
    if (trustScore >= 4.5 && !(await hasBadge(userId, 'Highly Trusted'))) {
      await awardBadge(userId, 'gold', 'Highly Trusted', 'Maintained a 4.5+ trust score');
    }

    if (completedSessions >= 50 && !(await hasBadge(userId, 'Expert'))) {
      await awardBadge(userId, 'gold', 'Expert', 'Completed 50 sessions');
    }

    // Platinum badges
    if (trustScore >= 4.8 && !(await hasBadge(userId, 'Master Teacher'))) {
      await awardBadge(userId, 'platinum', 'Master Teacher', 'Achieved a 4.8+ trust score');
    }

  } catch (error) {
    console.error('Check badge achievements error:', error);
  }
}

// Helper function to check if user has a badge
async function hasBadge(userId, badgeName) {
  const pool = getPool();
  const [badges] = await pool.execute(
    'SELECT id FROM user_badges WHERE user_id = ? AND badge_name = ?',
    [userId, badgeName]
  );
  return badges.length > 0;
}

// Helper function to award a badge
async function awardBadge(userId, badgeType, badgeName, badgeDescription) {
  const pool = getPool();
  await pool.execute(
    'INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description) VALUES (?, ?, ?, ?)',
    [userId, badgeType, badgeName, badgeDescription]
  );
}

// Get user's review analytics
router.get('/analytics/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user is requesting their own analytics or is admin
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pool = getPool();

    // Get review statistics
    const [stats] = await pool.execute(
      `SELECT
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews,
        COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_reviews
       FROM reviews
       WHERE reviewee_id = ? AND moderation_status = 'approved'`,
      [userId]
    );

    // Get monthly review trends
    const [monthlyTrends] = await pool.execute(
      `SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as review_count,
        AVG(rating) as avg_rating
       FROM reviews
       WHERE reviewee_id = ? AND moderation_status = 'approved'
         AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC`,
      [userId]
    );

    // Get rating distribution
    const [ratingDistribution] = await pool.execute(
      `SELECT
        rating,
        COUNT(*) as count
       FROM reviews
       WHERE reviewee_id = ? AND moderation_status = 'approved'
       GROUP BY rating
       ORDER BY rating DESC`,
      [userId]
    );

    res.json({
      statistics: stats[0],
      monthlyTrends,
      ratingDistribution
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;