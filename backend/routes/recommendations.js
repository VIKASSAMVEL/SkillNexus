const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get personalized skill recommendations for a user
router.get('/skills/:userId', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        const { userId } = req.params;
        const { limit = 10, category } = req.query;

        // Get user's interests and current skills
        const [userInterests] = await pool.execute(`
            SELECT usi.*, sc.name as category_name
            FROM user_skill_interests usi
            JOIN skill_categories sc ON usi.skill_category_id = sc.id
            WHERE usi.user_id = ?
            ORDER BY usi.interest_level DESC, usi.updated_at DESC
        `, [userId]);

        // Get user's learning style and preferences
        const [userPrefs] = await pool.execute(`
            SELECT learning_style, experience_level, budget_range_min, budget_range_max
            FROM users WHERE id = ?
        `, [userId]);

        if (userInterests.length === 0) {
            return res.json({
                success: true,
                recommendations: [],
                message: 'No skill interests found. Complete your profile to get recommendations.'
            });
        }

        // Build recommendation query based on user preferences
        let query = `
            SELECT DISTINCT
                s.*,
                sc.name as category_name,
                u.name as provider_name,
                u.profile_image as provider_image,
                COALESCE(urm.trust_score, 0) as provider_trust_score,
                COALESCE(pc.compatibility_score, 0) as compatibility_score,
                AVG(r.rating) as average_rating,
                COUNT(r.id) as review_count
            FROM skills s
            JOIN skill_categories sc ON s.category = sc.name
            JOIN users u ON s.user_id = u.id
            LEFT JOIN user_reputation_metrics urm ON u.id = urm.user_id
            LEFT JOIN provider_compatibility pc ON pc.provider_id = u.id AND pc.learner_id = ?
            LEFT JOIN reviews r ON r.reviewee_id = u.id
            WHERE s.is_available = 1 AND u.is_verified = 1
        `;

        const params = [userId];

        // Filter by category if specified
        if (category) {
            query += ' AND sc.id = ?';
            params.push(category);
        }

        // Add skill relationship recommendations
        const interestCategoryIds = userInterests.map(i => i.skill_category_id);
        if (interestCategoryIds.length > 0) {
            query += ` AND (
                sc.id IN (${interestCategoryIds.map(() => '?').join(',')})
                OR sc.id IN (
                    SELECT sc2.id FROM skill_relationships sr
                    JOIN skills s2 ON sr.related_skill_id = s2.id
                    JOIN skill_categories sc2 ON s2.category = sc2.name
                    WHERE sr.skill_id IN (SELECT id FROM skills WHERE category IN (
                        SELECT name FROM skill_categories WHERE id IN (${interestCategoryIds.map(() => '?').join(',')})
                    ))
                    AND sr.relationship_type IN ('complementary', 'advanced')
                )
            )`;
            params.push(...interestCategoryIds, ...interestCategoryIds);
        }

        query += `
            GROUP BY s.id, sc.name, u.name, u.profile_image, urm.trust_score, pc.compatibility_score
            ORDER BY
                COALESCE(pc.compatibility_score, 0) DESC,
                COALESCE(urm.trust_score, 0) DESC,
                COALESCE(AVG(r.rating), 0) DESC,
                s.created_at DESC
            LIMIT ?
        `;

        params.push(parseInt(limit));

        const [recommendations] = await pool.execute(query, params);

        // Calculate recommendation scores
        const scoredRecommendations = recommendations.map(rec => ({
            ...rec,
            recommendation_score: calculateRecommendationScore(rec, userPrefs[0], userInterests),
            match_reasons: generateMatchReasons(rec, userPrefs[0], userInterests)
        }));

        res.json({
            success: true,
            recommendations: scoredRecommendations,
            user_preferences: userPrefs[0],
            total_found: scoredRecommendations.length
        });

    } catch (error) {
        console.error('Error getting skill recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get skill recommendations',
            error: error.message
        });
    }
});

