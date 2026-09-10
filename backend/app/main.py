import os
import json
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, get_db
from app.schemas import (
    ExtractionRequest, ExtractionResult, ComplaintCreate, ComplaintResponse,
    ChatRequest, ChatResponse, SettingsPayload
)
from app.services.file_parser import parse_uploaded_file
from app.services.complaint_service import (
    create_complaint, get_complaints, get_complaint_by_id, update_triage_status
)
from app.agent.graph import complaint_workflow
from app.agent.groq_client import GroqLLMClient
from app.samples.sample_docs import SAMPLES

# Initialize DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Customer Complaint Management System for Pharma Quality Assurance (API & FDF)"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "models": [settings.PRIMARY_MODEL, settings.SECONDARY_MODEL],
        "groq_configured": bool(settings.GROQ_API_KEY)
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": "2026-09-09T22:00:00Z"}

@app.get("/api/samples")
def get_sample_documents():
    return SAMPLES

@app.post("/api/extract", response_model=ExtractionResult)
def extract_from_text(payload: ExtractionRequest):
    text = payload.raw_text
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Complaint raw_text cannot be empty.")
    
    api_key = payload.groq_api_key or settings.GROQ_API_KEY
    
    initial_state = {
        "raw_text": text,
        "api_key": api_key,
        "extracted_fields": {},
        "completeness": {},
        "risk_assessment": {},
        "duplicates": {},
        "rca_capa": {},
        "ai_summary": "",
        "current_step": "Initiated"
    }

    # Execute LangGraph Compiled Workflow
    final_state = complaint_workflow.invoke(initial_state)

    fields = final_state.get("extracted_fields", {})
    return ExtractionResult(
        complaint_source=fields.get("complaint_source", "Customer Email"),
        customer_name=fields.get("customer_name", "Unknown Customer"),
        product_name=fields.get("product_name", "Pharma Product"),
        product_strength=fields.get("product_strength", "N/A"),
        batch_number=fields.get("batch_number", "Unknown Batch"),
        mfg_date=fields.get("mfg_date", ""),
        expiry_date=fields.get("expiry_date", ""),
        quantity_affected=fields.get("quantity_affected", "Unspecified"),
        complaint_type=fields.get("complaint_type", "Quality Defect"),
        complaint_date=fields.get("complaint_date", ""),
        description=fields.get("description", text[:500]),
        initial_severity=fields.get("initial_severity", "Major"),
        priority=fields.get("priority", "Medium"),
        completeness=final_state.get("completeness"),
        risk_assessment=final_state.get("risk_assessment"),
        duplicates=final_state.get("duplicates"),
        rca_capa=final_state.get("rca_capa"),
        ai_summary=final_state.get("ai_summary", "Extraction completed.")
    )

@app.post("/api/extract-file", response_model=ExtractionResult)
async def extract_from_file(
    file: UploadFile = File(...),
    groq_api_key: Optional[str] = Form(None)
):
    contents = await file.read()
    extracted_text = parse_uploaded_file(file, contents)
    
    return extract_from_text(ExtractionRequest(raw_text=extracted_text, groq_api_key=groq_api_key))

@app.post("/api/complaints", response_model=ComplaintResponse)
def save_complaint(data: ComplaintCreate, db: Session = Depends(get_db)):
    return create_complaint(db, data)

@app.get("/api/complaints", response_model=List[ComplaintResponse])
def read_complaints(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_complaints(db, skip=skip, limit=limit)

@app.get("/api/complaints/{complaint_id}", response_model=ComplaintResponse)
def read_complaint_detail(complaint_id: int, db: Session = Depends(get_db)):
    comp = get_complaint_by_id(db, complaint_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return comp

@app.patch("/api/complaints/{complaint_id}/triage")
def update_triage(complaint_id: int, status: str = Body(..., embed=True), db: Session = Depends(get_db)):
    updated = update_triage_status(db, complaint_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"message": "Triage status updated", "complaint_number": updated.complaint_number, "status": updated.triage_status}

@app.post("/api/chat", response_model=ChatResponse)
def ai_copilot_chat(payload: ChatRequest):
    message = payload.message
    api_key = payload.groq_api_key or settings.GROQ_API_KEY
    context = payload.context or {}
    
    client = GroqLLMClient(api_key)
    model_used = settings.PRIMARY_MODEL
    
    system_prompt = (
        "You are an expert AI Copilot for a Pharmaceutical QMS Customer Complaint system. "
        "Provide precise, professional, GMP-aligned regulatory advice (FDA 21 CFR Part 211.198, ICH Q9/Q10) "
        "regarding customer complaints, batch release risk, 5-Whys root cause analysis, and CAPA formulation."
    )
    
    context_str = ""
    if context:
        context_str = f"\nACTIVE COMPLAINT CONTEXT:\nProduct: {context.get('product_name')}\nBatch: {context.get('batch_number')}\nDefect: {context.get('complaint_type')}\nDescription: {context.get('description')}\n"
    
    full_prompt = f"{context_str}\nUser Question: {message}"

    if client.is_available():
        try:
            reply = client.generate(full_prompt, system_prompt=system_prompt, json_mode=False)
            return ChatResponse(reply=reply, model_used=model_used)
        except Exception as e:
            print(f"[Chat LLM Error]: {e}")

    # High quality fallback response
    msg_lower = message.lower()
    if "capa" in msg_lower:
        reply = "For this complaint, recommended CAPA includes: 1) Quarantine remaining inventory of the lot in ERP, 2) Perform HPLC retention sample re-testing, 3) Review equipment calibration logs, 4) Issue SCAR to supplier if raw material defect is confirmed."
    elif "risk" in msg_lower or "severity" in msg_lower:
        reply = "Risk classification is determined by patient health hazard and product specification impact. Critical complaints (e.g. OOS impurity, toxic contaminant) mandate immediate 3-day Field Alert reporting under 21 CFR 211.198."
    elif "batch" in msg_lower or "duplicate" in msg_lower:
        reply = "Checking batch history in the registry helps identify recurring manufacturing trends. If multiple complaints exist for the same batch, escalate to QA Management for potential market recall."
    else:
        reply = f"I am your Pharma QA Copilot. I've analyzed your query regarding '{message[:40]}...'. All complaint investigations must strictly adhere to 21 CFR 211.198 QA guidelines."

    return ChatResponse(reply=reply, model_used="gemma2-9b-it (Deterministic Fallback)")

@app.post("/api/settings")
def update_settings(payload: SettingsPayload):
    if payload.groq_api_key:
        settings.GROQ_API_KEY = payload.groq_api_key.strip()
    if payload.primary_model:
        settings.PRIMARY_MODEL = payload.primary_model.strip()
    return {"message": "Settings updated successfully", "groq_configured": bool(settings.GROQ_API_KEY)}
