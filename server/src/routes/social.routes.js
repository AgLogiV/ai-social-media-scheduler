const express = require('express');
const { body, param, query } = require('express-validator');
const socialController = require('../controllers/social.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @route   GET /api/social/accounts
 * @desc    Get user's connected social media accounts
 * @access  Private
 */
router.get(
  '/accounts',
  authMiddleware.protect,
  socialController.getConnectedAccounts
);

/**
 * @route   POST /api/social/connect/:platform
 * @desc    Connect a social media account
 * @access  Private
 */
router.post(
  '/connect/:platform',
  authMiddleware.protect,
  [
    param('platform').isIn(['twitter', 'instagram', 'facebook', 'linkedin']).withMessage('Invalid platform'),
    body('accessToken').notEmpty().withMessage('Access token is required'),
    body('refreshToken').optional(),
    body('username').optional(),
    body('profileId').optional(),
  ],
  validationMiddleware.validate,
  socialController.connectAccount
);

/**
 * @route   DELETE /api/social/disconnect/:platform
 * @desc    Disconnect a social media account
 * @access  Private
 */
router.delete(
  '/disconnect/:platform',
  authMiddleware.protect,
  [
    param('platform').isIn(['twitter', 'instagram', 'facebook', 'linkedin']).withMessage('Invalid platform'),
  ],
  validationMiddleware.validate,
  socialController.disconnectAccount
);

/**
 * @route   GET /api/social/analytics/:platform
 * @desc    Get analytics for a social media account
 * @access  Private
 */
router.get(
  '/analytics/:platform',
  authMiddleware.protect,
  [
    param('platform').isIn(['twitter', 'instagram', 'facebook', 'linkedin']).withMessage('Invalid platform'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  ],
  validationMiddleware.validate,
  socialController.getAccountAnalytics
);

/**
 * @route   GET /api/social/post/:platform/:postId
 * @desc    Get analytics for a specific post
 * @access  Private
 */
router.get(
  '/post/:platform/:postId',
  authMiddleware.protect,
  [
    param('platform').isIn(['twitter', 'instagram', 'facebook', 'linkedin']).withMessage('Invalid platform'),
    param('postId').notEmpty().withMessage('Post ID is required'),
  ],
  validationMiddleware.validate,
  socialController.getPostAnalytics
);

/**
 * @route   GET /api/social/auth/:platform
 * @desc    Get OAuth URL for a platform
 * @access  Private
 */
router.get(
  '/auth/:platform',
  authMiddleware.protect,
  [
    param('platform').isIn(['twitter', 'instagram', 'facebook', 'linkedin']).withMessage('Invalid platform'),
  ],
  validationMiddleware.validate,
  socialController.getAuthUrl
);

/**
 * @route   POST /api/social/auth/callback/:platform
 * @desc    Handle OAuth callback
 * @access  Private
 */
router.post(
  '/auth/callback/:platform',
  authMiddleware.protect,
  [
    param('platform').isIn(['twitter', 'instagram', 'facebook', 'linkedin']).withMessage('Invalid platform'),
    body('code').notEmpty().withMessage('Authorization code is required'),
  ],
  validationMiddleware.validate,
  socialController.handleAuthCallback
);

module.exports = router; 