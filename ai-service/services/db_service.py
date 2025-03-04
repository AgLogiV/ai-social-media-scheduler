import os
import logging
from typing import List, Dict, Any, Optional
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DatabaseService:
    """Service for interacting with MongoDB database"""
    
    def __init__(self):
        """Initialize database connection"""
        self.logger = logging.getLogger(__name__)
        
        # Get MongoDB connection string from environment variables
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/ai-hashtag-optimizer")
        
        try:
            # Connect to MongoDB
            self.client = MongoClient(mongo_uri)
            self.db = self.client.get_database()
            self.logger.info("Connected to MongoDB")
            
            # Define collections
            self.hashtags = self.db.hashtags
            self.posts = self.db.posts
            self.analytics = self.db.analytics
            
        except Exception as e:
            self.logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    def get_trending_hashtags(self, platform: str, category: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Get trending hashtags from database"""
        query = {"trending": True}
        
        if platform != "all":
            query["platforms.name"] = platform
            
        if category:
            query["category"] = category
            
        try:
            trending = list(self.hashtags.find(query).sort("trendingScore", -1).limit(limit))
            return trending
        except Exception as e:
            self.logger.error(f"Error fetching trending hashtags: {str(e)}")
            return []
    
    def get_hashtag_by_text(self, text: str) -> Optional[Dict[str, Any]]:
        """Get hashtag by text"""
        try:
            return self.hashtags.find_one({"text": text})
        except Exception as e:
            self.logger.error(f"Error fetching hashtag by text: {str(e)}")
            return None
    
    def get_related_hashtags(self, hashtag_text: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get related hashtags for a given hashtag"""
        try:
            hashtag = self.get_hashtag_by_text(hashtag_text)
            if not hashtag or not hashtag.get("relatedHashtags"):
                return []
                
            related_texts = [h["text"] for h in hashtag["relatedHashtags"]]
            related_hashtags = list(self.hashtags.find({"text": {"$in": related_texts}}).limit(limit))
            return related_hashtags
        except Exception as e:
            self.logger.error(f"Error fetching related hashtags: {str(e)}")
            return []
    
    def get_hashtags_by_category(self, category: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get hashtags by category"""
        try:
            return list(self.hashtags.find({"category": category}).limit(limit))
        except Exception as e:
            self.logger.error(f"Error fetching hashtags by category: {str(e)}")
            return []
    
    def get_post_performance(self, post_id: str) -> Optional[Dict[str, Any]]:
        """Get post performance data"""
        try:
            post = self.posts.find_one({"_id": post_id})
            if post:
                return post.get("performance", {})
            return None
        except Exception as e:
            self.logger.error(f"Error fetching post performance: {str(e)}")
            return None
    
    def get_hashtag_performance(self, hashtag_text: str, platform: str = "all") -> Dict[str, Any]:
        """Get performance metrics for a hashtag"""
        try:
            # Get hashtag document
            hashtag = self.get_hashtag_by_text(hashtag_text)
            if not hashtag:
                return {"reach": 0, "engagement": 0, "postCount": 0}
            
            # If platform is specified, get platform-specific metrics
            if platform != "all":
                for p in hashtag.get("platforms", []):
                    if p["name"] == platform:
                        return {
                            "reach": p.get("popularity", 0),
                            "engagement": p.get("averageEngagement", 0),
                            "postCount": p.get("postCount", 0)
                        }
            
            # Otherwise return general metrics
            return {
                "reach": hashtag.get("popularity", 0),
                "engagement": hashtag.get("averageEngagement", 0),
                "postCount": hashtag.get("postCount", 0)
            }
        except Exception as e:
            self.logger.error(f"Error fetching hashtag performance: {str(e)}")
            return {"reach": 0, "engagement": 0, "postCount": 0}
    
    def close(self):
        """Close database connection"""
        if hasattr(self, 'client'):
            self.client.close()
            self.logger.info("Closed MongoDB connection") 