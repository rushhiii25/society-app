from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from datetime import datetime
from app.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True)
    complaint_source = Column(String(100))
    customer_name = Column(String(200))
    product_name = Column(String(200))
    product_strength = Column(String(100))
    batch_number = Column(String(100), index=True)
    mfg_date = Column(String(50))
    expiry_date = Column(String(50))
    quantity_affected = Column(String(100))
    complaint_type = Column(String(100))
    complaint_date = Column(String(50))
    description = Column(Text)
    initial_severity = Column(String(50))
    priority = Column(String(50))
    triage_status = Column(String(50), default="Pending Triage")
    
    # AI Assessments
    completeness_score = Column(Integer, default=100)
    missing_fields = Column(Text, default="[]")
    risk_level = Column(String(50), default="Moderate")
    risk_analysis = Column(Text, nullable=True)
    root_cause_analysis = Column(Text, nullable=True)
    capa_recommendation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
