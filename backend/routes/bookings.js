const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { getPool } = require('../config/database');
const { authenticateToken } = require('./auth');

// Validation schemas
const bookingSchema = Joi.object({
  teacher_id: Joi.number().integer().required(),
  skill_id: Joi.number().integer().required(),
  booking_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  duration_hours: Joi.number().min(0.5).max(8).optional(),
  notes: Joi.string().max(1000).allow('').optional()
});

const availabilitySchema = Joi.object({
  day_of_week: Joi.string().valid('monday','tuesday','wednesday','thursday','friday','saturday','sunday').required(),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  is_available: Joi.boolean().default(true)
});

// Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const student_id = req.user.userId;
    const { teacher_id, skill_id, booking_date, start_time, end_time, duration_hours, notes } = value;

    const pool = getPool();

    // Check if skill belongs to teacher
    const [skills] = await pool.execute(
      'SELECT id, price_per_hour, price_per_session FROM skills WHERE id = ? AND user_id = ? AND is_available = TRUE',
      [skill_id, teacher_id]
    );

    if (skills.length === 0) {
      return res.status(404).json({ message: 'Skill not found or not available' });
    }

    const skill = skills[0];

    // Check if teacher has availability for this time slot
    const bookingDate = new Date(booking_date + 'T00:00:00');
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: 'Invalid booking date format' });
    }
    
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayIndex = bookingDate.getDay();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[dayIndex];
    
    // Pad times with seconds if needed
    const startTimePadded = start_time.length === 5 ? start_time + ':00' : start_time;
    const endTimePadded = end_time.length === 5 ? end_time + ':00' : end_time;
    
    const [availability] = await pool.execute(
      'SELECT id FROM availability WHERE user_id = ? AND day_of_week = ? AND start_time <= ? AND end_time >= ? AND is_available = TRUE',
      [teacher_id, dayOfWeek, startTimePadded, endTimePadded]
    );

    if (availability.length === 0) {
      return res.status(400).json({ message: 'Teacher is not available at this time' });
    }

    // Check for conflicting bookings
    const [conflicts] = await pool.execute(
      'SELECT id FROM bookings WHERE teacher_id = ? AND booking_date = ? AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?)) AND status IN ("pending", "confirmed")',
      [teacher_id, booking_date, startTimePadded, startTimePadded, endTimePadded, endTimePadded]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Calculate duration and price
    const start = new Date(`1970-01-01T${startTimePadded}`);
    const end = new Date(`1970-01-01T${endTimePadded}`);
    const calculatedDuration = (end - start) / (1000 * 60 * 60); // hours
    const finalDuration = duration_hours || calculatedDuration;
    const totalPrice = skill.price_per_hour ? skill.price_per_hour * finalDuration : skill.price_per_session || 0;

    // Check student credits
    const [studentCredits] = await pool.execute(
      'SELECT balance FROM user_credits WHERE user_id = ?',
      [student_id]
    );

    if (studentCredits.length === 0 || studentCredits[0].balance < totalPrice) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    // Create booking
    const [result] = await pool.execute(
      `INSERT INTO bookings (student_id, teacher_id, skill_id, booking_date, start_time, end_time, duration_hours, total_price, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, teacher_id, skill_id, booking_date, startTimePadded, endTimePadded, finalDuration, totalPrice, notes || null]
    );

    // Deduct credits from student
    await pool.execute(
      'UPDATE user_credits SET balance = balance - ?, total_spent = total_spent + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [totalPrice, totalPrice, student_id]
    );

    // Add credits to teacher (hold until completion)
    await pool.execute(
      'UPDATE user_credits SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [totalPrice, teacher_id]
    );

    // Record transactions
    await pool.execute(
      `INSERT INTO credit_transactions (user_id, amount, transaction_type, description, reference_id, reference_type)
       VALUES (?, ?, 'spent', 'Booking payment', ?, 'booking')`,
      [student_id, totalPrice, result.insertId]
    );

    await pool.execute(
      `INSERT INTO credit_transactions (user_id, amount, transaction_type, description, reference_id, reference_type)
       VALUES (?, ?, 'earned', 'Booking earnings', ?, 'booking')`,
      [teacher_id, totalPrice, result.insertId]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertId,
      totalPrice
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's bookings (as student or teacher)
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, role = 'both' } = req.query; // role: 'student', 'teacher', 'both'

    const pool = getPool();
    let query = `
      SELECT b.*, s.name as skill_name, s.category as skill_category,
             student.name as student_name, teacher.name as teacher_name,
             teacher.email as teacher_email, student.email as student_email
      FROM bookings b
      JOIN skills s ON b.skill_id = s.id
      JOIN users student ON b.student_id = student.id
      JOIN users teacher ON b.teacher_id = teacher.id
      WHERE (b.student_id = ? OR b.teacher_id = ?)
    `;
    const params = [userId, userId];

    if (role === 'student') {
      query = query.replace('WHERE (b.student_id = ? OR b.teacher_id = ?)', 'WHERE b.student_id = ?');
      params.splice(1, 1);
    } else if (role === 'teacher') {
      query = query.replace('WHERE (b.student_id = ? OR b.teacher_id = ?)', 'WHERE b.teacher_id = ?');
      params.splice(0, 1);
    }

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.booking_date DESC, b.start_time DESC';

    const [bookings] = await pool.execute(query, params);

    res.json({ bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.userId;

    const pool = getPool();
    const [bookings] = await pool.execute(
      `SELECT b.*, s.name as skill_name, s.category as skill_category, s.description as skill_description,
              student.name as student_name, student.email as student_email,
              teacher.name as teacher_name, teacher.email as teacher_email
       FROM bookings b
       JOIN skills s ON b.skill_id = s.id
       JOIN users student ON b.student_id = student.id
       JOIN users teacher ON b.teacher_id = teacher.id
       WHERE b.id = ? AND (b.student_id = ? OR b.teacher_id = ?)`,
      [bookingId, userId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking: bookings[0] });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update booking status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.userId;
    const { status, notes } = req.body;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const pool = getPool();

    // Check if user is involved in this booking
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ? AND (student_id = ? OR teacher_id = ?)',
      [bookingId, userId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    // Only teacher can confirm, only teacher can complete, both can cancel
    if (status === 'confirmed' && booking.teacher_id !== userId) {
      return res.status(403).json({ message: 'Only teacher can confirm booking' });
    }
    if (status === 'completed' && booking.teacher_id !== userId) {
      return res.status(403).json({ message: 'Only teacher can mark booking as completed' });
    }

    // Update booking status
    await pool.execute(
      'UPDATE bookings SET status = ?, notes = CONCAT(IFNULL(notes, ""), ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, notes ? `\n[${new Date().toISOString()}] ${notes}` : '', bookingId]
    );

    // Handle credit refunds for cancellations
    if (status === 'cancelled' && booking.status !== 'completed') {
      // Refund student
      await pool.execute(
        'UPDATE user_credits SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [booking.total_price, booking.student_id]
      );

      // Deduct from teacher
      await pool.execute(
        'UPDATE user_credits SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [booking.total_price, booking.teacher_id]
      );

      // Record refund transactions
      await pool.execute(
        `INSERT INTO credit_transactions (user_id, amount, transaction_type, description, reference_id, reference_type)
         VALUES (?, ?, 'refund', 'Booking cancellation refund', ?, 'booking')`,
        [booking.student_id, booking.total_price, bookingId]
      );
    }

    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Availability management

// Get user's availability
router.get('/availability/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = getPool();

    const [availability] = await pool.execute(
      'SELECT * FROM availability WHERE user_id = ? ORDER BY FIELD(day_of_week, "monday","tuesday","wednesday","thursday","friday","saturday","sunday"), start_time',
      [userId]
    );

    res.json({ availability });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add availability slot
router.post('/availability', authenticateToken, async (req, res) => {
  try {
    const { error, value } = availabilitySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const userId = req.user.userId;
    const { day_of_week, start_time, end_time, is_available } = value;

    // Validate time range
    if (start_time >= end_time) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const pool = getPool();

    // Check for overlapping slots
    const [overlaps] = await pool.execute(
      'SELECT id FROM availability WHERE user_id = ? AND day_of_week = ? AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))',
      [userId, day_of_week, start_time, start_time, end_time, end_time]
    );

    if (overlaps.length > 0) {
      return res.status(400).json({ message: 'Time slot overlaps with existing availability' });
    }

    const [result] = await pool.execute(
      'INSERT INTO availability (user_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)',
      [userId, day_of_week, start_time, end_time, is_available]
    );

    res.status(201).json({
      message: 'Availability slot added successfully',
      availabilityId: result.insertId
    });
  } catch (error) {
    console.error('Add availability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update availability slot
router.put('/availability/:id', authenticateToken, async (req, res) => {
  try {
    const slotId = req.params.id;
    const userId = req.user.userId;
    const { start_time, end_time, is_available } = req.body;

    const pool = getPool();

    // Check ownership
    const [slots] = await pool.execute(
      'SELECT id FROM availability WHERE id = ? AND user_id = ?',
      [slotId, userId]
    );

    if (slots.length === 0) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    let updateFields = [];
    let updateValues = [];

    if (start_time !== undefined) {
      updateFields.push('start_time = ?');
      updateValues.push(start_time);
    }
    if (end_time !== undefined) {
      updateFields.push('end_time = ?');
      updateValues.push(end_time);
    }
    if (is_available !== undefined) {
      updateFields.push('is_available = ?');
      updateValues.push(is_available);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(slotId);
    const query = `UPDATE availability SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    await pool.execute(query, updateValues);

    res.json({ message: 'Availability slot updated successfully' });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete availability slot
router.delete('/availability/:id', authenticateToken, async (req, res) => {
  try {
    const slotId = req.params.id;
    const userId = req.user.userId;

    const pool = getPool();

    const [result] = await pool.execute(
      'DELETE FROM availability WHERE id = ? AND user_id = ?',
      [slotId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    res.json({ message: 'Availability slot deleted successfully' });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get teacher's availability for booking
router.get('/availability/:teacherId', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { date } = req.query;

    const pool = getPool();

    if (date) {
      // Get availability for specific date
      const dateObj = new Date(date + 'T00:00:00');
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      
      // Get day of week (0 = Sunday, 1 = Monday, etc.)
      const dayIndex = dateObj.getDay();
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = daysOfWeek[dayIndex];
      
      const [availability] = await pool.execute(
        'SELECT * FROM availability WHERE user_id = ? AND day_of_week = ? AND is_available = TRUE ORDER BY start_time',
        [teacherId, dayOfWeek]
      );

      // Get existing bookings for this date
      const [bookings] = await pool.execute(
        'SELECT start_time, end_time FROM bookings WHERE teacher_id = ? AND booking_date = ? AND status IN ("pending", "confirmed")',
        [teacherId, date]
      );

      res.json({ availability, bookings });
    } else {
      // Get all availability
      const [availability] = await pool.execute(
        'SELECT * FROM availability WHERE user_id = ? ORDER BY FIELD(day_of_week, "monday","tuesday","wednesday","thursday","friday","saturday","sunday"), start_time',
        [teacherId]
      );

      res.json({ availability });
    }
  } catch (error) {
    console.error('Get teacher availability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;