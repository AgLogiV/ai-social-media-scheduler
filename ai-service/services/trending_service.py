import os
import logging
import requests
import time
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Download NLTK resources
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

class TrendingService:
    """Service for fetching and analyzing trending hashtags"""
    
    def __init__(self, db_service):
        """Initialize trending service"""
        self.logger = logging.getLogger(__name__)
        self.db_service = db_service
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
        # Cache for trending hashtags to avoid frequent DB queries
        self.trending_cache = {}
        self.cache_expiry = {}
        self.cache_ttl = 3600  # 1 hour in seconds
    
    def get_trending(self, platform: str, category: Optional[str] = None, count: int = 20) -> List[Dict[str, Any]]:
        """Get trending hashtags for a platform and optional category"""
        cache_key = f"{platform}_{category or 'all'}"
        
        # Check if we have cached results that are still valid
        if cache_key in self.trending_cache and self.cache_expiry.get(cache_key, 0) > time.time():
            trending = self.trending_cache[cache_key]
            return trending[:count]
        
        # Fetch trending hashtags from database
        trending = self.db_service.get_trending_hashtags(platform, category, count)
        
        # Format the response
        formatted_trending = []
        for hashtag in trending:
            formatted_trending.append({
                "text": hashtag["text"],
                "score": hashtag.get("trendingScore", 0),
                "category": hashtag.get("category", ""),
                "isAIGenerated": False
            })
        
        # Cache the results
        self.trending_cache[cache_key] = formatted_trending
        self.cache_expiry[cache_key] = time.time() + self.cache_ttl
        
        return formatted_trending[:count]
    
    def get_relevant_trending(self, content: str, platform: str, count: int = 5) -> List[Dict[str, Any]]:
        """Get trending hashtags that are relevant to the content"""
        # Get all trending hashtags for the platform
        all_trending = self.get_trending(platform, count=50)
        
        # Extract keywords from content
        keywords = self._extract_keywords(content)
        
        # Score trending hashtags based on relevance to content
        scored_hashtags = []
        for hashtag in all_trending:
            relevance_score = self._calculate_relevance(hashtag["text"], keywords)
            scored_hashtags.append({
                "text": hashtag["text"],
                "score": relevance_score * hashtag["score"],  # Combine relevance with trending score
                "category": hashtag.get("category", ""),
                "isAIGenerated": False
            })
        
        # Sort by score and return top results
        scored_hashtags.sort(key=lambda x: x["score"], reverse=True)
        return scored_hashtags[:count]
    
    def _extract_keywords(self, content: str) -> List[str]:
        """Extract keywords from content"""
        # Tokenize and clean text
        tokens = word_tokenize(content.lower())
        
        # Remove stopwords and non-alphabetic tokens
        filtered_tokens = [
            self.lemmatizer.lemmatize(token) 
            for token in tokens 
            if token.isalpha() and token not in self.stop_words and len(token) > 2
        ]
        
        return filtered_tokens
    
    def _calculate_relevance(self, hashtag: str, keywords: List[str]) -> float:
        """Calculate relevance score between hashtag and keywords"""
        # Clean hashtag (remove # and lowercase)
        clean_hashtag = hashtag.replace('#', '').lower()
        
        # Check if hashtag contains any keywords
        if any(keyword in clean_hashtag for keyword in keywords):
            return 1.0
        
        # Calculate word overlap
        hashtag_words = clean_hashtag.split('_')
        overlap_count = sum(1 for word in hashtag_words if word in keywords)
        
        if overlap_count > 0:
            return 0.7 * (overlap_count / len(hashtag_words))
        
        # Check for partial matches
        for keyword in keywords:
            if keyword in clean_hashtag or clean_hashtag in keyword:
                return 0.5
        
        return 0.1  # Default low relevance
    
    def update_trending_data(self):
        """Update trending data from external APIs"""
        # This would connect to social media APIs to get real-time trending data
        # For now, we'll just log that this would happen
        self.logger.info("Updating trending data from external APIs")
        
        # In a real implementation, this would:
        # 1. Fetch trending topics from Twitter, Instagram, etc.
        # 2. Process and normalize the data
        # 3. Update the database with new trending hashtags
        # 4. Update trending scores for existing hashtags
        
        # Clear cache to ensure fresh data is fetched
        self.trending_cache = {}
        self.cache_expiry = {} 