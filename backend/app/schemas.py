from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ComplaintBase(BaseModel):
    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    product_strength: Optional[str] = None
    batch_number: Optional[str] = None
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[str] = None
    complaint_type: Optional[str] = None
    complaint_date: Optional[str] = None
    description: Optional[str] = None
    initial_severity: Optional[str] = "Major"
    priority: Optional[str] = "Medium"
    triage_status: Optional[str] = "Pending Triage"

class ComplaintCreate(ComplaintBase):
    completeness_score: Optional[int] = 100
    missing_fields: Optional[List[str]] = []
    risk_level: Optional[str] = "Moderate"
    risk_analysis: Optional[str] = None
    root_cause_analysis: Optional[str] = None
    capa_recommendation: Optional[str] = None

class ComplaintResponse(ComplaintBase):
    id: int
    complaint_number: str
    completeness_score: int
    missing_fields: Optional[str] = "[]"
    risk_level: Optional[str] = None
    risk_analysis: Optional[str] = None
    root_cause_analysis: Optional[str] = None
    capa_recommendation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ExtractionRequest(BaseModel):
    raw_text: str
    groq_api_key: Optional[str] = None

class CompletenessItem(BaseModel):
    field_name: str
    status: str # "present", "missing", "partial"
    impact: str
    recommendation: str

class CompletenessCheckResult(BaseModel):
    score: int
    is_complete: bool
    missing_fields: List[str]
    details: List[CompletenessItem]

class RiskAssessmentResult(BaseModel):
    risk_level: str # Critical, High, Moderate, Low
    patient_safety_impact: str
    regulatory_impact: str
    justification: str
    recommended_action: str

class DuplicateMatch(BaseModel):
    complaint_number: str
    product_name: str
    batch_number: str
    similarity_score: float
    description: str
    created_at: str

class DuplicateCheckResult(BaseModel):
    has_duplicates: bool
    matches: List[DuplicateMatch]

class RcaCapaResult(BaseModel):
    five_whys: List[str]
    root_cause: str
    immediate_containment: str
    corrective_actions: List[str]
    preventive_actions: List[str]

class ExtractionResult(BaseModel):
    complaint_source: str
    customer_name: str
    product_name: str
    product_strength: str
    batch_number: str
    mfg_date: str
    expiry_date: str
    quantity_affected: str
    complaint_type: str
    complaint_date: str
    description: str
    initial_severity: str
    priority: str
    completeness: CompletenessCheckResult
    risk_assessment: RiskAssessmentResult
    duplicates: DuplicateCheckResult
    rca_capa: RcaCapaResult
    ai_summary: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    groq_api_key: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    model_used: str

class SettingsPayload(BaseModel):
    groq_api_key: str
    primary_model: Optional[str] = "gemma2-9b-it"
