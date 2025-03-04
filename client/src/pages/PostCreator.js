import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  Slider,
  Stack,
} from '@mui/material';
import {
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const PostCreator = () => {
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram']);
  const [scheduledDate, setScheduledDate] = useState(new Date(Date.now() + 3600000)); // 1 hour from now
  const [suggestedHashtags, setSuggestedHashtags] = useState([]);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [customHashtag, setCustomHashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hashtagLimit, setHashtagLimit] = useState(30);

  // Fetch trending hashtags on component mount
  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      try {
        // In a real application, this would be an API call
        // const response = await axios.get('/api/hashtags/trending');
        // setTrendingHashtags(response.data);
        
        // Simulate data for development
        setTimeout(() => {
          setTrendingHashtags([
            { id: 1, name: 'digitalmarketing', popularity: 98 },
            { id: 2, name: 'socialmediatips', popularity: 92 },
            { id: 3, name: 'contentcreator', popularity: 87 },
            { id: 4, name: 'marketingstrategy', popularity: 85 },
            { id: 5, name: 'growyourbusiness', popularity: 82 },
            { id: 6, name: 'socialmediamarketing', popularity: 80 },
            { id: 7, name: 'onlinemarketing', popularity: 78 },
            { id: 8, name: 'smallbusiness', popularity: 76 },
            { id: 9, name: 'entrepreneurship', popularity: 75 },
            { id: 10, name: 'marketing', popularity: 74 },
          ]);
        }, 1000);
      } catch (error) {
        console.error('Error fetching trending hashtags:', error);
      }
    };

    fetchTrendingHashtags();
  }, []);

  // Analyze post content and suggest hashtags
  const analyzeContent = async () => {
    if (!postContent.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter some content to analyze',
        severity: 'error',
      });
      return;
    }

    try {
      setAnalyzing(true);
      
      // In a real application, this would be an API call to the AI service
      // const response = await axios.post('/api/hashtags/suggest', { content: postContent });
      // setSuggestedHashtags(response.data);
      
      // Simulate AI analysis for development
      setTimeout(() => {
        // Generate hashtags based on content
        const contentWords = postContent.toLowerCase().split(/\s+/);
        const marketingHashtags = [
          'marketing', 'digitalmarketing', 'socialmedia', 'contentmarketing', 
          'branding', 'marketingstrategy', 'business', 'entrepreneur', 
          'socialmediamarketing', 'advertising', 'digital', 'marketingtips',
          'smallbusiness', 'onlinemarketing', 'seo', 'contentcreation',
          'startup', 'growyourbusiness', 'success', 'entrepreneurship',
          'innovation', 'creativity', 'growth', 'strategy', 'leadership',
          'productivity', 'motivation', 'inspiration', 'goals', 'achievement'
        ];
        
        // Generate relevant hashtags based on content
        const relevantHashtags = marketingHashtags.filter(tag => {
          // Check if any word in the content is part of the hashtag
          return contentWords.some(word => tag.includes(word) || word.includes(tag));
        });
        
        // Add some general marketing hashtags if we don't have enough relevant ones
        const generalHashtags = marketingHashtags
          .filter(tag => !relevantHashtags.includes(tag))
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.max(0, 15 - relevantHashtags.length));
        
        // Combine and format the hashtags
        const generatedHashtags = [...relevantHashtags, ...generalHashtags]
          .map(tag => ({
            id: Math.random().toString(36).substr(2, 9),
            name: tag,
            relevance: relevantHashtags.includes(tag) 
              ? Math.floor(Math.random() * 20) + 80 // 80-100 for relevant
              : Math.floor(Math.random() * 30) + 50, // 50-80 for general
          }))
          .sort((a, b) => b.relevance - a.relevance);
        
        setSuggestedHashtags(generatedHashtags);
        setAnalyzing(false);
        
        // Also update performance metrics
        updatePerformanceMetrics([...selectedHashtags, ...generatedHashtags.slice(0, 5)]);
      }, 1500);
    } catch (error) {
      console.error('Error analyzing content:', error);
      setAnalyzing(false);
      setSnackbar({
        open: true,
        message: 'Error analyzing content. Please try again.',
        severity: 'error',
      });
    }
  };

  // Update performance metrics based on selected hashtags
  const updatePerformanceMetrics = (hashtags) => {
    // In a real application, this would be an API call to the AI service
    // const response = await axios.post('/api/hashtags/performance', { hashtags, platforms: selectedPlatforms });
    // setPerformanceMetrics(response.data);
    
    // Simulate performance metrics for development
    const hashtagCount = hashtags.length;
    const platformCount = selectedPlatforms.length;
    
    // Base metrics
    const baseReach = 500 + Math.floor(Math.random() * 500);
    const baseEngagement = 50 + Math.floor(Math.random() * 100);
    
    // Calculate metrics based on hashtag count and platform selection
    const reach = baseReach * (1 + (hashtagCount * 0.1)) * platformCount;
    const engagement = baseEngagement * (1 + (hashtagCount * 0.05)) * platformCount;
    const impressions = reach * (2 + Math.random());
    
    // Platform-specific metrics
    const platformMetrics = {};
    selectedPlatforms.forEach(platform => {
      let platformMultiplier;
      switch (platform) {
        case 'instagram':
          platformMultiplier = 1.2;
          break;
        case 'twitter':
          platformMultiplier = 0.9;
          break;
        case 'facebook':
          platformMultiplier = 0.8;
          break;
        case 'linkedin':
          platformMultiplier = 1.1;
          break;
        default:
          platformMultiplier = 1.0;
      }
      
      platformMetrics[platform] = {
        reach: Math.floor(reach * platformMultiplier),
        engagement: Math.floor(engagement * platformMultiplier),
        impressions: Math.floor(impressions * platformMultiplier),
      };
    });
    
    setPerformanceMetrics({
      overall: {
        reach: Math.floor(reach),
        engagement: Math.floor(engagement),
        impressions: Math.floor(impressions),
        engagementRate: ((engagement / impressions) * 100).toFixed(2),
      },
      platforms: platformMetrics,
    });
  };

  // Handle adding a hashtag to selected list
  const handleAddHashtag = (hashtag) => {
    if (selectedHashtags.some(tag => tag.name === hashtag.name)) {
      return; // Already added
    }
    
    if (selectedHashtags.length >= hashtagLimit) {
      setSnackbar({
        open: true,
        message: `You can only select up to ${hashtagLimit} hashtags`,
        severity: 'warning',
      });
      return;
    }
    
    const newSelectedHashtags = [...selectedHashtags, hashtag];
    setSelectedHashtags(newSelectedHashtags);
    updatePerformanceMetrics(newSelectedHashtags);
  };

  // Handle removing a hashtag from selected list
  const handleRemoveHashtag = (hashtagToRemove) => {
    const newSelectedHashtags = selectedHashtags.filter(
      hashtag => hashtag.name !== hashtagToRemove.name
    );
    setSelectedHashtags(newSelectedHashtags);
    updatePerformanceMetrics(newSelectedHashtags);
  };

  // Handle adding a custom hashtag
  const handleAddCustomHashtag = () => {
    if (!customHashtag.trim()) return;
    
    // Remove # if present
    const hashtagName = customHashtag.trim().replace(/^#/, '');
    
    // Check if already added
    if (selectedHashtags.some(tag => tag.name === hashtagName)) {
      setSnackbar({
        open: true,
        message: 'This hashtag is already added',
        severity: 'info',
      });
      setCustomHashtag('');
      return;
    }
    
    // Check hashtag limit
    if (selectedHashtags.length >= hashtagLimit) {
      setSnackbar({
        open: true,
        message: `You can only select up to ${hashtagLimit} hashtags`,
        severity: 'warning',
      });
      return;
    }
    
    const newHashtag = {
      id: Math.random().toString(36).substr(2, 9),
      name: hashtagName,
      relevance: 70, // Default relevance for custom hashtags
    };
    
    const newSelectedHashtags = [...selectedHashtags, newHashtag];
    setSelectedHashtags(newSelectedHashtags);
    setCustomHashtag('');
    updatePerformanceMetrics(newSelectedHashtags);
  };

  // Handle platform selection
  const handlePlatformChange = (event, newPlatforms) => {
    if (newPlatforms.length) {
      setSelectedPlatforms(newPlatforms);
      updatePerformanceMetrics(selectedHashtags);
    }
  };

  // Handle scheduling the post
  const handleSchedulePost = async () => {
    if (!postContent.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter some content for your post',
        severity: 'error',
      });
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one platform',
        severity: 'error',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const postData = {
        content: postContent,
        platforms: selectedPlatforms,
        scheduledFor: scheduledDate.toISOString(),
        hashtags: selectedHashtags.map(tag => tag.name),
      };
      
      // In a real application, this would be an API call
      // const response = await axios.post('/api/posts/schedule', postData);
      
      // Simulate API call for development
      setTimeout(() => {
        console.log('Post scheduled:', postData);
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Post scheduled successfully!',
          severity: 'success',
        });
        
        // Reset form
        setPostContent('');
        setSuggestedHashtags([]);
        setSelectedHashtags([]);
        setPerformanceMetrics(null);
      }, 1500);
    } catch (error) {
      console.error('Error scheduling post:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Error scheduling post. Please try again.',
        severity: 'error',
      });
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <InstagramIcon />;
      case 'twitter':
        return <TwitterIcon />;
      case 'facebook':
        return <FacebookIcon />;
      case 'linkedin':
        return <LinkedInIcon />;
      default:
        return null;
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Post
      </Typography>
      
      <Grid container spacing={3}>
        {/* Post Content Section */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Post Content
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Enter your post content here..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={analyzing ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
                onClick={analyzeContent}
                disabled={analyzing || !postContent.trim()}
              >
                {analyzing ? 'Analyzing...' : 'Analyze & Suggest Hashtags'}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {postContent.length} characters
              </Typography>
            </Box>
          </Paper>
          
          {/* Platform Selection */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Platforms
            </Typography>
            <ToggleButtonGroup
              value={selectedPlatforms}
              onChange={handlePlatformChange}
              aria-label="social media platforms"
              color="primary"
              fullWidth
            >
              <ToggleButton value="instagram" aria-label="instagram">
                <InstagramIcon sx={{ mr: 1 }} />
                Instagram
              </ToggleButton>
              <ToggleButton value="twitter" aria-label="twitter">
                <TwitterIcon sx={{ mr: 1 }} />
                Twitter
              </ToggleButton>
              <ToggleButton value="facebook" aria-label="facebook">
                <FacebookIcon sx={{ mr: 1 }} />
                Facebook
              </ToggleButton>
              <ToggleButton value="linkedin" aria-label="linkedin">
                <LinkedInIcon sx={{ mr: 1 }} />
                LinkedIn
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>
          
          {/* Scheduling */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Schedule Post
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Schedule Date and Time"
                value={scheduledDate}
                onChange={(newValue) => setScheduledDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 3 }} />}
                minDateTime={new Date()}
              />
            </LocalizationProvider>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScheduleIcon />}
              onClick={handleSchedulePost}
              disabled={loading || !postContent.trim() || selectedPlatforms.length === 0}
            >
              {loading ? 'Scheduling...' : 'Schedule Post'}
            </Button>
          </Paper>
        </Grid>
        
        {/* Hashtags Section */}
        <Grid item xs={12} md={5}>
          {/* Selected Hashtags */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Selected Hashtags ({selectedHashtags.length}/{hashtagLimit})
              </Typography>
              <Tooltip title="Clear all hashtags">
                <IconButton 
                  color="error" 
                  size="small"
                  onClick={() => {
                    setSelectedHashtags([]);
                    updatePerformanceMetrics([]);
                  }}
                  disabled={selectedHashtags.length === 0}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Hashtag Limit:
                </Typography>
                <Slider
                  value={hashtagLimit}
                  onChange={(e, newValue) => setHashtagLimit(newValue)}
                  step={1}
                  marks
                  min={5}
                  max={30}
                  valueLabelDisplay="auto"
                  sx={{ mx: 2, width: '60%' }}
                />
              </Stack>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
              {selectedHashtags.length > 0 ? (
                selectedHashtags.map((hashtag) => (
                  <Chip
                    key={hashtag.id}
                    label={`#${hashtag.name}`}
                    onDelete={() => handleRemoveHashtag(hashtag)}
                    color="primary"
                    className="hashtag-chip"
                    sx={{ m: 0.5 }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hashtags selected. Add some from the suggestions below or create custom ones.
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Add custom hashtag"
                value={customHashtag}
                onChange={(e) => setCustomHashtag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomHashtag();
                  }
                }}
                sx={{ mr: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddCustomHashtag}
                disabled={!customHashtag.trim()}
              >
                Add
              </Button>
            </Box>
          </Paper>
          
          {/* Suggested Hashtags */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                AI Suggested Hashtags
              </Typography>
              <Tooltip title="Refresh suggestions">
                <IconButton 
                  color="primary" 
                  size="small"
                  onClick={analyzeContent}
                  disabled={analyzing || !postContent.trim()}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {analyzing ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : suggestedHashtags.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {suggestedHashtags.map((hashtag) => (
                  <Tooltip 
                    key={hashtag.id} 
                    title={`Relevance: ${hashtag.relevance}%`}
                    arrow
                  >
                    <Chip
                      label={`#${hashtag.name}`}
                      onClick={() => handleAddHashtag(hashtag)}
                      color={hashtag.relevance > 80 ? "primary" : "default"}
                      variant={selectedHashtags.some(tag => tag.name === hashtag.name) ? "filled" : "outlined"}
                      className="hashtag-chip"
                      sx={{ 
                        m: 0.5,
                        opacity: selectedHashtags.some(tag => tag.name === hashtag.name) ? 0.6 : 1,
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Enter your post content and click "Analyze & Suggest Hashtags" to get AI-powered hashtag suggestions.
              </Typography>
            )}
          </Paper>
          
          {/* Trending Hashtags */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Trending Hashtags
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {trendingHashtags.map((hashtag) => (
                <Tooltip 
                  key={hashtag.id} 
                  title={`Popularity: ${hashtag.popularity}%`}
                  arrow
                >
                  <Chip
                    label={`#${hashtag.name}`}
                    onClick={() => handleAddHashtag(hashtag)}
                    color={hashtag.popularity > 90 ? "secondary" : "default"}
                    variant={selectedHashtags.some(tag => tag.name === hashtag.name) ? "filled" : "outlined"}
                    className="hashtag-chip trending-hashtag"
                    sx={{ 
                      m: 0.5,
                      opacity: selectedHashtags.some(tag => tag.name === hashtag.name) ? 0.6 : 1,
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Paper>
          
          {/* Performance Prediction */}
          {performanceMetrics && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance Prediction
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Estimated Reach
                      </Typography>
                      <Typography variant="h5">
                        {performanceMetrics.overall.reach.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Engagement
                      </Typography>
                      <Typography variant="h5">
                        {performanceMetrics.overall.engagement.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Engagement Rate
                      </Typography>
                      <Typography variant="h5">
                        {performanceMetrics.overall.engagementRate}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Platform Breakdown
              </Typography>
              
              {selectedPlatforms.map((platform) => (
                <Box key={platform} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ mr: 1 }}>
                    {getPlatformIcon(platform)}
                  </Box>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reach: {performanceMetrics.platforms[platform].reach.toLocaleString()} | 
                    Engagement: {performanceMetrics.platforms[platform].engagement.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PostCreator; 