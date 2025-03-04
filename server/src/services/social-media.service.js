const axios = require('axios');
const logger = require('../utils/logger');
const { TwitterApi } = require('twitter-api-v2');
const { IgApiClient } = require('instagram-private-api');
const { LinkedInApi } = require('node-linkedin');
const { FacebookApi } = require('fb');
const User = require('../models/user.model');

/**
 * Social Media Service
 * Handles interactions with various social media platforms
 */
class SocialMediaService {
  /**
   * Initialize social media clients
   */
  constructor() {
    this.clients = {};
    logger.info('Social Media Service initialized');
  }

  /**
   * Get social media client for a specific platform and user
   * @param {string} platform - Social media platform
   * @param {string} userId - User ID
   * @returns {Object} - Social media client
   */
  async getClient(platform, userId) {
    // Check if client already exists
    const clientKey = `${platform}_${userId}`;
    if (this.clients[clientKey]) {
      return this.clients[clientKey];
    }

    // Get user's social account
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const socialAccount = user.socialAccounts.find(
      account => account.platform === platform && account.connected
    );

    if (!socialAccount) {
      throw new Error(`No connected ${platform} account found for user`);
    }

    // Initialize client based on platform
    let client;
    switch (platform) {
      case 'twitter':
        client = new TwitterApi({
          appKey: process.env.TWITTER_API_KEY,
          appSecret: process.env.TWITTER_API_SECRET,
          accessToken: socialAccount.accessToken,
          accessSecret: socialAccount.refreshToken,
        });
        break;

      case 'instagram':
        client = new IgApiClient();
        client.state.generateDevice(socialAccount.username);
        await client.account.login(socialAccount.username, socialAccount.accessToken);
        break;

      case 'facebook':
        client = new FacebookApi({
          accessToken: socialAccount.accessToken,
          appId: process.env.FACEBOOK_APP_ID,
          appSecret: process.env.FACEBOOK_APP_SECRET,
        });
        break;

      case 'linkedin':
        client = new LinkedInApi({
          clientId: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          accessToken: socialAccount.accessToken,
        });
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Cache client
    this.clients[clientKey] = client;
    return client;
  }

  /**
   * Post content to social media
   * @param {string} platform - Social media platform
   * @param {string} userId - User ID
   * @param {Object} postData - Post data
   * @returns {Object} - Post result
   */
  async createPost(platform, userId, postData) {
    try {
      const client = await this.getClient(platform, userId);
      let result;

      switch (platform) {
        case 'twitter':
          result = await client.v2.tweet(postData.content);
          break;

        case 'instagram':
          // For Instagram, we need to handle media differently
          if (postData.media && postData.media.length > 0) {
            const mediaUrl = postData.media[0].url;
            const mediaBuffer = await this.downloadMedia(mediaUrl);
            
            if (postData.media.length === 1) {
              // Single photo post
              result = await client.publish.photo({
                file: mediaBuffer,
                caption: postData.content,
              });
            } else {
              // Carousel post
              const mediaItems = await Promise.all(
                postData.media.map(async (media) => {
                  const buffer = await this.downloadMedia(media.url);
                  return {
                    file: buffer,
                    type: media.type === 'video' ? 'video' : 'photo',
                  };
                })
              );
              
              result = await client.publish.album({
                items: mediaItems,
                caption: postData.content,
              });
            }
          } else {
            throw new Error('Instagram requires media for posts');
          }
          break;

        case 'facebook':
          if (postData.media && postData.media.length > 0) {
            // Post with media
            result = await client.api('me/photos', 'POST', {
              url: postData.media[0].url,
              caption: postData.content,
            });
          } else {
            // Text-only post
            result = await client.api('me/feed', 'POST', {
              message: postData.content,
            });
          }
          break;

        case 'linkedin':
          // LinkedIn post
          const postPayload = {
            author: `urn:li:person:${userId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: postData.content,
                },
                shareMediaCategory: 'NONE',
              },
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
          };

          // Add media if available
          if (postData.media && postData.media.length > 0) {
            postPayload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
            postPayload.specificContent['com.linkedin.ugc.ShareContent'].media = [
              {
                status: 'READY',
                description: {
                  text: postData.media[0].alt || '',
                },
                media: postData.media[0].url,
              },
            ];
          }

          result = await client.post('/v2/ugcPosts', postPayload);
          break;

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      logger.info(`Post created on ${platform} for user ${userId}`);
      return result;
    } catch (error) {
      logger.error(`Error creating post on ${platform}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get post analytics
   * @param {string} platform - Social media platform
   * @param {string} userId - User ID
   * @param {string} postId - Post ID
   * @returns {Object} - Post analytics
   */
  async getPostAnalytics(platform, userId, postId) {
    try {
      const client = await this.getClient(platform, userId);
      let analytics = {};

      switch (platform) {
        case 'twitter':
          // Get tweet metrics
          const tweetData = await client.v2.singleTweet(postId, {
            'tweet.fields': 'public_metrics,non_public_metrics',
          });
          
          analytics = {
            reach: tweetData.data.public_metrics.impression_count || 0,
            engagement: (
              (tweetData.data.public_metrics.like_count || 0) +
              (tweetData.data.public_metrics.reply_count || 0) +
              (tweetData.data.public_metrics.retweet_count || 0)
            ),
            likes: tweetData.data.public_metrics.like_count || 0,
            comments: tweetData.data.public_metrics.reply_count || 0,
            shares: tweetData.data.public_metrics.retweet_count || 0,
          };
          break;

        case 'instagram':
          // Get media insights
          const mediaInfo = await client.media.info(postId);
          const insights = await client.insights.mediaInsights(postId);
          
          analytics = {
            reach: insights.reach || 0,
            impressions: insights.impressions || 0,
            engagement: (
              (mediaInfo.like_count || 0) +
              (mediaInfo.comment_count || 0) +
              (insights.saves || 0)
            ),
            likes: mediaInfo.like_count || 0,
            comments: mediaInfo.comment_count || 0,
            saves: insights.saves || 0,
          };
          break;

        case 'facebook':
          // Get post insights
          const postInsights = await client.api(`${postId}/insights`, 'GET', {
            metric: 'post_impressions,post_engagements,post_reactions_by_type_total',
          });
          
          analytics = {
            reach: this.extractMetricValue(postInsights, 'post_impressions') || 0,
            engagement: this.extractMetricValue(postInsights, 'post_engagements') || 0,
            likes: this.extractReactionCount(postInsights, 'like') || 0,
            comments: 0, // Need separate API call for comments
            shares: 0, // Need separate API call for shares
          };
          
          // Get comments count
          const commentsData = await client.api(`${postId}/comments`, 'GET', { summary: true });
          analytics.comments = commentsData.summary.total_count || 0;
          
          // Get shares count
          const sharesData = await client.api(`${postId}/sharedposts`, 'GET', { summary: true });
          analytics.shares = sharesData.summary.total_count || 0;
          break;

        case 'linkedin':
          // Get post statistics
          const stats = await client.get(`/v2/socialActions/${postId}`);
          
          analytics = {
            likes: stats.likesSummary?.totalLikes || 0,
            comments: stats.commentsSummary?.totalComments || 0,
            shares: stats.sharesSummary?.totalShares || 0,
            engagement: (
              (stats.likesSummary?.totalLikes || 0) +
              (stats.commentsSummary?.totalComments || 0) +
              (stats.sharesSummary?.totalShares || 0)
            ),
          };
          
          // LinkedIn doesn't provide reach/impressions in the basic API
          analytics.reach = 0;
          break;

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      logger.info(`Retrieved analytics for post ${postId} on ${platform}`);
      return analytics;
    } catch (error) {
      logger.error(`Error getting post analytics on ${platform}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get account analytics
   * @param {string} platform - Social media platform
   * @param {string} userId - User ID
   * @param {Object} options - Options (timeframe, etc.)
   * @returns {Object} - Account analytics
   */
  async getAccountAnalytics(platform, userId, options = {}) {
    try {
      const client = await this.getClient(platform, userId);
      let analytics = {};
      const { startDate, endDate } = options;

      switch (platform) {
        case 'twitter':
          // Get user metrics
          const userData = await client.v2.me({
            'user.fields': 'public_metrics',
          });
          
          analytics = {
            followers: userData.data.public_metrics.followers_count || 0,
            following: userData.data.public_metrics.following_count || 0,
            tweets: userData.data.public_metrics.tweet_count || 0,
          };
          
          // For more detailed analytics, we would need to use Twitter Analytics API
          // which requires additional permissions
          break;

        case 'instagram':
          // Get user insights
          const userInsights = await client.insights.account({
            period: 'day',
            metrics: ['impressions', 'reach', 'profile_views'],
          });
          
          const profileInfo = await client.account.getInfo();
          
          analytics = {
            followers: profileInfo.follower_count || 0,
            following: profileInfo.following_count || 0,
            posts: profileInfo.media_count || 0,
            reach: this.extractInsightValue(userInsights, 'reach') || 0,
            impressions: this.extractInsightValue(userInsights, 'impressions') || 0,
            profileVisits: this.extractInsightValue(userInsights, 'profile_views') || 0,
          };
          break;

        case 'facebook':
          // Get page insights
          const pageInsights = await client.api('me/insights', 'GET', {
            metric: 'page_impressions,page_engaged_users,page_fans',
            period: 'day',
            date_preset: 'last_30_days',
          });
          
          analytics = {
            followers: this.extractMetricValue(pageInsights, 'page_fans') || 0,
            reach: this.extractMetricValue(pageInsights, 'page_impressions') || 0,
            engagement: this.extractMetricValue(pageInsights, 'page_engaged_users') || 0,
          };
          break;

        case 'linkedin':
          // Get organization followers
          const orgData = await client.get('/v2/organizationalEntityFollowerStatistics');
          
          // Get page statistics
          const pageStats = await client.get('/v2/organizationalEntityShareStatistics');
          
          analytics = {
            followers: orgData.totalFollowerCount || 0,
            impressions: this.sumMetrics(pageStats.totalShareStatistics?.impressionCount) || 0,
            engagement: this.sumMetrics(pageStats.totalShareStatistics?.engagement) || 0,
            clicks: this.sumMetrics(pageStats.totalShareStatistics?.clickCount) || 0,
            likes: this.sumMetrics(pageStats.totalShareStatistics?.likeCount) || 0,
            comments: this.sumMetrics(pageStats.totalShareStatistics?.commentCount) || 0,
            shares: this.sumMetrics(pageStats.totalShareStatistics?.shareCount) || 0,
          };
          break;

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      logger.info(`Retrieved account analytics for ${platform} user ${userId}`);
      return analytics;
    } catch (error) {
      logger.error(`Error getting account analytics on ${platform}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get trending hashtags from social media platforms
   * @param {string} platform - Social media platform
   * @returns {Array} - Trending hashtags
   */
  async getTrendingHashtags(platform) {
    try {
      let trending = [];

      switch (platform) {
        case 'twitter':
          // Get trending topics from Twitter
          // Note: This requires elevated access to the Twitter API
          const twitterClient = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            bearerToken: process.env.TWITTER_BEARER_TOKEN,
          });
          
          // Get trends for a specific location (1 is global)
          const trendData = await twitterClient.v1.trendsByPlace(1);
          
          trending = trendData[0].trends
            .filter(trend => trend.name.startsWith('#'))
            .map(trend => ({
              text: trend.name,
              score: trend.tweet_volume || 0,
              category: 'trending',
              isAIGenerated: false,
            }));
          break;

        case 'instagram':
          // Instagram doesn't have a public API for trending hashtags
          // We would need to use a third-party service or scrape the data
          // For now, we'll call our AI service to get trending hashtags
          trending = await this.getAITrendingHashtags(platform);
          break;

        case 'facebook':
          // Facebook doesn't have a public API for trending hashtags
          trending = await this.getAITrendingHashtags(platform);
          break;

        case 'linkedin':
          // LinkedIn doesn't have a public API for trending hashtags
          trending = await this.getAITrendingHashtags(platform);
          break;

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      logger.info(`Retrieved trending hashtags for ${platform}`);
      return trending;
    } catch (error) {
      logger.error(`Error getting trending hashtags on ${platform}: ${error.message}`);
      // Fallback to AI service
      return this.getAITrendingHashtags(platform);
    }
  }

  /**
   * Get trending hashtags from AI service
   * @param {string} platform - Social media platform
   * @returns {Array} - Trending hashtags
   */
  async getAITrendingHashtags(platform) {
    try {
      const response = await axios.get(`${process.env.AI_SERVICE_URL}/trending/${platform}`);
      return response.data;
    } catch (error) {
      logger.error(`Error getting AI trending hashtags: ${error.message}`);
      return [];
    }
  }

  /**
   * Download media from URL
   * @param {string} url - Media URL
   * @returns {Buffer} - Media buffer
   */
  async downloadMedia(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      logger.error(`Error downloading media: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract metric value from Facebook insights
   * @param {Object} insights - Facebook insights data
   * @param {string} metricName - Metric name
   * @returns {number} - Metric value
   */
  extractMetricValue(insights, metricName) {
    if (!insights || !insights.data) return 0;
    
    const metric = insights.data.find(item => item.name === metricName);
    if (!metric || !metric.values || !metric.values[0]) return 0;
    
    return metric.values[0].value || 0;
  }

  /**
   * Extract reaction count from Facebook insights
   * @param {Object} insights - Facebook insights data
   * @param {string} reactionType - Reaction type
   * @returns {number} - Reaction count
   */
  extractReactionCount(insights, reactionType) {
    if (!insights || !insights.data) return 0;
    
    const metric = insights.data.find(item => item.name === 'post_reactions_by_type_total');
    if (!metric || !metric.values || !metric.values[0]) return 0;
    
    const values = metric.values[0].value || {};
    return values[reactionType] || 0;
  }

  /**
   * Extract insight value from Instagram insights
   * @param {Object} insights - Instagram insights data
   * @param {string} metricName - Metric name
   * @returns {number} - Metric value
   */
  extractInsightValue(insights, metricName) {
    if (!insights || !insights.data) return 0;
    
    const metric = insights.data.find(item => item.name === metricName);
    if (!metric || !metric.values || !metric.values[0]) return 0;
    
    return metric.values[0].value || 0;
  }

  /**
   * Sum metrics from LinkedIn statistics
   * @param {Array} metrics - LinkedIn metrics
   * @returns {number} - Sum of metrics
   */
  sumMetrics(metrics) {
    if (!metrics || !Array.isArray(metrics)) return 0;
    
    return metrics.reduce((sum, metric) => sum + (metric.count || 0), 0);
  }
}

module.exports = new SocialMediaService(); 