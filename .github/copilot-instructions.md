[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase

## SkillNexus Platform Development Guide

SkillNexus is a full-stack web platform for hyperlocal talent sharing, enabling users to connect with local skill providers for learning, consulting, and collaborative projects.

### Architecture Overview

**Tech Stack:**
- **Frontend**: React 18+ with Material-UI (MUI) components, React Router, Axios for API calls
- **Backend**: Node.js/Express with Socket.io for real-time features
- **Database**: MySQL with connection pooling (mysql2)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time**: Socket.io for chat, video sessions, and collaborative whiteboard
- **Maps**: Google Maps API for location-based skill discovery
- **Validation**: Joi schemas for request validation

**Core Components:**
- User management with profiles, verification, and reputation system
- Skills marketplace with location-based filtering (Haversine formula)
- Booking system with calendar integration and conflict detection
- Community projects for collaborative work
- Credit/incentive system with transaction tracking
- Real-time sessions with video, chat, and file sharing

### Critical Development Workflows

**Local Development Setup:**
```bash
# Database (requires XAMPP or MySQL server)
mysql -u root -e "CREATE DATABASE urban_skill_exchange;"
mysql -u root urban_skill_exchange < database/schema.sql

# Backend
cd backend && npm install
cp .env.example .env  # Configure DB credentials, JWT_SECRET
npm run dev  # Uses nodemon for auto-restart

# Frontend (new terminal)
cd frontend && npm install
npm start  # Runs on localhost:3000
```

**Google Maps Integration:**
- API key required in `frontend/src/components/SkillsMap.js` (currently hardcoded for testing)
- Enable Maps JavaScript API in Google Cloud Console
- Configure HTTP referrer restrictions for localhost:3000
- Uses `@googlemaps/js-api-loader` for dynamic script loading

**Database Operations:**
- Use connection pooling via `config/database.js`
- Prepared statements for all queries to prevent SQL injection
- Location queries use Haversine formula for distance calculation
- Foreign key constraints ensure data integrity

### Project-Specific Conventions

**Frontend Patterns:**
- Dark theme by default (`palette.mode: 'dark'` in theme)
- Material-UI components with custom styling via `sx` prop
- Axios interceptors handle JWT auth and token refresh
- Error boundaries and loading states for all async operations
- Component structure: `pages/` for routes, `components/` for reusable UI

**Backend Patterns:**
- Express routes mounted under `/api` prefix
- `authenticateToken` middleware for protected routes
- Joi validation schemas for all request bodies
- Async/await with try/catch error handling
- Consistent JSON response format with `message` and data fields

**Real-time Features:**
- Socket.io rooms for session isolation (`session-${sessionId}`)
- WebRTC signaling for video calls (offer/answer/ICE candidates)
- Whiteboard events for collaborative drawing
- File sharing with metadata tracking

**Data Models:**
- Users with location (lat/lng), bio, verification status
- Skills with pricing (per hour/session), availability, proficiency levels
- Bookings with recurring patterns and timezone support
- Reviews with moderation, voting, and trust score calculation
- Credits with transaction history and balance tracking

### Common Implementation Patterns

**API Calls:**
```javascript
// Frontend API service pattern
import api from '../services/api';

// GET request
const skills = await api.get('/skills', { params: { category: 'Technology' } });

// POST with auth
const newSkill = await api.post('/skills', skillData);
```

**Database Queries:**
```javascript
// Backend pattern with connection pooling
const pool = getPool();
const [rows] = await pool.execute(
  'SELECT * FROM skills WHERE user_id = ? AND is_available = ?',
  [userId, true]
);
```

**Component Structure:**
```javascript
// Typical React component with MUI
import { Box, Typography, Button } from '@mui/material';

const SkillCard = ({ skill, onSelect }) => (
  <Box sx={{ p: 2, border: 1, borderRadius: 1 }}>
    <Typography variant="h6">{skill.name}</Typography>
    <Button onClick={() => onSelect(skill)}>Book Now</Button>
  </Box>
);
```

**Socket Events:**
```javascript
// Real-time messaging pattern
socket.on('send-message', (data) => {
  io.to(`session-${data.sessionId}`).emit('receive-message', {
    message: data.message,
    senderId: data.senderId,
    timestamp: new Date()
  });
});
```

### Key Files and Directories

- `backend/server.js`: Main Express app with Socket.io setup
- `backend/routes/`: API endpoints organized by feature
- `backend/config/database.js`: MySQL connection pooling
- `frontend/src/App.js`: React Router configuration
- `frontend/src/services/api.js`: Axios instance with interceptors
- `database/schema.sql`: Complete database structure
- `frontend/src/components/SkillsMap.js`: Google Maps integration example

### Testing and Validation

**API Testing:**
- Use Postman for endpoint testing
- JWT tokens required for authenticated routes
- Test location-based queries with lat/lng parameters

**Component Testing:**
- React Testing Library for component tests
- Mock API calls for isolated testing
- Test loading and error states

**Database Testing:**
- Use separate test database
- Seed with sample data from schema.sql
- Test foreign key constraints and transactions

### Deployment Considerations

**Environment Variables:**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database connection
- `JWT_SECRET`: Secure random string for token signing
- `GOOGLE_MAPS_API_KEY`: For location features
- `FRONTEND_URL`: CORS configuration

**Production Setup:**
- HTTPS required for WebRTC and geolocation
- Database connection limits and timeouts
- Socket.io clustering for scalability
- File upload limits and storage (currently local)

### Troubleshooting Common Issues

**Database Connection:**
- Ensure XAMPP MySQL is running on port 3306
- Check credentials in `backend/.env`
- Use `mysql -u root -p` to verify connection

**Google Maps:**
- API key must have Maps JavaScript API enabled
- Billing enabled in Google Cloud (required even for free tier)
- Check browser console for API errors

**Socket.io:**
- CORS configuration must include frontend URL
- Check server logs for connection errors
- WebRTC requires HTTPS in production

**JWT Auth:**
- Tokens expire in 7 days by default
- Refresh tokens not implemented (consider adding)
- Password reset functionality not implemented

### Future Enhancements (Planned)

- AI-powered skill matching and recommendations
- Video calling with screen sharing
- Advanced reputation system with badges
- Community projects with milestones
- Mobile app with React Native
- Payment integration for monetization
