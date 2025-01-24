# models.py
from sqlalchemy import Column, Integer, String, DateTime, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class NewsCache(Base):
    __tablename__ = 'news_cache'
    
    id = Column(Integer, primary_key=True)
    company = Column(String(255), nullable=False)
    date = Column(DateTime, nullable=False)
    summary = Column(Text)
    sentiment = Column(String(50))
    links = Column(Text)  # Store as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)