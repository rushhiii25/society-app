import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSavedComplaints, setSelectedComplaint } from '../store/complaintSlice';
import { Search, Download, Eye, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function ComplaintTable() {
  const dispatch = useDispatch();
  const savedComplaints = useSelector((state) => state.complaint.savedComplaints);
  const selectedComplaint = useSelector((state) => state.complaint.selectedComplaint);

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/complaints');
      dispatch(setSavedComplaints(res.data));
    } catch (err) {
      console.error('Fetch complaints error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleTriageChange = async (id, newStatus) => {
    try {
      await axios.patch(`/api/complaints/${id}/triage`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      console.error('Triage update error:', err);
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedComplaints, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pharma_complaints_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filtered = savedComplaints.filter((c) => {
    const matchesSearch =
      c.complaint_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'All' || c.initial_severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="card" style={{ maxWidth: '1440px', margin: '20px auto' }}>
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Complaints Registry</h2>
          <p className="card-subtitle">Historical Quality Complaints & Triage Audit Trail</p>
        </div>
        <button className="btn-reset" onClick={exportToJson}>
          <Download size={15} /> Export Registry JSON
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '34px' }}
            placeholder="Search by Complaint #, Product, Batch, Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="Major">Major</option>
          <option value="Minor">Minor</option>
        </select>
      </div>

      {/* COMPLAINTS TABLE */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading complaints DB...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
          No complaint records found matching your filters.
        </div>
      ) : (
        <table className="complaints-table">
          <thead>
            <tr>
              <th>Complaint #</th>
              <th>Customer</th>
              <th>Product / Batch</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Completeness</th>
              <th>Triage Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: '700', color: '#2563eb' }}>{item.complaint_number}</td>
                <td style={{ fontWeight: '500' }}>{item.customer_name}</td>
                <td>
                  <div><strong>{item.product_name}</strong></div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Batch: {item.batch_number}</div>
                </td>
                <td>{item.complaint_type}</td>
                <td>
                  <span style={{
                    padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                    background: item.initial_severity === 'Critical' ? '#fef2f2' : item.initial_severity === 'Major' ? '#fffbe6' : '#f0fdf4',
                    color: item.initial_severity === 'Critical' ? '#dc2626' : item.initial_severity === 'Major' ? '#d97706' : '#16a34a',
                    border: `1px solid ${item.initial_severity === 'Critical' ? '#fca5a5' : item.initial_severity === 'Major' ? '#ffe58f' : '#bbf7d0'}`
                  }}>
                    {item.initial_severity}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: '700', color: item.completeness_score >= 85 ? '#16a34a' : '#d97706' }}>
                    {item.completeness_score}%
                  </span>
                </td>
                <td>
                  <select
                    className="form-select"
                    style={{ fontSize: '11.5px', padding: '4px 8px' }}
                    value={item.triage_status}
                    onChange={(e) => handleTriageChange(item.id, e.target.value)}
                  >
                    <option value="Pending Triage">Pending Triage</option>
                    <option value="Triaged">Triaged</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="CAPA Issued">CAPA Issued</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn-reset"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                    onClick={() => dispatch(setSelectedComplaint(item))}
                  >
                    <Eye size={13} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* DETAIL MODAL */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => dispatch(setSelectedComplaint(null))}>
          <div className="modal-card" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Complaint {selectedComplaint.complaint_number}</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Logged on {new Date(selectedComplaint.created_at).toLocaleDateString()}</p>
              </div>
              <span className="badge-triage">{selectedComplaint.triage_status}</span>
            </div>

            <div className="form-grid-2" style={{ marginBottom: '12px' }}>
              <div><strong>Customer:</strong> {selectedComplaint.customer_name}</div>
              <div><strong>Source:</strong> {selectedComplaint.complaint_source}</div>
              <div><strong>Product:</strong> {selectedComplaint.product_name}</div>
              <div><strong>Strength:</strong> {selectedComplaint.product_strength}</div>
              <div><strong>Batch #:</strong> {selectedComplaint.batch_number}</div>
              <div><strong>Affected Qty:</strong> {selectedComplaint.quantity_affected}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '7px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Description</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>{selectedComplaint.description}</div>
            </div>

            {selectedComplaint.risk_analysis && (
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '7px', marginBottom: '16px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>AI Risk Assessment ({selectedComplaint.risk_level})</div>
                <div style={{ fontSize: '12.5px', color: '#1e3a8a', marginTop: '4px' }}>{selectedComplaint.risk_analysis}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-save" onClick={() => dispatch(setSelectedComplaint(null))}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
