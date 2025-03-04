import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  AddPhotoAlternate, 
  Close, 
  Send, 
  Schedule, 
  Save, 
  Delete,
  Tag,
  AutoAwesome,
  ExpandMore,
  Lightbulb,
  Analytics
} from '@mui/icons-material';
import axios from 'axios';
import postService from '../services/post.service';
import HashtagSuggestions from './HashtagSuggestions';
import ContentSuggestions from './ContentSuggestions';
import PerformancePrediction from './PerformancePrediction';

const PostForm = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    content: '',
    platform: 'instagram',
    scheduledTime: null,
    media: [],
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [hashtagDialogOpen, setHashtagDialogOpen] = useState(false);
  const [suggestedHashtags, setSuggestedHashtags] = useState([]);
  const [hashtagsLoading, setHashtagsLoading] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [characterCount, setCharacterCount] = useState(0);
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [mediaPreview, setMediaPreview] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hashtags, setHashtags] = useState([]);
  const [aiTab, setAiTab] = useState(0);
  
  // Platform character limits
  const platformLimits = {
    twitter: 280,
    instagram: 2200,
    facebook: 5000,
    linkedin: 3000,
  };
  
  // Initialize form data if post is provided (edit mode)
  useEffect(() => {
    if (post) {
      setFormData({
        content: post.content || '',
        platform: post.platform || 'instagram',
        scheduledTime: post.scheduledTime ? new Date(post.scheduledTime) : null,
        media: post.media || [],
      });
      
      // Extract hashtags from content
      const hashtags = (post.content.match(/#[a-zA-Z0-9_]+/g) || [])
        .map(tag => tag.substring(1));
      setSelectedHashtags(hashtags);
      
      // Set media previews
      if (post.media && post.media.length > 0) {
        setMediaPreview(post.media.map(item => ({
          url: item.url,
          type: item.type,
          file: null
        })));
      }
    }
  }, [post]);
  
  // Update character count when content changes
  useEffect(() => {
    setCharacterCount(formData.content.length);
  }, [formData.content]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // Handle scheduled time change
  const handleScheduledTimeChange = (date) => {
    setFormData(prev => ({
      ...prev,
      scheduledTime: date,
    }));
    
    // Clear error for this field
    if (errors.scheduledTime) {
      setErrors(prev => ({
        ...prev,
        scheduledTime: '',
      }));
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    // Check if we're exceeding the platform's media limit
    const totalMedia = formData.media.length + files.length;
    const platformMediaLimits = {
      instagram: 10,
      twitter: 4,
      facebook: 10,
      linkedin: 9,
    };
    
    if (totalMedia > platformMediaLimits[formData.platform]) {
      setSnackbar({
        open: true,
        message: `${formData.platform} allows a maximum of ${platformMediaLimits[formData.platform]} media files`,
        severity: 'error',
      });
      return;
    }
    
    // Create form data for upload
    const formDataForUpload = new FormData();
    for (let i = 0; i < files.length; i++) {
      formDataForUpload.append('media', files[i]);
    }
    
    try {
      setUploadLoading(true);
      
      // Upload files
      const response = await axios.post('/api/posts/upload', formDataForUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Add uploaded media to form data
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, ...response.data.media],
      }));
      
      setSnackbar({
        open: true,
        message: 'Media uploaded successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to upload media',
        severity: 'error',
      });
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Remove media item
  const handleRemoveMedia = (index) => {
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate content
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > platformLimits[formData.platform]) {
      newErrors.content = `Content exceeds ${platformLimits[formData.platform]} character limit for ${formData.platform}`;
    }
    
    // Validate platform
    if (!formData.platform) {
      newErrors.platform = 'Platform is required';
    }
    
    // Validate scheduled time if provided
    if (formData.scheduledTime) {
      const now = new Date();
      if (formData.scheduledTime <= now) {
        newErrors.scheduledTime = 'Scheduled time must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e, action = 'save') => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const postData = {
        ...formData,
        scheduledTime: formData.scheduledTime ? formData.scheduledTime.toISOString() : undefined,
      };
      
      // If action is 'publish', set status to 'published'
      if (action === 'publish') {
        postData.status = 'published';
      } else if (action === 'schedule' && formData.scheduledTime) {
        postData.status = 'scheduled';
      } else {
        postData.status = 'draft';
      }
      
      // Call the onSave callback with the form data
      await onSave(postData, action);
      
      // Reset form if it's a new post
      if (!post) {
        setFormData({
          content: '',
          platform: 'instagram',
          scheduledTime: null,
          media: [],
        });
        setSelectedHashtags([]);
      }
      
      setSnackbar({
        open: true,
        message: post 
          ? `Post ${action === 'publish' ? 'published' : action === 'schedule' ? 'scheduled' : 'updated'} successfully` 
          : `Post ${action === 'publish' ? 'published' : action === 'schedule' ? 'scheduled' : 'created'} successfully`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving post:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save post',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Open hashtag suggestion dialog
  const handleOpenHashtagDialog = async () => {
    setHashtagDialogOpen(true);
    
    try {
      setHashtagsLoading(true);
      
      // Get hashtag suggestions based on content
      const response = await axios.post('/api/hashtags/suggest', {
        content: formData.content,
        platform: formData.platform,
      });
      
      setSuggestedHashtags(response.data.hashtags || []);
    } catch (error) {
      console.error('Error getting hashtag suggestions:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to get hashtag suggestions',
        severity: 'error',
      });
    } finally {
      setHashtagsLoading(false);
    }
  };
  
  // Add hashtag to content
  const handleAddHashtag = (hashtag) => {
    // Check if hashtag is already selected
    if (selectedHashtags.includes(hashtag)) {
      return;
    }
    
    // Add hashtag to selected hashtags
    setSelectedHashtags(prev => [...prev, hashtag]);
    
    // Add hashtag to content
    const newContent = `${formData.content} #${hashtag}`;
    setFormData(prev => ({
      ...prev,
      content: newContent,
    }));
  };
  
  // Remove hashtag from content
  const handleRemoveHashtag = (hashtag) => {
    // Remove hashtag from selected hashtags
    setSelectedHashtags(prev => prev.filter(tag => tag !== hashtag));
    
    // Remove hashtag from content
    const newContent = formData.content.replace(`#${hashtag}`, '').replace(/\s+/g, ' ').trim();
    setFormData(prev => ({
      ...prev,
      content: newContent,
    }));
  };
  
  // Get AI suggestion for content
  const handleGetAiSuggestion = async () => {
    try {
      setAiSuggestionLoading(true);
      
      // Get AI suggestion
      const response = await axios.post('/api/ai/suggest-content', {
        platform: formData.platform,
        topic: formData.content || 'social media post',
      });
      
      setAiSuggestion(response.data.content || '');
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to get AI suggestion',
        severity: 'error',
      });
    } finally {
      setAiSuggestionLoading(false);
    }
  };
  
  // Apply AI suggestion to content
  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion) return;
    
    setFormData(prev => ({
      ...prev,
      content: aiSuggestion,
    }));
    
    setAiSuggestion('');
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };
  
  // Handle hashtag selection
  const handleHashtagSelect = (selectedHashtags) => {
    setHashtags(selectedHashtags);
    
    // Update content with selected hashtags
    const hashtagText = selectedHashtags.map(tag => `#${tag}`).join(' ');
    if (hashtagText) {
      // Remove existing hashtags from content
      const contentWithoutHashtags = formData.content.replace(/#[a-zA-Z0-9_]+/g, '').trim();
      setFormData(prev => ({
        ...prev,
        content: `${contentWithoutHashtags}\n\n${hashtagText}`
      }));
    }
  };
  
  // Handle content selection from AI suggestions
  const handleContentSelect = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };
  
  // Handle AI tab change
  const handleAiTabChange = (event, newValue) => {
    setAiTab(newValue);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={(e) => handleSubmit(e, 'save')}>
        <Typography variant="h5" gutterBottom>
          {post ? 'Edit Post' : 'Create New Post'}
        </Typography>
        
        <Grid container spacing={3}>
          {/* Platform Selection */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.platform}>
              <InputLabel>Platform</InputLabel>
              <Select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                label="Platform"
              >
                <MenuItem value="instagram">Instagram</MenuItem>
                <MenuItem value="twitter">Twitter</MenuItem>
                <MenuItem value="facebook">Facebook</MenuItem>
                <MenuItem value="linkedin">LinkedIn</MenuItem>
              </Select>
              {errors.platform && (
                <FormHelperText>{errors.platform}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Scheduled Time */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Schedule for"
                value={formData.scheduledTime}
                onChange={handleScheduledTimeChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.scheduledTime}
                    helperText={errors.scheduledTime}
                  />
                )}
                disablePast
              />
            </LocalizationProvider>
          </Grid>
          
          {/* Content */}
          <Grid item xs={12}>
            <TextField
              name="content"
              label="Content"
              multiline
              rows={6}
              value={formData.content}
              onChange={handleChange}
              fullWidth
              error={!!errors.content}
              helperText={errors.content || `${characterCount}/${platformLimits[formData.platform]} characters`}
              InputProps={{
                endAdornment: (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={handleOpenHashtagDialog}
                      title="Add hashtags"
                    >
                      <Tag />
                    </IconButton>
                    <IconButton 
                      onClick={handleGetAiSuggestion}
                      disabled={aiSuggestionLoading}
                      title="Get AI suggestion"
                    >
                      {aiSuggestionLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        <AutoAwesome />
                      )}
                    </IconButton>
                  </Box>
                ),
              }}
            />
          </Grid>
          
          {/* AI Suggestion */}
          {aiSuggestion && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    AI Suggestion
                  </Typography>
                  <Box>
                    <Button 
                      size="small" 
                      startIcon={<Close />} 
                      onClick={() => setAiSuggestion('')}
                    >
                      Dismiss
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={<Save />} 
                      onClick={handleApplyAiSuggestion}
                      sx={{ ml: 1 }}
                    >
                      Apply
                    </Button>
                  </Box>
                </Box>
                <Typography variant="body2">{aiSuggestion}</Typography>
              </Paper>
            </Grid>
          )}
          
          {/* Selected Hashtags */}
          {selectedHashtags.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedHashtags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    onDelete={() => handleRemoveHashtag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          )}
          
          {/* Media Upload */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Media
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {mediaPreview.map((media, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`Preview ${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <video
                      src={media.url}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      controls
                    />
                  )}
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)'
                    }}
                    onClick={() => handleRemoveMedia(index)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<AddPhotoAlternate />}
                sx={{
                  width: 150,
                  height: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                disabled={loading}
              >
                Add Media
                <input
                  type="file"
                  accept="image/*,video/*"
                  hidden
                  onChange={handleFileUpload}
                  multiple
                />
              </Button>
            </Box>
            
            {loading && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading: {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Grid>
          
          {/* Action Buttons */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  startIcon={<Save />}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Draft'}
                </Button>
                
                {formData.scheduledTime && (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={<Schedule />}
                    onClick={(e) => handleSubmit(e, 'schedule')}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Schedule'}
                  </Button>
                )}
                
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={loading}
                  startIcon={<Send />}
                  onClick={(e) => handleSubmit(e, 'publish')}
                >
                  {loading ? <CircularProgress size={24} /> : 'Publish Now'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Hashtag Dialog */}
      <Dialog
        open={hashtagDialogOpen}
        onClose={() => setHashtagDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Suggested Hashtags
        </DialogTitle>
        <DialogContent>
          {hashtagsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : suggestedHashtags.length === 0 ? (
            <Typography>No hashtag suggestions available</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {suggestedHashtags.map((hashtag) => (
                <Chip
                  key={hashtag}
                  label={`#${hashtag}`}
                  onClick={() => handleAddHashtag(hashtag)}
                  color={selectedHashtags.includes(hashtag) ? 'primary' : 'default'}
                  clickable
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHashtagDialogOpen(false)}>Close</Button>
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

export default PostForm; 