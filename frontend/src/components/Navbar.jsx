import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../store/complaintSlice';
import { FileText, Database, ShieldAlert, Settings, Cpu } from 'lucide-react';

export default function Navbar({ onOpenSettings }) {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.complaint.activeTab);
  const groqApiKey = useSelector((state) => state.ai.groqApiKey);

  return (
    <header className="app-header">
      <div className="brand-logo">
        <div className="logo-badge">AIVOA.AI</div>
        <div>
          <div className="brand-title">Pharma QMS Intelligence</div>
          <div className="brand-sub">Customer Complaint Management • API & FDF QA</div>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => dispatch(setActiveTab('form'))}
        >
          <FileText size={16} /> Log Complaint Form
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'registry' ? 'active' : ''}`}
          onClick={() => dispatch(setActiveTab('registry'))}
        >
          <Database size={16} /> Complaints Registry
        </button>
      </nav>

      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <Cpu size={14} color="#2563eb" />
          <span>Model: <strong>gemma2-9b-it</strong></span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: groqApiKey ? '#10b981' : '#f59e0b' }} title={groqApiKey ? "Groq Key Configured" : "Offline Fallback Active"} />
        </div>
        <button className="btn-settings" onClick={onOpenSettings}>
          <Settings size={15} /> Settings
        </button>
      </div>
    </header>
  );
}
