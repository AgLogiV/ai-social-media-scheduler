import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PostForm from '../components/PostForm';
import axios from 'axios';

const EditPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  
  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`/api/posts/${id}`);
        setPost(response.data.post);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error.response?.data?.message || 'Failed to fetch post');
        
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to fetch post',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
  // Handle save post
  const handleSavePost = async (postData, action) => {
    try {
      // Update post
      await axios.put(`/api/posts/${id}`, postData);
      
      // If action is 'publish', publish the post
      if (action === 'publish') {
        await axios.post(`/api/posts/${id}/publish`);
      } else if (action === 'schedule' && postData.scheduledTime) {
        await axios.post(`/api/posts/${id}/schedule`, {
          scheduledTime: postData.scheduledTime,
        });
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Post ${action === 'publish' ? 'published' : action === 'schedule' ? 'scheduled' : 'updated'} successfully`,
        severity: 'success',
      });
      
      // Navigate to posts page after a delay
      setTimeout(() => {
        navigate('/posts');
      }, 1500);
    } catch (error) {
      console.error('Error updating post:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update post',
        severity: 'error',
      });
      
      // Re-throw error to be handled by the form
      throw error;
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/posts');
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
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
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Post
        </Typography>
        
        {post && (
          <PostForm
            post={post}
            onSave={handleSavePost}
            onCancel={handleCancel}
          />
        )}
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditPost; 