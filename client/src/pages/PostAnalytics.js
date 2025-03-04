import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PostAnalytics = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [timelineData, setTimelineData] = useState({
    labels: [],
    datasets: [],
  });
  const [demographicsData, setDemographicsData] = useState({
    labels: [],
    datasets: [],
  });
  
  // Fetch post and analytics data
  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Fetch post data
      const postResponse = await axios.get(`/api/posts/${id}`);
      setPost(postResponse.data.post);
      
      // Fetch analytics data
      const analyticsResponse = await axios.get(`/api/posts/${id}/analytics`);
      setAnalytics(analyticsResponse.data.analytics);
      
      // Prepare timeline data
      if (analyticsResponse.data.analytics.timeline) {
        setTimelineData({
          labels: analyticsResponse.data.analytics.timeline.map(item => item.date),
          datasets: [
            {
              label: 'Reach',
              data: analyticsResponse.data.analytics.timeline.map(item => item.reach),
              borderColor: 'rgba(53, 162, 235, 1)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
              label: 'Engagement',
              data: analyticsResponse.data.analytics.timeline.map(item => item.engagement),
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
          ],
        });
      }
      
      // Prepare demographics data
      if (analyticsResponse.data.analytics.demographics) {
        setDemographicsData({
          labels: Object.keys(analyticsResponse.data.analytics.demographics.ageGroups),
          datasets: [
            {
              label: 'Age Distribution',
              data: Object.values(analyticsResponse.data.analytics.demographics.ageGroups),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchData(true);
  };
  
  // Handle back button
  const handleBack = () => {
    navigate(`/posts/${id}`);
  };
  
  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Back to Post
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom color="error">
            Error
          </Typography>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Show not found state
  if (!post || !analytics) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Back to Post
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics Not Available
          </Typography>
          <Typography variant="body1">
            Analytics data is not available for this post.
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Back to Post
          </Button>
          
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Post Analytics
        </Typography>
        
        {/* Post Summary */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Post Summary
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Published on: {new Date(post.publishedTime).toLocaleString()}
              </Typography>
            </Grid>
            
            {post.media && post.media.length > 0 && (
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: 150,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  {post.media[0].type === 'image' ? (
                    <img
                      src={post.media[0].url}
                      alt="Post media"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'black',
                        color: 'white',
                      }}
                    >
                      <Typography variant="body2">Video</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
        
        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Reach
                </Typography>
                <Typography variant="h4">
                  {analytics.reach.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Engagement
                </Typography>
                <Typography variant="h4">
                  {analytics.engagement.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Likes
                </Typography>
                <Typography variant="h4">
                  {analytics.likes.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Comments
                </Typography>
                <Typography variant="h4">
                  {analytics.comments.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tabs */}
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Performance" />
            <Tab label="Audience" />
            <Tab label="Engagement" />
          </Tabs>
          
          <Divider />
          
          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {/* Performance Tab */}
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Performance Over Time
                </Typography>
                
                {analytics.timeline ? (
                  <Box sx={{ height: 300, mb: 4 }}>
                    <Line
                      data={timelineData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Timeline data not available
                  </Typography>
                )}
                
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Engagement Breakdown
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ height: 300 }}>
                      <Bar
                        data={{
                          labels: ['Likes', 'Comments', 'Shares', 'Saves'],
                          datasets: [
                            {
                              label: 'Engagement',
                              data: [
                                analytics.likes,
                                analytics.comments,
                                analytics.shares || 0,
                                analytics.saves || 0,
                              ],
                              backgroundColor: [
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(54, 162, 235, 0.5)',
                                'rgba(255, 206, 86, 0.5)',
                                'rgba(75, 192, 192, 0.5)',
                              ],
                              borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell align="right">Count</TableCell>
                            <TableCell align="right">% of Reach</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Likes</TableCell>
                            <TableCell align="right">{analytics.likes.toLocaleString()}</TableCell>
                            <TableCell align="right">
                              {((analytics.likes / analytics.reach) * 100).toFixed(2)}%
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Comments</TableCell>
                            <TableCell align="right">{analytics.comments.toLocaleString()}</TableCell>
                            <TableCell align="right">
                              {((analytics.comments / analytics.reach) * 100).toFixed(2)}%
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Shares</TableCell>
                            <TableCell align="right">{(analytics.shares || 0).toLocaleString()}</TableCell>
                            <TableCell align="right">
                              {((analytics.shares || 0) / analytics.reach * 100).toFixed(2)}%
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Saves</TableCell>
                            <TableCell align="right">{(analytics.saves || 0).toLocaleString()}</TableCell>
                            <TableCell align="right">
                              {((analytics.saves || 0) / analytics.reach * 100).toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Audience Tab */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Audience Demographics
                </Typography>
                
                {analytics.demographics ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Age Distribution
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Pie
                          data={demographicsData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                          }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Gender Distribution
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Pie
                          data={{
                            labels: Object.keys(analytics.demographics.gender),
                            datasets: [
                              {
                                label: 'Gender',
                                data: Object.values(analytics.demographics.gender),
                                backgroundColor: [
                                  'rgba(54, 162, 235, 0.5)',
                                  'rgba(255, 99, 132, 0.5)',
                                  'rgba(255, 206, 86, 0.5)',
                                ],
                                borderColor: [
                                  'rgba(54, 162, 235, 1)',
                                  'rgba(255, 99, 132, 1)',
                                  'rgba(255, 206, 86, 1)',
                                ],
                                borderWidth: 1,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                          }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Top Locations
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Location</TableCell>
                              <TableCell align="right">Viewers</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(analytics.demographics.locations || {})
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 5)
                              .map(([location, count]) => (
                                <TableRow key={location}>
                                  <TableCell>{location}</TableCell>
                                  <TableCell align="right">{count.toLocaleString()}</TableCell>
                                  <TableCell align="right">
                                    {((count / analytics.reach) * 100).toFixed(2)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Demographics data not available
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Engagement Tab */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Engagement Analysis
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Engagement Rate
                    </Typography>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h3" color="primary">
                        {((analytics.engagement / analytics.reach) * 100).toFixed(2)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total engagement rate
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Engagement Breakdown
                    </Typography>
                    <Box sx={{ height: 200 }}>
                      <Pie
                        data={{
                          labels: ['Likes', 'Comments', 'Shares', 'Saves'],
                          datasets: [
                            {
                              label: 'Engagement',
                              data: [
                                analytics.likes,
                                analytics.comments,
                                analytics.shares || 0,
                                analytics.saves || 0,
                              ],
                              backgroundColor: [
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(54, 162, 235, 0.5)',
                                'rgba(255, 206, 86, 0.5)',
                                'rgba(75, 192, 192, 0.5)',
                              ],
                              borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  {analytics.topComments && analytics.topComments.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Top Comments
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>User</TableCell>
                              <TableCell>Comment</TableCell>
                              <TableCell align="right">Likes</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analytics.topComments.map((comment, index) => (
                              <TableRow key={index}>
                                <TableCell>{comment.username}</TableCell>
                                <TableCell>{comment.text}</TableCell>
                                <TableCell align="right">{comment.likes}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                  
                  {analytics.hashtags && analytics.hashtags.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Hashtag Performance
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Hashtag</TableCell>
                              <TableCell align="right">Reach</TableCell>
                              <TableCell align="right">Engagement</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analytics.hashtags.map((hashtag, index) => (
                              <TableRow key={index}>
                                <TableCell>#{hashtag.tag}</TableCell>
                                <TableCell align="right">{hashtag.reach.toLocaleString()}</TableCell>
                                <TableCell align="right">{hashtag.engagement.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PostAnalytics; 