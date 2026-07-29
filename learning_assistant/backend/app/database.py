import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# We will create this file later to switch between SQLite and Postgres
load_dotenv()

# Defaults to local SQLite if DATABASE_URL is not set in .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# Connect_args is only needed for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

# SessionLocal is used to create actual database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# This allows to inject the database session into every request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()