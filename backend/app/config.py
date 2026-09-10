import os

class Settings:
    PROJECT_NAME: str = "AIVOA Pharma QMS - Customer Complaint Management"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    PRIMARY_MODEL: str = "gemma2-9b-it"
    SECONDARY_MODEL: str = "llama-3.3-70b-versatile"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./complaints.db")

settings = Settings()
