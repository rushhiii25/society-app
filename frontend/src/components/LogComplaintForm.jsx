import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField, resetForm, addSavedComplaint } from '../store/complaintSlice';
import { resetAiState } from '../store/aiSlice';
import { RotateCcw, Save, CheckCircle2, Clock } from 'lucide-react';
import axios from 'axios';

export default function LogComplaintForm() {
  const dispatch = useDispatch();
  const form = useSelector((state) => state.complaint.form);
  const aiPopulatedFields = useSelector((state) => state.complaint.aiPopulatedFields);
  const analysisResult = useSelector((state) => state.ai.analysisResult);

  const handleChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      dispatch(resetForm());
      dispatch(resetAiState());
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.product_name || !form.description) {
      alert("Please ensure at least Product Name and Detailed Complaint Description are filled before saving.");
      return;
    }

    try {
      const payload = {
        ...form,
        completeness_score: analysisResult?.completeness?.score || 100,
        missing_fields: analysisResult?.completeness?.missing_fields || [],
        risk_level: analysisResult?.risk_assessment?.risk_level || 'Moderate',
        risk_analysis: analysisResult?.risk_assessment?.justification || '',
        root_cause_analysis: JSON.stringify(analysisResult?.rca_capa?.five_whys || []),
        capa_recommendation: JSON.stringify(analysisResult?.rca_capa?.corrective_actions || []),
      };

      const response = await axios.post('/api/complaints', payload);
      dispatch(addSavedComplaint(response.data));
      alert(`Complaint ${response.data.complaint_number} saved successfully!`);
    } catch (err) {
      console.error("Save Complaint Error:", err);
      alert("Error saving complaint to database.");
    }
  };

  const isAiPopulated = (field) => Boolean(aiPopulatedFields[field]);

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Log Customer Complaint</h2>
          <p className="card-subtitle">API & FDF Quality Assurance Module</p>
        </div>
        <div className="badge-triage">
          <Clock size={14} /> Pending Triage
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* SECTION 1 */}
        <div className="form-section-title">1. Origin & Customer Details</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Complaint Source</label>
            <input
              type="text"
              className={`form-input ${isAiPopulated('complaint_source') ? 'ai-populated' : ''}`}
              placeholder="Awaiting AI extraction..."
              value={form.complaint_source}
              onChange={(e) => handleChange('complaint_source', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className={`form-input ${isAiPopulated('customer_name') ? 'ai-populated' : ''}`}
              placeholder="Awaiting AI extraction..."
              value={form.customer_name}
              onChange={(e) => handleChange('customer_name', e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 2 */}
        <div className="form-section-title">2. Product & Batch Identification</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              className={`form-input ${isAiPopulated('product_name') ? 'ai-populated' : ''}`}
              placeholder="Awaiting AI extraction..."
              value={form.product_name}
              onChange={(e) => handleChange('product_name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Product Strength/Grade</label>
            <input
              type="text"
              className={`form-input ${isAiPopulated('product_strength') ? 'ai-populated' : ''}`}
              placeholder="Awaiting AI extraction..."
              value={form.product_strength}
              onChange={(e) => handleChange('product_strength', e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Batch/Lot Number</label>
            <input
              type="text"
              className={`form-input ${isAiPopulated('batch_number') ? 'ai-populated' : ''}`}
              placeholder="Awaiting AI extraction..."
              value={form.batch_number}
              onChange={(e) => handleChange('batch_number', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Manufacturing Date</label>
            <input
              type="text"
              className={`form-input ${isAiPopulated('mfg_date') ? 'ai-populated' : ''}`}
              placeholder="Awaiting AI extraction..."
              value={form.mfg_date}
              onChange={(e) => handleChange('mfg_date', e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              type="text"
              className={`form-input ${isAiPopulated('expiry_date') ? 'ai-populated' : ''}`}
              placeholder="Awaiting AI extraction..."
              value={form.expiry_date}
              onChange={(e) => handleChange('expiry_date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity Affected</label>
            <input
              type="text"
              className={`form-input ${isAiPopulated('quantity_affected') ? 'ai-populated' : ''}`}
              placeholder="Awaiting AI extraction..."
              value={form.quantity_affected}
              onChange={(e) => handleChange('quantity_affected', e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 3 */}
        <div className="form-section-title">3. Complaint Details</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Complaint Type</label>
            <input
              type="text"
              className={`form-input ${isAiPopulated('complaint_type') ? 'ai-populated' : ''}`}
              placeholder="Awaiting AI extraction..."
              value={form.complaint_type}
              onChange={(e) => handleChange('complaint_type', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Complaint Date</label>
            <input
              type="text"
              className={`form-input ${isAiPopulated('complaint_date') ? 'ai-populated' : ''}`}
              placeholder="Awaiting AI extraction..."
              value={form.complaint_date}
              onChange={(e) => handleChange('complaint_date', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label">Detailed Complaint Description</label>
          <textarea
            className={`form-textarea ${isAiPopulated('description') ? 'ai-populated' : ''}`}
            placeholder="Awaiting AI extraction..."
            rows={4}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        {/* SECTION 4 */}
        <div className="form-section-title">4. Initial Assessment & Priority</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Initial Severity</label>
            <select
              className={`form-select ${isAiPopulated('initial_severity') ? 'ai-populated' : ''}`}
              value={form.initial_severity}
              onChange={(e) => handleChange('initial_severity', e.target.value)}
            >
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className={`form-select ${isAiPopulated('priority') ? 'ai-populated' : ''}`}
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="form-actions">
          <button type="button" className="btn-reset" onClick={handleReset}>
            <RotateCcw size={15} /> Reset Form
          </button>
          <button type="submit" className="btn-save">
            <Save size={16} /> Save Complaint
          </button>
        </div>
      </form>
    </div>
  );
}
