import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AppLayout from './components/common/AppLayout';
import TailorDashboard from './pages/TailorDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import OrdersPage from './pages/OrdersPage';
import MeasurementsPage from './pages/MeasurementsPage';
import RecordsPage from './pages/RecordsPage';
import OldBookScannerPage from './pages/OldBookScannerPage';
import SpecSheetPage from './pages/SpecSheetPage';
import LoginPage from './pages/LoginPage';
import DesignAndBookPage from './pages/DesignAndBookPage';
import TailorsDirectoryPage from './pages/TailorsDirectoryPage';
import ExplorePage from './pages/ExplorePage';

// Resilient Error Boundary to catch any unexpected runtime issues
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('TailorHub Render Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#07090e',
          color: '#f8fafc',
          fontFamily: 'Inter, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#121624',
            border: '1px solid rgba(230, 175, 46, 0.3)',
            borderRadius: '16px',
            padding: '36px',
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: '#e6af2e', marginBottom: '12px' }}>Workspace Recovery</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '20px' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => { this.setState({ hasError: false }); window.location.href = '/login'; }}
                style={{
                  background: '#e6af2e',
                  color: '#07090e',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Go to Login
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper to determine starting view based on role
function RoleRedirect() {
  const role = localStorage.getItem('tailorhub_active_role') || 'tailor';
  return <Navigate to={role === 'tailor' ? '/tailor' : '/customer'} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* WOW Dark Theme Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Dedicated Dual Login Portal (Customer & Tailor) */}
            <Route path="/login" element={<LoginPage />} />

            {/* Warm Light Theme Application Shell */}
            <Route element={<AppLayout />}>
              <Route path="/app" element={<RoleRedirect />} />
              <Route path="/tailor" element={<TailorDashboard />} />
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/design-order" element={<DesignAndBookPage />} />
              <Route path="/tailors" element={<TailorsDirectoryPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/measurements" element={<MeasurementsPage />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="/scanner" element={<Navigate to="/records" replace />} />
              <Route path="/spec-sheet" element={<SpecSheetPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
