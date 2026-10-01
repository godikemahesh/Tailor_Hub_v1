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
import { useAuth } from '../context/AuthContext';

const STAGES = [
  { key: 'all', label: 'All Orders' },
  { key: 'received', label: 'Received' },
  { key: 'cutting', label: 'Cutting' },
  { key: 'stitching', label: 'Stitching' },
  { key: 'trial_ready', label: 'Trial Ready' },
  { key: 'delivered', label: 'Delivered' }
];

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrderModal, setActiveOrderModal] = useState(null);

  const renderOrders = () => {
    try {
      const storeOrders = store.getOrders(user?.role || 'all', user);
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
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error(e);
      setOrders([]);
    }
  };

  useEffect(() => {
    renderOrders();
    const sync = async () => {
      await store.syncOrdersFromBackend();
      renderOrders();
    };
    sync();
  }, [user]);

  const isTailor = (user?.role === 'tailor') || (localStorage.getItem('tailorhub_active_role') === 'tailor');

  const advanceStage = (id) => {
    if (!isTailor) return; // Strictly read-only for customer accounts
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
            <span>{isTailor ? 'Studio Production OS' : 'Live Orders Tracker'}</span>
          </div>
          <h1 className="atelier-title">{isTailor ? 'Orders & Job Cards Management' : 'Live Orders & Garment Tracker'}</h1>
          <p className="atelier-subtitle">
            {isTailor 
              ? 'Track garments across 5 stages of craftsmanship. Print cutting job cards and monitor delivery schedules.'
              : 'Track your custom tailored garments in real time across the 5 craftsmanship stages from cutting to trial fitting.'}
          </p>
        </div>

        <div className="quick-actions-bar">
          {isTailor ? (
            <Link to="/spec-sheet" className="action-pill-btn primary">
              <span>+ Create New Job Card</span>
            </Link>
          ) : (
            <Link to="/design-order" className="action-pill-btn primary">
              <span>+ Design New Garment</span>
            </Link>
          )}
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
              <th>{isTailor ? 'Action' : 'Live Status'}</th>
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
                    {isTailor ? (
                      order.stage !== 'delivered' ? (
                        <button 
                          type="button" 
                          className="advance-stage-btn"
                          onClick={() => advanceStage(order.id)}
                          title="Advance to next production stage"
                        >
                          <span>Advance</span>
                          <ChevronRight size={13} />
                        </button>
                      ) : (
                        <span className="completed-text">Done</span>
                      )
                    ) : (
                      <span 
                        className="readonly-stage-text" 
                        style={{ 
                          fontSize: '0.82rem', 
                          fontWeight: 600, 
                          color: order.stage === 'delivered' ? '#16a34a' : order.stage === 'trial_ready' ? '#d97706' : '#64748b',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {order.stage === 'delivered' ? '✓ Delivered' : order.stage === 'trial_ready' ? '📞 Ready for Trial' : '⏳ In Crafting'}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <Scissors size={32} color="#94a3b8" />
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: '#334155' }}>No Orders in Queue</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {searchQuery ? 'No orders match your filter.' : 'When clients place custom stitching orders with your atelier, they will appear here.'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
