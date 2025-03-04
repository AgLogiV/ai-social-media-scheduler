const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating a post
 */
exports.createPostValidation = [
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isString()
    .withMessage('Content must be a string')
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),
  
  body('platform')
    .notEmpty()
    .withMessage('Platform is required')
    .isString()
    .withMessage('Platform must be a string')
    .isIn(['instagram', 'twitter', 'facebook', 'linkedin'])
    .withMessage('Platform must be one of: instagram, twitter, facebook, linkedin'),
  
  body('scheduledTime')
    .optional()
    .isISO8601()
    .withMessage('Scheduled time must be a valid date')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      
      if (scheduledDate <= now) {
        throw new Error('Scheduled time must be in the future');
      }
      
      return true;
    }),
  
  body('media')
    .optional()
    .isArray()
    .withMessage('Media must be an array'),
  
  body('media.*.type')
    .optional()
    .isString()
    .withMessage('Media type must be a string')
    .isIn(['image', 'video', 'gif'])
    .withMessage('Media type must be one of: image, video, gif'),
  
  body('media.*.url')
    .optional()
    .isString()
    .withMessage('Media URL must be a string'),
  
  body('status')
    .optional()
    .isString()
    .withMessage('Status must be a string')
    .isIn(['draft', 'scheduled'])
    .withMessage('Status must be one of: draft, scheduled'),
];

/**
 * Validation rules for updating a post
 */
exports.updatePostValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID'),
  
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string')
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),
  
  body('platform')
    .optional()
    .isString()
    .withMessage('Platform must be a string')
    .isIn(['instagram', 'twitter', 'facebook', 'linkedin'])
    .withMessage('Platform must be one of: instagram, twitter, facebook, linkedin'),
  
  body('scheduledTime')
    .optional()
    .isISO8601()
    .withMessage('Scheduled time must be a valid date')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      
      if (scheduledDate <= now) {
        throw new Error('Scheduled time must be in the future');
      }
      
      return true;
    }),
  
  body('media')
    .optional()
    .isArray()
    .withMessage('Media must be an array'),
  
  body('media.*.type')
    .optional()
    .isString()
    .withMessage('Media type must be a string')
    .isIn(['image', 'video', 'gif'])
    .withMessage('Media type must be one of: image, video, gif'),
  
  body('media.*.url')
    .optional()
    .isString()
    .withMessage('Media URL must be a string'),
  
  body('status')
    .optional()
    .isString()
    .withMessage('Status must be a string')
    .isIn(['draft', 'scheduled'])
    .withMessage('Status must be one of: draft, scheduled'),
];

/**
 * Validation rules for getting a post by ID
 */
exports.getPostValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID'),
];

/**
 * Validation rules for deleting a post
 */
exports.deletePostValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID'),
];

/**
 * Validation rules for publishing a post
 */
exports.publishPostValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID'),
];

/**
 * Validation rules for scheduling a post
 */
exports.schedulePostValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID'),
  
  body('scheduledTime')
    .notEmpty()
    .withMessage('Scheduled time is required')
    .isISO8601()
    .withMessage('Scheduled time must be a valid date')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      
      if (scheduledDate <= now) {
        throw new Error('Scheduled time must be in the future');
      }
      
      return true;
    }),
];

/**
 * Validation rules for canceling a scheduled post
 */
exports.cancelScheduledPostValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID'),
];

/**
 * Validation rules for getting post analytics
 */
exports.getPostAnalyticsValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID'),
];

/**
 * Validation rules for getting posts
 */
exports.getPostsValidation = [
  query('status')
    .optional()
    .isString()
    .withMessage('Status must be a string')
    .isIn(['draft', 'scheduled', 'published', 'failed'])
    .withMessage('Status must be one of: draft, scheduled, published, failed'),
  
  query('platform')
    .optional()
    .isString()
    .withMessage('Platform must be a string')
    .isIn(['instagram', 'twitter', 'facebook', 'linkedin'])
    .withMessage('Platform must be one of: instagram, twitter, facebook, linkedin'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string')
    .isIn(['createdAt', 'scheduledTime', 'publishedTime'])
    .withMessage('Sort by must be one of: createdAt, scheduledTime, publishedTime'),
  
  query('sortOrder')
    .optional()
    .isString()
    .withMessage('Sort order must be a string')
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be one of: asc, desc'),
  
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.startDate && value) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      
      return true;
    }),
]; 