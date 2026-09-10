import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setGroqApiKey } from '../store/aiSlice';
import { Key, Cpu, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function SettingsModal({ onClose }) {
  const dispatch = useDispatch();
  const currentKey = useSelector((state) => state.ai.groqApiKey);

  const [apiKey, setApiKey] = useState(currentKey);
  const [model, setModel] = useState('gemma2-9b-it');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    dispatch(setGroqApiKey(apiKey.trim()));

    try {
      await axios.post('/api/settings', {
        groq_api_key: apiKey.trim(),
        primary_model: model,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Settings save error:', err);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <Cpu size={22} color="#2563eb" />
          <h3 style={{ fontSize: '18px', fontWeight: '800' }}>AI Framework & LLM Settings</h3>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} color="#3b82f6" /> Groq API Key
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
              Create a free API key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>console.groq.com</a>. If blank, high-accuracy fallback agent operates offline.
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Selected LLM Model</label>
            <select className="form-select" value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="gemma2-9b-it">gemma2-9b-it (Mandatory Specified Model)</option>
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Context Model)</option>
            </select>
          </div>

          {saveSuccess && (
            <div style={{ background: '#f0fdf4', color: '#166534', padding: '10px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <CheckCircle size={16} /> Key & Model configuration saved successfully!
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-reset" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
}
