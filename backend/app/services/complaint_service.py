import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Complaint
from app.schemas import ComplaintCreate

def generate_complaint_number(db: Session) -> str:
    count = db.query(Complaint).count()
    year = datetime.now().year
    return f"CC-{year}-{(count + 1):03d}"

def create_complaint(db: Session, data: ComplaintCreate) -> Complaint:
    comp_no = generate_complaint_number(db)
    
    missing_json = json.dumps(data.missing_fields or [])
    
    db_obj = Complaint(
        complaint_number=comp_no,
        complaint_source=data.complaint_source or "Customer Email",
        customer_name=data.customer_name or "Unknown Customer",
        product_name=data.product_name or "N/A",
        product_strength=data.product_strength or "N/A",
        batch_number=data.batch_number or "N/A",
        mfg_date=data.mfg_date or "",
        expiry_date=data.expiry_date or "",
        quantity_affected=data.quantity_affected or "N/A",
        complaint_type=data.complaint_type or "Quality Defect",
        complaint_date=data.complaint_date or datetime.now().strftime("%Y-%m-%d"),
        description=data.description or "",
        initial_severity=data.initial_severity or "Major",
        priority=data.priority or "Medium",
        triage_status=data.triage_status or "Pending Triage",
        completeness_score=data.completeness_score or 100,
        missing_fields=missing_json,
        risk_level=data.risk_level or "Moderate",
        risk_analysis=data.risk_analysis or "",
        root_cause_analysis=data.root_cause_analysis or "",
        capa_recommendation=data.capa_recommendation or ""
    )
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_complaints(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Complaint).order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()

def get_complaint_by_id(db: Session, complaint_id: int):
    return db.query(Complaint).filter(Complaint.id == complaint_id).first()

def update_triage_status(db: Session, complaint_id: int, status: str):
    obj = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if obj:
        obj.triage_status = status
        db.commit()
        db.refresh(obj)
    return obj
