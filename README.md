# SkillNexus: A Full-Stack Platform for Hyperlocal Talent Sharing

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

## Detailed Project Views

### Frontend Pages & Features

#### 1. **Authentication Pages**
- **Login.js**: Secure login interface with email and password validation
  - JWT token-based session management
  - Error handling and user feedback
  
- **Register.js**: User registration with profile creation
  - Email validation and password requirements
  - Initial profile setup with location

#### 2. **Home Page (Home.js)**
- Platform overview and key features showcase
- Quick navigation to main features
- Welcome section for new and returning users
- Call-to-action buttons for skill discovery and listing

#### 3. **Skills Management**
- **Skills.js**: Main skills browsing and discovery interface
  - Grid view of available skills
  - Category filtering
  - Search and sort functionality
  - Responsive design for all devices

- **SkillsList.js**: Enhanced list view component
  - Detailed skill information
  - User profiles and ratings
  - Availability status

- **SkillCard.js**: Individual skill card component
  - Skill name, category, and pricing
  - User rating and review count
  - Quick action buttons

- **SkillDetails.js**: Comprehensive skill detail view
  - Full skill description and requirements
  - User profile information
  - Availability calendar
  - Booking interface
  - User reviews and testimonials

- **AddSkillForm.js**: Skill creation and editing interface
  - Form fields for skill details (title, description, category)
  - Pricing configuration (hourly and session rates)
  - Category selection
  - Availability scheduling
  - Dark theme styled form with section headers

#### 4. **Location & Mapping**
- **SkillsMap.js**: Interactive Google Maps integration
  - Location-based skill discovery
  - Skill markers on map
  - Radius filtering for nearby skills
  - Current location detection

- **LocationSearch.js**: Location input and search component
  - Address autocomplete
  - Radius selector
  - Map view integration

#### 5. **Booking & Scheduling**
- **Bookings.js**: Main booking management page
  - View upcoming and past bookings
  - Booking status tracking
  - Cancellation functionality
  - Booking history

- **BookingForm.js**: Booking creation interface
  - Date and time selection
  - Duration configuration
  - Session notes
  - Price calculation

- **BookingsList.js**: List of all bookings
  - Filterable by status (confirmed, pending, completed)
  - User information
  - Action buttons

- **AvailabilityManager.js**: Schedule and availability management
  - Calendar interface for setting availability
  - Time slot configuration
  - Recurring availability patterns
  - Time zone support

#### 6. **Projects**
- **Projects.js**: Community projects page
  - Browse available projects
  - Project filtering and search
  - Project creation interface
  - Participation management

- **CreateProjectDialog.js**: Modal for project creation
  - Project details input
  - Participant management
  - Timeline and milestones
  - Project category selection

- **ProjectCard.js**: Individual project card
  - Project overview
  - Participant count
  - Progress indicator
  - Join button

#### 7. **User Profile**
- **Profile.js**: User profile management
  - Profile information display and editing
  - Skill listing
  - Ratings and reviews
  - Booking history
  - Account settings

#### 8. **Trust & Safety Pages**
- **VerificationProcess.js**: Identity verification workflow
  - Verification steps and requirements
  - Document upload
  - Status tracking

- **TrustSafety.js**: Platform trust and safety information
  - Safety guidelines
  - Verification badges
  - User protections

- **ReportUser.js**: User reporting interface
  - Issue categorization
  - Detailed issue description
  - Evidence upload
  - Report tracking

#### 9. **Community & Support**
- **CommunityGuidelines.js**: Platform rules and best practices
  - Code of conduct
  - Dos and don'ts
  - Community expectations

- **FAQ.js**: Frequently asked questions
  - Common questions and answers
  - Search functionality
  - Contact support links

#### 10. **Legal & Policy Pages**
- **TermsOfService.js**: Platform terms and conditions
  - User rights and responsibilities
  - Service terms
  - Limitation of liability

- **PrivacyPolicy.js**: Data privacy and protection
  - Data collection practices
  - User rights
  - GDPR compliance information

#### 11. **Other Components**
- **Header.js**: Navigation bar
  - Logo and branding
  - Navigation links
  - User menu
  - Dark/light theme toggle
  - Responsive mobile menu

- **Footer.js**: Site footer
  - Quick links
  - Social media links
  - Trust & Safety section
  - Community guidelines links
  - Copyright information

- **Credits.js**: Platform credits and attribution
  - Team and contributors
  - Open-source libraries
  - Acknowledgments

- **ScrollToTop.js**: Utility component
  - Scroll-to-top button
  - Smooth scrolling

### Backend Routes & API

#### **Auth Routes (auth.js)**
- User registration and login
- Profile management
- JWT token handling

#### **Skills Routes (skills.js)**
- CRUD operations for skills
- Category management
- Search and filtering
- Skill availability management

#### **Bookings Routes (bookings.js)**
- Create and manage bookings
- Booking status updates
- Availability checking
- Schedule conflict detection

#### **Projects Routes (projects.js)**
- Project CRUD operations
- Project participation
- Milestone tracking
- Collaborator management

#### **Index Routes (index.js)**
- Main route configuration
- Health check endpoint
- Route mounting

### Database Tables

1. **users** - User profiles and authentication
2. **skills** - Skill listings and details
3. **skill_categories** - Skill categorization
4. **bookings** - Booking records and scheduling
5. **projects** - Community projects
6. **project_participants** - Project collaboration data
7. **reviews** - User ratings and testimonials
8. **availability** - User availability schedules
9. **messages** - Chat and communication
10. **notifications** - System notifications
11. **credits** - User credit/incentive tracking
12. **verification_status** - User verification records

### UI/UX Features

- **Dark Theme**: Modern dark interface throughout the application
- **Responsive Design**: Mobile-first approach with breakpoint support
- **Material-UI**: Professional component library
- **Interactive Maps**: Google Maps integration for location-based features
- **Form Validation**: Client and server-side validation
- **Real-time Feedback**: Loading states and error handling
- **Accessibility**: WCAG 2.1 compliance considerations

## Screenshots

[Include screenshots or GIFs demonstrating the application's flow]

- Home Page - Platform overview and feature highlights
- Login/Register - Authentication interface
- Skills Discovery - Browsing and filtering skills
- Skills Map - Location-based skill search
- Skill Details - Individual skill information with booking
- Add Skill - Create and manage your skills
- User Profile - Profile management and history
- Bookings - Schedule and manage sessions
- Projects - Community collaboration interface
- Trust & Safety - Verification and safety features

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