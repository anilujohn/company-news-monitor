# main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import get_db
from news_service import NewsService
import logging
from datetime import datetime  # Add this import
from fastapi.responses import StreamingResponse
import json
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Initialize news service
news_service = NewsService()

class CompanyNewsRequest(BaseModel):
    companies: List[str]
    force_refresh: bool = False

@app.get("/api/test")
async def test_endpoint():
    """
    Test endpoint to verify API is working.
    Returns a simple status message.
    """
    return {
        "status": "API is working",
        "message": "Successfully connected to the backend server"
    }

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint for monitoring system status.
    Returns basic health information about the API.
    """
    try:
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "server_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.post("/api/fetch-news")
async def fetch_news(
    request: CompanyNewsRequest,
    db: Session = Depends(get_db)
):
    if not request.companies:
        raise HTTPException(status_code=400, detail="No companies provided")
    
    try:
        logger.info(f"Fetching news for companies: {request.companies}")
        news_data = news_service.get_news(  # This is the line causing the error
            db=db,
            companies=request.companies,
            force_refresh=request.force_refresh
        )
        return {
            "success": True,
            "data": news_data,
            "message": "Data retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error fetching news: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))