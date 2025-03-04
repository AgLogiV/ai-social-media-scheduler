const express = require('express');
const router = express.Router();
const passport = require('passport');
const Analytics = require('../models/analytics.model');
const Post = require('../models/post.model');

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// @route   GET api/analytics/overview
// @desc    Get analytics overview
// @access  Private
router.get('/overview', auth, async (req, res) => {
  try {
    const { platform = 'all', startDate, endDate } = req.query;
    
    // Set default date range to last 30 days if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate 
      ? new Date(startDate) 
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Build query
    const query = {
      user: req.user.id,
      platform,
      date: { $gte: start, $lte: end },
    };
    
    // Get analytics data
    const analyticsData = await Analytics.find(query).sort({ date: 1 });
    
    // Calculate totals and averages
    let totalReach = 0;
    let totalEngagement = 0;
    let totalFollowers = 0;
    let totalImpressions = 0;
    
    analyticsData.forEach(data => {
      totalReach += data.metrics.reach;
      totalEngagement += data.metrics.engagement;
      totalFollowers += data.metrics.followers;
      totalImpressions += data.metrics.impressions;
    });
    
    // Calculate engagement rate
    const engagementRate = totalImpressions > 0 
      ? (totalEngagement / totalImpressions) * 100 
      : 0;
    
    // Format data for charts
    const chartData = analyticsData.map(data => ({
      date: data.date,
      reach: data.metrics.reach,
      engagement: data.metrics.engagement,
      engagementRate: data.metrics.engagementRate,
      followers: data.metrics.followers,
    }));
    
    res.json({
      overview: {
        totalReach,
        totalEngagement,
        engagementRate,
        totalFollowers,
        period: {
          start,
          end,
        },
      },
      chartData,
    });
  } catch (error) {
    console.error('Error in get analytics overview:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/analytics/hashtags
// @desc    Get hashtag performance analytics
// @access  Private
router.get('/hashtags', auth, async (req, res) => {
  try {
    const { platform = 'all', startDate, endDate, limit = 10 } = req.query;
    
    // Set default date range to last 30 days if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate 
      ? new Date(startDate) 
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Build query
    const query = {
      user: req.user.id,
      platform,
      date: { $gte: start, $lte: end },
    };
    
    // Get analytics data
    const analyticsData = await Analytics.find(query);
    
    // Aggregate hashtag performance
    const hashtagPerformance = {};
    
    analyticsData.forEach(data => {
      data.hashtagPerformance.forEach(hashtag => {
        if (!hashtagPerformance[hashtag.hashtag]) {
          hashtagPerformance[hashtag.hashtag] = {
            hashtag: hashtag.hashtag,
            reach: 0,
            engagement: 0,
            postCount: 0,
          };
        }
        
        hashtagPerformance[hashtag.hashtag].reach += hashtag.reach;
        hashtagPerformance[hashtag.hashtag].engagement += hashtag.engagement;
        hashtagPerformance[hashtag.hashtag].postCount += hashtag.postCount;
      });
    });
    
    // Convert to array and calculate engagement rate
    const hashtagArray = Object.values(hashtagPerformance).map(hashtag => ({
      ...hashtag,
      engagementRate: hashtag.reach > 0 
        ? (hashtag.engagement / hashtag.reach) * 100 
        : 0,
    }));
    
    // Sort by engagement rate and limit
    hashtagArray.sort((a, b) => b.engagementRate - a.engagementRate);
    const topHashtags = hashtagArray.slice(0, parseInt(limit));
    
    res.json(topHashtags);
  } catch (error) {
    console.error('Error in get hashtag analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/analytics/posts
// @desc    Get top performing posts
// @access  Private
router.get('/posts', auth, async (req, res) => {
  try {
    const { platform = 'all', startDate, endDate, metric = 'engagement', limit = 5 } = req.query;
    
    // Set default date range to last 30 days if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate 
      ? new Date(startDate) 
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Build query
    const query = {
      user: req.user.id,
      'platforms.name': platform === 'all' ? { $exists: true } : platform,
      'platforms.postedTime': { $gte: start, $lte: end },
      isDeleted: false,
    };
    
    // Get posts
    const posts = await Post.find(query);
    
    // Sort posts by performance metric
    posts.sort((a, b) => {
      if (metric === 'engagement') {
        return b.performance.engagement - a.performance.engagement;
      } else if (metric === 'reach') {
        return b.performance.reach - a.performance.reach;
      } else if (metric === 'engagementRate') {
        const aRate = a.performance.reach > 0 
          ? (a.performance.engagement / a.performance.reach) * 100 
          : 0;
        const bRate = b.performance.reach > 0 
          ? (b.performance.engagement / b.performance.reach) * 100 
          : 0;
        return bRate - aRate;
      }
      return 0;
    });
    
    // Limit results
    const topPosts = posts.slice(0, parseInt(limit));
    
    res.json(topPosts);
  } catch (error) {
    console.error('Error in get top posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/analytics/audience
// @desc    Get audience analytics
// @access  Private
router.get('/audience', auth, async (req, res) => {
  try {
    const { platform = 'all' } = req.query;
    
    // Get latest analytics data
    const latestAnalytics = await Analytics.findOne({
      user: req.user.id,
      platform,
    }).sort({ date: -1 });
    
    if (!latestAnalytics) {
      return res.status(404).json({ message: 'No analytics data found' });
    }
    
    res.json(latestAnalytics.audienceData);
  } catch (error) {
    console.error('Error in get audience analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/analytics/best-times
// @desc    Get best posting times
// @access  Private
router.get('/best-times', auth, async (req, res) => {
  try {
    const { platform = 'all' } = req.query;
    
    // Get all analytics data
    const analyticsData = await Analytics.find({
      user: req.user.id,
      platform,
    });
    
    // Aggregate active hours and days
    const activeHours = {};
    const activeDays = {};
    
    analyticsData.forEach(data => {
      // Process active hours
      data.audienceData.activeHours.forEach(hour => {
        if (!activeHours[hour.hour]) {
          activeHours[hour.hour] = 0;
        }
        activeHours[hour.hour] += hour.activity;
      });
      
      // Process active days
      data.audienceData.activeDays.forEach(day => {
        if (!activeDays[day.day]) {
          activeDays[day.day] = 0;
        }
        activeDays[day.day] += day.activity;
      });
    });
    
    // Convert to arrays and sort
    const hoursArray = Object.entries(activeHours).map(([hour, activity]) => ({
      hour: parseInt(hour),
      activity,
    }));
    
    const daysArray = Object.entries(activeDays).map(([day, activity]) => ({
      day,
      activity,
    }));
    
    hoursArray.sort((a, b) => b.activity - a.activity);
    daysArray.sort((a, b) => b.activity - a.activity);
    
    // Get top 3 hours and days
    const bestHours = hoursArray.slice(0, 3).map(h => h.hour);
    const bestDays = daysArray.slice(0, 3).map(d => d.day);
    
    res.json({
      bestHours,
      bestDays,
      hourlyActivity: hoursArray,
      dailyActivity: daysArray,
    });
  } catch (error) {
    console.error('Error in get best posting times:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 