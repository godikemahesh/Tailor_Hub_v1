import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  Search, 
  Scissors, 
  User, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  LogOut, 
  ExternalLink 
} from 'lucide-react';
import './Header.css';
import { Link } from 'react-router-dom';

export default function Header({ currentRole, onToggleRole, onOpenQuickOrder }) {
  const { user, logout } = useAuth();

  const isTailor = currentRole === 'tailor';

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder={isTailor ? "Search orders, customer phone, job cards..." : "Search saved garments, tailors, orders..."}
            className="header-search-input"
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>
      </div>

      <div className="header-right">
        {/* Static Role Identifier Pill (No internal workspace switching) */}
        <div className={`user-role-pill ${isTailor ? 'tailor' : 'customer'}`}>
          {isTailor ? <Scissors size={14} /> : <User size={14} />}
          <span>{isTailor ? 'Tailor Atelier OS' : 'Customer Portal'}</span>
        </div>

        {/* Capacity status pill */}
        {isTailor && (
          <div className="status-pill capacity-badge">
            <span className="pulse-dot"></span>
            <span className="badge-text">Capacity: <strong>14/20 slots</strong></span>
          </div>
        )}

        {/* Landing Page Link */}
        <Link to="/" className="landing-shortcut-btn" title="View Landing Page">
          <ExternalLink size={15} />
          <span>Landing Page</span>
        </Link>

        {/* Notification Bell */}
        <button type="button" className="icon-action-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notif-indicator">3</span>
        </button>

        {/* User Profile dropdown/pill */}
        <div className="user-profile-menu">
          <div className="avatar-circle">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : (isTailor ? 'T' : 'C')}
          </div>
          <div className="user-info-text">
            <span className="user-name">{user?.full_name || (isTailor ? 'Master Tailor' : 'Valued Customer')}</span>
            <span className="user-role-badge">
              {isTailor ? (user?.shop_name || 'Royal Stitch Studio') : 'Loyal Customer'}
            </span>
          </div>
          <button 
            type="button" 
            className="logout-minimal-btn" 
            title="Log out"
            onClick={logout}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
