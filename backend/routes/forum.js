const express = require('express');
const Joi = require('joi');
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const topicSchema = Joi.object({
  title: Joi.string().min(5).max(255).required(),
  content: Joi.string().min(10).max(5000).required(),
  category: Joi.string().valid('general', 'skills', 'projects', 'help', 'announcements').default('general')
});

const replySchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  parent_reply_id: Joi.number().integer().optional()
});

const likeSchema = Joi.object({
  content_type: Joi.string().valid('topic', 'reply').required(),
  content_id: Joi.number().integer().required(),
  like_type: Joi.string().valid('like', 'dislike').default('like')
});

// Get all forum topics with optional filtering
router.get('/topics', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0, sort = 'latest' } = req.query;
    const pool = getPool();

    let query = `
      SELECT t.*, u.name as author_name, u.profile_image as author_image,
             COALESCE(r.total_replies, 0) as reply_count,
             COALESCE(l.total_likes, 0) as like_count
      FROM forum_topics t
      JOIN users u ON t.author_id = u.id
      LEFT JOIN (
        SELECT topic_id, COUNT(*) as total_replies
        FROM forum_replies
        GROUP BY topic_id
      ) r ON t.id = r.topic_id
      LEFT JOIN (
        SELECT content_id, COUNT(*) as total_likes
        FROM forum_likes
        WHERE content_type = 'topic' AND like_type = 'like'
        GROUP BY content_id
      ) l ON t.id = l.content_id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND t.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (t.title LIKE ? OR t.content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Sort options
    switch (sort) {
      case 'oldest':
        query += ' ORDER BY t.created_at ASC';
        break;
      case 'most_replies':
        query += ' ORDER BY COALESCE(r.total_replies, 0) DESC, t.created_at DESC';
        break;
      case 'most_likes':
        query += ' ORDER BY COALESCE(l.total_likes, 0) DESC, t.created_at DESC';
        break;
      case 'latest':
      default:
        query += ' ORDER BY t.is_pinned DESC, t.last_reply_at DESC, t.created_at DESC';
        break;
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [topics] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM forum_topics t WHERE 1=1';
    const countParams = [];

    if (category && category !== 'all') {
      countQuery += ' AND t.category = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (t.title LIKE ? OR t.content LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const [countResult] = await pool.execute(countQuery, countParams);

    res.json({
      topics,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < countResult[0].total
      }
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single topic with replies
router.get('/topics/:id', async (req, res) => {
  try {
    const topicId = req.params.id;
    const pool = getPool();

    // Update view count
    await pool.execute(
      'UPDATE forum_topics SET view_count = view_count + 1 WHERE id = ?',
      [topicId]
    );

    // Get topic details
    const [topics] = await pool.execute(
      `SELECT t.*, u.name as author_name, u.profile_image as author_image,
              u.bio as author_bio, u.location as author_location
       FROM forum_topics t
       JOIN users u ON t.author_id = u.id
       WHERE t.id = ?`,
      [topicId]
    );

    if (topics.length === 0) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const topic = topics[0];

    // Get replies
    const [replies] = await pool.execute(
      `SELECT r.*, u.name as author_name, u.profile_image as author_image,
              COALESCE(l.like_count, 0) as like_count,
              COALESCE(l.dislike_count, 0) as dislike_count
       FROM forum_replies r
       JOIN users u ON r.author_id = u.id
       LEFT JOIN (
         SELECT content_id,
                SUM(CASE WHEN like_type = 'like' THEN 1 ELSE 0 END) as like_count,
                SUM(CASE WHEN like_type = 'dislike' THEN 1 ELSE 0 END) as dislike_count
         FROM forum_likes
         WHERE content_type = 'reply'
         GROUP BY content_id
       ) l ON r.id = l.content_id
       WHERE r.topic_id = ?
       ORDER BY r.created_at ASC`,
      [topicId]
    );

    // Get user's like status if authenticated
    let userLikes = {};
    if (req.user) {
      const [likes] = await pool.execute(
        `SELECT content_type, content_id, like_type
         FROM forum_likes
         WHERE user_id = ? AND ((content_type = 'topic' AND content_id = ?) OR (content_type = 'reply' AND content_id IN (SELECT id FROM forum_replies WHERE topic_id = ?)))`,
        [req.user.userId, topicId, topicId]
      );

      likes.forEach(like => {
        userLikes[`${like.content_type}_${like.content_id}`] = like.like_type;
      });
    }

    res.json({
      topic,
      replies,
      userLikes
    });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new topic (authenticated users only)
router.post('/topics', authenticateToken, async (req, res) => {
  try {
    const { error, value } = topicSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const topicData = {
      ...value,
      author_id: req.user.userId
    };

    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO forum_topics (title, content, author_id, category)
       VALUES (?, ?, ?, ?)`,
      [
        topicData.title,
        topicData.content,
        topicData.author_id,
        topicData.category
      ]
    );

    res.status(201).json({
      message: 'Topic created successfully',
      topicId: result.insertId
    });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create reply to topic (authenticated users only)
