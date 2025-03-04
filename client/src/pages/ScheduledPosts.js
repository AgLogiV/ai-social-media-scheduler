import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ScheduledPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        setLoading(true);
        
        // In a real application, this would be an API call
        // const response = await axios.get('/api/posts/scheduled');
        // setPosts(response.data);
        
        // Simulate data for development
        setTimeout(() => {
          const mockPosts = [
            {
              id: 1,
              content: 'Check out our latest blog post on social media optimization strategies!',
              platforms: ['instagram', 'facebook'],
              scheduledFor: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
              hashtags: ['socialmedia', 'optimization', 'digitalmarketing'],
              status: 'scheduled',
            },
            {
              id: 2,
              content: 'Excited to announce our new product launch next week! Stay tuned for more details.',
              platforms: ['twitter', 'linkedin', 'facebook'],
              scheduledFor: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
              hashtags: ['productlaunch', 'innovation', 'comingsoon'],
              status: 'scheduled',
            },
            {
              id: 3,
              content: 'Join our webinar on the latest digital marketing trends for 2023!',
              platforms: ['instagram', 'linkedin'],
              scheduledFor: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
              hashtags: ['webinar', 'digitalmarketing', 'trends', 'marketing2023'],
              status: 'scheduled',
            },
            {
              id: 4,
              content: 'Happy Monday! Start your week with our productivity tips.',
              platforms: ['instagram', 'twitter'],
              scheduledFor: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
              hashtags: ['mondaymotivation', 'productivity', 'tips', 'workweek'],
              status: 'scheduled',
            },
            {
              id: 5,
              content: 'Throwback to our company retreat last month. Great memories!',
              platforms: ['instagram', 'facebook'],
              scheduledFor: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
              hashtags: ['throwbackthursday', 'companyculture', 'teambuilding'],
              status: 'scheduled',
            },
          ];
          
          setPosts(mockPosts);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching scheduled posts:', error);
        setLoading(false);
      }
    };

    fetchScheduledPosts();
  }, []);

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    
    try {
      // In a real application, this would be an API call
      // await axios.delete(`/api/posts/${postToDelete.id}`);
      
      // Simulate API call for development
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

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
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPlatform = platformFilter === 'all' || post.platforms.includes(platformFilter);
    
    return matchesSearch && matchesPlatform;
  });

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
          Scheduled Posts
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/create')}
        >
          Create New Post
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search posts or hashtags"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="platform-filter-label">Platform</InputLabel>
            <Select
              labelId="platform-filter-label"
              id="platform-filter"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              label="Platform"
              startAdornment={
                platformFilter !== 'all' ? (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    {getPlatformIcon(platformFilter)}
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
      </Paper>
      
      {/* Posts Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="scheduled posts table">
          <TableHead>
            <TableRow>
              <TableCell>Content</TableCell>
              <TableCell>Platforms</TableCell>
              <TableCell>Scheduled For</TableCell>
              <TableCell>Hashtags</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography noWrap>
                      {post.content}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {post.platforms.map((platform) => (
                        <Tooltip key={platform} title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                          <Box>
                            {getPlatformIcon(platform)}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(post.scheduledFor)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 300 }}>
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
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => navigate(`/edit/${post.id}`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDeleteClick(post)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    {posts.length === 0
                      ? "No scheduled posts found. Create a new post to get started!"
                      : "No posts match your search criteria."}
                  </Typography>
                  {posts.length === 0 && (
                    <Button
                      variant="contained"
                      onClick={() => navigate('/create')}
                      sx={{ mt: 2 }}
                    >
                      Create New Post
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Scheduled Post
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this scheduled post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduledPosts; 