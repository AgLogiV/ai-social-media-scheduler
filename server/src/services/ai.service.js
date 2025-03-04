const axios = require('axios');
const logger = require('../utils/logger');

// Mock data for development purposes
const MOCK_DATA = {
  trending: {
    instagram: ['travel', 'fashion', 'food', 'fitness', 'photography', 'art', 'beauty', 'nature', 'music', 'love', 'design', 'motivation', 'style', 'family', 'health', 'life', 'instagood', 'photooftheday', 'happy', 'beautiful'],
    twitter: ['technology', 'news', 'politics', 'sports', 'gaming', 'business', 'crypto', 'ai', 'climatechange', 'health', 'science', 'education', 'entertainment', 'music', 'movies', 'books', 'travel', 'food', 'fashion', 'art'],
    facebook: ['family', 'friends', 'memories', 'events', 'community', 'support', 'inspiration', 'motivation', 'humor', 'recipes', 'diy', 'gardening', 'parenting', 'pets', 'travel', 'health', 'fitness', 'books', 'movies', 'music'],
    linkedin: ['leadership', 'business', 'innovation', 'technology', 'management', 'career', 'jobsearch', 'networking', 'marketing', 'sales', 'entrepreneurship', 'hr', 'productivity', 'success', 'learning', 'development', 'strategy', 'finance', 'data', 'ai']
  }
};

// Configuration for AI service
const AI_SERVICE_CONFIG = {
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:5001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.AI_SERVICE_API_KEY || 'dev-key'
  }
};

// Create axios instance for AI service
const aiClient = axios.create(AI_SERVICE_CONFIG);

/**
 * Check the health of the AI service
 * @returns {Promise<Object>} Health status
 */
async function checkHealth() {
  try {
    // In a real implementation, you would call the AI service
    // const response = await aiClient.get('/health');
    // return response.data;
    
    // Mock implementation
    return {
      status: 'healthy',
      version: '1.0.0',
      uptime: '3d 4h 12m',
      message: 'AI service is operational'
    };
  } catch (error) {
    logger.error(`Error checking AI service health: ${error.message}`);
    throw new Error('AI service health check failed');
  }
}

/**
 * Get hashtag suggestions based on content
 * @param {string} content - Post content
 * @param {string} platform - Social media platform
 * @param {number} count - Number of hashtags to suggest
 * @returns {Promise<Array>} Suggested hashtags
 */
