const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const aiService = require('../services/ai.service');
const logger = require('../utils/logger');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health
 * @access  Private
 */
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.checkHealth();
    
    res.status(200).json({
      success: true,
      health,
    });
  } catch (error) {
    logger.error(`Error checking AI service health: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to check AI service health',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/ai/suggest-hashtags
 * @desc    Suggest hashtags based on content
 * @access  Private
 */
router.post(
  '/suggest-hashtags',
  [
    body('content').notEmpty().withMessage('Content is required'),
    body('platform').isIn(['instagram', 'twitter', 'facebook', 'linkedin']).withMessage('Invalid platform'),
    body('count').optional().isInt({ min: 1, max: 50 }).withMessage('Count must be between 1 and 50'),
  ],
  validate,
  async (req, res) => {
    try {
      const { content, platform, count = 10 } = req.body;
      
      const hashtags = await aiService.getSuggestions(content, platform, count);
      
      res.status(200).json({
        success: true,
        hashtags,
      });
    } catch (error) {
      logger.error(`Error suggesting hashtags: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to suggest hashtags',
        error: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/ai/optimize-hashtags
 * @desc    Optimize hashtag combination
 * @access  Private
 */
router.post(
  '/optimize-hashtags',
  [
    body('hashtags').isArray().withMessage('Hashtags must be an array'),
    body('content').optional().isString().withMessage('Content must be a string'),
    body('platform').isIn(['instagram', 'twitter', 'facebook', 'linkedin']).withMessage('Invalid platform'),
    body('count').optional().isInt({ min: 1, max: 50 }).withMessage('Count must be between 1 and 50'),
  ],
  validate,
  async (req, res) => {
    try {
      const { hashtags, content, platform, count = 30 } = req.body;
      
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
  }
);

/**
 * @route   POST /api/ai/predict-performance
 * @desc    Predict post performance
 * @access  Private
 */
router.post(
  '/predict-performance',
  [
    body('content').notEmpty().withMessage('Content is required'),
    body('hashtags').isArray().withMessage('Hashtags must be an array'),
    body('platform').isIn(['instagram', 'twitter', 'facebook', 'linkedin']).withMessage('Invalid platform'),
  ],
  validate,
  async (req, res) => {
    try {
      const { content, hashtags, platform } = req.body;
      
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
  }
);

/**
 * @route   GET /api/ai/trending/:platform
 * @desc    Get trending hashtags
 * @access  Private
 */
router.get('/trending/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { count = 20 } = req.query;
    
    if (!['instagram', 'twitter', 'facebook', 'linkedin'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform',
      });
    }
    
    const hashtags = await aiService.getTrendingHashtags(platform, parseInt(count));
    
    res.status(200).json({
      success: true,
      hashtags,
    });
  } catch (error) {
    logger.error(`Error getting trending hashtags: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending hashtags',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/ai/suggest-content
 * @desc    Suggest content for a post
 * @access  Private
 */
router.post(
  '/suggest-content',
  [
    body('platform').isIn(['instagram', 'twitter', 'facebook', 'linkedin']).withMessage('Invalid platform'),
    body('topic').notEmpty().withMessage('Topic is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { platform, topic } = req.body;
      
      // This is a mock implementation since the AI service doesn't have a content suggestion endpoint
      // In a real implementation, you would call the AI service
      const content = generateMockContent(platform, topic);
      
      res.status(200).json({
        success: true,
        content,
      });
    } catch (error) {
      logger.error(`Error suggesting content: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to suggest content',
        error: error.message,
      });
    }
  }
);

/**
 * Generate mock content for a post
 * @param {string} platform - Social media platform
 * @param {string} topic - Topic for the post
 * @returns {string} - Generated content
 */
function generateMockContent(platform, topic) {
  const templates = {
    instagram: [
      `✨ Exploring the world of ${topic} today! What's your favorite aspect of it? Share in the comments below! 📸 #${topic.replace(/\s+/g, '')} #Inspiration`,
      `🌟 Diving deep into ${topic} and discovering amazing insights! Can't wait to share more with you all. 💫 #${topic.replace(/\s+/g, '')} #Learning`,
      `📱 Just discovered something incredible about ${topic}! Swipe to see more and let me know your thoughts! 👀 #${topic.replace(/\s+/g, '')} #Discovery`
    ],
    twitter: [
      `Just learned something fascinating about ${topic}! Anyone else interested in this? #${topic.replace(/\s+/g, '')}`,
      `Exploring the world of ${topic} today. So many interesting aspects to discover! #${topic.replace(/\s+/g, '')}`,
      `Quick question for the ${topic} experts out there: what's your best tip for beginners? #${topic.replace(/\s+/g, '')}`
    ],
    facebook: [
      `I've been exploring ${topic} lately and wanted to share some thoughts with you all. It's fascinating how much there is to learn about it! What aspects of ${topic} interest you the most?`,
      `Today I'm diving deep into ${topic} and I'm amazed by what I'm discovering. Has anyone else explored this area? I'd love to hear your experiences!`,
      `Question for my friends interested in ${topic}: what resources would you recommend for someone just getting started? I'm looking to expand my knowledge and would appreciate any suggestions!`
    ],
    linkedin: [
      `I'm excited to share my latest insights on ${topic}. This field is evolving rapidly, and staying informed is crucial for professionals. What trends are you seeing in this space? #${topic.replace(/\s+/g, '')} #ProfessionalDevelopment`,
      `Recently, I've been researching ${topic} and its impact on our industry. The potential for innovation is tremendous. I'd love to connect with others working in this area to exchange ideas. #${topic.replace(/\s+/g, '')} #Innovation`,
      `As professionals, we should always be learning. Today, I'm focusing on ${topic} and how it's transforming our approach to business. What skills do you think are essential in this domain? #${topic.replace(/\s+/g, '')} #ContinuousLearning`
    ]
  };
  
  const platformTemplates = templates[platform] || templates.instagram;
  const randomIndex = Math.floor(Math.random() * platformTemplates.length);
  
  return platformTemplates[randomIndex];
}

module.exports = router; 