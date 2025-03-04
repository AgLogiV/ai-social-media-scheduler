# AI-Powered Hashtag Optimizer - AI Service

This is the AI service component of the AI-Powered Hashtag Optimizer application, which provides hashtag suggestion, optimization, and performance prediction capabilities.

## Features

- Hashtag suggestion based on content analysis
- Hashtag optimization for maximum reach and engagement
- Performance prediction for posts with different hashtag combinations
- Real-time trending hashtag analysis
- Cross-platform support (Instagram, Twitter, Facebook, LinkedIn)

## Tech Stack

- Python 3.8+
- FastAPI for API endpoints
- PyTorch and Transformers for NLP models
- NLTK and spaCy for text processing
- MongoDB for data storage

## Prerequisites

- Python 3.8 or higher
- MongoDB (local or Atlas)
- pip or conda

## Installation

1. Clone the repository
2. Navigate to the AI service directory:
   ```
   cd ai-service
   ```
3. Create a virtual environment:
   ```
   python -m venv venv
   ```
4. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```
5. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
6. Download spaCy model:
   ```
   python -m spacy download en_core_web_sm
   ```
7. Create a `.env` file in the root directory with the following variables:
   ```
   AI_SERVICE_PORT=8000
   MONGODB_URI=mongodb://localhost:27017/ai-hashtag-optimizer
   LOG_LEVEL=INFO
   TRANSFORMERS_CACHE=./ai-service/data/models
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET=your_twitter_api_secret
   INSTAGRAM_API_KEY=your_instagram_api_key
   INSTAGRAM_API_SECRET=your_instagram_api_secret
   FACEBOOK_API_KEY=your_facebook_api_key
   FACEBOOK_API_SECRET=your_facebook_api_secret
   LINKEDIN_API_KEY=your_linkedin_api_key
   LINKEDIN_API_SECRET=your_linkedin_api_secret
   ```
8. Start the development server:
   ```
   uvicorn app:app --reload
   ```

## API Endpoints

### Hashtag Suggestion

- `POST /suggest` - Suggest hashtags based on content
  - Request body:
    ```json
    {
      "content": "Your post content here",
      "platform": "instagram",
      "count": 10
    }
    ```

### Hashtag Optimization

- `POST /optimize` - Optimize hashtag combination
  - Request body:
    ```json
    {
      "hashtags": ["#travel", "#vacation", "#beach"],
      "content": "Your post content here",
      "platform": "instagram",
      "count": 30
    }
    ```

### Performance Prediction

- `POST /predict` - Predict post performance
  - Request body:
    ```json
    {
      "content": "Your post content here",
      "hashtags": ["#travel", "#vacation", "#beach"],
      "platform": "instagram"
    }
    ```

### Trending Hashtags

- `GET /trending/{platform}` - Get trending hashtags
  - Path parameters:
    - `platform` - Social media platform (instagram, twitter, facebook, linkedin)
  - Query parameters:
    - `category` (optional) - Filter by category
    - `count` (optional) - Number of hashtags to return (default: 20)

## Development

- Run tests:
  ```
  pytest
  ```

## Model Training

The AI models in this service are pre-trained and fine-tuned for hashtag analysis. If you want to retrain or update the models, follow these steps:

1. Prepare training data in the `data` directory
2. Run the training script:
   ```
   python models/train.py
   ```

## License

MIT 