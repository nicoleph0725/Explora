import os
from pathlib import Path
from dotenv import load_dotenv
from sqlmodel import create_engine, Session, SQLModel

# Load .env relative to this file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

def init_db():
    SQLModel.metadata.create_all(engine)