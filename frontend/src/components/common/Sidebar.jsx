import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Ruler,
  ShoppingBag,
  Scissors,
  FileText,
  BookOpen,
  Mic,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Compass
} from 'lucide-react';
import './Sidebar.css';

const TAILOR_LINKS = [
  { to: '/tailor', icon: LayoutDashboard, label: 'Workshop Overview' },
  { to: '/explore', icon: Compass, label: 'Artisanal Showcases' },
  { to: '/orders', icon: ShoppingBag, label: '5-Stage Order Queue', badge: '14' },
  { to: '/spec-sheet', icon: FileText, label: 'Visual Spec Sheets' },
  { to: '/measurements', icon: Mic, label: 'Voice Tape Intake' },
  { to: '/records', icon: BookOpen, label: 'Records' },
];

const CUSTOMER_LINKS = [
  { to: '/customer', icon: LayoutDashboard, label: 'My Wardrobe' },
  { to: '/explore', icon: Compass, label: 'Explore Creations' },
  { to: '/design-order', icon: Sparkles, label: 'Design Custom Stitch' },
  { to: '/tailors', icon: Users, label: 'Master Tailors Directory' },
  { to: '/orders', icon: ShoppingBag, label: 'Live Orders Tracker', badge: '2' },
  { to: '/measurements', icon: Ruler, label: 'Family Fit Vault' },
];

export default function Sidebar({ currentRole }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const isTailor = currentRole === 'tailor';
  const links = isTailor ? TAILOR_LINKS : CUSTOMER_LINKS;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar dark-atelier-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-logo">
        <Link to="/" className="sidebar-brand-link">
          <div className="sidebar-logo-icon">
            <Scissors size={20} color="#e6af2e" />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-brand">Tailor<span>Hub</span></span>
              <span className="sidebar-tagline">Studio OS</span>
            </div>
          )}
        </Link>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Static Role Workspace Badge (No Switching) */}
      {!collapsed && (
        <div className="sidebar-role-card">
          <div className="role-card-inner">
            <div className="role-badge-title">
              <span className="role-pulse-dot"></span>
              <span>{isTailor ? 'Master Atelier Workspace' : 'Customer Bespoke Vault'}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {isTailor ? 'Royal Stitch Studio #8842' : 'Family Measurements Active'}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">
          {!collapsed && (isTailor ? 'PRODUCTION WORKBENCH' : 'BESPOKE WARDROBE')}
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              title={link.label}
            >
              <Icon size={18} className="sidebar-link-icon" />
              {!collapsed && (
                <>
                  <span className="sidebar-link-label">{link.label}</span>
                  {link.badge && <span className="sidebar-link-badge">{link.badge}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="sidebar-footer">
        <Link to="/" className="sidebar-link landing-link" title="Landing Page">
          <ExternalLink size={18} className="sidebar-link-icon" />
          {!collapsed && <span className="sidebar-link-label">View Landing Page</span>}
        </Link>

        <button 
          type="button" 
          className="sidebar-link sidebar-logout" 
          onClick={handleLogout} 
          title="Logout"
        >
          <LogOut size={18} className="sidebar-link-icon" />
          {!collapsed && <span className="sidebar-link-label">Sign Out</span>}
        </button>

        {!collapsed && (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : (isTailor ? 'T' : 'C')}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {user?.full_name || (isTailor ? 'Master Tailor' : 'Valued Customer')}
              </span>
              <span className="sidebar-user-role">
                {isTailor ? (user?.shop_name || 'Royal Stitch Studio') : 'Customer Bespoke Vault'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
