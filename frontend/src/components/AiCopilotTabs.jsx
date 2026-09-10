import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, AlertTriangle, Copy, GitPullRequest, FileCheck2, Lightbulb } from 'lucide-react';

export default function AiCopilotTabs() {
  const [activeSubTab, setActiveSubTab] = useState('completeness');
  const analysisResult = useSelector((state) => state.ai.analysisResult);

  if (!analysisResult) {
    return (
      <div className="card" style={{ marginTop: '24px', textAlign: 'center', padding: '36px', color: '#64748b' }}>
        <FileCheck2 size={36} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155' }}>No AI Analysis Results Yet</h3>
        <p style={{ fontSize: '13px', marginTop: '4px' }}>
          Upload a complaint document or load a sample preset in the right pane to generate real-time AI Risk, Completeness, Duplicate, and RCA/CAPA insights.
        </p>
      </div>
    );
  }

  const { completeness, risk_assessment, duplicates, rca_capa, ai_summary } = analysisResult;

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div className="card-header-flex">
        <div>
          <h2 className="card-title" style={{ fontSize: '18px' }}>AI Quality & Regulatory Insights</h2>
          <p className="card-subtitle">FDA 21 CFR 211.198 & ICH Q9/Q10 Compliance Analytics</p>
        </div>
        <div style={{ background: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid #bbf7d0' }}>
          LangGraph Workflow Executed
        </div>
      </div>

      {/* SUB TABS */}
      <div className="widget-tabs-nav">
        <button
          className={`widget-tab-btn ${activeSubTab === 'completeness' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('completeness')}
        >
          <FileCheck2 size={15} /> Completeness ({completeness?.score || 100}%)
        </button>
        <button
          className={`widget-tab-btn ${activeSubTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('risk')}
        >
          <AlertTriangle size={15} /> Risk Classification ({risk_assessment?.risk_level || 'Moderate'})
        </button>
        <button
          className={`widget-tab-btn ${activeSubTab === 'duplicates' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('duplicates')}
        >
          <Copy size={15} /> Duplicate Detector ({duplicates?.has_duplicates ? 'Found' : '0'})
        </button>
        <button
          className={`widget-tab-btn ${activeSubTab === 'rca' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('rca')}
        >
          <GitPullRequest size={15} /> RCA (5-Whys) & CAPA
        </button>
      </div>

      {/* TAB 1: COMPLETENESS */}
      {activeSubTab === 'completeness' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: completeness?.score >= 85 ? '#dcfce7' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: completeness?.score >= 85 ? '#15803d' : '#b45309' }}>
              {completeness?.score}%
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                {completeness?.is_complete ? 'Regulatory Complaint Document Complete' : 'Incomplete Complaint Metadata Detected'}
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                {completeness?.missing_fields?.length > 0
                  ? `Missing fields required for 21 CFR 211.198 QA audit: ${completeness.missing_fields.join(', ')}`
                  : 'All mandatory regulatory fields are present in the parsed document.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {completeness?.details?.map((item, idx) => (
              <div key={idx} style={{ padding: '10px 14px', borderRadius: '7px', background: item.status === 'present' ? '#ffffff' : '#fffbe6', border: `1px solid ${item.status === 'present' ? '#e2e8f0' : '#ffe58f'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '600', color: '#1e293b' }}>
                  <span>{item.field_name}</span>
                  <span style={{ fontSize: '11px', color: item.status === 'present' ? '#16a34a' : '#d97706', textTransform: 'uppercase', fontWeight: '700' }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                  {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RISK CLASSIFICATION */}
      {activeSubTab === 'risk' && (
        <div>
          <div style={{ padding: '16px', borderRadius: '8px', background: risk_assessment?.risk_level === 'Critical' ? '#fef2f2' : risk_assessment?.risk_level === 'Major' ? '#fffbe6' : '#f0fdf4', border: `1px solid ${risk_assessment?.risk_level === 'Critical' ? '#fca5a5' : risk_assessment?.risk_level === 'Major' ? '#ffe58f' : '#bbf7d0'}`, marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', color: risk_assessment?.risk_level === 'Critical' ? '#991b1b' : risk_assessment?.risk_level === 'Major' ? '#92400e' : '#166534' }}>
              Risk Level: {risk_assessment?.risk_level}
            </div>
            <div style={{ fontSize: '13px', marginTop: '4px', color: '#334155' }}>
              <strong>Justification:</strong> {risk_assessment?.justification}
            </div>
          </div>

          <div className="form-grid-2">
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Patient Safety & Health Impact</div>
              <div style={{ fontSize: '13px', color: '#1e293b' }}>{risk_assessment?.patient_safety_impact}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Regulatory Reporting Impact</div>
              <div style={{ fontSize: '13px', color: '#1e293b' }}>{risk_assessment?.regulatory_impact}</div>
            </div>
          </div>

          <div style={{ marginTop: '12px', background: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '13px', color: '#1e40af' }}>
            <strong>Recommended Immediate Action:</strong> {risk_assessment?.recommended_action}
          </div>
        </div>
      )}

      {/* TAB 3: DUPLICATE DETECTOR */}
      {activeSubTab === 'duplicates' && (
        <div>
          {duplicates?.has_duplicates ? (
            <div>
              <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', color: '#b45309', marginBottom: '14px' }}>
                ⚠️ Potential duplicate or related batch complaints found in historical QMS registry!
              </div>
              {duplicates.matches.map((match, idx) => (
                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                    <span>Complaint #{match.complaint_number} - Batch: {match.batch_number}</span>
                    <span style={{ color: '#2563eb' }}>Similarity: {(match.similarity_score * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>
                    <strong>Product:</strong> {match.product_name} • <strong>Date:</strong> {match.created_at}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                    "{match.description}"
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
              <ShieldCheck size={28} style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontWeight: '700' }}>No Duplicate Batch Complaints Detected</div>
              <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>This appears to be an isolated complaint event for this batch number.</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RCA & CAPA */}
      {activeSubTab === 'rca' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lightbulb size={16} color="#2563eb" /> 5-Whys Root Cause Analysis (Fishbone Breakdown)
            </h4>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {rca_capa?.five_whys?.map((why, idx) => (
                <div key={idx} style={{ fontSize: '12.5px', color: '#334155', padding: '4px 0', borderBottom: idx < 4 ? '1px dashed #e2e8f0' : 'none' }}>
                  {why}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fef3c7', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '13px', color: '#92400e', marginBottom: '16px' }}>
            <strong>Confirmed Root Cause:</strong> {rca_capa?.root_cause}
          </div>

          <div className="form-grid-2">
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', marginBottom: '8px' }}>Corrective Actions (Immediate)</div>
              <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: '#334155' }}>
                {rca_capa?.corrective_actions?.map((act, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{act}</li>
                ))}
              </ul>
            </div>
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', marginBottom: '8px' }}>Preventive Actions (Long-Term)</div>
              <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: '#334155' }}>
                {rca_capa?.preventive_actions?.map((act, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
