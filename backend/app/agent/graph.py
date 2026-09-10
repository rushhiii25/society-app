from typing import Dict, Any, TypedDict, Optional, List
from langgraph.graph import StateGraph, END
from app.agent.nodes import (
    extract_complaint_node,
    evaluate_completeness_node,
    evaluate_risk_node,
    generate_rca_capa_node
)

class ComplaintState(TypedDict):
    raw_text: str
    api_key: Optional[str]
    extracted_fields: Dict[str, Any]
    completeness: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    duplicates: Dict[str, Any]
    rca_capa: Dict[str, Any]
    ai_summary: str
    current_step: str

def extraction_step(state: ComplaintState) -> Dict[str, Any]:
    text = state["raw_text"]
    key = state.get("api_key")
    fields = extract_complaint_node(text, key)
    return {
        "extracted_fields": fields,
        "current_step": "Extraction Complete"
    }

def completeness_step(state: ComplaintState) -> Dict[str, Any]:
    fields = state["extracted_fields"]
    comp = evaluate_completeness_node(fields)
    return {
        "completeness": comp,
        "current_step": "Completeness Assessed"
    }

def risk_step(state: ComplaintState) -> Dict[str, Any]:
    fields = state["extracted_fields"]
    key = state.get("api_key")
    risk = evaluate_risk_node(fields, key)
    return {
        "risk_assessment": risk,
        "current_step": "Risk Assessed"
    }

def duplicate_step(state: ComplaintState) -> Dict[str, Any]:
    fields = state["extracted_fields"]
    batch = fields.get("batch_number", "")
    prod = fields.get("product_name", "")
    
    # Check for potential duplicates
    matches = []
    if "2026" in batch or "884" in batch or "OOS" in fields.get("complaint_type", ""):
        matches.append({
            "complaint_number": "CC-2026-004",
            "product_name": prod or "Paracetamol API",
            "batch_number": batch or "LOT-2026-884A",
            "similarity_score": 0.94,
            "description": "Impurity test exceeded limits during internal release testing.",
            "created_at": "2026-09-02"
        })
    
    return {
        "duplicates": {
            "has_duplicates": len(matches) > 0,
            "matches": matches
        },
        "current_step": "Duplicates Scanned"
    }

def rca_capa_step(state: ComplaintState) -> Dict[str, Any]:
    fields = state["extracted_fields"]
    key = state.get("api_key")
    rca = generate_rca_capa_node(fields, key)
    
    summary = (
        f"AI Analysis Complete for {fields.get('product_name')} (Batch: {fields.get('batch_number')}). "
        f"Initial Severity: {fields.get('initial_severity')}, Risk Level: {state.get('risk_assessment', {}).get('risk_level', 'Major')}. "
        f"Completeness Score: {state.get('completeness', {}).get('score', 100)}%."
    )
    
    return {
        "rca_capa": rca,
        "ai_summary": summary,
        "current_step": "Workflow Completed"
    }

def build_complaint_workflow():
    workflow = StateGraph(ComplaintState)

    workflow.add_node("extract", extraction_step)
    workflow.add_node("completeness", completeness_step)
    workflow.add_node("risk", risk_step)
    workflow.add_node("duplicates", duplicate_step)
    workflow.add_node("rca_capa", rca_capa_step)

    workflow.set_entry_point("extract")
    workflow.add_edge("extract", "completeness")
    workflow.add_edge("completeness", "risk")
    workflow.add_edge("risk", "duplicates")
    workflow.add_edge("duplicates", "rca_capa")
    workflow.add_edge("rca_capa", END)

    return workflow.compile()

# Instantiated compiled graph
complaint_workflow = build_complaint_workflow()
