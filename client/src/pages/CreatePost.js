import React, { useState } from 'react';
import { Box, Typography, Container, Paper, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import axios from 'axios';

const CreatePost = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  
  // Handle save post
  const handleSavePost = async (postData, action) => {
    try {
      // Create post
      const response = await axios.post('/api/posts', postData);
      
      // If action is 'publish', publish the post
      if (action === 'publish') {
        await axios.post(`/api/posts/${response.data.post._id}/publish`);
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Post ${action === 'publish' ? 'published' : action === 'schedule' ? 'scheduled' : 'created'} successfully`,
        severity: 'success',
      });
      
      // Navigate to posts page after a delay
      setTimeout(() => {
        navigate('/posts');
      }, 1500);
    } catch (error) {
      console.error('Error saving post:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save post',
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
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Post
        </Typography>
        
        <PostForm
          onSave={handleSavePost}
          onCancel={handleCancel}
        />
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

export default CreatePost; 