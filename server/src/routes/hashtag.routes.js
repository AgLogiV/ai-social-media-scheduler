const express = require('express');
const { body, query, param } = require('express-validator');
const hashtagController = require('../controllers/hashtag.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @route   POST /api/hashtags/suggest
 * @desc    Get hashtag suggestions based on content
 * @access  Private
 */
router.post(
  '/suggest',
  authMiddleware.protect,
  [
    body('content').notEmpty().withMessage('Content is required'),
    body('platform').notEmpty().withMessage('Platform is required'),
    body('count').optional().isInt({ min: 1, max: 30 }).withMessage('Count must be between 1 and 30'),
  ],
  validationMiddleware.validate,
  hashtagController.getSuggestions
);

/**
 * @route   POST /api/hashtags/optimize
 * @desc    Optimize hashtags for maximum reach and engagement
 * @access  Private
 */
router.post(
  '/optimize',
  authMiddleware.protect,
  [
    body('hashtags').isArray().withMessage('Hashtags must be an array'),
    body('content').notEmpty().withMessage('Content is required'),
    body('platform').notEmpty().withMessage('Platform is required'),
    body('count').optional().isInt({ min: 1, max: 30 }).withMessage('Count must be between 1 and 30'),
  ],
  validationMiddleware.validate,
  hashtagController.optimizeHashtags
);

/**
 * @route   POST /api/hashtags/predict
 * @desc    Predict performance of a post with given hashtags
 * @access  Private
 */
router.post(
  '/predict',
  authMiddleware.protect,
  [
    body('content').notEmpty().withMessage('Content is required'),
    body('hashtags').isArray().withMessage('Hashtags must be an array'),
    body('platform').notEmpty().withMessage('Platform is required'),
  ],
  validationMiddleware.validate,
  hashtagController.predictPerformance
);

/**
 * @route   GET /api/hashtags/trending/:platform
 * @desc    Get trending hashtags for a platform
 * @access  Private
 */
router.get(
  '/trending/:platform',
  authMiddleware.protect,
  [
    param('platform').notEmpty().withMessage('Platform is required'),
    query('count').optional().isInt({ min: 1, max: 50 }).withMessage('Count must be between 1 and 50'),
  ],
  validationMiddleware.validate,
  hashtagController.getTrendingHashtags
);

/**
 * @route   GET /api/hashtags/analyze/:hashtag
 * @desc    Analyze hashtag performance
 * @access  Private
 */
router.get(
  '/analyze/:hashtag',
  authMiddleware.protect,
  [
    param('hashtag').notEmpty().withMessage('Hashtag is required'),
    query('platform').notEmpty().withMessage('Platform is required'),
  ],
  validationMiddleware.validate,
  hashtagController.analyzeHashtag
);

/**
 * @route   GET /api/hashtags/related/:hashtag
 * @desc    Get related hashtags
 * @access  Private
 */
router.get(
  '/related/:hashtag',
  authMiddleware.protect,
  [
    param('hashtag').notEmpty().withMessage('Hashtag is required'),
    query('platform').notEmpty().withMessage('Platform is required'),
    query('count').optional().isInt({ min: 1, max: 30 }).withMessage('Count must be between 1 and 30'),
  ],
  validationMiddleware.validate,
  hashtagController.getRelatedHashtags
);

/**
 * @route   GET /api/hashtags/history
 * @desc    Get user's hashtag usage history
 * @access  Private
 */
router.get(
  '/history',
  authMiddleware.protect,
  hashtagController.getHashtagHistory
);

/**
 * @route   POST /api/hashtags/save
 * @desc    Save hashtags for future use
 * @access  Private
 */
router.post(
  '/save',
  authMiddleware.protect,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('hashtags').isArray().withMessage('Hashtags must be an array'),
    body('platform').optional(),
  ],
  validationMiddleware.validate,
  hashtagController.saveHashtags
);

/**
 * @route   GET /api/hashtags/saved
 * @desc    Get user's saved hashtag sets
 * @access  Private
 */
router.get(
  '/saved',
  authMiddleware.protect,
  hashtagController.getSavedHashtags
);

/**
 * @route   DELETE /api/hashtags/saved/:id
 * @desc    Delete a saved hashtag set
 * @access  Private
 */
router.delete(
  '/saved/:id',
  authMiddleware.protect,
  hashtagController.deleteSavedHashtags
);

module.exports = router; 