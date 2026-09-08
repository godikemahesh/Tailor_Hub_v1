import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Scissors, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Shirt, 
  AlertCircle,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { store } from '../services/store';
import { useAuth } from '../context/AuthContext';

const DEFAULT_FAMILY_MEMBERS = [
  {
    id: 'mem-1',
    name: 'Self',
    relationship: 'Self',
    garmentsCount: 3,
    primaryGarment: 'Bespoke Outfit',
    lastUpdated: 'Today',
    measurements: {
      chest: '38"',
      waist: '32"',
      shoulder: '16"',
      length: '28"',
      sleeve: '24"',
      neck: '15.5"'
    }
  },
  {
    id: 'mem-2',
    name: 'Mom',
    relationship: 'Mom',
    garmentsCount: 2,
    primaryGarment: 'Anarkali Kurta & Suit (38")',
    lastUpdated: 'Jul 15, 2026',
    measurements: {
      chest: '38"',
      waist: '34"',
      shoulder: '15.5"',
      length: '42"',
      sleeve: '18"',
      armhole: '17.5"'
    }
  },
  {
    id: 'mem-3',
    name: 'Dad',
    relationship: 'Dad',
    garmentsCount: 4,
    primaryGarment: 'Oxford Formal Shirt & Trouser (40")',
    lastUpdated: 'Aug 02, 2026',
    measurements: {
      chest: '40"',
      waist: '34"',
      shoulder: '17.5"',
      length: '30"',
      sleeve: '25"',
      neck: '16"'
    }
  }
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const displayName = user?.full_name ? user.full_name.split(' ')[0] : 'Valued Customer';
  const fullName = user?.full_name || 'My Profile';

  const familyMembers = [
    {
      ...DEFAULT_FAMILY_MEMBERS[0],
      name: `${fullName} (Self)`
    },
    ...DEFAULT_FAMILY_MEMBERS.slice(1)
  ];

  const [selectedMember, setSelectedMember] = useState(familyMembers[0]);
  const [orders, setOrders] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    setOrders(store.getOrders('customer'));
  }, []);

  const STAGE_NAMES = ['Received', 'Cutting', 'Stitching', 'Trial Ready', 'Delivered'];
  const STAGE_KEYS = ['received', 'cutting', 'stitching', 'trial_ready', 'delivered'];

  const displayOrders = orders && orders.length > 0 ? orders : [
    {
      id: 'TH-8842',
      member: `${fullName} (Self)`,
      garment: 'Raw Silk Bespoke Outfit',
      tailorShop: 'Royal Stitch Studio',
      stageIndex: 2, // Stitching
      stages: ['Received', 'Cutting', 'Stitching', 'Trial Ready', 'Delivered'],
      estimatedDelivery: 'Tomorrow, 5:00 PM',
      specNotes: 'Tailored fit • Premium stitching • Quality inner margin'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Top Welcome Banner */}
      <div className="atelier-header-banner customer-banner">
        <div>
          <div className="atelier-badge customer-badge">
            <Users size={14} />
            <span>Family Wardrobe & Bespoke Fit Vault</span>
          </div>
          <h1 className="atelier-title">Welcome back, {displayName}</h1>
          <p className="atelier-subtitle">
            You have <strong>{displayOrders.length} bespoke garments</strong> being crafted by master tailors.
          </p>
        </div>

        <div className="quick-actions-bar">
          <Link to="/explore" className="action-pill-btn secondary" style={{ background: '#fefce8', borderColor: '#fef08a', color: '#854d0e', fontWeight: 600 }}>
            <Compass size={16} />
            <span>Explore Creations Feed</span>
          </Link>
          <Link to="/tailors" className="action-pill-btn secondary">
            <Users size={16} />
            <span>Find Master Tailors</span>
          </Link>
          <Link to="/design-order" className="action-pill-btn primary">
            <Sparkles size={16} />
            <span>Customize & Book Stitch</span>
          </Link>
        </div>
      </div>

      {/* 5-Stage Live Garment Trackers */}
      <div className="customer-active-orders-section">
        <h2 className="section-title">Live Outfit Progress Tracking</h2>
        <p className="section-desc">Real-time status updates directly from the master tailor's workbench.</p>

        <div className="orders-cards-list">
          {displayOrders.map(order => {
            const orderId = order.order_number || order.id;
            const memberName = order.member_name || order.member || 'Self';
            const tailorShop = order.shop_name || order.tailorShop || 'Royal Stitch Studio';
            const garmentTitle = order.garment_type || order.garment || 'Bespoke Garment';
            const specNotes = order.specNotes || (order.visual_specs 
              ? `${order.visual_specs.front_neck_label || 'Custom Neck'} • ${order.visual_specs.sleeve_label || 'Fitted Sleeves'} • ${order.visual_specs.internal_margin_inches ? order.visual_specs.internal_margin_inches + '" Inner Margin' : '2.0" Margin'}`
              : 'Handcrafted Bespoke Specifications');
            const deliveryTime = order.promised_date || order.estimatedDelivery || 'In 4-5 Days';
            const currentStageIndex = order.stageIndex !== undefined 
              ? order.stageIndex 
              : Math.max(0, STAGE_KEYS.indexOf(order.status));

            return (
              <div key={order.id} className="live-order-card">
                <div className="live-order-card-header">
                  <div>
                    <div className="order-meta-row">
                      <span className="order-tag">Order #{orderId}</span>
                      <span className="order-member-pill">{memberName}</span>
                      <span className="order-tailor-name">Atelier: {tailorShop}</span>
                    </div>
                    <h3 className="order-garment-title">{garmentTitle}</h3>
                    <p className="order-spec-summary">
                      <ShieldCheck size={14} style={{ display: 'inline', color: '#16a34a', marginRight: '4px' }} />
                      {specNotes}
                    </p>
                  </div>

                  <div className="delivery-target-box">
                    <span className="target-label">Estimated Completion</span>
                    <div className="target-value">{deliveryTime}</div>
                  </div>
                </div>

                {/* 5-Stage Visual Stepper */}
                <div className="order-timeline-stepper">
                  {STAGE_NAMES.map((st, idx) => {
                    const isDone = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    return (
                      <div key={st} className={`stepper-node ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}>
                        <div className="stepper-circle">
                          {isDone ? <CheckCircle2 size={16} /> : (idx + 1)}
                        </div>
                        <span className="stepper-label">{st}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Member Family Fit Vault Section */}
      <div className="family-vault-section">
        <div className="queue-header-row">
          <div>
            <h2 className="section-title">Multi-Member Family Fit Vault</h2>
            <p className="section-desc">Saved profiles for every family member. Switch with 1-click for zero-hassle bookings.</p>
          </div>
          <Link to="/measurements" className="action-pill-btn secondary">
            <Plus size={15} />
            <span>Add Family Member</span>
          </Link>
        </div>

        <div className="family-members-grid">
          {familyMembers.map(mem => {
            const isSelected = selectedMember.id === mem.id;
            return (
              <div 
                key={mem.id} 
                className={`member-profile-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedMember(mem)}
              >
                <div className="member-card-top">
                  <div className="member-avatar">
                    {mem.name.charAt(0)}
                  </div>
                  <span className={`relationship-tag ${mem.relationship.toLowerCase()}`}>
                    {mem.relationship}
                  </span>
                </div>

                <div className="member-name">{mem.name}</div>
                <div className="member-garment-desc">{mem.primaryGarment}</div>

                <div className="member-measurements-preview">
                  {Object.entries(mem.measurements).slice(0, 4).map(([k, v]) => (
                    <div key={k} className="meas-chip">
                      <span className="chip-key">{k}:</span>
                      <span className="chip-val">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="member-card-footer">
                  <span className="meas-count">{mem.garmentsCount} saved garment styles</span>
                  <button 
                    type="button" 
                    className="use-profile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMember(mem);
                      setShowBookingModal(true);
                    }}
                  >
                    {isSelected ? 'Book Outfit' : 'Select'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Wizard Modal preview */}
      {showBookingModal && (
        <div className="modal-backdrop" onClick={() => setShowBookingModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Book a Bespoke Custom Stitch</h3>
              <button 
                type="button" 
                className="close-modal-btn"
                onClick={() => setShowBookingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#574e44', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Select the family member profile to apply measurements instantly:
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
                {familyMembers.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: selectedMember.id === m.id ? '2px solid #2b3990' : '1px solid #e5e0d8',
                      background: selectedMember.id === m.id ? '#eef2ff' : '#ffffff',
                      color: selectedMember.id === m.id ? '#2b3990' : '#334155',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedMember(m)}
                  >
                    [{m.relationship}] {m.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div style={{ background: '#fbf7ec', border: '1px solid #e7d8b5', padding: '12px', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#805b10' }}>
                ✓ Applying saved measurements for <strong>{selectedMember.name}</strong> ({selectedMember.primaryGarment}). No in-person measuring visit required!
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="action-pill-btn secondary"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
                <Link 
                  to="/design-order" 
                  state={{ member: selectedMember.relationship }}
                  className="action-pill-btn primary"
                  onClick={() => setShowBookingModal(false)}
                >
                  Continue to 2D Visualizer & Tailors →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
