import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Reputation System API calls

// Reviews
export const reviewsAPI = {
  // Submit a review
  submitReview: (reviewData) => api.post('/reviews', reviewData),

  // Get reviews for a user
  getUserReviews: (userId, params = {}) =>
    api.get(`/reviews/user/${userId}`, { params }),

  // Update review response
  respondToReview: (reviewId, responseData) =>
    api.put(`/reviews/${reviewId}/response`, responseData),

  // Vote on review helpfulness
  voteOnReview: (reviewId, voteType) =>
    api.post(`/reviews/${reviewId}/vote`, { vote_type: voteType }),

  // Report a review
  reportReview: (reviewId, reportData) =>
    api.post(`/reviews/${reviewId}/report`, reportData),

  // Get user's trust score and reputation
  getUserReputation: (userId) =>
    api.get(`/reviews/trust-score/${userId}`),

  // Create skill endorsement
  endorseSkill: (userId, endorsementData) =>
    api.post(`/reviews/endorse/${userId}`, endorsementData),

  // Get skill endorsements for a user
  getUserEndorsements: (userId) =>
    api.get(`/reviews/endorsements/${userId}`),

  // Moderate a review (admin only)
  moderateReview: (reviewId, moderationData) =>
    api.put(`/reviews/${reviewId}/moderate`, moderationData),

  // Get reported reviews (moderator only)
  getReportedReviews: (params = {}) =>
    api.get('/reviews/moderation/reports', { params }),

  // Handle review report (moderator only)
  updateReport: (reportId, updateData) =>
    api.put(`/reviews/reports/${reportId}`, updateData),

  // Get user's review analytics
  getReviewAnalytics: (userId) =>
    api.get(`/reviews/analytics/${userId}`)
};

// AI Recommendations API calls
export const recommendationsAPI = {
  // Get personalized skill recommendations
  getSkillRecommendations: (userId, params = {}) =>
    api.get(`/recommendations/skills/${userId}`, { params }),

  // Get learning path recommendations
  getLearningPathRecommendations: (userId, params = {}) =>
    api.get(`/recommendations/learning-paths/${userId}`, { params }),

  // Get provider compatibility score
  getProviderCompatibility: (learnerId, providerId) =>
    api.get(`/recommendations/compatibility/${learnerId}/${providerId}`),

  // Update user preferences and skill interests
  updateUserPreferences: (userId, preferencesData) =>
    api.post(`/recommendations/preferences/${userId}`, preferencesData)
};

export default api;