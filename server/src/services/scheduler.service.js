const cron = require('node-cron');
const logger = require('../utils/logger');
const Post = require('../models/post.model');
const socialMediaService = require('./social-media.service');
const emailService = require('./email.service');

/**
 * Scheduler Service
 * Handles scheduling and publishing of posts
 */
class SchedulerService {
  /**
   * Initialize scheduler
   */
  constructor() {
    this.jobs = new Map();
    this.initializeScheduler();
    logger.info('Scheduler Service initialized');
  }

  /**
   * Initialize scheduler by loading all pending scheduled posts
   */
  async initializeScheduler() {
    try {
      // Get all pending scheduled posts
      const scheduledPosts = await Post.find({
        status: 'scheduled',
        scheduledTime: { $gt: new Date() },
      }).populate('user');

      // Schedule each post
      scheduledPosts.forEach(post => {
        this.schedulePost(post);
      });

      logger.info(`Initialized scheduler with ${scheduledPosts.length} pending posts`);

      // Set up a daily job to check for posts that need scheduling
      cron.schedule('0 0 * * *', async () => {
        await this.checkForNewScheduledPosts();
      });

      // Set up a job to run every 5 minutes to check for failed posts
      cron.schedule('*/5 * * * *', async () => {
        await this.retryFailedPosts();
      });
    } catch (error) {
      logger.error(`Error initializing scheduler: ${error.message}`);
    }
  }

  /**
   * Check for new scheduled posts
   */
  async checkForNewScheduledPosts() {
    try {
      // Get all pending scheduled posts that aren't already scheduled
      const scheduledPosts = await Post.find({
        status: 'scheduled',
        scheduledTime: { $gt: new Date() },
      }).populate('user');

      // Filter out posts that are already scheduled
      const newPosts = scheduledPosts.filter(post => !this.jobs.has(post._id.toString()));

      // Schedule each new post
      newPosts.forEach(post => {
        this.schedulePost(post);
      });

      logger.info(`Found and scheduled ${newPosts.length} new posts`);
    } catch (error) {
      logger.error(`Error checking for new scheduled posts: ${error.message}`);
    }
  }

  /**
   * Retry failed posts
   */
  async retryFailedPosts() {
    try {
      // Get all failed posts that haven't exceeded retry limit
      const failedPosts = await Post.find({
        status: 'failed',
        retryCount: { $lt: 3 },
        scheduledTime: { $lt: new Date() },
      }).populate('user');

      // Retry each failed post
      for (const post of failedPosts) {
        await this.publishPost(post);
      }

      logger.info(`Retried ${failedPosts.length} failed posts`);
    } catch (error) {
      logger.error(`Error retrying failed posts: ${error.message}`);
    }
  }

  /**
   * Schedule a post
   * @param {Object} post - Post to schedule
   */
  schedulePost(post) {
    try {
      const postId = post._id.toString();
      const scheduledTime = new Date(post.scheduledTime);
      
      // Calculate cron expression
      const cronExpression = this.getCronExpression(scheduledTime);
      
      // If the post is already scheduled, cancel the existing job
      if (this.jobs.has(postId)) {
        this.cancelScheduledPost(postId);
      }
      
      // Schedule the post
      const job = cron.schedule(cronExpression, async () => {
        await this.publishPost(post);
        // Remove the job after it's executed
        this.jobs.delete(postId);
      });
      
      // Store the job
      this.jobs.set(postId, job);
      
      logger.info(`Scheduled post ${postId} for ${scheduledTime.toISOString()}`);
      return true;
    } catch (error) {
      logger.error(`Error scheduling post ${post._id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Cancel a scheduled post
   * @param {string} postId - Post ID
   * @returns {boolean} - Success status
   */
  cancelScheduledPost(postId) {
    try {
      // Check if the post is scheduled
      if (!this.jobs.has(postId)) {
        logger.warn(`Post ${postId} is not scheduled`);
        return false;
      }
      
      // Stop the job
      const job = this.jobs.get(postId);
      job.stop();
      
      // Remove the job
      this.jobs.delete(postId);
      
      logger.info(`Cancelled scheduled post ${postId}`);
      return true;
    } catch (error) {
      logger.error(`Error cancelling scheduled post ${postId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Publish a post to social media
   * @param {Object} post - Post to publish
   */
  async publishPost(post) {
    try {
      // Update post status to publishing
      post.status = 'publishing';
      await post.save();
      
      // Get user ID and platform
      const userId = post.user._id;
      const platform = post.platform;
      
      // Prepare post data
      const postData = {
        content: post.content,
        media: post.media,
      };
      
      // Publish to social media
      const result = await socialMediaService.createPost(platform, userId, postData);
      
      // Update post with result
      post.status = 'published';
      post.publishedTime = new Date();
      post.platformPostId = result.id || result.data?.id;
      await post.save();
      
      // Send notification email
      await this.sendPublishNotification(post, true);
      
      logger.info(`Published post ${post._id} to ${platform}`);
    } catch (error) {
      logger.error(`Error publishing post ${post._id}: ${error.message}`);
      
      // Update post status to failed
      post.status = 'failed';
      post.retryCount = (post.retryCount || 0) + 1;
      post.lastError = error.message;
      await post.save();
      
      // Send failure notification if max retries reached
      if (post.retryCount >= 3) {
        await this.sendPublishNotification(post, false);
      }
    }
  }

  /**
   * Send notification email about post publishing
   * @param {Object} post - Post
   * @param {boolean} success - Whether publishing was successful
   */
  async sendPublishNotification(post, success) {
    try {
      const user = post.user;
      
      // Check if user has notifications enabled
      if (!user.notificationSettings?.postPublished) {
        return;
      }
      
      // Prepare email data
      const emailData = {
        to: user.email,
        subject: success 
          ? `Your post has been published to ${post.platform}` 
          : `Failed to publish your post to ${post.platform}`,
        template: success ? 'post-published' : 'post-failed',
        context: {
          userName: user.name,
          platform: post.platform,
          postContent: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          scheduledTime: new Date(post.scheduledTime).toLocaleString(),
          publishedTime: success ? new Date(post.publishedTime).toLocaleString() : null,
          error: success ? null : post.lastError,
          dashboardUrl: `${process.env.CLIENT_URL}/dashboard/posts`,
        },
      };
      
      // Send email
      await emailService.sendEmail(emailData);
      
      logger.info(`Sent ${success ? 'success' : 'failure'} notification email to ${user.email} for post ${post._id}`);
    } catch (error) {
      logger.error(`Error sending notification email: ${error.message}`);
    }
  }

  /**
   * Get cron expression for a date
   * @param {Date} date - Date to convert
   * @returns {string} - Cron expression
   */
  getCronExpression(date) {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    
    return `${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
  }

  /**
   * Reschedule a post
   * @param {string} postId - Post ID
   * @param {Date} newScheduledTime - New scheduled time
   * @returns {boolean} - Success status
   */
  async reschedulePost(postId, newScheduledTime) {
    try {
      // Get the post
      const post = await Post.findById(postId).populate('user');
      if (!post) {
        logger.warn(`Post ${postId} not found`);
        return false;
      }
      
      // Update scheduled time
      post.scheduledTime = newScheduledTime;
      post.status = 'scheduled';
      await post.save();
      
      // Reschedule the post
      this.schedulePost(post);
      
      logger.info(`Rescheduled post ${postId} for ${newScheduledTime.toISOString()}`);
      return true;
    } catch (error) {
      logger.error(`Error rescheduling post ${postId}: ${error.message}`);
      return false;
    }
  }
}

module.exports = new SchedulerService(); 