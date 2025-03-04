import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import ScoreIcon from '@mui/icons-material/Score';
import aiService from '../services/ai.service';

/**
 * Component for displaying AI-powered performance prediction
 */
const PerformancePrediction = ({ content, hashtags, platform }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Predict performance when content, hashtags, or platform changes
  useEffect(() => {
    if (content && platform && hashtags && hashtags.length > 0) {
      predictPerformance();
    }
  }, [content, hashtags, platform]);

  /**
   * Predict post performance using AI service
   */
  const predictPerformance = async () => {
    if (!content || !platform || !hashtags || hashtags.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.predictPerformance(content, hashtags, platform);
      setPrediction(result);
    } catch (error) {
      console.error('Error predicting performance:', error);
      setError('Failed to predict performance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get color based on score
   * @param {number} score - The score
   * @returns {string} The color
   */
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'primary';
    if (score >= 30) return 'warning';
    return 'error';
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Analyzing post performance...
        </Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  // Render empty state
  if (!prediction) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Performance Prediction
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add content, select a platform, and include hashtags to see a performance prediction.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Performance Prediction
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%'
            }}
          >
            <ScoreIcon color={getScoreColor(prediction.score)} sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {prediction.score}/100
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Overall Score
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%'
            }}
          >
            <ThumbUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {prediction.engagement.estimated_likes}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Estimated Likes
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%'
            }}
          >
            <CommentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {prediction.engagement.estimated_comments}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Estimated Comments
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%'
            }}
          >
            <ShareIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {prediction.engagement.estimated_shares}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Estimated Shares
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Recommendations
      </Typography>
      
      <List>
        {prediction.recommendations.map((recommendation, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <TipsAndUpdatesIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={recommendation} />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={predictPerformance}
        >
          Refresh Analysis
        </Button>
      </Box>
    </Paper>
  );
};

export default PerformancePrediction; 