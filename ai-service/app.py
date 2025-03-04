import os
import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# Import AI models and services
from models.hashtag_suggester import HashtagSuggester
from models.hashtag_optimizer import HashtagOptimizer
from models.performance_predictor import PerformancePredictor
from services.trending_service import TrendingService
from services.db_service import DatabaseService

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Hashtag Optimizer API",
    description="AI service for hashtag suggestion, optimization, and performance prediction",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
db_service = DatabaseService()
trending_service = TrendingService(db_service)

# Initialize AI models
hashtag_suggester = HashtagSuggester()
hashtag_optimizer = HashtagOptimizer()
performance_predictor = PerformancePredictor()

# Pydantic models for request/response
class ContentRequest(BaseModel):
    content: str
    platform: str
    count: Optional[int] = 10

class HashtagOptimizeRequest(BaseModel):
    hashtags: List[str]
    content: Optional[str] = None
    platform: str
    count: Optional[int] = 30

class PerformancePredictionRequest(BaseModel):
    content: str
    hashtags: List[str]
    platform: str

class Hashtag(BaseModel):
    text: str
    score: float
    category: Optional[str] = None
    isAIGenerated: bool = True

class PerformancePrediction(BaseModel):
    score: float
    reach: int
    engagement: int

# API endpoints
@app.get("/")
async def root():
    return {"message": "AI Hashtag Optimizer API is running"}

@app.post("/suggest", response_model=List[Hashtag])
async def suggest_hashtags(request: ContentRequest):
    try:
        # Get AI-generated hashtag suggestions
        ai_suggestions = hashtag_suggester.suggest(
            content=request.content,
            platform=request.platform,
            count=request.count
        )
        
        # Get trending hashtags that might be relevant
        trending_suggestions = trending_service.get_relevant_trending(
            content=request.content,
            platform=request.platform,
            count=request.count // 2
        )
        
        # Combine and return unique hashtags
        all_suggestions = ai_suggestions + trending_suggestions
        unique_suggestions = {h.text: h for h in all_suggestions}.values()
        return list(unique_suggestions)[:request.count]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize", response_model=List[Hashtag])
async def optimize_hashtags(request: HashtagOptimizeRequest):
    try:
        optimized_hashtags = hashtag_optimizer.optimize(
            hashtags=request.hashtags,
            content=request.content,
            platform=request.platform,
            count=request.count
        )
        return optimized_hashtags
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict", response_model=PerformancePrediction)
async def predict_performance(request: PerformancePredictionRequest):
    try:
        prediction = performance_predictor.predict(
            content=request.content,
            hashtags=request.hashtags,
            platform=request.platform
        )
        return prediction
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/trending/{platform}", response_model=List[Hashtag])
async def get_trending_hashtags(platform: str, category: Optional[str] = None, count: int = 20):
    try:
        trending = trending_service.get_trending(
            platform=platform,
            category=category,
            count=count
        )
        return trending
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the application
if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True) 