// Get learning path recommendations for a user
router.get('/learning-paths/:userId', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        const { userId } = req.params;
        const { skill_goal } = req.query;

        // Get user's current skill interests and proficiency
        const [userSkills] = await pool.execute(`
            SELECT usi.*, sc.name as category_name
            FROM user_skill_interests usi
            JOIN skill_categories sc ON usi.skill_category_id = sc.id
            WHERE usi.user_id = ? AND usi.interest_level IN ('medium', 'high')
            ORDER BY usi.interest_level DESC, usi.target_proficiency DESC
        `, [userId]);

        if (userSkills.length === 0) {
            return res.json({
                success: true,
                learning_paths: [],
                message: 'Add skill interests to your profile to get learning path recommendations.'
            });
        }

        // Generate personalized learning paths
        const learningPaths = [];

        for (const skill of userSkills) {
            const path = await generateLearningPath(userId, skill, skill_goal);
            if (path) {
                learningPaths.push(path);
            }
        }

        res.json({
            success: true,
            learning_paths: learningPaths,
            based_on_skills: userSkills.length
        });

    } catch (error) {
        console.error('Error getting learning path recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get learning path recommendations',
            error: error.message
        });
    }
});

// Get provider compatibility for a specific learner-provider pair
router.get('/compatibility/:learnerId/:providerId', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        const { learnerId, providerId } = req.params;

        // Check if compatibility score exists and is recent
        const [existing] = await pool.execute(`
            SELECT *, TIMESTAMPDIFF(HOUR, last_calculated, NOW()) as hours_old
            FROM provider_compatibility
            WHERE learner_id = ? AND provider_id = ?
        `, [learnerId, providerId]);

        let compatibility;
        if (existing.length > 0 && existing[0].hours_old < 24) {
            // Use cached score if less than 24 hours old
            compatibility = existing[0];
        } else {
            // Calculate new compatibility score
            compatibility = await calculateCompatibilityScore(learnerId, providerId);

            // Cache the result
            await pool.execute(`
                INSERT INTO provider_compatibility (learner_id, provider_id, compatibility_score, factors, last_calculated)
                VALUES (?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                compatibility_score = VALUES(compatibility_score),
                factors = VALUES(factors),
                last_calculated = NOW()
            `, [learnerId, providerId, compatibility.score, JSON.stringify(compatibility.factors)]);
        }

        res.json({
            success: true,
            compatibility: {
                score: compatibility.score,
                factors: compatibility.factors,
                last_calculated: compatibility.last_calculated || new Date()
            }
        });

    } catch (error) {
        console.error('Error calculating compatibility:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate compatibility',
            error: error.message
        });
    }
});

