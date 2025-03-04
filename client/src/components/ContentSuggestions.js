import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper, 
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import aiService from '../services/ai.service';

/**
 * Component for generating AI-powered content suggestions
 */
const ContentSuggestions = ({ platform, onSelectContent }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [copied, setCopied] = useState(false);

  /**
   * Generate content suggestion
   */
  const generateSuggestion = async () => {
    if (!topic || !platform) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const content = await aiService.suggestContent(platform, topic);
      setSuggestion(content);
    } catch (error) {
      console.error('Error generating content suggestion:', error);
      setError('Failed to generate content suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy suggestion to clipboard
   */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(suggestion).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /**
   * Use the suggested content
   */
  const useContent = () => {
    if (onSelectContent && suggestion) {
      onSelectContent(suggestion);
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">AI Content Generator</Typography>
        {suggestion && (
          <Tooltip title="Copy suggestion">
            <IconButton onClick={copyToClipboard} size="small">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {copied && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Content copied to clipboard!
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="What topic would you like content for?"
          variant="outlined"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., digital marketing, fitness tips, travel destinations"
          disabled={loading}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          onClick={generateSuggestion}
          disabled={!topic || !platform || loading}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Generating...
            </>
          ) : (
            'Generate Content'
          )}
        </Button>
      </Box>
      
      {suggestion && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Suggested Content:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 2, 
              backgroundColor: 'background.default',
              minHeight: '100px'
            }}
          >
            <Typography variant="body1">
              {suggestion}
            </Typography>
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={useContent}
            >
              Use This Content
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ContentSuggestions; 