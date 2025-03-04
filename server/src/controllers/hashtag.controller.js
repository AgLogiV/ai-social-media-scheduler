const aiService = require('../services/ai.service');
const socialMediaService = require('../services/social-media.service');
const HashtagSet = require('../models/hashtag-set.model');
const Post = require('../models/post.model');
const logger = require('../utils/logger');

/**
 * Get hashtag suggestions based on content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSuggestions = async (req, res) => {
  try {
    const { content, platform, count = 10 } = req.body;
    
    // Get suggestions from AI service
    const hashtags = await aiService.getSuggestions(content, platform, count);
    
    res.status(200).json({
      success: true,
      hashtags,
    });
  } catch (error) {
    logger.error(`Error getting hashtag suggestions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get hashtag suggestions',
      error: error.message,
    });
  }
};

/**
 * Optimize hashtags for maximum reach and engagement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.optimizeHashtags = async (req, res) => {
  try {
    const { hashtags, content, platform, count = 10 } = req.body;
    
    // Optimize hashtags using AI service
    const optimizedHashtags = await aiService.optimizeHashtags(hashtags, content, platform, count);
    
    res.status(200).json({
      success: true,
      hashtags: optimizedHashtags,
    });
  } catch (error) {
    logger.error(`Error optimizing hashtags: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize hashtags',
      error: error.message,
    });
  }
};

/**
 * Predict performance of a post with given hashtags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.predictPerformance = async (req, res) => {
  try {
    const { content, hashtags, platform } = req.body;
    
    // Predict performance using AI service
    const prediction = await aiService.predictPerformance(content, hashtags, platform);
    
    res.status(200).json({
      success: true,
      prediction,
    });
  } catch (error) {
    logger.error(`Error predicting performance: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to predict performance',
      error: error.message,
    });
  }
};

/**
 * Get trending hashtags for a platform
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTrendingHashtags = async (req, res) => {
  try {
    const { platform } = req.params;
    const { count = 20 } = req.query;
    
    // Try to get trending hashtags from social media service first
    try {
      const trendingHashtags = await socialMediaService.getTrendingHashtags(platform);
      
      if (trendingHashtags && trendingHashtags.length > 0) {
        return res.status(200).json({
          success: true,
          hashtags: trendingHashtags.slice(0, count),
          source: 'social-media-api',
        });
      }
    } catch (error) {
      logger.warn(`Failed to get trending hashtags from social media API: ${error.message}`);
    }
    
    // Fallback to AI service
    const trendingHashtags = await aiService.getTrendingHashtags(platform, count);
    
    res.status(200).json({
      success: true,
      hashtags: trendingHashtags,
      source: 'ai-service',
    });
  } catch (error) {
    logger.error(`Error getting trending hashtags: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending hashtags',
      error: error.message,
    });
  }
};

/**
 * Analyze hashtag performance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.analyzeHashtag = async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { platform } = req.query;
    
    // Analyze hashtag using AI service
    const analysis = await aiService.analyzeHashtag(hashtag, platform);
    
    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    logger.error(`Error analyzing hashtag: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze hashtag',
      error: error.message,
    });
  }
};

/**
 * Get related hashtags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRelatedHashtags = async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { platform, count = 10 } = req.query;
    
    // Get related hashtags using AI service
    const relatedHashtags = await aiService.getRelatedHashtags(hashtag, platform, count);
    
    res.status(200).json({
      success: true,
      hashtags: relatedHashtags,
    });
  } catch (error) {
    logger.error(`Error getting related hashtags: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get related hashtags',
      error: error.message,
    });
  }
};

/**
 * Get user's hashtag usage history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getHashtagHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's posts
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    
    // Extract hashtags from posts
    const hashtagCounts = {};
    
    posts.forEach(post => {
      // Extract hashtags from content
      const hashtags = post.content.match(/#[a-zA-Z0-9_]+/g) || [];
      
      // Count occurrences
      hashtags.forEach(hashtag => {
        if (hashtagCounts[hashtag]) {
          hashtagCounts[hashtag].count += 1;
          
          // Add platform if not already included
          if (!hashtagCounts[hashtag].platforms.includes(post.platform)) {
            hashtagCounts[hashtag].platforms.push(post.platform);
          }
          
          // Update last used
          if (new Date(post.createdAt) > new Date(hashtagCounts[hashtag].lastUsed)) {
            hashtagCounts[hashtag].lastUsed = post.createdAt;
          }
        } else {
          hashtagCounts[hashtag] = {
            text: hashtag,
            count: 1,
            platforms: [post.platform],
            lastUsed: post.createdAt,
          };
        }
      });
    });
    
    // Convert to array and sort by count
    const hashtagHistory = Object.values(hashtagCounts).sort((a, b) => b.count - a.count);
    
    res.status(200).json({
      success: true,
      hashtags: hashtagHistory,
    });
  } catch (error) {
    logger.error(`Error getting hashtag history: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get hashtag history',
      error: error.message,
    });
  }
};

/**
 * Save hashtags for future use
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.saveHashtags = async (req, res) => {
  try {
    const { name, hashtags, platform } = req.body;
    const userId = req.user._id;
    
    // Create new hashtag set
    const hashtagSet = new HashtagSet({
      name,
      hashtags,
      platform,
      user: userId,
    });
    
    // Save to database
    await hashtagSet.save();
    
    res.status(201).json({
      success: true,
      hashtagSet,
    });
  } catch (error) {
    logger.error(`Error saving hashtags: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to save hashtags',
      error: error.message,
    });
  }
};

/**
 * Get user's saved hashtag sets
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSavedHashtags = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's saved hashtag sets
    const hashtagSets = await HashtagSet.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      hashtagSets,
    });
  } catch (error) {
    logger.error(`Error getting saved hashtags: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved hashtags',
      error: error.message,
    });
  }
};

/**
 * Delete a saved hashtag set
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteSavedHashtags = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find hashtag set
    const hashtagSet = await HashtagSet.findById(id);
    
    // Check if hashtag set exists
    if (!hashtagSet) {
      return res.status(404).json({
        success: false,
        message: 'Hashtag set not found',
      });
    }
    
    // Check if user owns the hashtag set
    if (hashtagSet.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this hashtag set',
      });
    }
    
    // Delete hashtag set
    await hashtagSet.remove();
    
    res.status(200).json({
      success: true,
      message: 'Hashtag set deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting saved hashtags: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete saved hashtags',
      error: error.message,
    });
  }
}; 