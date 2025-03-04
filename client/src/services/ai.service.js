import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Service for interacting with AI features
 */
class AIService {
  /**
   * Check AI service health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${API_URL}/ai/health`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error checking AI health:', error);
      throw error;
    }
  }

  /**
   * Get hashtag suggestions based on content
   * @param {string} content - Post content
   * @param {string} platform - Social media platform
   * @param {number} count - Number of hashtags to suggest
   * @returns {Promise<Array>} Suggested hashtags
   */
  async getSuggestions(content, platform, count = 10) {
    try {
      const response = await axios.post(
        `${API_URL}/ai/suggest-hashtags`,
        { content, platform, count },
        { headers: getAuthHeader() }
      );
      return response.data.hashtags;
    } catch (error) {
      console.error('Error getting hashtag suggestions:', error);
      throw error;
    }
  }

  /**
   * Optimize hashtag combination
   * @param {Array} hashtags - Existing hashtags
   * @param {string} content - Post content
   * @param {string} platform - Social media platform
   * @param {number} count - Number of hashtags to return
   * @returns {Promise<Array>} Optimized hashtags
   */
  async optimizeHashtags(hashtags, content, platform, count = 30) {
    try {
      const response = await axios.post(
        `${API_URL}/ai/optimize-hashtags`,
        { hashtags, content, platform, count },
        { headers: getAuthHeader() }
      );
      return response.data.hashtags;
    } catch (error) {
      console.error('Error optimizing hashtags:', error);
      throw error;
    }
  }

  /**
   * Predict post performance
   * @param {string} content - Post content
   * @param {Array} hashtags - Hashtags
   * @param {string} platform - Social media platform
   * @returns {Promise<Object>} Performance prediction
   */
  async predictPerformance(content, hashtags, platform) {
    try {
      const response = await axios.post(
        `${API_URL}/ai/predict-performance`,
        { content, hashtags, platform },
        { headers: getAuthHeader() }
      );
      return response.data.prediction;
    } catch (error) {
      console.error('Error predicting performance:', error);
      throw error;
    }
  }

  /**
   * Get trending hashtags
   * @param {string} platform - Social media platform
   * @param {number} count - Number of hashtags to return
   * @returns {Promise<Array>} Trending hashtags
   */
  async getTrendingHashtags(platform, count = 20) {
    try {
      const response = await axios.get(
        `${API_URL}/ai/trending/${platform}?count=${count}`,
        { headers: getAuthHeader() }
      );
      return response.data.hashtags;
    } catch (error) {
      console.error('Error getting trending hashtags:', error);
      throw error;
    }
  }

  /**
   * Suggest content for a post
   * @param {string} platform - Social media platform
   * @param {string} topic - Topic for the post
   * @returns {Promise<string>} Suggested content
   */
  async suggestContent(platform, topic) {
    try {
      const response = await axios.post(
        `${API_URL}/ai/suggest-content`,
        { platform, topic },
        { headers: getAuthHeader() }
      );
      return response.data.content;
    } catch (error) {
      console.error('Error suggesting content:', error);
      throw error;
    }
  }
}

export default new AIService(); 