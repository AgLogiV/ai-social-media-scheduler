import re
import string
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from typing import List, Set

# Download NLTK resources if not already downloaded
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

# Initialize NLTK tools
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def clean_text(text: str) -> str:
    """Clean text by removing special characters and extra whitespace"""
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+', '', text)
    
    # Remove mentions (@username)
    text = re.sub(r'@\w+', '', text)
    
    # Remove hashtags (#hashtag)
    text = re.sub(r'#\w+', '', text)
    
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def tokenize_text(text: str) -> List[str]:
    """Tokenize text into words"""
    return word_tokenize(text)

def remove_stopwords(tokens: List[str]) -> List[str]:
    """Remove stopwords from a list of tokens"""
    return [token for token in tokens if token.lower() not in stop_words]

def lemmatize_tokens(tokens: List[str]) -> List[str]:
    """Lemmatize tokens to their base form"""
    return [lemmatizer.lemmatize(token) for token in tokens]

def extract_keywords(text: str, min_length: int = 3, max_keywords: int = 20) -> List[str]:
    """Extract keywords from text"""
    # Clean text
    cleaned_text = clean_text(text)
    
    # Tokenize
    tokens = tokenize_text(cleaned_text)
    
    # Remove stopwords
    filtered_tokens = remove_stopwords(tokens)
    
    # Lemmatize
    lemmatized_tokens = lemmatize_tokens(filtered_tokens)
    
    # Filter by length
    long_tokens = [token for token in lemmatized_tokens if len(token) >= min_length]
    
    # Count frequency
    token_freq = {}
    for token in long_tokens:
        token_freq[token] = token_freq.get(token, 0) + 1
    
    # Sort by frequency
    sorted_tokens = sorted(token_freq.items(), key=lambda x: x[1], reverse=True)
    
    # Return top keywords
    return [token for token, freq in sorted_tokens[:max_keywords]]

def extract_hashtags(text: str) -> List[str]:
    """Extract hashtags from text"""
    hashtag_pattern = r'#\w+'
    return re.findall(hashtag_pattern, text)

def format_hashtag(text: str) -> str:
    """Format text as a hashtag"""
    # Remove spaces and special characters
    clean_text = re.sub(r'[^\w\s]', '', text)
    clean_text = re.sub(r'\s+', '', clean_text)
    
    # Ensure it starts with #
    if not clean_text.startswith('#'):
        clean_text = f"#{clean_text}"
    
    return clean_text

def calculate_text_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two texts using Jaccard similarity"""
    # Clean and tokenize texts
    tokens1 = set(remove_stopwords(tokenize_text(clean_text(text1))))
    tokens2 = set(remove_stopwords(tokenize_text(clean_text(text2))))
    
    # Calculate Jaccard similarity
    intersection = len(tokens1.intersection(tokens2))
    union = len(tokens1.union(tokens2))
    
    if union == 0:
        return 0.0
    
    return intersection / union 