-- Sample data for Urban Skill Exchange
USE urban_skill_exchange;

-- Sample users (passwords are hashed 'password123')
INSERT INTO users (name, email, password_hash, phone, location, latitude, longitude, bio, is_verified) VALUES
('Alice Johnson', 'alice@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567890', 'New York, NY', 40.7128, -74.0060, 'Experienced web developer passionate about teaching coding to beginners.', TRUE),
('Bob Smith', 'bob@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567891', 'Brooklyn, NY', 40.6782, -73.9442, 'Professional photographer and graphic designer.', TRUE),
('Carol Davis', 'carol@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567892', 'Queens, NY', 40.7282, -73.7949, 'Native Spanish speaker offering language lessons.', FALSE),
('David Wilson', 'david@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567893', 'Manhattan, NY', 40.7831, -73.9712, 'Fitness trainer specializing in yoga and meditation.', TRUE);

-- Sample skills
INSERT INTO skills (user_id, name, category, description, proficiency_level, price_per_hour, price_per_session) VALUES
(1, 'Web Development', 'Technology', 'Full-stack web development with React, Node.js, and databases', 'advanced', 50.00, 150.00),
(1, 'JavaScript Programming', 'Technology', 'Modern JavaScript, ES6+, and frameworks', 'expert', 45.00, 135.00),
(2, 'Photography', 'Arts & Crafts', 'Portrait and event photography with professional equipment', 'expert', 75.00, 200.00),
(2, 'Graphic Design', 'Arts & Crafts', 'Logo design, branding, and digital graphics', 'advanced', 40.00, 120.00),
(3, 'Spanish Language', 'Languages', 'Conversational Spanish for beginners and intermediate learners', 'advanced', 25.00, 75.00),
(4, 'Yoga Instruction', 'Sports & Fitness', 'Hatha yoga classes for all levels', 'expert', 35.00, 100.00),
(4, 'Meditation', 'Health & Wellness', 'Mindfulness and meditation techniques', 'intermediate', 30.00, 80.00);

-- Sample projects
INSERT INTO projects (title, description, creator_id, category, location, latitude, longitude, max_participants, project_type) VALUES
('Community Garden Project', 'Creating a community vegetable garden in the neighborhood park', 1, 'community_service', 'Central Park, NY', 40.7829, -73.9654, 20, 'community_service'),
('Coding Workshop for Kids', 'Teaching basic programming to local children aged 10-14', 1, 'educational', 'Brooklyn Library', 40.6782, -73.9442, 15, 'educational'),
('Neighborhood Photography Club', 'Monthly photography sessions and exhibitions', 2, 'creative', 'Queens Arts Center', 40.7282, -73.7949, 12, 'creative');

-- Sample project participants
INSERT INTO project_participants (project_id, user_id, role) VALUES
(1, 1, 'creator'),
(1, 2, 'participant'),
(1, 4, 'participant'),
(2, 1, 'creator'),
(2, 3, 'mentor'),
(3, 2, 'creator'),
(3, 1, 'participant');

-- Sample user credits
INSERT INTO user_credits (user_id, balance, total_earned) VALUES
(1, 150.00, 300.00),
(2, 200.00, 400.00),
(3, 50.00, 100.00),
(4, 75.00, 150.00);

-- Sample reviews
INSERT INTO reviews (reviewer_id, reviewee_id, rating, review_text, review_type) VALUES
(2, 1, 5, 'Alice is an excellent teacher! Very patient and knowledgeable.', 'skill_session'),
(1, 2, 5, 'Bob captured amazing photos for our event. Highly recommended!', 'skill_session'),
(4, 3, 4, 'Carol helped me improve my Spanish conversation skills significantly.', 'skill_session'),
(3, 4, 5, 'David''s yoga classes are transformative. Great instructor!', 'skill_session');