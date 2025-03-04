import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Service for interacting with post-related APIs
 */
class PostService {
  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Created post
   */
  async createPost(postData) {
    try {
      const response = await axios.post(
        `${API_URL}/posts`,
        postData,
        { headers: getAuthHeader() }
      );
      return response.data.post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Get all posts
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Posts and pagination info
   */
  async getPosts(params = {}) {
    try {
      const response = await axios.get(
        `${API_URL}/posts`,
        { 
          params,
          headers: getAuthHeader() 
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }

  /**
   * Get a post by ID
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Post
   */
  async getPost(id) {
    try {
      const response = await axios.get(
        `${API_URL}/posts/${id}`,
        { headers: getAuthHeader() }
      );
      return response.data.post;
    } catch (error) {
      console.error(`Error getting post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a post
   * @param {string} id - Post ID
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Updated post
   */
  async updatePost(id, postData) {
    try {
      const response = await axios.put(
        `${API_URL}/posts/${id}`,
        postData,
        { headers: getAuthHeader() }
      );
      return response.data.post;
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a post
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Response
   */
  async deletePost(id) {
    try {
      const response = await axios.delete(
        `${API_URL}/posts/${id}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Publish a post immediately
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Published post
   */
  async publishPost(id) {
    try {
      const response = await axios.post(
        `${API_URL}/posts/${id}/publish`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data.post;
    } catch (error) {
      console.error(`Error publishing post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a post
   * @param {string} id - Post ID
   * @param {Date} scheduledTime - Scheduled time
   * @returns {Promise<Object>} Scheduled post
   */
  async schedulePost(id, scheduledTime) {
    try {
      const response = await axios.post(
        `${API_URL}/posts/${id}/schedule`,
        { scheduledTime },
        { headers: getAuthHeader() }
      );
      return response.data.post;
    } catch (error) {
      console.error(`Error scheduling post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled post
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Canceled post
   */
  async cancelPost(id) {
    try {
      const response = await axios.post(
        `${API_URL}/posts/${id}/cancel`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data.post;
    } catch (error) {
      console.error(`Error canceling post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get analytics for a post
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Post analytics
   */
  async getPostAnalytics(id) {
    try {
      const response = await axios.get(
        `${API_URL}/posts/${id}/analytics`,
        { headers: getAuthHeader() }
      );
      return response.data.analytics;
    } catch (error) {
      console.error(`Error getting analytics for post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Upload media for a post
   * @param {FormData} formData - Form data with media files
   * @param {Function} onUploadProgress - Progress callback
   * @returns {Promise<Object>} Uploaded media
   */
  async uploadMedia(formData, onUploadProgress) {
    try {
      const response = await axios.post(
        `${API_URL}/posts/upload`,
        formData,
        { 
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress
        }
      );
      return response.data.media;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }
}

export default new PostService(); 