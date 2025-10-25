# Urban Skill Exchange: A Full-Stack Platform for Hyperlocal Talent Sharing

## Project Overview

**Automatic Zoom WEB HACKATHON**

This project is developed as part of the WEB HACKATHON challenge to address the need for a streamlined, trustworthy platform for hyperlocal talent sharing in urban environments. The platform enables users to create profiles, list their skills or learning needs, and connect with others in their locality for skill exchange, micro-consulting, or collaborative projects.

## Problem Statement

In rapidly growing urban environments, many individuals possess unique skills—ranging from digital expertise to traditional crafts, tutoring, fitness, or language abilities—but lack a streamlined, trustworthy way to share or monetize these skills within their immediate communities. Conversely, residents often seek local, affordable, and verified help or learning opportunities but struggle to connect with the right people in their vicinity.

## Challenge

Build a full-stack web platform that enables users to create profiles, list their skills or learning needs, and connect with others in their locality for skill exchange, micro-consulting, or collaborative projects.

## Core Platform Features

### 1. User Authentication & Verification
- Secure sign-up/login
- Optional identity verification
- Skill validation through peer reviews or digital badges

### 2. Geo-Location Matching
- Users can discover and filter skill offerings or requests
- Search within a customizable radius

### 3. Booking & Scheduling
- Built-in calendar for scheduling sessions
- Automated reminders and conflict detection

### 4. Reputation System
- Ratings, testimonials, and skill endorsements to foster trust and reliability

### 5. Community Projects
- Users can propose or join collaborative projects (e.g., building a community garden, coding a local website, organizing a workshop)

### 6. Incentive Mechanism
- Optional token or credit system to encourage participation
- Credits can be redeemed for services or donated to community causes

### 7. Accessibility & Inclusivity
- Features for differently-abled users, such as voice navigation, high-contrast modes, and language localization

## Bonus Points Features
- Integrating AI-based skill recommendations or matching algorithms
- Real-time chat or video session capabilities
- Providing an Open API for third-party integrations (e.g., local NGOs, educational institutions)

## Objective

Create a robust, scalable, and user-friendly full-stack web application that not only facilitates hyperlocal skill exchange but also strengthens community bonds and fosters economic empowerment in urban neighborhoods.

## Tech Stack

- **Frontend**: React.js with Material-UI, React Router
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **Geo-Location**: Google Maps API
- **Real-time Features**: Socket.io for chat
- **Deployment**: XAMPP (local), Vercel/Railway (production)

## Setup and Installation Instructions

### Prerequisites
- Node.js (version 16.x or higher)
- npm or yarn
- XAMPP with MySQL (or any MySQL server)
- Git

### Database Setup
1. Start XAMPP and ensure MySQL is running
2. Run the database setup commands:
   ```bash
   mysql -u root -e "DROP DATABASE IF EXISTS urban_skill_exchange; CREATE DATABASE urban_skill_exchange;"
   mysql -u root urban_skill_exchange -e "source database/schema.sql"
   mysql -u root urban_skill_exchange -e "source database/seed.sql"
   ```

### Installation Steps
1. Clone the repository:
   ```bash
   git clone [GitHub Repository URL]
   cd urban-skill-exchange
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   cd ..
   ```

4. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Update the values as needed (database credentials, JWT secret, etc.)

5. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

6. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm start
   ```

7. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Sign up or log in to create your profile
2. Add your skills or learning needs
3. Search for skills in your locality using geo-location filters
4. Book sessions or join community projects
5. Rate and review interactions to build reputation

## Screenshots

[Include screenshots or GIFs demonstrating the application's flow]

- Home Page
- User Profile
- Skill Search
- Booking Interface
- Community Projects

## Links

- **GitHub Repository**: [Link to public GitHub repo]
- **Deployed Application**: [Live URL, e.g., https://urban-skill-exchange.vercel.app]
- **Project Report**: [Link to PDF report]
- **Demo Video**: [Link to 3-5 minute walkthrough video]

## Team Information

- **Team Name**: [Your Team Name]
- **Team Members**:
  - Member 1: [Name, Role]
  - Member 2: [Name, Role]
  - Member 3: [Name, Role]

## Project Architecture

### System Design
- [Describe high-level architecture, e.g., microservices, monolithic]

### Database Schema
- **Users**: User profiles, authentication, location data
- **Skills**: User skills, categories, pricing, availability
- **Bookings**: Skill exchange sessions, scheduling, payments
- **Projects**: Community projects, participants, progress tracking
- **Reviews**: Ratings and testimonials for trust building
- **Messages**: Real-time chat functionality
- **Credits**: Incentive system for participation
- **Notifications**: System and user notifications

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

#### Skills Management
- `GET /api/skills` - List all skills with optional filtering (category, proficiency, availability)
- `GET /api/skills/my-skills` - Get authenticated user's skills (requires auth)
- `GET /api/skills/:id` - Get specific skill details
- `POST /api/skills` - Create new skill (requires auth)
- `PUT /api/skills/:id` - Update skill (requires auth, owner only)
- `DELETE /api/skills/:id` - Delete skill (requires auth, owner only)
- `GET /api/skills/meta/categories` - Get all skill categories

#### Health Check
- `GET /api/health` - Server health check

#### Planned Endpoints (Not Yet Implemented)
- `POST /api/bookings` - Create booking
- `GET /api/projects` - List community projects
- `POST /api/reviews` - Submit review
- `GET /api/messages` - Get chat messages

## Implementation Details

### Core Features Implementation

#### ✅ User Authentication System
- JWT-based authentication with secure password hashing (bcrypt)
- User registration and login endpoints
- Profile management with user information
- Token-based authorization middleware

#### ✅ Skills Management System
- Complete CRUD operations for skills
- Skill categories system (Technology, Languages, Arts & Crafts, etc.)
- Filtering by category, proficiency level, and availability
- User-specific skill management
- Pricing structure (per hour and per session)

#### ✅ Geo-Location Features
- Google Maps integration for location-based skill search
- Interactive map view with skill markers
- Location-based filtering within customizable radius
- Current location detection and reverse geocoding
- Distance calculation using Haversine formula

#### ✅ Database Design
- MySQL database with 12+ tables including users, skills, bookings, projects, reviews
- Proper relationships and foreign keys
- Sample data seeding for testing
- Connection pooling for performance

#### ✅ Backend API
- Node.js/Express server with security middleware
- RESTful API design with proper HTTP status codes
- Input validation using Joi
- Error handling and logging
- CORS and security headers

#### ✅ Frontend Setup
- React.js application with Material-UI
- Component-based architecture
- Routing with React Router
- Axios for API communication
- Responsive design foundation

### Bonus Features Implementation
- ✅ **Geo-Location Integration**: Google Maps API with location-based search and interactive map view
- [Real-time chat system planned]
- [Community projects system planned]
- [Reputation and review system planned]

## Challenges Faced & Solutions

#### Database Connection Issues
- **Challenge**: Initial MySQL connection setup and environment configuration
- **Solution**: Used XAMPP for local MySQL server and implemented connection pooling

#### API Route Loading
- **Challenge**: Backend server restart required to load new route modules
- **Solution**: Proper route mounting in Express and server restart procedures

#### Authentication Flow
- **Challenge**: JWT token handling and middleware implementation
- **Solution**: Implemented comprehensive authentication middleware with proper error handling

#### Data Validation
- **Challenge**: Ensuring data integrity across API endpoints
- **Solution**: Used Joi validation library for all input validation

#### CORS Configuration
- **Challenge**: Frontend-backend communication during development
- **Solution**: Configured CORS middleware with appropriate origins and headers

## Future Scope

### Immediate Next Steps
- **Booking System**: Complete booking and scheduling functionality
- **Real-time Chat**: WebSocket-based messaging between users
- **Community Projects**: Collaborative project creation and management
- **Reputation System**: User ratings and review system

### Advanced Features
- **Community Projects**: Collaborative project creation and management
- **Reputation System**: User ratings and review system
- **Incentive Mechanism**: Credit system for skill sharing
- **AI Recommendations**: Smart matching of users with relevant skills
- **Mobile App**: React Native mobile application
- **Payment Integration**: Secure payment processing for skill sessions

### Technical Enhancements
- **Testing Suite**: Unit and integration tests
- **API Documentation**: Swagger/OpenAPI documentation
- **Deployment**: Cloud deployment with CI/CD pipeline
- **Monitoring**: Application performance monitoring
- **Caching**: Redis for improved performance
- **File Upload**: Image upload for profiles and projects

## References

### Backend Dependencies
- **express**: Web framework for Node.js
- **mysql2**: MySQL database driver with connection pooling
- **bcryptjs**: Password hashing for security
- **jsonwebtoken**: JWT token generation and verification
- **joi**: Data validation library
- **helmet**: Security middleware for HTTP headers
- **cors**: Cross-origin resource sharing middleware
- **dotenv**: Environment variable management

### Frontend Dependencies
- **react**: Frontend framework
- **react-dom**: React DOM rendering
- **@mui/material**: Material-UI component library
- **@emotion/react**: CSS-in-JS styling
- **@emotion/styled**: Styled components
- **react-router-dom**: Client-side routing
- **axios**: HTTP client for API calls

### Development Tools
- **nodemon**: Development server auto-restart
- **concurrently**: Run multiple commands simultaneously

### Database
- **MySQL**: Relational database management system
- **XAMPP**: Local development environment

## Development Guidelines Followed

- Used modern tech stack with clear separation of frontend and backend
- Implemented security best practices (hashed passwords, HTTPS)
- Used Git for version control with meaningful commit messages
- Maintained responsive and accessible design
- Followed best practices in code organization and documentation

## Submission Details

This project was developed during the WEB HACKATHON timeframe. All code is original and developed during the hackathon period. Pre-existing open-source libraries/frameworks are declared in the references section.

For any doubts or questions, please refer to the Doubts Form provided by the organizers.

---

**Note**: This README serves as both project documentation and submission material for the WEB HACKATHON. Ensure all links and placeholders are updated with actual content before final submission.