router.post('/topics/:topicId/replies', authenticateToken, async (req, res) => {
  try {
    const topicId = req.params.topicId;
    const { error, value } = replySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const pool = getPool();

    // Check if topic exists and is not locked
    const [topics] = await pool.execute(
      'SELECT id, is_locked FROM forum_topics WHERE id = ?',
      [topicId]
    );

    if (topics.length === 0) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (topics[0].is_locked) {
      return res.status(403).json({ message: 'This topic is locked' });
    }

    // Check parent reply if specified
    if (value.parent_reply_id) {
      const [parentReplies] = await pool.execute(
        'SELECT id FROM forum_replies WHERE id = ? AND topic_id = ?',
        [value.parent_reply_id, topicId]
      );

      if (parentReplies.length === 0) {
        return res.status(400).json({ message: 'Parent reply not found in this topic' });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO forum_replies (topic_id, content, author_id, parent_reply_id)
       VALUES (?, ?, ?, ?)`,
      [
        topicId,
        value.content,
        req.user.userId,
        value.parent_reply_id || null
      ]
    );

    // Update topic's reply count and last reply info
    await pool.execute(
      `UPDATE forum_topics
       SET reply_count = reply_count + 1,
           last_reply_at = CURRENT_TIMESTAMP,
           last_reply_user_id = ?
       WHERE id = ?`,
      [req.user.userId, topicId]
    );

    res.status(201).json({
      message: 'Reply created successfully',
      replyId: result.insertId
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like/unlike topic or reply (authenticated users only)
router.post('/like', authenticateToken, async (req, res) => {
  try {
    const { error, value } = likeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const { content_type, content_id, like_type } = value;
    const pool = getPool();

    // Check if content exists
    let tableName, idField;
    if (content_type === 'topic') {
      tableName = 'forum_topics';
      idField = 'id';
    } else if (content_type === 'reply') {
      tableName = 'forum_replies';
      idField = 'id';
    } else {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    const [existingContent] = await pool.execute(
      `SELECT ${idField} FROM ${tableName} WHERE ${idField} = ?`,
      [content_id]
    );

    if (existingContent.length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user already liked this content
    const [existingLikes] = await pool.execute(
      'SELECT id, like_type FROM forum_likes WHERE user_id = ? AND content_type = ? AND content_id = ?',
      [req.user.userId, content_type, content_id]
    );

    if (existingLikes.length > 0) {
      // User already has a like/dislike - update it
      if (existingLikes[0].like_type === like_type) {
        // Same type - remove the like
        await pool.execute(
          'DELETE FROM forum_likes WHERE id = ?',
          [existingLikes[0].id]
        );
        res.json({ message: 'Like removed successfully' });
      } else {
        // Different type - update it
        await pool.execute(
          'UPDATE forum_likes SET like_type = ? WHERE id = ?',
          [like_type, existingLikes[0].id]
        );
        res.json({ message: 'Like updated successfully' });
      }
    } else {
      // No existing like - create new one
      await pool.execute(
        'INSERT INTO forum_likes (user_id, content_type, content_id, like_type) VALUES (?, ?, ?, ?)',
        [req.user.userId, content_type, content_id, like_type]
      );
      res.json({ message: 'Like added successfully' });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get forum statistics
router.get('/stats', async (req, res) => {
  try {
    const pool = getPool();

    const [topicStats] = await pool.execute(
      'SELECT COUNT(*) as total_topics, SUM(view_count) as total_views FROM forum_topics'
    );

    const [replyStats] = await pool.execute(
      'SELECT COUNT(*) as total_replies FROM forum_replies'
    );

    const [userStats] = await pool.execute(
      'SELECT COUNT(DISTINCT author_id) as active_users FROM forum_topics'
    );

    const [categoryStats] = await pool.execute(
      `SELECT category, COUNT(*) as count
       FROM forum_topics
       GROUP BY category
       ORDER BY count DESC`
    );

    res.json({
      totalTopics: topicStats[0].total_topics || 0,
      totalViews: topicStats[0].total_views || 0,
      totalReplies: replyStats[0].total_replies || 0,
      activeUsers: userStats[0].active_users || 0,
      categories: categoryStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get forum categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'general', name: 'General Discussion', description: 'General topics and community discussions' },
      { id: 'skills', name: 'Skills & Learning', description: 'Questions about skills, learning techniques, and tutoring' },
      { id: 'projects', name: 'Projects & Collaboration', description: 'Project ideas, collaboration opportunities, and team formation' },
      { id: 'help', name: 'Help & Support', description: 'Get help with platform features and technical issues' },
      { id: 'announcements', name: 'Announcements', description: 'Official announcements and platform updates' }
    ];

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;