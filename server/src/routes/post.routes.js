const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const postValidation = require('../middleware/validation/post.validation');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post(
  '/',
  postValidation.createPostValidation,
  validate,
  postController.createPost
);

/**
 * @route   GET /api/posts
 * @desc    Get all posts
 * @access  Private
 */
router.get(
  '/',
  postValidation.getPostsValidation,
  validate,
  postController.getPosts
);

/**
 * @route   GET /api/posts/:id
 * @desc    Get a post by ID
 * @access  Private
 */
router.get(
  '/:id',
  postValidation.getPostValidation,
  validate,
  postController.getPost
);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.put(
  '/:id',
  postValidation.updatePostValidation,
  validate,
  postController.updatePost
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete(
  '/:id',
  postValidation.deletePostValidation,
  validate,
  postController.deletePost
);

/**
 * @route   POST /api/posts/:id/publish
 * @desc    Publish a post immediately
 * @access  Private
 */
router.post(
  '/:id/publish',
  postValidation.publishPostValidation,
  validate,
  postController.publishPost
);

/**
 * @route   POST /api/posts/:id/schedule
 * @desc    Schedule a post
 * @access  Private
 */
router.post(
  '/:id/schedule',
  postValidation.schedulePostValidation,
  validate,
  postController.schedulePost
);

/**
 * @route   POST /api/posts/:id/cancel
 * @desc    Cancel a scheduled post
 * @access  Private
 */
router.post(
  '/:id/cancel',
  postValidation.cancelScheduledPostValidation,
  validate,
  postController.cancelScheduledPost
);

/**
 * @route   GET /api/posts/:id/analytics
 * @desc    Get analytics for a post
 * @access  Private
 */
router.get(
  '/:id/analytics',
  postValidation.getPostAnalyticsValidation,
  validate,
  postController.getPostAnalytics
);

/**
 * @route   POST /api/posts/upload
 * @desc    Upload media for a post
 * @access  Private
 */
router.post(
  '/upload',
  postController.uploadMedia
);

module.exports = router; 