import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    scheduledPosts: 0,
    publishedPosts: 0,
    totalEngagement: 0,
    platformStats: {
      instagram: { posts: 0, engagement: 0 },
      twitter: { posts: 0, engagement: 0 },
      facebook: { posts: 0, engagement: 0 },
      linkedin: { posts: 0, engagement: 0 },
    },
  });
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real application, these would be actual API calls
        // For now, we'll simulate the data
        
        // Simulate API call for dashboard stats
        // const statsResponse = await axios.get('/api/dashboard/stats');
        // setStats(statsResponse.data);
        
        // Simulate API call for trending hashtags
        // const hashtagsResponse = await axios.get('/api/hashtags/trending');
        // setTrendingHashtags(hashtagsResponse.data);
        
        // Simulate API call for recent posts
        // const postsResponse = await axios.get('/api/posts/recent');
        // setRecentPosts(postsResponse.data);
        
        // Simulate data for development
        setTimeout(() => {
          setStats({
            scheduledPosts: 5,
            publishedPosts: 12,
            totalEngagement: 1243,
            platformStats: {
              instagram: { posts: 7, engagement: 523 },
              twitter: { posts: 8, engagement: 412 },
              facebook: { posts: 4, engagement: 189 },
              linkedin: { posts: 3, engagement: 119 },
            },
          });
          
          setTrendingHashtags([
            { id: 1, name: 'digitalmarketing', popularity: 98 },
            { id: 2, name: 'socialmediatips', popularity: 92 },
            { id: 3, name: 'contentcreator', popularity: 87 },
            { id: 4, name: 'marketingstrategy', popularity: 85 },
            { id: 5, name: 'growyourbusiness', popularity: 82 },
          ]);
          
          setRecentPosts([
            {
              id: 1,
              content: 'Check out our latest blog post on social media optimization strategies!',
              platform: 'instagram',
              scheduledFor: new Date(Date.now() + 86400000).toISOString(),
              hashtags: ['socialmedia', 'optimization', 'digitalmarketing'],
            },
            {
              id: 2,
              content: 'Excited to announce our new product launch next week! Stay tuned for more details.',
              platform: 'twitter',
              scheduledFor: new Date(Date.now() + 172800000).toISOString(),
              hashtags: ['productlaunch', 'innovation', 'comingsoon'],
            },
          ]);
          
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {currentUser?.name || 'User'}!
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create')}
        >
          Create New Post
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Scheduled Posts
              </Typography>
              <Typography variant="h3" component="div">
                {stats.scheduledPosts}
              </Typography>
              <Button
                variant="text"
                endIcon={<ScheduleIcon />}
                onClick={() => navigate('/scheduled')}
                sx={{ mt: 1 }}
              >
                View Schedule
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Published Posts
              </Typography>
              <Typography variant="h3" component="div">
                {stats.publishedPosts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Engagement
              </Typography>
              <Typography variant="h3" component="div">
                {stats.totalEngagement}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Platform Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InstagramIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {stats.platformStats.instagram.posts} posts ({stats.platformStats.instagram.engagement} engagements)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TwitterIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {stats.platformStats.twitter.posts} posts ({stats.platformStats.twitter.engagement} engagements)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FacebookIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {stats.platformStats.facebook.posts} posts ({stats.platformStats.facebook.engagement} engagements)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinkedInIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {stats.platformStats.linkedin.posts} posts ({stats.platformStats.linkedin.engagement} engagements)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Trending Hashtags */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Trending Hashtags</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {trendingHashtags.map((hashtag) => (
                <Chip
                  key={hashtag.id}
                  label={`#${hashtag.name}`}
                  color="primary"
                  variant={hashtag.popularity > 90 ? "filled" : "outlined"}
                  className="hashtag-chip trending-hashtag"
                  sx={{ 
                    fontWeight: hashtag.popularity > 90 ? 'bold' : 'normal',
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Posts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Posts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Box key={post.id} className="post-preview" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box className="social-media-icon">
                      {getPlatformIcon(post.platform)}
                    </Box>
                    <Typography variant="subtitle2">
                      Scheduled for {formatDate(post.scheduledFor)}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {post.content}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {post.hashtags.map((tag, index) => (
                      <Chip
                        key={index}
                        size="small"
                        label={`#${tag}`}
                        variant="outlined"
                        className="hashtag-chip"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                No upcoming posts scheduled. Create a new post to get started!
              </Typography>
            )}
            {recentPosts.length > 0 && (
              <Button
                variant="outlined"
                onClick={() => navigate('/scheduled')}
                sx={{ mt: 1 }}
              >
                View All Scheduled Posts
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 