// Update user skill interests and preferences
router.post('/preferences/:userId', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        const { userId } = req.params;
        const {
            learning_style,
            preferred_session_duration,
            preferred_session_frequency,
            skill_goals,
            experience_level,
            availability_preferences,
            budget_range_min,
            budget_range_max,
            skill_interests
        } = req.body;

        // Update user preferences
        await pool.execute(`
            UPDATE users SET
                learning_style = ?,
                preferred_session_duration = ?,
                preferred_session_frequency = ?,
                skill_goals = ?,
                experience_level = ?,
                availability_preferences = ?,
                budget_range_min = ?,
                budget_range_max = ?,
                updated_at = NOW()
            WHERE id = ?
        `, [
            learning_style,
            preferred_session_duration,
            preferred_session_frequency,
            skill_goals,
            experience_level,
            JSON.stringify(availability_preferences || {}),
            budget_range_min || 0,
            budget_range_max || 100,
            userId
        ]);

        // Update skill interests
        if (skill_interests && Array.isArray(skill_interests)) {
            // Clear existing interests
            await pool.execute('DELETE FROM user_skill_interests WHERE user_id = ?', [userId]);

            // Insert new interests
            for (const interest of skill_interests) {
                await pool.execute(`
                    INSERT INTO user_skill_interests
                    (user_id, skill_category_id, interest_level, current_proficiency, target_proficiency)
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    userId,
                    interest.skill_category_id,
                    interest.interest_level || 'medium',
                    interest.current_proficiency || 'none',
                    interest.target_proficiency || 'intermediate'
                ]);
            }
        }

        res.json({
            success: true,
            message: 'User preferences updated successfully'
        });

    } catch (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences',
            error: error.message
        });
    }
});

// Helper function to calculate recommendation score
function calculateRecommendationScore(skill, userPrefs, userInterests) {
    let score = 0.5; // Base score

    // Compatibility score (30% weight)
    if (skill.compatibility_score) {
        score += skill.compatibility_score * 0.3;
    }

    // Provider trust score (25% weight)
    if (skill.provider_trust_score) {
        score += (skill.provider_trust_score / 100) * 0.25;
    }

    // Rating score (20% weight)
    if (skill.average_rating) {
        score += (skill.average_rating / 5) * 0.2;
    }

    // Interest alignment (15% weight)
    const interestMatch = userInterests.find(i =>
        i.skill_category_id === skill.category_id &&
        i.interest_level === 'high'
    );
    if (interestMatch) {
        score += 0.15;
    }

    // Experience level match (10% weight)
    if (userPrefs && skill.difficulty_level) {
        const levelMatch = getLevelMatch(userPrefs.experience_level, skill.difficulty_level);
        score += levelMatch * 0.1;
    }

    return Math.min(score, 1.0); // Cap at 1.0
}

// Helper function to generate match reasons
function generateMatchReasons(skill, userPrefs, userInterests) {
    const reasons = [];

    if (skill.compatibility_score > 0.7) {
        reasons.push('High compatibility match');
    }

    if (skill.provider_trust_score > 80) {
        reasons.push('Highly trusted provider');
    }

    if (skill.average_rating >= 4.5) {
        reasons.push('Excellent reviews');
    }

    const interestMatch = userInterests.find(i => i.skill_category_id === skill.category_id);
    if (interestMatch && interestMatch.interest_level === 'high') {
        reasons.push(`Matches your ${interestMatch.category_name} interest`);
    }

    return reasons;
}

// Helper function to get level match score
function getLevelMatch(userLevel, skillLevel) {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const userIndex = levels.indexOf(userLevel);
    const skillIndex = levels.indexOf(skillLevel);

    const diff = Math.abs(userIndex - skillIndex);
    return Math.max(0, 1 - (diff * 0.3)); // Closer levels get higher scores
}

// Helper function to generate learning path
async function generateLearningPath(userId, skill, skillGoal) {
    try {
        const pool = getPool();
        // Get related skills and prerequisites
        const [relatedSkills] = await pool.execute(`
            SELECT sr.*, s.name as skill_title, sc.name as category_name
            FROM skill_relationships sr
            JOIN skills s ON sr.related_skill_id = s.id
            JOIN skill_categories sc ON s.category = sc.name
            WHERE sr.skill_id IN (SELECT id FROM skills WHERE category = ?)
            AND sr.relationship_type IN ('prerequisite', 'complementary')
            ORDER BY sr.strength DESC
            LIMIT 5
        `, [skill.category_name]);

        const steps = [];
        let stepOrder = 1;

        // Add prerequisite skills first
        const prerequisites = relatedSkills.filter(r => r.relationship_type === 'prerequisite');
        for (const prereq of prerequisites) {
            steps.push({
                step_order: stepOrder++,
                skill_category_id: prereq.related_skill_id,
                title: `Learn ${prereq.skill_title}`,
                description: `Build foundation with ${prereq.skill_title} before advancing to ${skill.category_name}`,
                estimated_hours: 10,
                is_completed: false
            });
        }

        // Add main skill
        steps.push({
            step_order: stepOrder++,
            skill_category_id: skill.skill_category_id,
            title: `Master ${skill.category_name}`,
            description: skillGoal || `Develop proficiency in ${skill.category_name}`,
            estimated_hours: 20,
            is_completed: false
        });

        // Add complementary skills
        const complementary = relatedSkills.filter(r => r.relationship_type === 'complementary');
        for (const comp of complementary.slice(0, 2)) {
            steps.push({
                step_order: stepOrder++,
                skill_category_id: comp.related_skill_id,
                title: `Explore ${comp.skill_title}`,
                description: `Enhance your skills with complementary knowledge in ${comp.skill_title}`,
                estimated_hours: 15,
                is_completed: false
            });
        }

        return {
            title: `${skill.category_name} Learning Path`,
            description: `Personalized learning journey for ${skill.category_name}`,
            estimated_duration_weeks: Math.ceil(steps.reduce((sum, step) => sum + step.estimated_hours, 0) / 10),
            difficulty_level: skill.target_proficiency || 'intermediate',
            steps: steps,
            total_steps: steps.length,
            based_on_interest: skill.category_name
        };

    } catch (error) {
        console.error('Error generating learning path:', error);
        return null;
    }
}

// Helper function to calculate compatibility score
async function calculateCompatibilityScore(learnerId, providerId) {
    try {
        const pool = getPool();
        // Get learner and provider preferences
        const [learner] = await pool.execute(`
            SELECT learning_style, experience_level, budget_range_min, budget_range_max,
                   preferred_session_duration, preferred_session_frequency
            FROM users WHERE id = ?
        `, [learnerId]);

        const [provider] = await pool.execute(`
            SELECT learning_style, experience_level FROM users WHERE id = ?
        `, [providerId]);

        if (!learner.length || !provider.length) {
            return { score: 0.5, factors: { error: 'Missing user data' } };
        }

        const learnerPrefs = learner[0];
        const providerPrefs = provider[0];

        let score = 0.5; // Base score
        const factors = {};

        // Learning style compatibility (25% weight)
        if (learnerPrefs.learning_style && providerPrefs.learning_style) {
            const styleMatch = learnerPrefs.learning_style === providerPrefs.learning_style ? 1 : 0.7;
            score += styleMatch * 0.25;
            factors.learning_style_match = styleMatch;
        }

        // Experience level compatibility (20% weight)
        if (learnerPrefs.experience_level && providerPrefs.experience_level) {
            const levelMatch = getLevelMatch(learnerPrefs.experience_level, providerPrefs.experience_level);
            score += levelMatch * 0.2;
            factors.experience_level_match = levelMatch;
        }

        // Get shared skill interests (30% weight)
        const [sharedInterests] = await pool.execute(`
            SELECT COUNT(*) as shared_count
            FROM user_skill_interests lsi
            JOIN user_skill_interests psi ON lsi.skill_category_id = psi.skill_category_id
            WHERE lsi.user_id = ? AND psi.user_id = ?
            AND lsi.interest_level IN ('medium', 'high')
            AND psi.interest_level IN ('medium', 'high')
        `, [learnerId, providerId]);

        const interestScore = Math.min(sharedInterests[0].shared_count * 0.2, 0.3);
        score += interestScore;
        factors.shared_interests = sharedInterests[0].shared_count;

        // Provider reputation (25% weight)
        const [reputation] = await pool.execute(`
            SELECT trust_score FROM user_reputation_metrics WHERE user_id = ?
        `, [providerId]);

        if (reputation.length > 0) {
            const repScore = (reputation[0].trust_score / 100) * 0.25;
            score += repScore;
            factors.provider_reputation = reputation[0].trust_score;
        }

        return {
            score: Math.min(score, 1.0),
            factors: factors
        };

    } catch (error) {
        console.error('Error calculating compatibility:', error);
        return { score: 0.5, factors: { error: error.message } };
    }
}

module.exports = router;