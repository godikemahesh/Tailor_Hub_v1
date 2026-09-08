import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  FileText, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { store } from '../services/store';

const ALL_ORDERS = [
  {
    id: 'TH-8842',
    client: 'Ananya Sen',
    phone: '+91 98765 43210',
    garment: 'Raw Silk Crimson Bridal Blouse',
    specs: 'Sweetheart Neck • Puff Sleeve • 2.5" Margin • Cotton Lining',
    stage: 'stitching',
    dueDate: 'Tomorrow, 5 PM',
    amount: '₹ 2,400',
    advance: '₹ 1,000',
    urgent: true
  },
  {
    id: 'TH-8841',
    client: 'Ramesh Patel',
    phone: '+91 98234 56789',
    garment: 'Linen Formal Shirt & Trouser Set',
    specs: 'Cutaway Collar • Slim Fit • 2" Cuff • Coin Pocket',
    stage: 'cutting',
    dueDate: 'Sep 9',
    amount: '₹ 3,200',
    advance: '₹ 1,500',
    urgent: false
  },
  {
    id: 'TH-8840',
    client: 'Sunita Verma',
    phone: '+91 97112 34567',
    garment: 'Anarkali Suit Set with Dupatta',
    specs: 'Churidar • Boat Neck • Cotton Lining • Gold Piping',
    stage: 'trial_ready',
    dueDate: 'Today, 6 PM',
    amount: '₹ 4,500',
    advance: '₹ 2,000',
    urgent: true
  },
  {
    id: 'TH-8839',
    client: 'Vikram Malhotra',
    phone: '+91 99887 76655',
    garment: 'Bandhgala Jodhpuri Royal Suit',
    specs: 'Hand Stitched Lapel • Canvas Interlining • Brass Buttons',
    stage: 'received',
    dueDate: 'Sep 14',
    amount: '₹ 8,500',
    advance: '₹ 3,000',
    urgent: false
  },
  {
    id: 'TH-8838',
    client: 'Kavita Joshi',
    phone: '+91 94567 12345',
    garment: 'Silk Banarasi Blouse',
    specs: 'Deep U Back • Latkan Dori • Padded Cups',
    stage: 'delivered',
    dueDate: 'Delivered',
    amount: '₹ 1,800',
    advance: '₹ 1,800',
    urgent: false
  },
  {
    id: 'TH-8837',
    client: 'Meera Nair',
    phone: '+91 91234 87654',
    garment: 'Kalamkari Kurti with Palazzo',
    specs: 'Round Slit Neck • 3/4 Sleeves • Pockets Both Sides',
    stage: 'stitching',
    dueDate: 'Sep 11',
    amount: '₹ 2,100',
    advance: '₹ 1,000',
    urgent: false
  }
];

