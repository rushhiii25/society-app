# AIVOA.AI – AI-Powered Customer Complaint Management System (Pharma QMS)

An enterprise-grade **AI-Powered Customer Complaint Management System** tailored for the pharmaceutical manufacturing industry (Active Pharmaceutical Ingredients - **API** & Finished Dosage Forms - **FDF**). Built for Quality Assurance (QA) compliance following **FDA 21 CFR Part 211.198** and **ICH Q9/Q10** guidelines.

Developed for **AIVOA.AI Round 1 AI Product Engineer Assessment**.

---

## 🌟 Key Features

1. **Exact UI Reproduction & Enhanced UX**:
   - **Log Customer Complaint Form**: 4 structured QA sections covering Origin Details, Product & Batch Identification, Complaint Details, and Initial Assessment & Priority with `Pending Triage` status badge.
   - **AI Complaint Intake Assistant (BETA)**: Drag & Drop zone (PDF, DOCX, TXT, EML), paste text drawer, interactive extraction progress bar (0-100%), and interactive AI Copilot chat.
   - **Quick-Load Sample Presets**: 1-click loading of realistic pharma complaints (BioPharm API Impurity OOS, St. Jude Hospital Tablet Discoloration PDF, Apex Packaging Defect EML).

2. **LangGraph AI Agent Workflow Engine**:
   - Structured multi-node agent state machine (`StateGraph`) that parses unstructured text, extracts 12+ complaint metadata fields, performs completeness checks, evaluates health hazard risks, checks for duplicate batch complaints, and generates 5-Whys Root Cause Analysis (RCA) and Corrective & Preventive Action (CAPA) plans.

3. **Mandatory Tech Stack & Groq LLM Integration**:
   - **Frontend**: React + Redux Toolkit state management + Google Inter font + Glassmorphism aesthetic.
   - **Backend**: Python FastAPI REST API.
   - **AI Agent Framework**: LangGraph state machine.
   - **LLM Engine**: Groq API integration using **`gemma2-9b-it`** (Mandatory model) and **`llama-3.3-70b-versatile`** (Context model), with offline deterministic fallback.
   - **Database**: SQLite / PostgreSQL (SQLAlchemy ORM).

4. **Bonus AI Quality Features**:
   - **Complaint Completeness Checker**: Audit score (0-100%) against FDA 21 CFR 211.198 mandatory fields.
   - **AI Risk & Severity Classification**: Matrix assessment of patient health hazard vs batch release risk (Critical, Major, Minor).
   - **Duplicate Complaint Detector**: Batch number & defect similarity scanner across historical database records.
   - **RCA (5-Whys) & CAPA Recommendation Engine**: Automated Fishbone root cause determination and immediate/preventive CAPA checklists.
   - **Complaints Registry**: Database management tab with search, severity filter, triage status workflow, and JSON export.

---

## 🏗 System Architecture & Workflow

```
[ User Input ] ---> [ React UI + Redux Store ] ---> [ FastAPI REST API ]
(Doc / Text / Sample)                                        │
                                                             ▼
                                                [ LangGraph Agent Graph ]
                                                             │
                                        ┌────────────────────┼────────────────────┐
                                        ▼                    ▼                    ▼
                              [ 1. Extraction Node ] [ 2. Completeness ] [ 3. Risk Assessment ]
                                        │                    │                    │
                                        └────────────────────┼────────────────────┘
                                                             ▼
                                                    [ 4. Duplicate Check ]
                                                             │
                                                             ▼
                                                  [ 5. RCA & CAPA Generator ]
                                                             │
                                                             ▼
[ Log Complaint Form Auto-Population ] <--- [ Groq API (gemma2-9b-it) ] <--- [ Saved to SQLite DB ]
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### Step 1: Start the Backend Server (FastAPI + LangGraph)

```bash
# Navigate to backend folder
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the FastAPI server
python run.py
```
*Backend runs at:* `http://127.0.0.1:8000`  
*Interactive Swagger API Docs:* `http://127.0.0.1:8000/docs`

---

### Step 2: Start the Frontend Application (React + Vite + Redux)

Open a new terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend runs at:* `http://localhost:3000`

---

## ⚙️ Configuring Groq API Key

1. Click the **Settings** button in the top navigation bar.
2. Enter your Groq API Key (`gsk_...`) obtained from [console.groq.com](https://console.groq.com/keys).
3. Select **gemma2-9b-it** as the primary model.
4. Click **Save Settings**.

> **Note**: If no Groq API Key is provided, the application automatically uses its high-accuracy offline deterministic QA domain fallback agent so all features work seamlessly out of the box!

---

## 📽 Demo Video Presentation Structure (Submission Guide)

When recording the 5–10 minute demo video:
1. **Introduction**: Brief overview of the Pharma QMS complaint module purpose under FDA 21 CFR Part 211.198.
2. **User Input Demo**:
   - Click a **Sample Complaint Preset** (e.g. BioPharm API Impurity OOS).
   - Show real-time **Extraction Progress Bar** advancing through LangGraph nodes.
3. **Form Auto-Population & Verification**:
   - Demonstrate how extracted fields automatically populate the **Log Customer Complaint** form (Highlighted in blue).
   - Show form validation and `Save Complaint` to SQLite database.
4. **AI Copilot & Quality Insights**:
   - Showcase **Completeness Checker** score (0-100%).
   - Showcase **AI Risk Classification Matrix** (Critical vs Major vs Minor).
   - Showcase **Duplicate Complaint Detector** finding related batch numbers.
   - Showcase **5-Whys Root Cause Analysis** & **CAPA Plan**.
5. **Code Walkthrough**:
   - Show `backend/app/agent/graph.py` (LangGraph `StateGraph` definition).
   - Show `backend/app/agent/groq_client.py` (Groq API wrapper for `gemma2-9b-it`).
   - Show `frontend/src/store/complaintSlice.js` & `aiSlice.js` (Redux Toolkit state management).
   - Show FastAPI REST API endpoints in `backend/app/main.py`.

---

## 📄 License & Attribution

Built for **AIVOA.AI** Product Engineering Assessment.
