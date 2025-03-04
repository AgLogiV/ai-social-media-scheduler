import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button, 
  CircularProgress, 
  Paper, 
  Tabs, 
  Tab,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import aiService from '../services/ai.service';

/**
 * Component for displaying and managing AI-powered hashtag suggestions
 */
const HashtagSuggestions = ({ content, platform, onSelectHashtags }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);

  // Fetch suggestions when content or platform changes
  useEffect(() => {
    if (content && platform) {
      fetchSuggestions();
    }
  }, [content, platform]);

  // Fetch trending hashtags when platform changes
  useEffect(() => {
    if (platform) {
      fetchTrending();
    }
  }, [platform]);

  // Notify parent component when selected hashtags change
  useEffect(() => {
    if (onSelectHashtags) {
      onSelectHashtags(selectedHashtags);
    }
  }, [selectedHashtags, onSelectHashtags]);

  /**
   * Fetch hashtag suggestions from AI service
   */
  const fetchSuggestions = async () => {
    if (!content || !platform) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const hashtags = await aiService.getSuggestions(content, platform, 20);
      setSuggestions(hashtags);
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
      setError('Failed to fetch hashtag suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch trending hashtags from AI service
   */
  const fetchTrending = async () => {
    if (!platform) return;
    
    try {
      const hashtags = await aiService.getTrendingHashtags(platform, 20);
      setTrending(hashtags);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      // Don't show error for trending, as it's not critical
    }
  };

  /**
   * Optimize selected hashtags
   */
  const optimizeHashtags = async () => {
    if (!platform || selectedHashtags.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const optimized = await aiService.optimizeHashtags(selectedHashtags, content, platform, 30);
      setSelectedHashtags(optimized);
    } catch (error) {
      console.error('Error optimizing hashtags:', error);
      setError('Failed to optimize hashtags. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle a hashtag selection
   * @param {string} hashtag - The hashtag to toggle
   */
  const toggleHashtag = (hashtag) => {
    setSelectedHashtags(prev => {
      if (prev.includes(hashtag)) {
        return prev.filter(tag => tag !== hashtag);
      } else {
        return [...prev, hashtag];
      }
    });
  };

  /**
   * Copy selected hashtags to clipboard
   */
  const copyToClipboard = () => {
    const text = selectedHashtags.map(tag => `#${tag}`).join(' ');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /**
   * Handle tab change
   * @param {Event} event - The event
   * @param {number} newValue - The new tab value
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Loading hashtag suggestions...
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Hashtag Suggestions</Typography>
        <Box>
          <Tooltip title="Refresh suggestions">
            <IconButton onClick={fetchSuggestions} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy selected hashtags">
            <IconButton 
              onClick={copyToClipboard} 
              size="small" 
              disabled={selectedHashtags.length === 0}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {copied && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Hashtags copied to clipboard!
        </Alert>
      )}
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Suggestions" />
        <Tab label="Trending" />
        <Tab label="Selected" />
      </Tabs>
      
      {tabValue === 0 && (
        <Box>
          {suggestions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No suggestions available. Try adding more content to your post.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {suggestions.map((hashtag) => (
                <Chip
                  key={hashtag}
                  label={`#${hashtag}`}
                  onClick={() => toggleHashtag(hashtag)}
                  color={selectedHashtags.includes(hashtag) ? 'primary' : 'default'}
                  clickable
                />
              ))}
            </Box>
          )}
        </Box>
      )}
      
      {tabValue === 1 && (
        <Box>
          {trending.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No trending hashtags available.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {trending.map((hashtag) => (
                <Chip
                  key={hashtag}
                  label={`#${hashtag}`}
                  onClick={() => toggleHashtag(hashtag)}
                  color={selectedHashtags.includes(hashtag) ? 'primary' : 'default'}
                  clickable
                />
              ))}
            </Box>
          )}
        </Box>
      )}
      
      {tabValue === 2 && (
        <Box>
          {selectedHashtags.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hashtags selected. Click on hashtags to select them.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedHashtags.map((hashtag) => (
                  <Chip
                    key={hashtag}
                    label={`#${hashtag}`}
                    onDelete={() => toggleHashtag(hashtag)}
                    color="primary"
                  />
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {selectedHashtags.length} hashtags selected
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={optimizeHashtags}
                  disabled={selectedHashtags.length === 0}
                >
                  Optimize Selection
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default HashtagSuggestions; 