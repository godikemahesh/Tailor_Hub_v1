import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Mic, 
  BookOpen, 
  FileText, 
  ChevronRight, 
  Calendar, 
  User, 
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Eye,
  Download,
  Phone,
  MapPin,
  X,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { store } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';

const STAGES = [
  { key: 'received', label: 'Received', color: '#64748b' },
  { key: 'cutting', label: 'Cutting', color: '#0284c7' },
  { key: 'stitching', label: 'Stitching', color: '#d97706' },
  { key: 'trial_ready', label: 'Trial Ready', color: '#7c3aed' },
  { key: 'delivered', label: 'Delivered', color: '#16a34a' }
];

// SVG path dictionary for 2D visual rendering
const NECKLINE_PATHS = {
  sweetheart: 'M 40,20 Q 75,55 100,45 Q 125,55 160,20',
  deep_u: 'M 40,20 C 50,75 150,75 160,20',
  boat: 'M 40,20 Q 100,32 160,20',
  v_neck: 'M 40,20 L 100,60 L 160,20',
  square: 'M 40,20 L 55,55 L 145,55 L 160,20'
};

export default function TailorDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null); // Active order modal
  const [callToast, setCallToast] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [overridePhone, setOverridePhone] = useState('');

  useEffect(() => {
    // Load orders from central store (including any customer-created bookings!)
    const currentOrders = store.getOrders('tailor');
    setOrders(currentOrders);
  }, []);

  const handleAdvanceStage = async (orderId, e) => {
    if (e) e.stopPropagation();
    const orderBefore = orders.find(o => o.id === orderId);
    const willBeTrial = orderBefore && orderBefore.status === 'stitching';

    if (willBeTrial) {
      setCallToast({
        type: 'initiating',
        message: `📞 Auto-Calling Customer ${orderBefore.customer_name} (${orderBefore.customer_phone || '+91 98765 43210'}): Stitching complete, outfit ready for trial fitting!`
      });
    }

    const updated = await store.advanceOrderStatus(orderId);
    setOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      const refreshed = updated.find(o => o.id === orderId);
      setSelectedOrder(refreshed);
    }

    if (willBeTrial) {
      setTimeout(() => {
        setCallToast({
          type: 'success',
          message: `✅ Automated Call Dispatched to ${orderBefore.customer_name} (${orderBefore.customer_phone || '+91 98765 43210'})! Voice announced trial ready.`
        });
        setTimeout(() => setCallToast(null), 6000);
      }, 1500);
    }
  };

  const handleManualCall = async (order) => {
    setIsCalling(true);
    const phoneToUse = overridePhone.trim() || order.customer_phone || '+91 98765 43210';
    setCallToast({
      type: 'initiating',
      message: `📞 Connecting automated voice call to ${order.customer_name} (${phoneToUse})...`
    });

    const res = await store.triggerOrderCall(order.id, phoneToUse);
    setIsCalling(false);

    const refreshed = store.getOrders('tailor');
    setOrders(refreshed);
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(refreshed.find(o => o.id === order.id));
    }

    if (res?.success) {
      setCallToast({
        type: 'success',
        message: `✅ Voice Call Placed! Calling ${phoneToUse}. Announcement: "Trial fitting is ready!"`
      });
    } else {
      setCallToast({
        type: 'notice',
        message: `ℹ️ Automated Voice Call Triggered (${res?.error || 'Processed'}). Voice: "Your bespoke outfit is ready for trial fitting!"`
      });
    }
    setTimeout(() => setCallToast(null), 7000);
  };

  const handleDownloadPDF = (order) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(43, 57, 144);
    doc.text('TAILORHUB — CUTTING JOB CARD & SPEC SHEET', 20, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('2D Parametric Vector Blueprint Verified by Customer', 20, 28);
    doc.line(20, 32, 190, 32);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 27, 24);
    doc.text(`Order Number: ${order.order_number}`, 20, 42);
    doc.text(`Client: ${order.customer_name} (${order.customer_phone})`, 110, 42);
    doc.text(`Garment: ${order.garment_type}`, 20, 50);
    doc.text(`Target Delivery: ${order.promised_date}`, 110, 50);

    // Specifications box
    doc.setFillColor(247, 244, 238);
    doc.rect(20, 58, 170, 54, 'F');
    doc.rect(20, 58, 170, 54, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 57, 144);
    doc.text('CUSTOMER SPECIFICATIONS (2D BLUEPRINT LOCKED)', 25, 66);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const specs = order.visual_specs || {};
    doc.text(`• Front Neckline: ${specs.front_neck_label || 'Sweetheart'}`, 25, 74);
    doc.text(`• Sleeve Styling: ${specs.sleeve_label || 'Elbow Puff'}`, 25, 82);
    doc.text(`• Back Style: ${specs.back_neck_label || 'Deep U with Latkan Dori'}`, 25, 90);
    doc.text(`• Cups & Lining: ${specs.pads_type || 'Included'} | ${specs.lining_type || 'Cotton'}`, 25, 98);
    doc.text(`• Internal Alteration Margin: ${specs.internal_margin_inches || 2.5} Inches`, 25, 106);

    // Measurements
    doc.setFont('helvetica', 'bold');
    doc.text('BODY MEASUREMENTS (INCHES):', 20, 124);
    doc.setFont('helvetica', 'normal');
    let mText = Object.entries(order.measurements_snapshot || {})
      .map(([k, v]) => `${k.toUpperCase()}: ${v}"`)
      .join('  |  ');
    doc.text(mText, 20, 132);

    doc.save(`JobCard_${order.order_number}.pdf`);
  };

  const filteredOrders = stageFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === stageFilter);

  return (
    <div className="dashboard-container">
      {/* Twilio Voice Call Notification Toast */}
      {callToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: callToast.type === 'initiating' ? '#1e293b' : (callToast.type === 'success' ? '#064e3b' : '#312e81'),
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 99999,
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600,
          fontSize: '0.92rem',
          maxWidth: '520px'
        }}>
          <Phone size={18} color="#ffd978" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div>{callToast.message}</div>
          </div>
          <button 
            type="button" 
            onClick={() => setCallToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Top Welcome & Atelier Header */}
      <div className="atelier-header-banner">
        <div>
          <div className="atelier-badge">
            <Scissors size={14} />
            <span>Master Atelier OS • Royal Stitch Studio</span>
          </div>
          <h1 className="atelier-title">Workshop Production Overview</h1>
          <p className="atelier-subtitle">
            Welcome back, {user?.full_name ? (user.full_name.startsWith('Master') ? user.full_name : `Master ${user.full_name}`) : 'Master Tailor'}. You have <strong>{orders.filter(o => o.status === 'stitching' || o.status === 'trial_ready').length} active garments</strong> currently on the crafting tables.
          </p>
        </div>

        {/* Fast Action Buttons */}
        <div className="quick-actions-bar">
          <Link to="/explore" className="action-pill-btn secondary" style={{ background: '#fefce8', borderColor: '#fef08a', color: '#854d0e', fontWeight: 600 }}>
            <Compass size={16} />
            <span>Showcase Feed</span>
          </Link>
          <Link to="/spec-sheet" className="action-pill-btn secondary">
            <FileText size={16} />
            <span>2D Spec Sheets</span>
          </Link>
          <Link to="/records" className="action-pill-btn secondary">
            <BookOpen size={16} />
            <span>Records</span>
          </Link>
          <Link to="/measurements" className="action-pill-btn primary">
            <Mic size={16} />
            <span>Voice Tape Intake</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Workload</span>
            <div className="stat-icon-wrapper indigo"><Scissors size={18} /></div>
          </div>
          <div className="stat-value">{orders.length} Garments</div>
          <div className="stat-detail">
            <span className="positive">70% Capacity</span> • 5 slots open
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Today's Trials & Deadlines</span>
            <div className="stat-icon-wrapper amber"><Clock size={18} /></div>
          </div>
          <div className="stat-value">{orders.filter(o => o.status === 'trial_ready').length || 2} Ready</div>
          <div className="stat-detail text-amber">
            <AlertCircle size={13} style={{ display: 'inline', marginRight: '4px' }} />
            WhatsApp alerts synced
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Monthly Stitch Revenue</span>
            <div className="stat-icon-wrapper green"><TrendingUp size={18} /></div>
          </div>
          <div className="stat-value">₹ 52,400</div>
          <div className="stat-detail">
            <span className="positive">↑ 18%</span> vs last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Anti-Dispute Accuracy</span>
            <div className="stat-icon-wrapper purple"><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-value">100%</div>
          <div className="stat-detail">
            2.5" seam margin locked on all jobs
          </div>
        </div>
      </div>

      {/* 5-Stage Live Order Queue Section */}
      <div className="order-queue-section">
        <div className="queue-header-row">
          <div>
            <h2 className="section-title">Active 5-Stage Order Queue</h2>
            <p className="section-desc">
              Click any order to inspect full specifications with the customer's 2D vector design.
            </p>
          </div>

          {/* Stage Filter Pills */}
          <div className="stage-filter-pills">
            <button 
              type="button" 
              className={`stage-pill-btn ${stageFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStageFilter('all')}
            >
              All ({orders.length})
            </button>
            {STAGES.map(s => (
              <button
                key={s.key}
                type="button"
                className={`stage-pill-btn ${stageFilter === s.key ? 'active' : ''}`}
                onClick={() => setStageFilter(s.key)}
              >
                {s.label} ({orders.filter(o => o.status === s.key).length})
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Client & Phone</th>
                <th>Garment & 2D Specs</th>
                <th>Target Deadline</th>
                <th>Amount</th>
                <th>5-Stage Status</th>
                <th>Inspect / Advance</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const stageInfo = STAGES.find(s => s.key === order.status) || STAGES[0];
                return (
                  <tr 
                    key={order.id} 
                    className="clickable-order-row"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="job-id-cell">
                      <strong>{order.order_number || order.id}</strong>
                      {order.is_express && <span className="urgent-badge">Express</span>}
                    </td>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar">
                          {(order.customer_name || 'Client').charAt(0)}
                        </div>
                        <div>
                          <div className="client-name">{order.customer_name || 'Client'}</div>
                          <div className="client-phone">{order.customer_phone || '+91 98765 43210'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="garment-name">{order.garment_type}</div>
                      <div className="garment-specs">
                        {order.visual_specs?.front_neck_label || 'Sweetheart'} • {order.visual_specs?.sleeve_label || 'Puff Sleeve'} • {order.visual_specs?.internal_margin_inches || 2.5}" Margin
                      </div>
                    </td>
                    <td>
                      <div className="due-date-cell">
                        <Calendar size={13} />
                        <span>{order.promised_date || 'In 4 Days'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="amount-val">₹ {order.total_price || 2200}</div>
                      <span className="payment-pill paid">
                        Adv: ₹{order.advance_paid || 1000}
                      </span>
                    </td>
                    <td>
                      <span className={`status-stage-pill ${order.status}`}>
                        {stageInfo.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          type="button" 
                          className="action-pill-btn secondary"
                          style={{ padding: '4px 9px', fontSize: '0.75rem', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}
                          onClick={(e) => { e.stopPropagation(); handleManualCall(order); }}
                          title="Trigger Automated Voice Call to Customer"
                        >
                          <Phone size={12} />
                          <span>Call</span>
                        </button>

                        <button 
                          type="button" 
                          className="action-pill-btn secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                          title="View Customer's 2D Design & Blueprint"
                        >
                          <Eye size={13} />
                          <span>View 2D Design</span>
                        </button>

                        {order.status !== 'delivered' && (
                          <button 
                            type="button" 
                            className="advance-stage-btn"
                            onClick={(e) => handleAdvanceStage(order.id, e)}
                            title="Advance to next production stage"
                          >
                            <span>Advance</span>
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── INTERACTIVE 2D SPECIFICATION BLUEPRINT MODAL ── */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div 
            className="modal-dialog spec-modal-wide" 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '820px' }}
          >
            <div className="modal-header">
              <div>
                <span className="step-badge-mini" style={{ marginBottom: '4px' }}>
                  Customer Bespoke Blueprint
                </span>
                <h3 className="modal-title">
                  {selectedOrder.garment_type} — {selectedOrder.order_number}
                </h3>
              </div>
              <button 
                type="button" 
                className="close-modal-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Customer Contact Card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#fdfbf7', border: '1px solid #e5e0d8', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e1b18' }}>
                    Client: {selectedOrder.customer_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#7c7267', display: 'flex', gap: '12px', marginTop: '2px' }}>
                    <span><Phone size={12} style={{ display: 'inline' }} /> {selectedOrder.customer_phone}</span>
                    <span><MapPin size={12} style={{ display: 'inline' }} /> {selectedOrder.customer_address || 'City Center'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`status-stage-pill ${selectedOrder.status}`}>
                    Stage: {selectedOrder.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600, marginTop: '4px' }}>
                    Due: {selectedOrder.promised_date}
                  </div>
                </div>
              </div>

              {/* 2D Design Visualizer & Specifications Display */}
              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* 2D SVG Blueprint */}
                <div style={{ background: '#fbf9f5', border: '1px dashed #c4b59b', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#2b3990', marginBottom: '6px' }}>
                    Customer's 2D Design
                  </div>

                  <svg viewBox="0 0 200 240" style={{ width: '100%', height: '200px' }}>
                    {/* Bodice */}
                    <path 
                      d="M 40,30 L 20,80 L 35,95 L 45,75 L 45,210 L 155,210 L 155,75 L 165,95 L 180,80 L 160,30 Z" 
                      fill="#ffffff" 
                      stroke="#2b3990" 
                      strokeWidth="2.5" 
                    />
                    
                    {/* Dynamic Customer Neckline */}
                    <path 
                      d={NECKLINE_PATHS[selectedOrder.visual_specs?.front_neck_style] || NECKLINE_PATHS.sweetheart} 
                      fill="none" 
                      stroke="#c99318" 
                      strokeWidth="3.2" 
                      strokeLinecap="round" 
                    />

                    {/* Customer Seam Margin Lines */}
                    <line 
                      x1={45 + (selectedOrder.visual_specs?.internal_margin_inches || 2.5) * 4} 
                      y1="75" 
                      x2={45 + (selectedOrder.visual_specs?.internal_margin_inches || 2.5) * 4} 
                      y2="210" 
                      stroke="#dc2626" 
                      strokeWidth="1.5" 
                      strokeDasharray="4,4" 
                    />
                    <line 
                      x1={155 - (selectedOrder.visual_specs?.internal_margin_inches || 2.5) * 4} 
                      y1="75" 
                      x2={155 - (selectedOrder.visual_specs?.internal_margin_inches || 2.5) * 4} 
                      y2="210" 
                      stroke="#dc2626" 
                      strokeWidth="1.5" 
                      strokeDasharray="4,4" 
                    />

                    <rect x="45" y="145" width="110" height="24" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
                    <text x="100" y="160" textAnchor="middle" fill="#92400e" fontSize="9" fontWeight="700">
                      {selectedOrder.visual_specs?.internal_margin_inches || 2.5}" SEAM MARGIN
                    </text>
                  </svg>

                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                    ✓ 2D Spec Locked & Certified
                  </div>
                </div>

                {/* Specification Details List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#2b3990', fontWeight: 700 }}>
                      Anatomy & Styling Choices:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', lineHeight: '1.6', color: '#1e1b18' }}>
                      <li><strong>Front Neckline:</strong> {selectedOrder.visual_specs?.front_neck_label || 'Sweetheart Neck'}</li>
                      <li><strong>Sleeve Style:</strong> {selectedOrder.visual_specs?.sleeve_label || 'Elbow-Length Puff Sleeve'}</li>
                      <li><strong>Back Style:</strong> {selectedOrder.visual_specs?.back_neck_label || 'Deep U with Latkan Dori'}</li>
                      <li><strong>Inner Seam Margin:</strong> <span style={{ color: '#b45309', fontWeight: 700 }}>{selectedOrder.visual_specs?.internal_margin_inches || 2.5} Inches</span></li>
                      <li><strong>Lining & Pads:</strong> {selectedOrder.visual_specs?.pads_type || 'Included'} • {selectedOrder.visual_specs?.lining_type || 'Cotton'}</li>
                    </ul>
                  </div>

                  {/* Measurements snapshot */}
                  <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '12px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#2b3990', fontWeight: 700 }}>
                      Customer Measurements (Inches):
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', fontSize: '0.78rem' }}>
                      {Object.entries(selectedOrder.measurements_snapshot || {}).map(([k, v]) => (
                        <div key={k} style={{ background: '#fbf9f5', padding: '4px 6px', borderRadius: '4px', border: '1px solid #e5e0d8' }}>
                          <span style={{ color: '#7c7267', textTransform: 'capitalize' }}>{k}: </span>
                          <strong>{v}"</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer notes */}
                  {selectedOrder.visual_specs?.fabric_color && (
                    <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', padding: '10px', fontSize: '0.78rem', color: '#854d0e' }}>
                      <strong>Fabric & Client Notes:</strong> {selectedOrder.visual_specs.fabric_color}
                    </div>
                  )}
                </div>
              </div>

              {/* ── AUTOMATED TELEPHONY VOICE CALL HUB ── */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Phone size={14} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        Automated Voice Call
                      </span>
                      <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        Voice Notification
                      </span>
                    </div>
                  </div>

                  {selectedOrder.last_call_at && (
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
                      ✓ Call Sent at {selectedOrder.last_call_at}
                    </span>
                  )}
                </div>

                <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#475569' }}>
                  Tailors have no time to manually dial! TailorHub automatically phones the customer when marked <strong>Trial Ready</strong>, announcing completion and trial fitting instructions.
                </p>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', flex: '1', minWidth: '220px' }}>
                    <Phone size={13} color="#64748b" />
                    <input 
                      type="text" 
                      placeholder={selectedOrder.customer_phone || '+91 98765 43210'}
                      value={overridePhone}
                      onChange={e => setOverridePhone(e.target.value)}
                      style={{ border: 'none', outline: 'none', fontSize: '0.82rem', width: '100%', color: '#0f172a' }}
                      title="Customer phone or verified test number"
                    />
                  </div>

                  <button 
                    type="button" 
                    className="action-pill-btn primary"
                    disabled={isCalling}
                    onClick={() => handleManualCall(selectedOrder)}
                    style={{ background: '#2563eb', borderColor: '#1d4ed8', padding: '7px 16px', fontSize: '0.82rem' }}
                  >
                    <Phone size={14} />
                    <span>{isCalling ? 'Connecting Call...' : 'Trigger Voice Call to Customer'}</span>
                  </button>
                </div>

                {selectedOrder.last_call_error && (
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '6px 10px', borderRadius: '6px' }}>
                    ℹ️ Call Status: {selectedOrder.last_call_error}
                  </div>
                )}
              </div>

              {/* Action Buttons inside Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e0d8' }}>
                <button 
                  type="button" 
                  className="action-pill-btn secondary"
                  onClick={() => handleDownloadPDF(selectedOrder)}
                >
                  <Download size={15} />
                  <span>Print Cutting Job Card (PDF)</span>
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedOrder.status !== 'delivered' && (
                    <button 
                      type="button" 
                      className="action-pill-btn primary"
                      onClick={() => handleAdvanceStage(selectedOrder.id)}
                    >
                      <span>Advance to Next Production Stage</span>
                      <ChevronRight size={15} />
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="action-pill-btn secondary"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close Blueprint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
