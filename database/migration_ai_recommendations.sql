-- AI-Based Skill Recommendations and Matching System Migration
-- Adds user preferences, learning styles, and recommendation algorithms

USE urban_skill_exchange;

-- User learning preferences and styles
ALTER TABLE users ADD COLUMN learning_style ENUM('visual', 'auditory', 'kinesthetic', 'reading_writing') DEFAULT NULL;
ALTER TABLE users ADD COLUMN preferred_session_duration ENUM('30min', '1hour', '2hours', 'flexible') DEFAULT 'flexible';
ALTER TABLE users ADD COLUMN preferred_session_frequency ENUM('once', 'weekly', 'biweekly', 'monthly') DEFAULT 'once';
ALTER TABLE users ADD COLUMN skill_goals TEXT;
ALTER TABLE users ADD COLUMN experience_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner';
ALTER TABLE users ADD COLUMN availability_preferences JSON; -- Store preferred days/times
ALTER TABLE users ADD COLUMN budget_range_min DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE users ADD COLUMN budget_range_max DECIMAL(10, 2) DEFAULT 100;

-- Skill relationships and recommendations
CREATE TABLE skill_relationships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    skill_id INT NOT NULL,
    related_skill_id INT NOT NULL,
    relationship_type ENUM('prerequisite', 'complementary', 'advanced', 'alternative') DEFAULT 'complementary',
    strength DECIMAL(3, 2) DEFAULT 0.5, -- 0.0 to 1.0
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    FOREIGN KEY (related_skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_relationship (skill_id, related_skill_id, relationship_type)
);

-- User skill interests and progress
CREATE TABLE user_skill_interests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_category_id INT,
    interest_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    current_proficiency ENUM('none', 'beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'none',
    target_proficiency ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_category_id) REFERENCES skill_categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_category_id)
);

-- Learning path recommendations
CREATE TABLE learning_paths (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration_weeks INT,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Learning path steps
CREATE TABLE learning_path_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    learning_path_id INT NOT NULL,
    step_order INT NOT NULL,
    skill_category_id INT,
    skill_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_hours INT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_category_id) REFERENCES skill_categories(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- Provider compatibility scores (cached for performance)
CREATE TABLE provider_compatibility (
    id INT PRIMARY KEY AUTO_INCREMENT,
    learner_id INT NOT NULL,
    provider_id INT NOT NULL,
    compatibility_score DECIMAL(5, 4), -- 0.0000 to 1.0000
    factors JSON, -- Store breakdown of compatibility factors
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (learner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_compatibility (learner_id, provider_id)
);

-- Market trends and analytics
CREATE TABLE skill_trends (
    id INT PRIMARY KEY AUTO_INCREMENT,
    skill_category_id INT,
    trend_score DECIMAL(5, 4), -- Popularity/trend score
    search_count INT DEFAULT 0,
    booking_count INT DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_category_id) REFERENCES skill_categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_trend (skill_category_id, period_start, period_end)
);

-- User assessment responses for learning style
CREATE TABLE user_assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    assessment_type ENUM('learning_style', 'skill_interests', 'goals') DEFAULT 'learning_style',
    responses JSON, -- Store assessment answers
    results JSON, -- Store calculated results
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_skill_relationships_skill ON skill_relationships(skill_id);
CREATE INDEX idx_skill_relationships_related ON skill_relationships(related_skill_id);
CREATE INDEX idx_user_skill_interests_user ON user_skill_interests(user_id);
CREATE INDEX idx_learning_paths_user ON learning_paths(user_id);
CREATE INDEX idx_provider_compatibility_learner ON provider_compatibility(learner_id);
CREATE INDEX idx_provider_compatibility_score ON provider_compatibility(compatibility_score DESC);
CREATE INDEX idx_skill_trends_category ON skill_trends(skill_category_id);
CREATE INDEX idx_skill_trends_period ON skill_trends(period_start, period_end);