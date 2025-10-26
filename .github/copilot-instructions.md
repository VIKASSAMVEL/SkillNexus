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

## SkillNexus: Hyperlocal Talent Sharing Platform

Full-stack platform connecting users with local skill providers. React 18+ frontend with Material-UI, Node.js/Express backend with Socket.io real-time features, MySQL database with complex relationships and location-based queries.

### Architecture Patterns

**Database Layer:**
- Connection pooling via `mysql2` in `backend/config/database.js`
- Haversine formula for location queries: `6371 * acos(cos(radians(?)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians(?)) + sin(radians(?)) * sin(radians(u.latitude))) <= ?`
- Foreign key constraints with CASCADE/SET NULL policies
- Prepared statements for all queries to prevent SQL injection

**API Layer:**
- Joi validation schemas for all request bodies (see `backend/routes/skills.js`)
- JWT authentication middleware (`authenticateToken`)
- Consistent response format: `{ message: string, data?: any }`
- Rate limiting and CORS configured in `backend/server.js`

**Frontend Patterns:**
- Axios interceptors for JWT token management in `frontend/src/services/api.js`
- Material-UI `sx` prop for component styling
- Dark theme configuration in `frontend/src/App.js`
- React Router with protected routes

**Real-time Features:**
- Socket.io rooms for session isolation: `session-${sessionId}`
- WebRTC signaling: `offer`/`answer`/`ice-candidate` events
- Collaborative whiteboard with stroke data in JSON format

### Critical Workflows

**Local Development:**
```bash
# Database setup (XAMPP/MySQL required)
mysql -u root -e "CREATE DATABASE urban_skill_exchange;"
mysql -u root urban_skill_exchange < database/schema.sql

# Backend (port 5000)
cd backend && npm install && npm run dev

# Frontend (port 3000)
cd frontend && npm install && npm start
```

**Google Maps Integration:**
- API key in `frontend/src/components/SkillsMap.js`
- `@googlemaps/js-api-loader` for dynamic loading
- Location filtering with radius in kilometers

### Project-Specific Conventions

**Database Queries:**
```javascript
// Location-based filtering pattern
const [skills] = await pool.execute(`
  SELECT s.*, u.name, u.location,
         6371 * acos(cos(radians(?)) * cos(radians(u.latitude)) *
         cos(radians(u.longitude) - radians(?)) + sin(radians(?)) * sin(radians(u.latitude))) as distance
  FROM skills s JOIN users u ON s.user_id = u.id
  WHERE distance <= ?
  ORDER BY distance`, [lat, lng, lat, radius]);
```

**API Route Structure:**
```javascript
// Validation + database pattern (backend/routes/skills.js)
const { error, value } = skillSchema.validate(req.body);
if (error) return res.status(400).json({ message: 'Validation error', error: error.details[0].message });

const [result] = await pool.execute('INSERT INTO skills (user_id, name) VALUES (?, ?)', [userId, value.name]);
res.status(201).json({ message: 'Skill created', skillId: result.insertId });
```

**Component Patterns:**
```javascript
// MUI component with async data (frontend/src/components/SkillCard.js)
const SkillCard = ({ skill, onSelect }) => (
  <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
    <Typography variant="h6">{skill.name}</Typography>
    <Button variant="contained" onClick={() => onSelect(skill)}>Book Now</Button>
  </Card>
);
```

**Socket Events:**
```javascript
// Real-time session pattern (backend/server.js)
socket.on('join-session', (sessionId) => {
  socket.join(`session-${sessionId}`);
  socket.to(`session-${sessionId}`).emit('user-joined', { userId: socket.id });
});
```

### Key Files & Data Models

**Core Tables:** `users`, `skills`, `bookings`, `sessions`, `projects`, `reviews`, `user_credits`
**API Routes:** `/auth`, `/skills`, `/bookings`, `/sessions`, `/projects`, `/reviews`
**Frontend:** `pages/` for routes, `components/` for UI, `services/api.js` for HTTP calls

### Common Pitfalls

- JWT tokens expire after 7 days (no refresh mechanism)
- Google Maps requires billing enabled even for free tier
- WebRTC requires HTTPS in production
- Database foreign key constraints prevent orphaned records
- Socket.io CORS must include frontend URL

### Business Logic Notes

- Credits system: earned from completed sessions, spent on bookings
- Trust scores: calculated from ratings, completion rates, response times
- Booking conflicts: detected via overlapping time slots
- Location matching: Haversine formula with configurable radius (default 10km)
- Session analytics: tracks user actions, file sharing, whiteboard usage
