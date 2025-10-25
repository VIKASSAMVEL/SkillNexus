import React from 'react';
import StarRating from './StarRating';
import './UserReputation.css';

const UserReputation = ({ reputationData, endorsements = [], badges = [] }) => {
  const { trustScore, endorsementCount } = reputationData;

  const getTrustLevel = (score) => {
    if (score >= 4.8) return { level: 'Platinum', color: '#e5e4e2', icon: '🏆' };
    if (score >= 4.5) return { level: 'Gold', color: '#ffd700', icon: '🥇' };
    if (score >= 4.0) return { level: 'Silver', color: '#c0c0c0', icon: '🥈' };
    if (score >= 3.0) return { level: 'Bronze', color: '#cd7f32', icon: '🥉' };
    return { level: 'New', color: '#666', icon: '🌱' };
  };

  const trustLevel = getTrustLevel(trustScore.overall_score);

  const formatPercentage = (value) => {
    return value ? `${Number(value).toFixed(1)}%` : '0%';
  };

  return (
    <div className="user-reputation">
      <div className="user-reputation__header">
        <h3>Reputation & Trust</h3>
        <div className="user-reputation__trust-level">
          <span className="user-reputation__trust-icon">{trustLevel.icon}</span>
          <span
            className="user-reputation__trust-badge"
            style={{ backgroundColor: trustLevel.color }}
          >
            {trustLevel.level}
          </span>
        </div>
      </div>

      <div className="user-reputation__stats">
        <div className="user-reputation__stat">
          <div className="user-reputation__stat-value">
            <StarRating rating={trustScore.average_rating} size="small" showValue={false} />
            <span className="user-reputation__rating-text">
              {Number(trustScore.average_rating)?.toFixed(1) || '0.0'}
            </span>
          </div>
          <div className="user-reputation__stat-label">
            Average Rating ({trustScore.rating_count || 0} reviews)
          </div>
        </div>

        <div className="user-reputation__stat">
          <div className="user-reputation__stat-value">
            {formatPercentage(trustScore.completion_rate)}
          </div>
          <div className="user-reputation__stat-label">
            Completion Rate
          </div>
        </div>

        <div className="user-reputation__stat">
          <div className="user-reputation__stat-value">
            {endorsementCount || 0}
          </div>
          <div className="user-reputation__stat-label">
            Skill Endorsements
          </div>
        </div>

        <div className="user-reputation__stat">
          <div className="user-reputation__stat-value">
            {trustScore.total_sessions || 0}
          </div>
          <div className="user-reputation__stat-label">
            Total Sessions
          </div>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="user-reputation__badges">
          <h4>Achievements</h4>
          <div className="user-reputation__badges-grid">
            {badges.map((badge) => (
              <div key={badge.id} className="user-reputation__badge">
                <div className="user-reputation__badge-icon">
                  {badge.badge_name === 'First Session' && '🎓'}
                  {badge.badge_name === 'First Review' && '📝'}
                  {badge.badge_name === 'Reviewer' && '⭐'}
                  {badge.badge_name === 'Trusted Teacher' && '🎯'}
                  {badge.badge_name === 'Experienced' && '🏆'}
                  {badge.badge_name === 'Highly Trusted' && '💎'}
                  {badge.badge_name === 'Expert' && '👑'}
                  {badge.badge_name === 'Master Teacher' && '🌟'}
                  {!['First Session', 'First Review', 'Reviewer', 'Trusted Teacher', 'Experienced', 'Highly Trusted', 'Expert', 'Master Teacher'].includes(badge.badge_name) && '🏅'}
                </div>
                <div className="user-reputation__badge-info">
                  <div className="user-reputation__badge-name">{badge.badge_name}</div>
                  <div className="user-reputation__badge-desc">{badge.badge_description}</div>
                  <div className="user-reputation__badge-date">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {endorsements.length > 0 && (
        <div className="user-reputation__endorsements">
          <h4>Skill Endorsements</h4>
          <div className="user-reputation__endorsements-list">
            {endorsements.slice(0, 5).map((endorsement) => (
              <div key={endorsement.id} className="user-reputation__endorsement">
                <div className="user-reputation__endorsement-header">
                  <span className="user-reputation__endorsement-skill">
                    {endorsement.skill_name}
                  </span>
                  <span className="user-reputation__endorsement-endorser">
                    by {endorsement.endorser_name}
                  </span>
                </div>
                {endorsement.endorsement_text && (
                  <p className="user-reputation__endorsement-text">
                    "{endorsement.endorsement_text}"
                  </p>
                )}
                <span className="user-reputation__endorsement-date">
                  {new Date(endorsement.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {endorsements.length > 5 && (
              <div className="user-reputation__endorsements-more">
                +{endorsements.length - 5} more endorsements
              </div>
            )}
          </div>
        </div>
      )}

      <div className="user-reputation__trust-info">
        <div className="user-reputation__trust-score">
          <div className="user-reputation__trust-score-value">
            Trust Score: {Number(trustScore.overall_score)?.toFixed(1) || '0.0'}/5.0
          </div>
          <div className="user-reputation__trust-score-bar">
            <div
              className="user-reputation__trust-score-fill"
              style={{ width: `${((trustScore.overall_score || 0) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="user-reputation__trust-factors">
          <h5>How trust score is calculated:</h5>
          <ul>
            <li><strong>50%</strong> - Average rating from reviews</li>
            <li><strong>30%</strong> - Session completion rate</li>
            <li><strong>20%</strong> - Other factors (response time, consistency)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserReputation;