const Post = require('../models/post.model');
const socialMediaService = require('../services/social-media.service');
const schedulerService = require('../services/scheduler.service');
const aiService = require('../services/ai.service');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Create a new post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createPost = async (req, res) => {
  try {
    const { content, platform, scheduledTime, media, status = 'draft' } = req.body;
    const userId = req.user._id;
    
    // Create new post
    const post = new Post({
      user: userId,
      content,
      platform,
      media,
      status,
    });
    
    // If scheduled time is provided, set status to scheduled
    if (scheduledTime) {
      post.scheduledTime = new Date(scheduledTime);
      post.status = 'scheduled';
    }
    
    // Save post
    await post.save();
    
    // If status is scheduled, schedule the post
    if (post.status === 'scheduled') {
      schedulerService.schedulePost(post);
    }
    
    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    logger.error(`Error creating post: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message,
    });
  }
};

/**
 * Get all posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      status,
      platform,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      startDate,
      endDate,
    } = req.query;
    
    // Build query
    const query = {
      user: userId,
      isDeleted: false,
    };
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Add platform filter
    if (platform) {
      query.platform = platform;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { hashtags: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get posts
    const posts = await Post.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');
    
    // Get total count
    const total = await Post.countDocuments(query);
    
    res.status(200).json({
      success: true,
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error(`Error getting posts: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts',
      error: error.message,
    });
  }
};

/**
 * Get a post by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Get post
    const post = await Post.findOne({
      _id: id,
      user: userId,
      isDeleted: false,
    }).populate('user', 'name email');
    
    // Check if post exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    logger.error(`Error getting post: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get post',
      error: error.message,
    });
  }
};

/**
 * Update a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, platform, scheduledTime, media, status } = req.body;
    const userId = req.user._id;
    
    // Get post
    const post = await Post.findOne({
      _id: id,
      user: userId,
      isDeleted: false,
    });
    
    // Check if post exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Check if post is published
    if (post.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a published post',
      });
    }
    
    // Update post
    if (content !== undefined) post.content = content;
    if (platform !== undefined) post.platform = platform;
    if (media !== undefined) post.media = media;
    if (status !== undefined && status !== 'published') post.status = status;
    
    // If scheduled time is provided, update it
    if (scheduledTime !== undefined) {
      post.scheduledTime = new Date(scheduledTime);
      
      // If status is not explicitly set, set it to scheduled
      if (status === undefined) {
        post.status = 'scheduled';
      }
    }
    
    // Save post
    await post.save();
    
    // If status is scheduled, reschedule the post
    if (post.status === 'scheduled') {
      schedulerService.schedulePost(post);
    } else if (post.status !== 'scheduled' && post.scheduledTime) {
      // If status is not scheduled but has a scheduled time, cancel the scheduled post
      schedulerService.cancelScheduledPost(post._id.toString());
    }
    
    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    logger.error(`Error updating post: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message,
    });
  }
};

/**
 * Delete a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Get post
    const post = await Post.findOne({
      _id: id,
      user: userId,
      isDeleted: false,
    });
    
    // Check if post exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Soft delete post
    post.isDeleted = true;
    await post.save();
    
    // If post is scheduled, cancel it
    if (post.status === 'scheduled') {
      schedulerService.cancelScheduledPost(post._id.toString());
    }
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting post: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message,
    });
  }
};

/**
 * Publish a post immediately
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.publishPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Get post
    const post = await Post.findOne({
      _id: id,
      user: userId,
      isDeleted: false,
    }).populate('user');
    
    // Check if post exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Check if post is already published
    if (post.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Post is already published',
      });
    }
    
    // Update post status
    post.status = 'publishing';
    await post.save();
    
    // Publish post
    schedulerService.publishPost(post)
      .then(() => {
        logger.info(`Post ${post._id} published successfully`);
      })
      .catch((error) => {
        logger.error(`Error publishing post ${post._id}: ${error.message}`);
      });
    
    res.status(200).json({
      success: true,
      message: 'Post is being published',
      post,
    });
  } catch (error) {
    logger.error(`Error publishing post: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to publish post',
      error: error.message,
    });
  }
};

/**
 * Schedule a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.schedulePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledTime } = req.body;
    const userId = req.user._id;
    
    // Get post
    const post = await Post.findOne({
      _id: id,
      user: userId,
      isDeleted: false,
    });
    
    // Check if post exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Check if post is already published
    if (post.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule a published post',
      });
    }
    
    // Update post
    post.scheduledTime = new Date(scheduledTime);
    post.status = 'scheduled';
    await post.save();
    
    // Schedule post
    schedulerService.schedulePost(post);
    
    res.status(200).json({
      success: true,
      message: 'Post scheduled successfully',
      post,
    });
  } catch (error) {
    logger.error(`Error scheduling post: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule post',
      error: error.message,
    });
  }
};

/**
 * Cancel a scheduled post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.cancelScheduledPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Get post
    const post = await Post.findOne({
      _id: id,
      user: userId,
      isDeleted: false,
    });
    
    // Check if post exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Check if post is scheduled
    if (post.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Post is not scheduled',
      });
    }
    
    // Update post
    post.status = 'draft';
    await post.save();
    
    // Cancel scheduled post
    schedulerService.cancelScheduledPost(post._id.toString());
    
    res.status(200).json({
      success: true,
      message: 'Scheduled post cancelled successfully',
      post,
    });
  } catch (error) {
    logger.error(`Error cancelling scheduled post: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel scheduled post',
      error: error.message,
    });
  }
};

/**
 * Get analytics for a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPostAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Get post
    const post = await Post.findOne({
      _id: id,
      user: userId,
      isDeleted: false,
    });
    
    // Check if post exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Check if post is published
    if (post.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Post is not published',
      });
    }
    
    // Check if post has platform post ID
    if (!post.platformPostId) {
      return res.status(400).json({
        success: false,
        message: 'Post does not have a platform post ID',
      });
    }
    
    // Get analytics from social media service
    const analytics = await socialMediaService.getPostAnalytics(
      post.platform,
      userId,
      post.platformPostId
    );
    
    // Update post analytics
    await post.updateAnalytics(analytics);
    
    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    logger.error(`Error getting post analytics: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get post analytics',
      error: error.message,
    });
  }
};

/**
 * Configure multer storage
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

/**
 * Configure multer upload
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only images and videos are allowed'));
  },
}).array('media', 10);

/**
 * Upload media for a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadMedia = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      logger.error(`Error uploading media: ${err.message}`);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }
    
    // Process uploaded files
    const media = req.files.map(file => {
      const isImage = file.mimetype.startsWith('image');
      const isVideo = file.mimetype.startsWith('video');
      
      return {
        type: isImage ? 'image' : isVideo ? 'video' : 'gif',
        url: `/uploads/${file.filename}`,
        alt: '',
        width: 0,
        height: 0,
        size: file.size,
      };
    });
    
    res.status(200).json({
      success: true,
      media,
    });
  });
}; 