/**
 * API Service for communicating with ML Backend
 */

const API_BASE_URL = '';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isBackendAvailable = false;
    this.checkBackendHealth();
  }

  /**
   * Check if backend is available
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isBackendAvailable = data.status === 'healthy';
        console.log('✅ Backend connected:', data);
        return true;
      }
    } catch (error) {
      console.log('⚠️  Backend not available, using baseline algorithm');
      this.isBackendAvailable = false;
    }
    return false;
  }

  /**
   * Get ML-based recommendation
   * @param {Object} profile - { targetRole, knownSkills, learningSpeed }
   * @returns {Promise<Object>} Recommendation data
   */
  async getRecommendation(profile) {
    if (!this.isBackendAvailable) {
      throw new Error('Backend not available');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetRole: profile.targetRole,
          knownSkills: profile.knownSkills,
          learningSpeed: profile.learningSpeed
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Get all skill gaps with ML scoring
   * @param {Object} profile - { targetRole, knownSkills }
   * @returns {Promise<Object>} Skill gaps data
   */
  async getSkillGaps(profile) {
    if (!this.isBackendAvailable) {
      throw new Error('Backend not available');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/skill-gaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetRole: profile.targetRole,
          knownSkills: profile.knownSkills
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Check if backend is currently available
   */
  isAvailable() {
    return this.isBackendAvailable;
  }
}

// Export singleton instance
export const apiService = new APIService();
