# news_service.py
from datetime import datetime, timedelta
from openai import OpenAI
import time
from textblob import TextBlob
import json
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models import NewsCache
from typing import List, Optional, Dict
import logging
import os
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class NewsService:
    def __init__(self):
        # Get API key from environment variable
        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        if not self.api_key:
            raise ValueError("PERPLEXITY_API_KEY not found in environment variables")
            
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.perplexity.ai"
        )

    def analyze_sentiment(self, text: str) -> str:
        """Analyze the sentiment of given text using TextBlob."""
        try:
            analysis = TextBlob(text)
            polarity = analysis.sentiment.polarity
            
            if polarity > 0.1:
                return "positive"
            elif polarity < -0.1:
                return "negative"
            return "neutral"
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {str(e)}")
            return "neutral"

    def get_cached_news(self, db: Session, company: str, date: datetime) -> Optional[NewsCache]:
        """Retrieve cached news for a company on a specific date."""
        try:
            return db.query(NewsCache).filter(
                and_(
                    NewsCache.company == company,
                    NewsCache.date == date.date()
                )
            ).first()
        except Exception as e:
            logger.error(f"Error retrieving cached news: {str(e)}")
            return None

    def cache_news(self, db: Session, news_data: Dict) -> Optional[NewsCache]:
        """Cache news data in the database."""
        try:
            news_cache = NewsCache(
                company=news_data['company'],
                date=datetime.strptime(news_data['date'], '%Y-%m-%d'),
                summary=news_data['summary'],
                sentiment=news_data['sentiment'],
                links=json.dumps(news_data['links'])
            )
            db.add(news_cache)
            db.commit()
            db.refresh(news_cache)
            return news_cache
        except Exception as e:
            logger.error(f"Error caching news: {str(e)}")
            db.rollback()
            return None

    def get_news_from_api(self, company: str, date_str: str) -> Optional[Dict]:
        """Fetch news from Perplexity API for a specific company and date."""
        try:
            logger.info(f"Fetching news for {company} on {date_str}")
            
            messages = [
                {
                    "role": "system",
                    "content": (
                        f"You are an AI assistant. Please provide news "
                        f"about {company} for the specific date in a clear, concise format. "
                        "Focus on business and investment-relevant information such as "
                        "stock performance, financial results, business developments, "
                        "and market analysis."
                    ),
                },
                {   
                    "role": "user",
                    "content": (
                        f"What are the key business and investment-related news updates "
                        f"about {company} for {date_str}? Please provide only verified "
                        "news from this specific date."
                    )
                },
            ]

            response = self.client.chat.completions.create(
                model="llama-3.1-sonar-large-128k-online",
                messages=messages,
                timeout=30  # 30 seconds timeout
            )
            
            if response and response.choices:
                content = response.choices[0].message.content
                citations = getattr(response, 'citations', []) or []
                sentiment = self.analyze_sentiment(content)
                
                return {
                    'date': date_str,
                    'company': company,
                    'summary': content,
                    'links': citations,
                    'sentiment': sentiment
                }
            
            raise ValueError("No valid response from API")
            
        except Exception as e:
            logger.error(f"Error fetching news for {company} on {date_str}: {str(e)}")
            return {
                'date': date_str,
                'company': company,
                'summary': f"Unable to fetch news: {str(e)}",
                'links': [],
                'sentiment': "neutral"
            }

    def get_news(self, db: Session, companies: List[str], force_refresh: bool = False) -> List[Dict]:
        """Get news for multiple companies with caching support."""
        all_news = []
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        try:
            for company in companies:
                current_date = start_date
                while current_date <= end_date:
                    date_str = current_date.strftime('%Y-%m-%d')
                    
                    # Check cache first
                    cached_news = None if force_refresh else self.get_cached_news(db, company, current_date)
                    
                    if cached_news and not force_refresh:
                        news_data = {
                            'date': date_str,
                            'company': cached_news.company,
                            'summary': cached_news.summary,
                            'sentiment': cached_news.sentiment,
                            'links': json.loads(cached_news.links),
                            'cached': True
                        }
                        all_news.append(news_data)
                    else:
                        news_data = self.get_news_from_api(company, date_str)
                        if news_data:
                            news_data['cached'] = False
                            all_news.append(news_data)
                            self.cache_news(db, news_data)
                        
                        # Shorter delay between API calls
                        time.sleep(0.5)
                    
                    current_date += timedelta(days=1)
            
            return sorted(all_news, key=lambda x: (x['date'], x['company']), reverse=True)
            
        except Exception as e:
            logger.error(f"Error in get_news: {str(e)}")
            return []