import os
import logging
import torch
import numpy as np
from typing import List, Dict, Any
from transformers import AutoTokenizer, AutoModel
import spacy
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Download NLTK resources if not already downloaded
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If model not found, download it
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

class HashtagSuggester:
    """Model for suggesting hashtags based on content"""
    
    def __init__(self):
        """Initialize the hashtag suggester model"""
        self.logger = logging.getLogger(__name__)
        
        # Load pre-trained model and tokenizer
        model_name = "distilbert-base-uncased"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        
        # Set model to evaluation mode
        self.model.eval()
        
        # Initialize NLP tools
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
        # Load hashtag categories and examples
        self.categories = self._load_categories()
        
        self.logger.info("Hashtag suggester model initialized")
    
    def _load_categories(self) -> Dict[str, List[str]]:
        """Load hashtag categories and examples"""
        # In a real implementation, this would load from a database or file
        # For now, we'll use a hardcoded dictionary
        return {
            "travel": ["#travel", "#wanderlust", "#adventure", "#explore", "#vacation", "#travelgram", "#instatravel", "#travelphotography", "#tourism", "#trip"],
            "food": ["#food", "#foodie", "#foodporn", "#instafood", "#foodphotography", "#delicious", "#yummy", "#foodlover", "#foodblogger", "#cooking"],
            "fitness": ["#fitness", "#workout", "#gym", "#fit", "#health", "#training", "#exercise", "#healthy", "#fitnessmotivation", "#lifestyle"],
            "fashion": ["#fashion", "#style", "#ootd", "#fashionblogger", "#streetstyle", "#fashionista", "#outfit", "#model", "#beauty", "#shopping"],
            "technology": ["#technology", "#tech", "#innovation", "#digital", "#coding", "#programming", "#developer", "#software", "#ai", "#machinelearning"],
            "business": ["#business", "#entrepreneur", "#marketing", "#success", "#motivation", "#startup", "#entrepreneurship", "#smallbusiness", "#leadership", "#branding"],
            "art": ["#art", "#artist", "#artwork", "#drawing", "#painting", "#illustration", "#design", "#creative", "#sketch", "#photography"],
            "music": ["#music", "#musician", "#song", "#singer", "#band", "#concert", "#guitar", "#hiphop", "#rap", "#producer"],
            "nature": ["#nature", "#naturephotography", "#outdoors", "#landscape", "#wildlife", "#mountains", "#ocean", "#hiking", "#environment", "#naturelovers"],
            "pets": ["#pets", "#dog", "#cat", "#animals", "#puppy", "#kitten", "#dogsofinstagram", "#catsofinstagram", "#petsofinstagram", "#adoptdontshop"]
        }
    
    def suggest(self, content: str, platform: str, count: int = 10) -> List[Dict[str, Any]]:
        """Suggest hashtags based on content"""
        try:
            # Extract entities and keywords from content
            entities = self._extract_entities(content)
            keywords = self._extract_keywords(content)
            
            # Determine relevant categories
            relevant_categories = self._get_relevant_categories(content, keywords)
            
            # Generate hashtags from entities and keywords
            entity_hashtags = self._generate_entity_hashtags(entities)
            keyword_hashtags = self._generate_keyword_hashtags(keywords)
            category_hashtags = self._get_category_hashtags(relevant_categories)
            
            # Combine all hashtags and remove duplicates
            all_hashtags = entity_hashtags + keyword_hashtags + category_hashtags
            unique_hashtags = {h["text"]: h for h in all_hashtags}.values()
            
            # Sort by score and limit to requested count
            sorted_hashtags = sorted(unique_hashtags, key=lambda x: x["score"], reverse=True)
            
            # Apply platform-specific filtering if needed
            if platform == "twitter":
                # Twitter has character limits, so prefer shorter hashtags
                sorted_hashtags.sort(key=lambda x: (0 - x["score"], len(x["text"])))
            
            return list(sorted_hashtags)[:count]
            
        except Exception as e:
            self.logger.error(f"Error suggesting hashtags: {str(e)}")
            # Return some generic hashtags as fallback
            return [
                {"text": "#awesome", "score": 0.5, "category": "general", "isAIGenerated": True},
                {"text": "#amazing", "score": 0.4, "category": "general", "isAIGenerated": True},
                {"text": "#instagood", "score": 0.3, "category": "general", "isAIGenerated": True}
            ]
    
    def _extract_entities(self, content: str) -> List[str]:
        """Extract named entities from content"""
        doc = nlp(content)
        entities = []
        
        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ORG", "GPE", "LOC", "PRODUCT", "EVENT"]:
                entities.append(ent.text)
        
        return entities
    
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
        
        # Count frequency of each token
        token_freq = {}
        for token in filtered_tokens:
            token_freq[token] = token_freq.get(token, 0) + 1
        
        # Sort by frequency
        sorted_tokens = sorted(token_freq.items(), key=lambda x: x[1], reverse=True)
        
        # Return top keywords
        return [token for token, freq in sorted_tokens[:15]]
    
    def _get_relevant_categories(self, content: str, keywords: List[str]) -> List[str]:
        """Determine relevant categories for the content"""
        # Encode content
        inputs = self.tokenizer(content, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # Get content embedding
        content_embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        
        # Calculate similarity with each category
        category_scores = {}
        for category, examples in self.categories.items():
            # Check keyword overlap
            category_keywords = [word.lower() for hashtag in examples for word in hashtag.replace('#', '').split()]
            overlap = sum(1 for keyword in keywords if keyword in category_keywords)
            
            # If there's overlap, this category is relevant
            if overlap > 0:
                category_scores[category] = 0.5 + (0.1 * overlap)
            else:
                category_scores[category] = 0.1
        
        # Sort categories by score
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Return top categories
        return [category for category, score in sorted_categories[:3]]
    
    def _generate_entity_hashtags(self, entities: List[str]) -> List[Dict[str, Any]]:
        """Generate hashtags from entities"""
        hashtags = []
        
        for entity in entities:
            # Clean entity and convert to hashtag format
            clean_entity = entity.replace(' ', '').replace('-', '').replace('_', '')
            if len(clean_entity) > 2:
                hashtags.append({
                    "text": f"#{clean_entity}",
                    "score": 0.9,
                    "category": "entity",
                    "isAIGenerated": True
                })
        
        return hashtags
    
    def _generate_keyword_hashtags(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Generate hashtags from keywords"""
        hashtags = []
        
        for i, keyword in enumerate(keywords):
            if len(keyword) > 2:
                # Score decreases as we go down the keyword list
                score = 0.8 - (i * 0.05)
                hashtags.append({
                    "text": f"#{keyword}",
                    "score": max(0.3, score),
                    "category": "keyword",
                    "isAIGenerated": True
                })
        
        return hashtags
    
    def _get_category_hashtags(self, categories: List[str]) -> List[Dict[str, Any]]:
        """Get hashtags from relevant categories"""
        hashtags = []
        
        for i, category in enumerate(categories):
            if category in self.categories:
                # Get hashtags for this category
                category_hashtags = self.categories[category]
                
                # Add top hashtags from this category
                for j, hashtag in enumerate(category_hashtags[:5]):
                    # Score decreases as we go down the category list and hashtag list
                    score = 0.7 - (i * 0.1) - (j * 0.05)
                    hashtags.append({
                        "text": hashtag,
                        "score": max(0.2, score),
                        "category": category,
                        "isAIGenerated": True
                    })
        
        return hashtags 