async function getSuggestions(content, platform, count = 10) {
  try {
    // In a real implementation, you would call the AI service
    // const response = await aiClient.post('/suggest-hashtags', {
    //   content,
    //   platform,
    //   count
    // });
    // return response.data.hashtags;
    
    // Mock implementation
    const mockHashtags = generateMockHashtags(content, platform, count);
    return mockHashtags;
  } catch (error) {
    logger.error(`Error getting hashtag suggestions: ${error.message}`);
    throw new Error('Failed to get hashtag suggestions');
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
async function optimizeHashtags(hashtags, content, platform, count = 30) {
  try {
    // In a real implementation, you would call the AI service
    // const response = await aiClient.post('/optimize-hashtags', {
    //   hashtags,
    //   content,
    //   platform,
    //   count
    // });
    // return response.data.hashtags;
    
    // Mock implementation
    const mockHashtags = [...hashtags];
    
    // Add some new hashtags based on content if provided
    if (content) {
      const newHashtags = generateMockHashtags(content, platform, Math.min(10, count - hashtags.length));
      mockHashtags.push(...newHashtags.filter(tag => !mockHashtags.includes(tag)));
    }
    
    // Add some trending hashtags
    const trendingHashtags = MOCK_DATA.trending[platform] || [];
    const remainingCount = count - mockHashtags.length;
    
    if (remainingCount > 0 && trendingHashtags.length > 0) {
      // Shuffle trending hashtags
      const shuffled = [...trendingHashtags].sort(() => 0.5 - Math.random());
      
      // Take only what we need
      const selected = shuffled.slice(0, remainingCount);
      
      // Add to our hashtags if not already included
      mockHashtags.push(...selected.filter(tag => !mockHashtags.includes(tag)));
    }
    
    return mockHashtags.slice(0, count);
  } catch (error) {
    logger.error(`Error optimizing hashtags: ${error.message}`);
    throw new Error('Failed to optimize hashtags');
  }
}

/**
 * Predict post performance
 * @param {string} content - Post content
 * @param {Array} hashtags - Hashtags
 * @param {string} platform - Social media platform
 * @returns {Promise<Object>} Performance prediction
 */
async function predictPerformance(content, hashtags, platform) {
  try {
    // In a real implementation, you would call the AI service
    // const response = await aiClient.post('/predict-performance', {
    //   content,
    //   hashtags,
    //   platform
    // });
    // return response.data.prediction;
    
    // Mock implementation
    const contentScore = Math.min(10, Math.max(1, content.length / 50));
    const hashtagScore = Math.min(10, Math.max(1, hashtags.length / 3));
    
    const baseEngagement = {
      instagram: { likes: 120, comments: 15, shares: 5 },
      twitter: { likes: 50, comments: 8, shares: 20 },
      facebook: { likes: 80, comments: 12, shares: 15 },
      linkedin: { likes: 40, comments: 5, shares: 10 }
    }[platform] || { likes: 50, comments: 5, shares: 5 };
    
    const multiplier = (contentScore + hashtagScore) / 20 * 3;
    
    return {
      score: Math.round((contentScore + hashtagScore) * 5),
      engagement: {
        estimated_likes: Math.round(baseEngagement.likes * multiplier),
        estimated_comments: Math.round(baseEngagement.comments * multiplier),
        estimated_shares: Math.round(baseEngagement.shares * multiplier)
      },
      recommendations: [
        contentScore < 5 ? 'Consider adding more engaging content to increase performance' : 'Your content length is good for engagement',
        hashtagScore < 5 ? 'Adding more relevant hashtags could improve visibility' : 'Your hashtag count is optimal',
        'Best time to post: ' + getBestTimeToPost(platform)
      ]
    };
  } catch (error) {
    logger.error(`Error predicting performance: ${error.message}`);
    throw new Error('Failed to predict post performance');
  }
}

/**
 * Get trending hashtags
 * @param {string} platform - Social media platform
 * @param {number} count - Number of hashtags to return
 * @returns {Promise<Array>} Trending hashtags
 */
async function getTrendingHashtags(platform, count = 20) {
  try {
    // In a real implementation, you would call the AI service
    // const response = await aiClient.get(`/trending/${platform}?count=${count}`);
    // return response.data.hashtags;
    
    // Mock implementation
    const trendingHashtags = MOCK_DATA.trending[platform] || MOCK_DATA.trending.instagram;
    return trendingHashtags.slice(0, count);
  } catch (error) {
    logger.error(`Error getting trending hashtags: ${error.message}`);
    throw new Error('Failed to get trending hashtags');
  }
}

/**
 * Generate mock hashtags based on content
 * @param {string} content - Post content
 * @param {string} platform - Social media platform
 * @param {number} count - Number of hashtags to generate
 * @returns {Array} Generated hashtags
 */
function generateMockHashtags(content, platform, count) {
  // Extract words from content
  const words = content.toLowerCase().match(/\b\w+\b/g) || [];
  
  // Filter out common words and short words
  const filteredWords = words.filter(word => 
    word.length > 3 && 
    !['the', 'and', 'for', 'that', 'have', 'this', 'with', 'you', 'not', 'but', 'from'].includes(word)
  );
  
  // Create hashtags from filtered words
  const contentHashtags = [...new Set(filteredWords)].map(word => word.toLowerCase()).slice(0, Math.min(5, count));
  
  // Get platform-specific hashtags
  const platformHashtags = MOCK_DATA.trending[platform] || [];
  
  // Combine and return unique hashtags
  const combined = [...contentHashtags, ...platformHashtags];
  const unique = [...new Set(combined)];
  
  return unique.slice(0, count);
}

/**
 * Get mock best time to post
 * @param {string} platform - Social media platform
 * @returns {string} Best time to post
 */
function getBestTimeToPost(platform) {
  const times = {
    instagram: ['9:00 AM', '12:00 PM', '8:00 PM'],
    twitter: ['8:00 AM', '12:00 PM', '5:00 PM'],
    facebook: ['1:00 PM', '3:00 PM', '9:00 PM'],
    linkedin: ['8:00 AM', '10:00 AM', '2:00 PM']
  };
  
  const platformTimes = times[platform] || times.instagram;
  const randomIndex = Math.floor(Math.random() * platformTimes.length);
  
  return platformTimes[randomIndex];
}

module.exports = {
  checkHealth,
  getSuggestions,
  optimizeHashtags,
  predictPerformance,
  getTrendingHashtags
}; 