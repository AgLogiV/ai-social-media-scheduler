import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from '@mui/material';
import {
  Edit,
  Delete,
  Schedule,
  Send,
  Cancel,
  BarChart,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';

const PostDetails = ({ post, onDelete, onRefresh }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  
  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'facebook':
        return <Facebook />;
      case 'twitter':
        return <Twitter />;
      case 'instagram':
        return <Instagram />;
      case 'linkedin':
        return <LinkedIn />;
      default:
        return null;
    }
  };
  
  // Get platform color
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'facebook':
        return '#3b5998';
      case 'twitter':
        return '#1da1f2';
      case 'instagram':
        return '#e1306c';
      case 'linkedin':
        return '#0077b5';
      default:
        return '#757575';
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'scheduled':
        return 'primary';
      case 'draft':
        return 'default';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Extract hashtags from content
  const extractHashtags = (content) => {
    if (!content) return [];
    return (content.match(/#[a-zA-Z0-9_]+/g) || []);
  };
  
  // Handle edit post
  const handleEditPost = () => {
    navigate(`/posts/edit/${post._id}`);
  };
  
  // Handle delete post
  const handleDeletePost = async () => {
    try {
      setLoading(true);
      
      // Delete post
      await axios.delete(`/api/posts/${post._id}`);
      
      // Close dialog
      setDeleteDialogOpen(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Post deleted successfully',
        severity: 'success',
      });
      
      // Call onDelete callback
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete post',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle publish post
  const handlePublishPost = async () => {
    try {
      setLoading(true);
      
      // Publish post
      await axios.post(`/api/posts/${post._id}/publish`);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Post is being published',
        severity: 'success',
      });
      
      // Refresh post data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to publish post',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel scheduled post
  const handleCancelScheduledPost = async () => {
    try {
      setLoading(true);
      
      // Cancel scheduled post
      await axios.post(`/api/posts/${post._id}/cancel`);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Scheduled post cancelled successfully',
        severity: 'success',
      });
      
      // Refresh post data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error cancelling scheduled post:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to cancel scheduled post',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle view analytics
  const handleViewAnalytics = () => {
    navigate(`/posts/${post._id}/analytics`);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };
  
  // Get post actions based on status
  const getPostActions = () => {
    const actions = [];
    
    // Edit action (only for draft and scheduled posts)
    if (post.status === 'draft' || post.status === 'scheduled') {
      actions.push(
        <Button
          key="edit"
          variant="outlined"
          startIcon={<Edit />}
          onClick={handleEditPost}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
      );
    }
    
    // Delete action
    actions.push(
      <Button
        key="delete"
        variant="outlined"
        color="error"
        startIcon={<Delete />}
        onClick={() => setDeleteDialogOpen(true)}
        disabled={loading}
        sx={{ mr: 1 }}
      >
        Delete
      </Button>
    );
    
    // Publish action (only for draft posts)
    if (post.status === 'draft') {
      actions.push(
        <Button
          key="publish"
          variant="contained"
          color="secondary"
          startIcon={<Send />}
          onClick={handlePublishPost}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Publish Now
        </Button>
      );
    }
    
    // Cancel scheduled action (only for scheduled posts)
    if (post.status === 'scheduled') {
      actions.push(
        <Button
          key="cancel"
          variant="outlined"
          color="warning"
          startIcon={<Cancel />}
          onClick={handleCancelScheduledPost}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Cancel Schedule
        </Button>
      );
    }
    
    // View analytics action (only for published posts)
    if (post.status === 'published') {
      actions.push(
        <Button
          key="analytics"
          variant="contained"
          color="primary"
          startIcon={<BarChart />}
          onClick={handleViewAnalytics}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          View Analytics
        </Button>
      );
    }
    
    return actions;
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                icon={getPlatformIcon(post.platform)}
                label={post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                sx={{ 
                  bgcolor: getPlatformColor(post.platform),
                  color: 'white',
                  mr: 1,
                }}
              />
              <Chip
                label={post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                color={getStatusColor(post.status)}
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Created: {formatDate(post.createdAt)}
            </Typography>
          </Box>
        </Grid>
        
        {/* Content */}
        <Grid item xs={12} md={post.media && post.media.length > 0 ? 8 : 12}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {post.content}
          </Typography>
          
          {/* Hashtags */}
          {extractHashtags(post.content).length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {extractHashtags(post.content).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
          
          {/* Schedule Info */}
          {post.status === 'scheduled' && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" color="primary">
                Scheduled for: {formatDate(post.scheduledTime)}
              </Typography>
            </Box>
          )}
          
          {/* Published Info */}
          {post.status === 'published' && post.publishedTime && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" color="success.main">
                Published on: {formatDate(post.publishedTime)}
              </Typography>
            </Box>
          )}
          
          {/* Error Info */}
          {post.status === 'failed' && post.lastError && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" color="error">
                Error: {post.lastError}
              </Typography>
            </Box>
          )}
        </Grid>
        
        {/* Media */}
        {post.media && post.media.length > 0 && (
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {post.media.slice(0, 3).map((item, index) => (
                <Card key={index} variant="outlined">
                  {item.type === 'image' ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.url}
                      alt={item.alt || 'Media'}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 140,
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
                </Card>
              ))}
              {post.media.length > 3 && (
                <Typography variant="body2" align="center">
                  +{post.media.length - 3} more
                </Typography>
              )}
            </Box>
          </Grid>
        )}
        
        {/* Analytics Summary (for published posts) */}
        {post.status === 'published' && post.analytics && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Performance Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Reach
                  </Typography>
                  <Typography variant="h6">
                    {post.analytics.reach.toLocaleString()}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Engagement
                  </Typography>
                  <Typography variant="h6">
                    {post.analytics.engagement.toLocaleString()}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Likes
                  </Typography>
                  <Typography variant="h6">
                    {post.analytics.likes.toLocaleString()}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Comments
                  </Typography>
                  <Typography variant="h6">
                    {post.analytics.comments.toLocaleString()}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}
        
        {/* Actions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {loading ? (
              <CircularProgress size={24} sx={{ mr: 2 }} />
            ) : (
              getPostActions()
            )}
          </Box>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Delete Post
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePost}
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default PostDetails; 