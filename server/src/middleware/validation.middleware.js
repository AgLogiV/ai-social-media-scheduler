const { validationResult } = require('express-validator');

/**
 * Validation middleware
 * Checks for validation errors in the request
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: 'Validation failed',
    });
  }
  
  next();
}; 