"""
Database connection layer.
Loads MySQL credentials from .env and exposes:
  - engine        : SQLAlchemy engine
  - SessionLocal   : session factory (one per request)
  - Base           : declarative base for ORM models
  - get_db()       : FastAPI dependency that yields a session and closes it after use
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "student_records")

# pymysql is the pure-Python MySQL driver -> no extra system deps needed
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # avoids "MySQL server has gone away" on idle connections
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session, guarantees it closes after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