const STAGES = [
  { key: 'all', label: 'All Orders' },
  { key: 'received', label: 'Received' },
  { key: 'cutting', label: 'Cutting' },
  { key: 'stitching', label: 'Stitching' },
  { key: 'trial_ready', label: 'Trial Ready' },
  { key: 'delivered', label: 'Delivered' }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(ALL_ORDERS);
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrderModal, setActiveOrderModal] = useState(null);

  useEffect(() => {
    try {
      const storeOrders = store.getOrders();
      if (storeOrders && storeOrders.length > 0) {
        const formatted = storeOrders.map(o => ({
          id: o.order_number || o.id,
          storeId: o.id,
          client: o.customer_name || 'Customer',
          phone: o.customer_phone || '+91 98765 43210',
          garment: o.garment_type || 'Bespoke Garment',
          specs: o.visual_specs 
            ? `${o.visual_specs.front_neck_label || ''} • ${o.visual_specs.sleeve_label || ''} • ${o.visual_specs.internal_margin_inches ? o.visual_specs.internal_margin_inches + '" Margin' : ''}`
            : (o.specNotes || 'Custom Bespoke Fit'),
          stage: o.status || 'received',
          dueDate: o.promised_date || 'In 4 Days',
          amount: `₹ ${(o.total_price || 2400).toLocaleString()}`,
          advance: `₹ ${(o.advance_paid || 1000).toLocaleString()}`,
          urgent: !!o.is_express,
          rawOrder: o
        }));
        setOrders(formatted);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const advanceStage = (id) => {
    const seq = ['received', 'cutting', 'stitching', 'trial_ready', 'delivered'];
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const curr = seq.indexOf(o.stage);
        if (curr < seq.length - 1) {
          const next = seq[curr + 1];
          if (o.storeId) {
            store.advanceOrderStatus(o.storeId);
          }
          return { ...o, stage: next };
        }
      }
      return o;
    }));
  };

  const filtered = orders.filter(o => {
    const matchesStage = selectedStage === 'all' || o.stage === selectedStage;
    const matchesQuery = 
      o.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.garment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesQuery;
  });

  return (
    <div className="orders-page-container">
      {/* Header */}
      <div className="spec-page-header">
        <div>
          <div className="atelier-badge">
            <Scissors size={14} />
            <span>Studio Production OS</span>
          </div>
          <h1 className="atelier-title">Orders & Job Cards Management</h1>
          <p className="atelier-subtitle">
            Track garments across 5 stages of craftsmanship. Print cutting job cards and monitor delivery schedules.
          </p>
        </div>

        <div className="quick-actions-bar">
          <Link to="/spec-sheet" className="action-pill-btn primary">
            <span>+ Create New Job Card</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="orders-filter-toolbar">
        <div className="search-bar-wrapper" style={{ maxWidth: '360px' }}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by client, order #, or garment..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="header-search-input"
          />
        </div>

        <div className="stage-filter-pills">
          {STAGES.map(s => (
            <button
              key={s.key}
              type="button"
              className={`stage-pill-btn ${selectedStage === s.key ? 'active' : ''}`}
              onClick={() => setSelectedStage(s.key)}
            >
              {s.label} ({s.key === 'all' ? orders.length : orders.filter(o => o.stage === s.key).length})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="orders-table-wrapper" style={{ marginTop: '1.5rem' }}>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Job Order #</th>
              <th>Customer</th>
              <th>Garment & Anti-Dispute Specs</th>
              <th>Target Deadline</th>
              <th>Pricing / Balance</th>
              <th>Production Stage</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id} className={order.urgent ? 'urgent-row' : ''}>
                <td className="job-id-cell">
                  <strong>{order.id}</strong>
                  {order.urgent && <span className="urgent-badge">Urgent</span>}
                </td>
                <td>
                  <div className="client-cell">
                    <div className="client-avatar">{order.client.charAt(0)}</div>
                    <div>
                      <div className="client-name">{order.client}</div>
                      <div className="client-phone">{order.phone}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="garment-name">{order.garment}</div>
                  <div className="garment-specs">{order.specs}</div>
                </td>
                <td>
                  <div className="due-date-cell">
                    <Calendar size={13} />
                    <span>{order.dueDate}</span>
                  </div>
                </td>
                <td>
                  <div className="amount-val">{order.amount}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7c7267' }}>
                    Adv: {order.advance}
                  </div>
                </td>
                <td>
                  <span className={`status-stage-pill ${order.stage}`}>
                    {order.stage.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Link 
                      to="/spec-sheet" 
                      className="icon-action-btn" 
                      style={{ width: '32px', height: '32px' }}
                      title="View Cutting Job Card"
                    >
                      <FileText size={14} />
                    </Link>
                    {order.stage !== 'delivered' ? (
                      <button 
                        type="button" 
                        className="advance-stage-btn"
                        onClick={() => advanceStage(order.id)}
                      >
                        <span>Advance</span>
                        <ChevronRight size={13} />
                      </button>
                    ) : (
                      <span className="completed-text">Done</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
