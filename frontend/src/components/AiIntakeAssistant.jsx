import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setExtractionProgress,
  setAnalysisResult,
  addChatMessage,
  setCopilotThinking
} from '../store/aiSlice';
import { populateFormFromAi } from '../store/complaintSlice';
import {
  UploadCloud, FileText, Send, Info, Bot, User, Sparkles, CheckCircle
} from 'lucide-react';
import axios from 'axios';

export default function AiIntakeAssistant() {
  const dispatch = useDispatch();
  const { status, progress, statusMessage, chatMessages, isCopilotThinking, groqApiKey } = useSelector((state) => state.ai);
  const formState = useSelector((state) => state.complaint.form);

  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [copilotInput, setCopilotInput] = useState('');
  const [samples, setSamples] = useState(null);

  useEffect(() => {
    // Fetch available sample complaint presets from backend
    axios.get('/api/samples')
      .then(res => setSamples(res.data))
      .catch(err => console.log('Samples load info:', err));
  }, []);

  const runExtractionWorkflow = async (rawText, file = null) => {
    dispatch(setExtractionProgress({ progress: 15, message: 'Initiating LangGraph document parser node...', status: 'loading' }));

    try {
      let response;
      if (file) {
        dispatch(setExtractionProgress({ progress: 35, message: `Reading file ${file.name} and parsing structure...` }));
        const formData = new FormData();
        formData.append('file', file);
        if (groqApiKey) formData.append('groq_api_key', groqApiKey);
        response = await axios.post('/api/extract-file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        dispatch(setExtractionProgress({ progress: 45, message: 'Analyzing text via Groq (gemma2-9b-it) & LangGraph nodes...' }));
        response = await axios.post('/api/extract', {
          raw_text: rawText,
          groq_api_key: groqApiKey
        });
      }

      dispatch(setExtractionProgress({ progress: 75, message: 'Evaluating FDA completeness, Risk Matrix & 5-Whys RCA...' }));

      setTimeout(() => {
        const result = response.data;
        dispatch(setAnalysisResult(result));
        dispatch(populateFormFromAi(result));
        
        dispatch(addChatMessage({
          sender: 'assistant',
          text: `Successfully extracted details for ${result.product_name || 'complaint'}. Form fields auto-populated!`
        }));
      }, 600);

    } catch (err) {
      console.error('Extraction Error:', err);
      dispatch(setExtractionProgress({
        progress: 100,
        message: 'Extraction failed or timed out. Please check file format or text.',
        status: 'error'
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) runExtractionWorkflow(null, file);
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    setPasteModalOpen(false);
    runExtractionWorkflow(pastedText);
    setPastedText('');
  };

  const handleSampleClick = (key) => {
    if (samples && samples[key]) {
      runExtractionWorkflow(samples[key].text);
    }
  };

  const handleCopilotSend = async (e) => {
    e.preventDefault();
    if (!copilotInput.trim() || isCopilotThinking) return;

    const userMsg = copilotInput.trim();
    setCopilotInput('');
    dispatch(addChatMessage({ sender: 'user', text: userMsg }));
    dispatch(setCopilotThinking(true));

    try {
      const res = await axios.post('/api/chat', {
        message: userMsg,
        context: formState,
        groq_api_key: groqApiKey
      });

      dispatch(addChatMessage({ sender: 'assistant', text: res.data.reply }));
    } catch (err) {
      dispatch(addChatMessage({
        sender: 'assistant',
        text: 'Apologies, I encountered an error answering your question. Please verify your Groq settings or network.'
      }));
    } finally {
      dispatch(setCopilotThinking(false));
    }
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header-flex">
        <div>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#2563eb" /> AI Complaint Intake Assistant
          </h2>
        </div>
        <span className="badge-beta">BETA</span>
      </div>

      {/* SAMPLE DOCUMENT PRESETS FOR FAST TESTING */}
      <div className="sample-presets-box">
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
          Quick Load Sample Complaint Documents:
        </div>
        <div className="preset-pills">
          <button className="preset-pill-btn" onClick={() => handleSampleClick('api_impurity')}>
            💊 Sample API Impurity Email
          </button>
          <button className="preset-pill-btn" onClick={() => handleSampleClick('fdf_discoloration')}>
            🧪 Sample FDF Discoloration PDF
          </button>
          <button className="preset-pill-btn" onClick={() => handleSampleClick('packaging_leakage')}>
            📦 Sample Packaging Leak EML
          </button>
        </div>
      </div>

      {/* DRAG & DROP ZONE */}
      <label className="dropzone">
        <input type="file" accept=".pdf,.docx,.txt,.eml" style={{ display: 'none' }} onChange={handleFileUpload} />
        <UploadCloud className="dropzone-icon" style={{ margin: '0 auto 8px auto' }} />
        <div className="dropzone-text">
          Drag & drop complaint document here or <span className="dropzone-link">click to browse</span>
        </div>
      </label>

      <div className="divider-text">OR</div>

      {/* PASTE COMPLAINT TEXT BUTTON */}
      <button className="btn-paste" onClick={() => setPasteModalOpen(true)}>
        <FileText size={16} /> Paste Complaint Text / Email
      </button>

      {/* SUPPORTED FORMATS INFO */}
      <div className="supported-formats-box">
        <Info size={16} />
        <span>Supported formats: <strong>PDF, DOCX, TXT, EML</strong> • Max file size: 10MB</span>
      </div>

      {/* EXTRACTION PROGRESS BAR */}
      {status !== 'idle' && (
        <div className="extraction-progress-box">
          <div className="progress-header">
            <span>Extraction Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-status-text">
            {progress < 100 ? <Sparkles size={14} className="spin" color="#2563eb" /> : <CheckCircle size={14} color="#10b981" />}
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* AI ASSISTANT CHAT FEED */}
      <div className="ai-assistant-container">
        <div className="chat-header">
          <Bot size={15} color="#2563eb" /> AI Copilot Feed
        </div>

        <div className="chat-messages-area">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={msg.sender === 'user' ? 'chat-card-user' : 'chat-card-assistant'}>
              {msg.sender === 'assistant' && (
                <div className="chat-icon-avatar">
                  <Bot size={16} />
                </div>
              )}
              <div>
                <div className="chat-text">{msg.text}</div>
                <div style={{ fontSize: '10px', color: msg.sender === 'user' ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isCopilotThinking && (
            <div className="chat-card-assistant">
              <div className="chat-icon-avatar"><Sparkles size={16} /></div>
              <div className="chat-text" style={{ fontStyle: 'italic', color: '#64748b' }}>
                Analyzing complaint context & regulatory rules...
              </div>
            </div>
          )}
        </div>

        {/* COPILOT INPUT BAR */}
        <form onSubmit={handleCopilotSend} className="chat-input-bar">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask me anything about this complaint..."
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
          />
          <button type="submit" className="btn-chat-send">
            <Send size={16} />
          </button>
        </form>
      </div>
      <div className="chat-disclaimer">
        AI responses may contain errors. Please verify information under QA SOP guidelines.
      </div>

      {/* PASTE MODAL */}
      {pasteModalOpen && (
        <div className="modal-overlay" onClick={() => setPasteModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Paste Complaint Text or Email</h3>
            <textarea
              className="form-textarea"
              style={{ minHeight: '180px', width: '100%', marginBottom: '16px' }}
              placeholder="Paste raw customer email body, QA complaint letter, or audit note here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-reset" onClick={() => setPasteModalOpen(false)}>Cancel</button>
              <button className="btn-save" onClick={handlePasteSubmit}>Extract Fields</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
