import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import PostDetails from '../components/PostDetails';
import axios from 'axios';

const ViewPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch post data
  const fetchPost = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data.post);
      setError(null);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError(error.response?.data?.message || 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchPost();
  }, [id]);
  
  // Handle delete post
  const handleDeletePost = (postId) => {
    // Navigate back to posts list
    navigate('/posts');
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/posts');
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
            Back to Posts
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
  if (!post) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Back to Posts
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Post Not Found
          </Typography>
          <Typography variant="body1">
            The post you are looking for does not exist or has been deleted.
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Posts
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Post Details
        </Typography>
        
        <PostDetails
          post={post}
          onDelete={handleDeletePost}
          onRefresh={fetchPost}
        />
      </Box>
    </Container>
  );
};

export default ViewPost; 