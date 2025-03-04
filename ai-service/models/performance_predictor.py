import os
import logging
import numpy as np
import random
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PerformancePredictor:
    """Model for predicting post performance based on content and hashtags"""
    
    def __init__(self):
        """Initialize the performance predictor model"""
        self.logger = logging.getLogger(__name__)
        
        # Platform-specific base metrics
        self.platform_metrics = {
            "instagram": {
                "base_reach": 300,
                "base_engagement": 30,
                "hashtag_multiplier": 1.2,
                "content_multiplier": 1.1,
                "variance": 0.3
            },
            "twitter": {
                "base_reach": 200,
                "base_engagement": 15,
                "hashtag_multiplier": 1.1,
                "content_multiplier": 1.3,
                "variance": 0.4
            },
            "facebook": {
                "base_reach": 150,
                "base_engagement": 10,
                "hashtag_multiplier": 1.05,
                "content_multiplier": 1.2,
                "variance": 0.25
            },
            "linkedin": {
                "base_reach": 100,
                "base_engagement": 5,
                "hashtag_multiplier": 1.15,
                "content_multiplier": 1.4,
                "variance": 0.2
            }
        }
        
        # Hashtag effectiveness by category
        self.category_effectiveness = {
            "travel": 1.3,
            "food": 1.25,
            "fitness": 1.2,
            "fashion": 1.3,
            "technology": 1.15,
            "business": 1.1,
            "art": 1.2,
            "music": 1.25,
            "nature": 1.15,
            "pets": 1.4,
            "general": 1.0,
            "entity": 1.2,
            "keyword": 1.1,
            "unknown": 1.0
        }
        
        self.logger.info("Performance predictor model initialized")
    
    def predict(self, content: str, hashtags: List[str], platform: str) -> Dict[str, Any]:
        """Predict performance metrics for a post"""
        try:
            # Get platform-specific metrics
            metrics = self.platform_metrics.get(platform, self.platform_metrics["instagram"])
            
            # Calculate content score
            content_score = self._calculate_content_score(content)
            
            # Calculate hashtag score
            hashtag_score = self._calculate_hashtag_score(hashtags)
            
            # Calculate reach
            base_reach = metrics["base_reach"]
            reach_multiplier = (
                metrics["hashtag_multiplier"] ** min(len(hashtags), 10) * 
                metrics["content_multiplier"] ** content_score
            )
            predicted_reach = int(base_reach * reach_multiplier * (1 + random.uniform(-metrics["variance"], metrics["variance"])))
            
            # Calculate engagement
            base_engagement = metrics["base_engagement"]
            engagement_rate = 0.1 * (1 + hashtag_score * 0.5 + content_score * 0.3)
            predicted_engagement = int(predicted_reach * engagement_rate * (1 + random.uniform(-metrics["variance"], metrics["variance"])))
            
            # Calculate overall score (0-100)
            overall_score = min(100, (hashtag_score * 40 + content_score * 30 + (engagement_rate * 100) * 30))
            
            return {
                "score": round(overall_score, 1),
                "reach": predicted_reach,
                "engagement": predicted_engagement
            }
            
        except Exception as e:
            self.logger.error(f"Error predicting performance: {str(e)}")
            # Return default prediction as fallback
            return {
                "score": 50.0,
                "reach": 200,
                "engagement": 20
            }
    
    def _calculate_content_score(self, content: str) -> float:
        """Calculate content quality score"""
        # This is a simplified version
        # In a real implementation, this would use NLP and ML models
        
        # Length factor (longer content tends to perform better, up to a point)
        length = len(content)
        length_score = min(1.0, length / 500)
        
        # Diversity factor (estimate based on unique words)
        words = content.lower().split()
        unique_words = set(words)
        diversity_score = min(1.0, len(unique_words) / 50)
        
        # Readability factor (simplified)
        avg_word_length = sum(len(word) for word in words) / max(1, len(words))
        readability_score = 1.0 - min(1.0, abs(avg_word_length - 5) / 5)
        
        # Combine scores
        content_score = 0.4 * length_score + 0.4 * diversity_score + 0.2 * readability_score
        
        return content_score
    
    def _calculate_hashtag_score(self, hashtags: List[str]) -> float:
        """Calculate hashtag effectiveness score"""
        if not hashtags:
            return 0.0
        
        # Count by category
        category_counts = {}
        for hashtag in hashtags:
            # Clean hashtag
            clean_hashtag = hashtag.replace('#', '').lower()
            
            # Determine category
            category = self._estimate_category(clean_hashtag)
            
            # Update count
            category_counts[category] = category_counts.get(category, 0) + 1
        
        # Calculate diversity score
        diversity_score = min(1.0, len(category_counts) / 5)
        
        # Calculate effectiveness score
        effectiveness_sum = sum(
            self.category_effectiveness.get(category, 1.0) * count
            for category, count in category_counts.items()
        )
        effectiveness_score = effectiveness_sum / max(1, len(hashtags))
        
        # Calculate quantity score
        quantity_score = min(1.0, len(hashtags) / 15)
        
        # Combine scores
        hashtag_score = 0.4 * diversity_score + 0.4 * effectiveness_score + 0.2 * quantity_score
        
        return hashtag_score
    
    def _estimate_category(self, hashtag: str) -> str:
        """Estimate category of a hashtag based on text"""
        # This is a simplified version
        # In a real implementation, this would use a classifier or database lookup
        hashtag_lower = hashtag.lower()
        
        categories = {
            "travel": ["travel", "wanderlust", "adventure", "explore", "vacation", "trip"],
            "food": ["food", "foodie", "delicious", "yummy", "cooking", "recipe"],
            "fitness": ["fitness", "workout", "gym", "exercise", "health", "training"],
            "fashion": ["fashion", "style", "outfit", "beauty", "model", "shopping"],
            "technology": ["tech", "technology", "digital", "coding", "programming", "software"],
            "business": ["business", "entrepreneur", "marketing", "startup", "success"],
            "art": ["art", "artist", "creative", "design", "drawing", "painting"],
            "music": ["music", "song", "singer", "band", "concert", "musician"],
            "nature": ["nature", "outdoors", "landscape", "wildlife", "mountain", "ocean"],
            "pets": ["pet", "dog", "cat", "animal", "puppy", "kitten"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in hashtag_lower for keyword in keywords):
                return category
        
        return "general" 