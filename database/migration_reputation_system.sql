-- Reputation System Migration
-- Adds comprehensive reputation and review system

USE urban_skill_exchange;

-- Enhanced reviews table (extending existing one)
ALTER TABLE reviews ADD COLUMN (
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_moderated BOOLEAN DEFAULT FALSE,
    moderation_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    moderator_id INT,
    response_text TEXT,
    response_created_at TIMESTAMP NULL,
    helpful_votes INT DEFAULT 0,
    FOREIGN KEY (moderator_id) REFERENCES users(id)
);

-- Skill endorsements table
CREATE TABLE skill_endorsements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    endorser_id INT NOT NULL,
    endorsee_id INT NOT NULL,
    skill_id INT NOT NULL,
    endorsement_text TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (endorser_id) REFERENCES users(id),
    FOREIGN KEY (endorsee_id) REFERENCES users(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_endorsement (endorser_id, endorsee_id, skill_id)
);

-- User badges/achievements
CREATE TABLE user_badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    badge_type ENUM('bronze', 'silver', 'gold', 'platinum', 'special') NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    icon_url VARCHAR(500),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trust scores table
CREATE TABLE user_trust_scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    overall_score DECIMAL(3, 2) DEFAULT 0.00, -- 0.00 to 5.00
    rating_count INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    completion_rate DECIMAL(5, 2) DEFAULT 0.00, -- Percentage of completed sessions
    response_time_minutes INT DEFAULT 0, -- Average response time in minutes
    total_sessions INT DEFAULT 0,
    successful_sessions INT DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Review helpful votes
CREATE TABLE review_votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    voter_id INT NOT NULL,
    vote_type ENUM('helpful', 'not_helpful') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote (review_id, voter_id)
);

-- Review reports for moderation
CREATE TABLE review_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    reporter_id INT NOT NULL,
    report_reason ENUM('spam', 'inappropriate', 'fake', 'harassment', 'other') NOT NULL,
    report_details TEXT,
    status ENUM('pending', 'investigated', 'resolved') DEFAULT 'pending',
    moderator_id INT,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (moderator_id) REFERENCES users(id)
);

-- User reputation metrics (for analytics)
CREATE TABLE user_reputation_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    metric_date DATE NOT NULL,
    trust_score DECIMAL(3, 2),
    total_ratings INT DEFAULT 0,
    average_rating DECIMAL(3, 2),
    completion_rate DECIMAL(5, 2),
    response_rate DECIMAL(5, 2),
    total_endorsements INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_metric (user_id, metric_date)
);

-- Indexes for performance
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
CREATE INDEX idx_reviews_project ON reviews(project_id);
CREATE INDEX idx_reviews_moderation ON reviews(moderation_status);
CREATE INDEX idx_endorsements_endorsee ON skill_endorsements(endorsee_id);
CREATE INDEX idx_endorsements_skill ON skill_endorsements(skill_id);
CREATE INDEX idx_badges_user ON user_badges(user_id);
CREATE INDEX idx_badges_type ON user_badges(badge_type);
CREATE INDEX idx_trust_scores_score ON user_trust_scores(overall_score);
CREATE INDEX idx_review_votes_review ON review_votes(review_id);
CREATE INDEX idx_review_reports_status ON review_reports(status);
CREATE INDEX idx_reputation_metrics_date ON user_reputation_metrics(metric_date);

-- Insert default badges
INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, icon_url) VALUES
(1, 'bronze', 'First Session', 'Completed your first skill-sharing session', '/badges/first-session.png'),
(1, 'bronze', 'Helpful Reviewer', 'Left your first review', '/badges/helpful-reviewer.png'),
(1, 'bronze', 'Community Member', 'Joined the skill-sharing community', '/badges/community-member.png');

-- Initialize trust scores for existing users
INSERT INTO user_trust_scores (user_id, overall_score, rating_count, average_rating, completion_rate, response_time_minutes, total_sessions, successful_sessions)
SELECT
    u.id,
    3.00, -- Default neutral score
    0,
    0.00,
    0.00,
    60, -- Default 1 hour response time
    0,
    0
FROM users u
LEFT JOIN user_trust_scores uts ON u.id = uts.user_id
WHERE uts.user_id IS NULL;