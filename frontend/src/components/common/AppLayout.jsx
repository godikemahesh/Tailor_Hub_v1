import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/variables.css';
import '../../styles/layout.css';
import '../../styles/dashboard.css';

export default function AppLayout() {
  const { user, token, loading } = useAuth();
  
  if (loading) {
    return null;
  }

  // Enforce authentication: redirect to login if no active user session
  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  // Strict role enforcement from user session
  const currentRole = user?.role || localStorage.getItem('tailorhub_active_role') || 'customer';

  return (
    <div className="app-shell">
      {/* Luxury Obsidian Dark-theme Sidebar */}
      <Sidebar currentRole={currentRole} />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Sticky Header with Search, Role Identifier, Capacity Badge */}
        <Header currentRole={currentRole} />

        {/* Page Content */}
        <main className="app-content-body">
          <Outlet context={{ currentRole }} />
        </main>
      </div>
    </div>
  );
}
