import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [platform, setPlatform] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [topHashtags, setTopHashtags] = useState([]);
  const [postPerformance, setPostPerformance] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // In a real application, these would be actual API calls
        // const response = await axios.get(`/api/analytics?timeRange=${timeRange}&platform=${platform}`);
        // setAnalyticsData(response.data);
        
        // const hashtagsResponse = await axios.get(`/api/analytics/hashtags?timeRange=${timeRange}&platform=${platform}`);
        // setTopHashtags(hashtagsResponse.data);
        
        // const postsResponse = await axios.get(`/api/analytics/posts?timeRange=${timeRange}&platform=${platform}`);
        // setPostPerformance(postsResponse.data);
        
        // Simulate data for development
        setTimeout(() => {
          // Generate dates for the selected time range
          const dates = [];
          const now = new Date();
          let daysToGenerate;
          
          switch (timeRange) {
            case '7days':
              daysToGenerate = 7;
              break;
            case '30days':
              daysToGenerate = 30;
              break;
            case '90days':
              daysToGenerate = 90;
              break;
            default:
              daysToGenerate = 30;
          }
          
          for (let i = daysToGenerate - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
          }
          
          // Generate random data for each platform
          const generatePlatformData = (multiplier) => {
            return dates.map(() => Math.floor(Math.random() * 100 * multiplier));
          };
          
          const instagramData = {
            reach: generatePlatformData(5),
            engagement: generatePlatformData(1),
            followers: 2500 + Math.floor(Math.random() * 500),
            followersGrowth: 5 + Math.floor(Math.random() * 20),
          };
          
          const twitterData = {
            reach: generatePlatformData(4),
            engagement: generatePlatformData(0.8),
            followers: 1800 + Math.floor(Math.random() * 400),
            followersGrowth: 3 + Math.floor(Math.random() * 15),
          };
          
          const facebookData = {
            reach: generatePlatformData(3.5),
            engagement: generatePlatformData(0.7),
            followers: 1500 + Math.floor(Math.random() * 300),
            followersGrowth: 2 + Math.floor(Math.random() * 10),
          };
          
          const linkedinData = {
            reach: generatePlatformData(3),
            engagement: generatePlatformData(0.6),
            followers: 1200 + Math.floor(Math.random() * 200),
            followersGrowth: 1 + Math.floor(Math.random() * 8),
          };
          
          // Combine data based on selected platform
          let combinedReach = [];
          let combinedEngagement = [];
          let totalFollowers = 0;
          let totalFollowersGrowth = 0;
          
          if (platform === 'all' || platform === 'instagram') {
            combinedReach = combinedReach.length ? combinedReach.map((val, idx) => val + instagramData.reach[idx]) : [...instagramData.reach];
            combinedEngagement = combinedEngagement.length ? combinedEngagement.map((val, idx) => val + instagramData.engagement[idx]) : [...instagramData.engagement];
            totalFollowers += instagramData.followers;
            totalFollowersGrowth += instagramData.followersGrowth;
          }
          
          if (platform === 'all' || platform === 'twitter') {
            combinedReach = combinedReach.length ? combinedReach.map((val, idx) => val + twitterData.reach[idx]) : [...twitterData.reach];
            combinedEngagement = combinedEngagement.length ? combinedEngagement.map((val, idx) => val + twitterData.engagement[idx]) : [...twitterData.engagement];
            totalFollowers += twitterData.followers;
            totalFollowersGrowth += twitterData.followersGrowth;
          }
          
          if (platform === 'all' || platform === 'facebook') {
            combinedReach = combinedReach.length ? combinedReach.map((val, idx) => val + facebookData.reach[idx]) : [...facebookData.reach];
            combinedEngagement = combinedEngagement.length ? combinedEngagement.map((val, idx) => val + facebookData.engagement[idx]) : [...facebookData.engagement];
            totalFollowers += facebookData.followers;
            totalFollowersGrowth += facebookData.followersGrowth;
          }
          
          if (platform === 'all' || platform === 'linkedin') {
            combinedReach = combinedReach.length ? combinedReach.map((val, idx) => val + linkedinData.reach[idx]) : [...linkedinData.reach];
            combinedEngagement = combinedEngagement.length ? combinedEngagement.map((val, idx) => val + linkedinData.engagement[idx]) : [...linkedinData.engagement];
            totalFollowers += linkedinData.followers;
            totalFollowersGrowth += linkedinData.followersGrowth;
          }
          
          // Calculate engagement rate
          const engagementRate = combinedReach.map((reach, idx) => {
            return ((combinedEngagement[idx] / reach) * 100).toFixed(2);
          });
          
          // Generate platform distribution data for pie chart
          const platformDistribution = {
            labels: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn'],
            datasets: [
              {
                data: [
                  instagramData.engagement.reduce((a, b) => a + b, 0),
                  twitterData.engagement.reduce((a, b) => a + b, 0),
                  facebookData.engagement.reduce((a, b) => a + b, 0),
                  linkedinData.engagement.reduce((a, b) => a + b, 0),
                ],
                backgroundColor: ['#E1306C', '#1DA1F2', '#4267B2', '#0077B5'],
                borderWidth: 1,
              },
            ],
          };
          
          // Generate top hashtags
          const mockHashtags = [
            { tag: 'marketing', count: 45, engagement: 1250 },
            { tag: 'socialmedia', count: 38, engagement: 980 },
            { tag: 'digitalmarketing', count: 32, engagement: 870 },
            { tag: 'contentcreation', count: 28, engagement: 760 },
            { tag: 'branding', count: 25, engagement: 680 },
            { tag: 'business', count: 22, engagement: 590 },
            { tag: 'entrepreneur', count: 20, engagement: 540 },
            { tag: 'marketingtips', count: 18, engagement: 490 },
            { tag: 'socialmediatips', count: 15, engagement: 410 },
            { tag: 'growyourbusiness', count: 12, engagement: 320 },
          ];
          
          // Generate post performance data
          const mockPosts = [
            {
              id: 1,
              content: 'Check out our latest blog post on social media optimization strategies!',
              platform: 'instagram',
              publishedAt: '2023-05-15T10:30:00Z',
              reach: 2500,
              engagement: 320,
              engagementRate: 12.8,
              hashtags: ['socialmedia', 'optimization', 'digitalmarketing'],
            },
            {
              id: 2,
              content: 'Excited to announce our new product launch next week! Stay tuned for more details.',
              platform: 'twitter',
              publishedAt: '2023-05-10T14:15:00Z',
              reach: 1800,
              engagement: 210,
              engagementRate: 11.7,
              hashtags: ['productlaunch', 'innovation', 'comingsoon'],
            },
            {
              id: 3,
              content: 'Join our webinar on the latest digital marketing trends for 2023!',
              platform: 'linkedin',
              publishedAt: '2023-05-05T09:00:00Z',
              reach: 1500,
              engagement: 180,
              engagementRate: 12.0,
              hashtags: ['webinar', 'digitalmarketing', 'trends', 'marketing2023'],
            },
            {
              id: 4,
              content: 'Happy Monday! Start your week with our productivity tips.',
              platform: 'facebook',
              publishedAt: '2023-04-30T08:45:00Z',
              reach: 1200,
              engagement: 150,
              engagementRate: 12.5,
              hashtags: ['mondaymotivation', 'productivity', 'tips', 'workweek'],
            },
            {
              id: 5,
              content: 'Throwback to our company retreat last month. Great memories!',
              platform: 'instagram',
              publishedAt: '2023-04-25T16:20:00Z',
              reach: 2200,
              engagement: 280,
              engagementRate: 12.7,
              hashtags: ['throwbackthursday', 'companyculture', 'teambuilding'],
            },
          ];
          
          // Filter posts based on selected platform
          const filteredPosts = platform === 'all' 
            ? mockPosts 
            : mockPosts.filter(post => post.platform === platform);
          
          setAnalyticsData({
            dates,
            reach: combinedReach,
            engagement: combinedEngagement,
            engagementRate,
            followers: totalFollowers,
            followersGrowth: totalFollowersGrowth,
            platformDistribution,
            platforms: {
              instagram: instagramData,
              twitter: twitterData,
              facebook: facebookData,
              linkedin: linkedinData,
            },
          });
          
          setTopHashtags(mockHashtags);
          setPostPerformance(filteredPosts);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, platform]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handlePlatformChange = (event) => {
    setPlatform(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getPlatformIcon = (platformName) => {
    switch (platformName) {
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
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading || !analyticsData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Prepare chart data
  const reachChartData = {
    labels: analyticsData.dates.map(date => formatDate(date)),
    datasets: [
      {
        label: 'Reach',
        data: analyticsData.reach,
        borderColor: 'rgba(63, 81, 181, 1)',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const engagementChartData = {
    labels: analyticsData.dates.map(date => formatDate(date)),
    datasets: [
      {
        label: 'Engagement',
        data: analyticsData.engagement,
        borderColor: 'rgba(245, 0, 87, 1)',
        backgroundColor: 'rgba(245, 0, 87, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const engagementRateChartData = {
    labels: analyticsData.dates.map(date => formatDate(date)),
    datasets: [
      {
        label: 'Engagement Rate (%)',
        data: analyticsData.engagementRate,
        borderColor: 'rgba(76, 175, 80, 1)',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const hashtagsChartData = {
    labels: topHashtags.slice(0, 5).map(item => `#${item.tag}`),
    datasets: [
      {
        label: 'Engagement',
        data: topHashtags.slice(0, 5).map(item => item.engagement),
        backgroundColor: [
          'rgba(63, 81, 181, 0.7)',
          'rgba(245, 0, 87, 0.7)',
          'rgba(76, 175, 80, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(33, 150, 243, 0.7)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range"
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="platform-label">Platform</InputLabel>
            <Select
              labelId="platform-label"
              id="platform"
              value={platform}
              onChange={handlePlatformChange}
              label="Platform"
              startAdornment={
                platform !== 'all' ? (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    {getPlatformIcon(platform)}
                  </Box>
                ) : null
              }
            >
              <MenuItem value="all">All Platforms</MenuItem>
              <MenuItem value="instagram">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InstagramIcon sx={{ mr: 1 }} />
                  Instagram
                </Box>
              </MenuItem>
              <MenuItem value="twitter">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TwitterIcon sx={{ mr: 1 }} />
                  Twitter
                </Box>
              </MenuItem>
              <MenuItem value="facebook">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FacebookIcon sx={{ mr: 1 }} />
                  Facebook
                </Box>
              </MenuItem>
              <MenuItem value="linkedin">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinkedInIcon sx={{ mr: 1 }} />
                  LinkedIn
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <VisibilityIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Total Reach
                </Typography>
              </Box>
              <Typography variant="h4">
                {analyticsData.reach.reduce((a, b) => a + b, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ThumbUpIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Total Engagement
                </Typography>
              </Box>
              <Typography variant="h4">
                {analyticsData.engagement.reduce((a, b) => a + b, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Avg. Engagement Rate
                </Typography>
              </Box>
              <Typography variant="h4">
                {(analyticsData.engagementRate.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / analyticsData.engagementRate.length).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" color="text.secondary">
                  Followers
                </Typography>
              </Box>
              <Typography variant="h4">
                {analyticsData.followers.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                +{analyticsData.followersGrowth} new
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Box sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs" sx={{ mb: 2 }}>
          <Tab label="Reach" />
          <Tab label="Engagement" />
          <Tab label="Engagement Rate" />
        </Tabs>
        
        <Paper sx={{ p: 3, height: 400 }}>
          {tabValue === 0 && (
            <Line data={reachChartData} options={chartOptions} height={350} />
          )}
          {tabValue === 1 && (
            <Line data={engagementChartData} options={chartOptions} height={350} />
          )}
          {tabValue === 2 && (
            <Line data={engagementRateChartData} options={chartOptions} height={350} />
          )}
        </Paper>
      </Box>
      
      <Grid container spacing={3}>
        {/* Top Hashtags */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Hashtags
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300 }}>
              <Bar data={hashtagsChartData} options={chartOptions} height={250} />
            </Box>
            
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Hashtag</TableCell>
                    <TableCell align="right">Usage Count</TableCell>
                    <TableCell align="right">Total Engagement</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topHashtags.map((hashtag) => (
                    <TableRow key={hashtag.tag}>
                      <TableCell>
                        <Chip 
                          label={`#${hashtag.tag}`} 
                          size="small" 
                          variant="outlined"
                          className="hashtag-chip"
                        />
                      </TableCell>
                      <TableCell align="right">{hashtag.count}</TableCell>
                      <TableCell align="right">{hashtag.engagement}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Platform Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Engagement by Platform
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '80%', maxWidth: 300 }}>
                <Pie data={analyticsData.platformDistribution} />
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InstagramIcon sx={{ color: '#E1306C', mr: 1 }} />
                    <Typography variant="body2">Instagram</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {analyticsData.platforms.instagram.engagement.reduce((a, b) => a + b, 0).toLocaleString()} engagements
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TwitterIcon sx={{ color: '#1DA1F2', mr: 1 }} />
                    <Typography variant="body2">Twitter</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {analyticsData.platforms.twitter.engagement.reduce((a, b) => a + b, 0).toLocaleString()} engagements
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FacebookIcon sx={{ color: '#4267B2', mr: 1 }} />
                    <Typography variant="body2">Facebook</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {analyticsData.platforms.facebook.engagement.reduce((a, b) => a + b, 0).toLocaleString()} engagements
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LinkedInIcon sx={{ color: '#0077B5', mr: 1 }} />
                    <Typography variant="body2">LinkedIn</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {analyticsData.platforms.linkedin.engagement.reduce((a, b) => a + b, 0).toLocaleString()} engagements
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Post Performance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Posts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Content</TableCell>
                    <TableCell>Platform</TableCell>
                    <TableCell>Published</TableCell>
                    <TableCell align="right">Reach</TableCell>
                    <TableCell align="right">Engagement</TableCell>
                    <TableCell align="right">Engagement Rate</TableCell>
                    <TableCell>Hashtags</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {postPerformance.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Typography noWrap>
                          {post.content}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getPlatformIcon(post.platform)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">{post.reach.toLocaleString()}</TableCell>
                      <TableCell align="right">{post.engagement.toLocaleString()}</TableCell>
                      <TableCell align="right">{post.engagementRate}%</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                          {post.hashtags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={`#${tag}`}
                              size="small"
                              variant="outlined"
                              className="hashtag-chip"
                            />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 