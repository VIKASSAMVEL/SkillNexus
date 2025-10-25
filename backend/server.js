const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join session room
  socket.on('join-session', (sessionId) => {
    socket.join(`session-${sessionId}`);
    console.log(`User ${socket.id} joined session ${sessionId}`);
    socket.to(`session-${sessionId}`).emit('user-joined', { 
      userId: socket.id 
    });
  });

  // Leave session room
  socket.on('leave-session', (sessionId) => {
    socket.leave(`session-${sessionId}`);
    console.log(`User ${socket.id} left session ${sessionId}`);
    socket.to(`session-${sessionId}`).emit('user-left', { userId: socket.id });
  });

  // Chat messages
  socket.on('send-message', (data) => {
    const { sessionId, message, senderId, senderName } = data;
    io.to(`session-${sessionId}`).emit('receive-message', {
      message,
      senderId,
      senderName,
      timestamp: new Date()
    });
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    socket.to(`session-${data.sessionId}`).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(`session-${data.sessionId}`).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(`session-${data.sessionId}`).emit('ice-candidate', data);
  });

  // Whiteboard events
  socket.on('whiteboard-draw', (data) => {
    socket.to(`session-${data.sessionId}`).emit('whiteboard-draw', data);
  });

  socket.on('whiteboard-clear', (data) => {
    socket.to(`session-${data.sessionId}`).emit('whiteboard-clear', data);
  });

  // File sharing
  socket.on('file-shared', (data) => {
    io.to(`session-${data.sessionId}`).emit('file-shared', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'SkillNexus API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };