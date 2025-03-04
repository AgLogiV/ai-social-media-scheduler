const User = require('../models/user.model');
const socialMediaService = require('../services/social-media.service');
const logger = require('../utils/logger');

/**
 * Get user's connected social media accounts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getConnectedAccounts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with social accounts
    const user = await User.findById(userId).select('socialAccounts');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      accounts: user.socialAccounts,
    });
  } catch (error) {
    logger.error(`Error getting connected accounts: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get connected accounts',
      error: error.message,
    });
  }
};

/**
 * Connect a social media account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.connectAccount = async (req, res) => {
  try {
    const { platform } = req.params;
    const { accessToken, refreshToken, username, profileId } = req.body;
    const userId = req.user._id;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if account already exists
    const existingAccountIndex = user.socialAccounts.findIndex(
      account => account.platform === platform
    );
    
    if (existingAccountIndex !== -1) {
      // Update existing account
      user.socialAccounts[existingAccountIndex] = {
        platform,
        accessToken,
        refreshToken,
        username,
        profileId,
        connected: true,
        connectedAt: new Date(),
      };
    } else {
      // Add new account
      user.socialAccounts.push({
        platform,
        accessToken,
        refreshToken,
        username,
        profileId,
        connected: true,
        connectedAt: new Date(),
      });
    }
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Successfully connected ${platform} account`,
      account: user.socialAccounts.find(account => account.platform === platform),
    });
  } catch (error) {
    logger.error(`Error connecting account: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to connect account',
      error: error.message,
    });
  }
};

/**
 * Disconnect a social media account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.disconnectAccount = async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user._id;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if account exists
    const accountIndex = user.socialAccounts.findIndex(
      account => account.platform === platform
    );
    
    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `No connected ${platform} account found`,
      });
    }
    
    // Disconnect account
    user.socialAccounts[accountIndex].connected = false;
    user.socialAccounts[accountIndex].disconnectedAt = new Date();
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Successfully disconnected ${platform} account`,
    });
  } catch (error) {
    logger.error(`Error disconnecting account: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect account',
      error: error.message,
    });
  }
};

/**
 * Get analytics for a social media account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAccountAnalytics = async (req, res) => {
  try {
    const { platform } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user._id;
    
    // Get analytics from social media service
    const analytics = await socialMediaService.getAccountAnalytics(platform, userId, {
      startDate,
      endDate,
    });
    
    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    logger.error(`Error getting account analytics: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get account analytics',
      error: error.message,
    });
  }
};

/**
 * Get analytics for a specific post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPostAnalytics = async (req, res) => {
  try {
    const { platform, postId } = req.params;
    const userId = req.user._id;
    
    // Get analytics from social media service
    const analytics = await socialMediaService.getPostAnalytics(platform, userId, postId);
    
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
 * Get OAuth URL for a platform
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAuthUrl = async (req, res) => {
  try {
    const { platform } = req.params;
    
    // Define OAuth URLs for each platform
    const oauthUrls = {
      twitter: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_API_KEY}&redirect_uri=${encodeURIComponent(process.env.CLIENT_URL + '/auth/callback/twitter')}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`,
      
      facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.CLIENT_URL + '/auth/callback/facebook')}&state=state&scope=pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,pages_read_user_content,public_profile`,
      
      instagram: `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(process.env.CLIENT_URL + '/auth/callback/instagram')}&scope=user_profile,user_media&response_type=code`,
      
      linkedin: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.CLIENT_URL + '/auth/callback/linkedin')}&state=state&scope=r_liteprofile%20r_emailaddress%20w_member_social`,
    };
    
    // Check if platform is supported
    if (!oauthUrls[platform]) {
      return res.status(400).json({
        success: false,
        message: `Unsupported platform: ${platform}`,
      });
    }
    
    res.status(200).json({
      success: true,
      url: oauthUrls[platform],
    });
  } catch (error) {
    logger.error(`Error getting auth URL: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get auth URL',
      error: error.message,
    });
  }
};

/**
 * Handle OAuth callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.handleAuthCallback = async (req, res) => {
  try {
    const { platform } = req.params;
    const { code } = req.body;
    const userId = req.user._id;
    
    // Exchange code for tokens
    let tokenData;
    
    switch (platform) {
      case 'twitter':
        tokenData = await exchangeTwitterCode(code);
        break;
      case 'facebook':
        tokenData = await exchangeFacebookCode(code);
        break;
      case 'instagram':
        tokenData = await exchangeInstagramCode(code);
        break;
      case 'linkedin':
        tokenData = await exchangeLinkedinCode(code);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported platform: ${platform}`,
        });
    }
    
    // Get user info
    let userInfo;
    
    switch (platform) {
      case 'twitter':
        userInfo = await getTwitterUserInfo(tokenData.access_token);
        break;
      case 'facebook':
        userInfo = await getFacebookUserInfo(tokenData.access_token);
        break;
      case 'instagram':
        userInfo = await getInstagramUserInfo(tokenData.access_token);
        break;
      case 'linkedin':
        userInfo = await getLinkedinUserInfo(tokenData.access_token);
        break;
    }
    
    // Connect account
    const connectData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      username: userInfo.username || userInfo.name,
      profileId: userInfo.id,
    };
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if account already exists
    const existingAccountIndex = user.socialAccounts.findIndex(
      account => account.platform === platform
    );
    
    if (existingAccountIndex !== -1) {
      // Update existing account
      user.socialAccounts[existingAccountIndex] = {
        platform,
        ...connectData,
        connected: true,
        connectedAt: new Date(),
      };
    } else {
      // Add new account
      user.socialAccounts.push({
        platform,
        ...connectData,
        connected: true,
        connectedAt: new Date(),
      });
    }
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Successfully connected ${platform} account`,
      account: user.socialAccounts.find(account => account.platform === platform),
    });
  } catch (error) {
    logger.error(`Error handling auth callback: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to handle auth callback',
      error: error.message,
    });
  }
};

/**
 * Exchange Twitter authorization code for tokens
 * @param {string} code - Authorization code
 * @returns {Object} - Token data
 */
async function exchangeTwitterCode(code) {
  try {
    const axios = require('axios');
    
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.TWITTER_API_KEY);
    params.append('redirect_uri', `${process.env.CLIENT_URL}/auth/callback/twitter`);
    params.append('code_verifier', 'challenge');
    
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Error exchanging Twitter code: ${error.message}`);
    throw new Error(`Failed to exchange Twitter code: ${error.message}`);
  }
}

/**
 * Exchange Facebook authorization code for tokens
 * @param {string} code - Authorization code
 * @returns {Object} - Token data
 */
async function exchangeFacebookCode(code) {
  try {
    const axios = require('axios');
    
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: `${process.env.CLIENT_URL}/auth/callback/facebook`,
        code,
      },
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Error exchanging Facebook code: ${error.message}`);
    throw new Error(`Failed to exchange Facebook code: ${error.message}`);
  }
}

/**
 * Exchange Instagram authorization code for tokens
 * @param {string} code - Authorization code
 * @returns {Object} - Token data
 */
async function exchangeInstagramCode(code) {
  try {
    const axios = require('axios');
    
    const params = new URLSearchParams();
    params.append('client_id', process.env.INSTAGRAM_APP_ID);
    params.append('client_secret', process.env.INSTAGRAM_APP_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', `${process.env.CLIENT_URL}/auth/callback/instagram`);
    params.append('code', code);
    
    const response = await axios.post('https://api.instagram.com/oauth/access_token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return {
      access_token: response.data.access_token,
      user_id: response.data.user_id,
    };
  } catch (error) {
    logger.error(`Error exchanging Instagram code: ${error.message}`);
    throw new Error(`Failed to exchange Instagram code: ${error.message}`);
  }
}

/**
 * Exchange LinkedIn authorization code for tokens
 * @param {string} code - Authorization code
 * @returns {Object} - Token data
 */
async function exchangeLinkedinCode(code) {
  try {
    const axios = require('axios');
    
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', `${process.env.CLIENT_URL}/auth/callback/linkedin`);
    params.append('client_id', process.env.LINKEDIN_CLIENT_ID);
    params.append('client_secret', process.env.LINKEDIN_CLIENT_SECRET);
    
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Error exchanging LinkedIn code: ${error.message}`);
    throw new Error(`Failed to exchange LinkedIn code: ${error.message}`);
  }
}

/**
 * Get Twitter user info
 * @param {string} accessToken - Access token
 * @returns {Object} - User info
 */
async function getTwitterUserInfo(accessToken) {
  try {
    const axios = require('axios');
    
    const response = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    return response.data.data;
  } catch (error) {
    logger.error(`Error getting Twitter user info: ${error.message}`);
    throw new Error(`Failed to get Twitter user info: ${error.message}`);
  }
}

/**
 * Get Facebook user info
 * @param {string} accessToken - Access token
 * @returns {Object} - User info
 */
async function getFacebookUserInfo(accessToken) {
  try {
    const axios = require('axios');
    
    const response = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name',
        access_token: accessToken,
      },
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Error getting Facebook user info: ${error.message}`);
    throw new Error(`Failed to get Facebook user info: ${error.message}`);
  }
}

/**
 * Get Instagram user info
 * @param {string} accessToken - Access token
 * @returns {Object} - User info
 */
async function getInstagramUserInfo(accessToken) {
  try {
    const axios = require('axios');
    
    const response = await axios.get('https://graph.instagram.com/me', {
      params: {
        fields: 'id,username',
        access_token: accessToken,
      },
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Error getting Instagram user info: ${error.message}`);
    throw new Error(`Failed to get Instagram user info: ${error.message}`);
  }
}

/**
 * Get LinkedIn user info
 * @param {string} accessToken - Access token
 * @returns {Object} - User info
 */
async function getLinkedinUserInfo(accessToken) {
  try {
    const axios = require('axios');
    
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    return {
      id: response.data.id,
      name: `${response.data.localizedFirstName} ${response.data.localizedLastName}`,
    };
  } catch (error) {
    logger.error(`Error getting LinkedIn user info: ${error.message}`);
    throw new Error(`Failed to get LinkedIn user info: ${error.message}`);
  }
}; 