import os
import logging
import numpy as np
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class HashtagOptimizer:
    """Model for optimizing hashtag combinations"""
    
    def __init__(self):
        """Initialize the hashtag optimizer model"""
        self.logger = logging.getLogger(__name__)
        
        # Platform-specific constraints
        self.platform_constraints = {
            "instagram": {
                "max_hashtags": 30,
                "max_length": 2200,  # Total caption length
            },
            "twitter": {
                "max_hashtags": 10,  # Recommended, not enforced
                "max_length": 280,   # Tweet length
            },
            "facebook": {
                "max_hashtags": 15,  # Recommended, not enforced
                "max_length": 5000,  # Approximate
            },
            "linkedin": {
                "max_hashtags": 10,  # Recommended, not enforced
                "max_length": 3000,  # Approximate
            }
        }
        
        # Hashtag diversity weights
        self.diversity_weights = {
            "category": 0.3,
            "length": 0.2,
            "popularity": 0.5
        }
        
        self.logger.info("Hashtag optimizer model initialized")
    
    def optimize(self, hashtags: List[str], content: Optional[str] = None, platform: str = "instagram", count: int = 30) -> List[Dict[str, Any]]:
        """Optimize hashtag combination for maximum reach and engagement"""
        try:
            # Validate inputs
            if not hashtags:
                return []
            
            # Get platform constraints
            constraints = self.platform_constraints.get(platform, self.platform_constraints["instagram"])
            max_hashtags = min(count, constraints["max_hashtags"])
            
            # Prepare hashtags with metadata
            hashtag_objects = self._prepare_hashtags(hashtags)
            
            # Calculate content length if provided
            content_length = len(content) if content else 0
            
            # Calculate available space for hashtags
            available_space = constraints["max_length"] - content_length - max_hashtags  # Account for spaces
            
            # If space is limited, prioritize shorter hashtags
            if available_space < sum(len(h["text"]) for h in hashtag_objects):
                hashtag_objects.sort(key=lambda x: len(x["text"]))
                
                # Keep adding hashtags until we run out of space
                optimized_hashtags = []
                current_length = 0
                
                for hashtag in hashtag_objects:
                    hashtag_length = len(hashtag["text"]) + 1  # +1 for space
                    if current_length + hashtag_length <= available_space:
                        optimized_hashtags.append(hashtag)
                        current_length += hashtag_length
                    
                    if len(optimized_hashtags) >= max_hashtags:
                        break
                
                return optimized_hashtags
            
            # If space is not an issue, optimize for diversity and performance
            return self._optimize_for_performance(hashtag_objects, max_hashtags)
            
        except Exception as e:
            self.logger.error(f"Error optimizing hashtags: {str(e)}")
            # Return original hashtags as fallback
            return [{"text": h, "score": 0.5, "category": "unknown", "isAIGenerated": False} for h in hashtags[:count]]
    
    def _prepare_hashtags(self, hashtags: List[str]) -> List[Dict[str, Any]]:
        """Prepare hashtags with metadata"""
        hashtag_objects = []
        
        for hashtag in hashtags:
            # Ensure hashtag starts with #
            clean_hashtag = hashtag if hashtag.startswith('#') else f"#{hashtag}"
            
            # Estimate popularity based on length (just a heuristic)
            # In a real implementation, this would use actual popularity data
            popularity = 1.0 / (0.1 + len(clean_hashtag) / 20)
            
            # Determine category (simplified)
            category = self._estimate_category(clean_hashtag)
            
            hashtag_objects.append({
                "text": clean_hashtag,
                "score": popularity,
                "category": category,
                "isAIGenerated": False
            })
        
        return hashtag_objects
    
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
    
    def _optimize_for_performance(self, hashtags: List[Dict[str, Any]], max_count: int) -> List[Dict[str, Any]]:
        """Optimize hashtags for performance and diversity"""
        # Sort by score (popularity)
        sorted_by_score = sorted(hashtags, key=lambda x: x["score"], reverse=True)
        
        # Take top performers
        top_performers = sorted_by_score[:int(max_count * 0.6)]
        remaining = sorted_by_score[int(max_count * 0.6):]
        
        # Group remaining by category
        categories = {}
        for hashtag in remaining:
            category = hashtag["category"]
            if category not in categories:
                categories[category] = []
            categories[category].append(hashtag)
        
        # Select diverse hashtags from each category
        diverse_selections = []
        for category, hashtags in categories.items():
            # Take top 2 from each category
            diverse_selections.extend(hashtags[:2])
        
        # Combine and sort by score
        combined = top_performers + diverse_selections
        combined.sort(key=lambda x: x["score"], reverse=True)
        
        # Remove duplicates and limit to max count
        unique_hashtags = []
        seen = set()
        
        for hashtag in combined:
            if hashtag["text"] not in seen and len(unique_hashtags) < max_count:
                unique_hashtags.append(hashtag)
                seen.add(hashtag["text"])
        
        return unique_hashtags 