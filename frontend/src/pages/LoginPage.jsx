import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { store } from '../services/store';
import { authAPI } from '../services/api';
import { 
  Scissors, 
  User, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  Phone, 
  CheckCircle2,
  MapPin,
  Briefcase,
  Camera,
  Store,
  AlertCircle
} from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const [activePortal, setActivePortal] = useState('customer'); // 'customer' | 'tailor'
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Credentials
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Tailor-specific registration fields
  const [shopName, setShopName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        const payload = {
          email: email.trim(),
          phone_number: phone.trim() || '+91 98765 43210',
          password: password,
          full_name: fullName.trim() || (email ? email.split('@')[0] : 'User'),
          role: activePortal,
          ...(activePortal === 'tailor' ? {
            shop_name: shopName.trim() || `${fullName.trim() || 'Master'}'s Atelier`,
            experience_years: experienceYears || '5',
            specialization: specialization || 'Bespoke Tailoring',
            address: address.trim() || 'Main Workshop Studio',
            city: city.trim() || 'Bengaluru',
            pincode: pincode.trim() || '560001',
            avatar_url: avatarUrl.trim() || ''
          } : {})
        };
        const res = await authAPI.register(payload);
        if (res.data?.access_token) {
          localStorage.setItem('tailorhub_token', res.data.access_token);
        }
        
        const baseUser = res.data?.user || {};
        const userToSave = {
          ...baseUser,
          full_name: baseUser.full_name || fullName.trim() || (activePortal === 'tailor' ? 'Master Tailor' : 'Customer'),
          role: activePortal,
          ...(activePortal === 'tailor' ? {
            shop_name: shopName.trim() || baseUser.shop_name || `${fullName.trim() || 'Master'}'s Atelier`,
            address: address.trim() || baseUser.address || 'Main Workshop Studio',
            city: city.trim() || baseUser.city || 'Bengaluru',
            pincode: pincode.trim() || baseUser.pincode || '560001',
            experience_years: experienceYears || '5',
            specialization: specialization || 'Bespoke Tailoring'
          } : {})
        };

        localStorage.setItem('tailorhub_user', JSON.stringify(userToSave));
        if (activePortal === 'tailor') {
          // Clear any leftover cached mock customer records from prior sessions
          localStorage.removeItem('tailorhub_records');
        }
      } else {
        const res = await authAPI.login({
          email: email.trim(),
          password: password
        });
        let userData = res.data?.user;
        if (res.data?.access_token) {
          localStorage.setItem('tailorhub_token', res.data.access_token);
        }

        // If user logged in via Tailor portal but their DB account is customer (or vice versa), auto-sync role
        if (userData && userData.role !== activePortal) {
          try {
            const updateRes = await authAPI.updateRole(activePortal);
            if (updateRes.data) {
              userData = updateRes.data;
            }
          } catch (e) {
            console.warn('Could not auto-sync role on login:', e);
            userData = { ...userData, role: activePortal };
          }
        }

        if (userData && activePortal === 'tailor') {
          if (!userData.shop_name || userData.shop_name === 'Royal Stitch Studio') {
            const allTailors = store.getTailors();
            const matchingTailor = allTailors.find(t => t.tailor_id === userData.id || t.id === userData.id);
            userData.shop_name = matchingTailor?.shop_name || `${userData.full_name || 'Master'}'s Atelier`;
            userData.address = matchingTailor?.address || userData.address || 'Workshop Studio';
          }
        }

        if (userData) {
          localStorage.setItem('tailorhub_user', JSON.stringify(userData));
        }
      }

      localStorage.setItem('tailorhub_active_role', activePortal);
      if (activePortal === 'tailor') {
        window.location.href = '/tailor';
      } else {
        window.location.href = '/customer';
      }
    } catch (err) {
      console.error('Authentication error:', err);
      let errorMsg = 'Authentication failed. Please verify your details.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map(d => `${d.loc ? d.loc.slice(-1) : ''}: ${d.msg}`).join(', ');
        } else {
          errorMsg = err.response.data.detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setAuthError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-portal-container">
      <div className="login-ambient-1"></div>
      <div className="login-ambient-2"></div>
      <div className="login-grid-overlay"></div>

      {/* Top Bar with Brand and Back to Home */}
      <header className="login-header-bar">
        <Link to="/" className="brand-logo-group">
          <div className="brand-logo-icon">
            <Scissors size={20} color="#e6af2e" />
          </div>
          <div className="brand-name-wrap">
            <span className="brand-title">Tailor<span>Hub</span></span>
            <span className="brand-subtitle">Studio OS & Atelier Platform</span>
          </div>
        </Link>
        <Link to="/" className="login-back-link">
          ← Back to Landing Page
        </Link>
      </header>

      {/* Main Login Card */}
      <div className="login-card-wrapper">
        <div className="login-portal-header">
          <span className="portal-badge-pill">
            <Sparkles size={13} color="#e6af2e" />
            <span>Dedicated Workspace Authentication</span>
          </span>
          <h1 className="login-headline">
            {isRegisterMode ? 'Create Your Account' : 'Choose Your Portal'}
          </h1>
          <p className="login-subheadline">
            {activePortal === 'customer' 
              ? 'Sign in to customize garments, explore master tailors, and book orders.'
              : 'Sign in to manage your atelier workshop, capacity, and 2D visual cutting specs.'}
          </p>

          {/* Portal Switcher Tabs */}
          <div className="portal-switch-tabs">
            <button
              type="button"
              className={`portal-tab-btn ${activePortal === 'customer' ? 'active customer' : ''}`}
              onClick={() => { setActivePortal('customer'); setIsRegisterMode(false); }}
            >
              <User size={16} />
              <span>Customer Portal</span>
            </button>
            <button
              type="button"
              className={`portal-tab-btn ${activePortal === 'tailor' ? 'active tailor' : ''}`}
              onClick={() => { setActivePortal('tailor'); setIsRegisterMode(false); }}
            >
              <Scissors size={16} />
              <span>Tailor Atelier OS</span>
            </button>
          </div>
        </div>

        {/* Portal Form Box */}
        <div className="portal-form-box">
          {/* Top Toggle: Sign In vs Register */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {isRegisterMode ? 'Already have an account?' : "Don't have an account yet?"}
            </span>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffd978',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={() => setIsRegisterMode(!isRegisterMode)}
            >
              {isRegisterMode 
                ? 'Sign In Instead' 
                : (activePortal === 'customer' ? 'Register as Customer' : 'Register as Master Tailor')}
            </button>
          </div>

          {authError && (
            <div className="auth-error-banner" style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          {activePortal === 'customer' ? (
            <div className="portal-content-view">
              <div className="portal-identity-badge customer">
                <div className="badge-icon-wrap"><User size={20} /></div>
                <div>
                  <div className="identity-title">Customer Wardrobe Access</div>
                  <div className="identity-desc">Design custom outfits, select master tailors & track live stitches</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {isRegisterMode && (
                  <div className="form-field-group">
                    <label>Your Full Name</label>
                    <div className="input-with-icon">
                      <User size={16} className="field-icon" />
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Mahesh Godike" 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="portal-input" 
                      />
                    </div>
                  </div>
                )}

                <div className="form-field-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="field-icon" />
                    <input 
                      type="email" 
                      required
                      placeholder="name@example.com" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="portal-input" 
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label>Mobile Number</label>
                  <div className="input-with-icon">
                    <Phone size={16} className="field-icon" />
                    <input 
                      type="text" 
                      required
                      placeholder="+91 98765 43210" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="portal-input" 
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label>Password</label>
                  <div className="input-with-icon">
                    <Lock size={16} className="field-icon" />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="portal-input" 
                    />
                  </div>
                </div>

                <button type="submit" className="portal-submit-btn customer">
                  <span>{isRegisterMode ? 'Complete Registration & Start Designing' : 'Enter Customer Wardrobe'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          ) : (
            <div className="portal-content-view">
              <div className="portal-identity-badge tailor">
                <div className="badge-icon-wrap"><Scissors size={20} /></div>
                <div>
                  <div className="identity-title">Master Tailor Atelier OS</div>
                  <div className="identity-desc">Workshop production queue, 2D visual job cards & capacity balancer</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {isRegisterMode && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-field-group">
                        <label>Master Tailor Name</label>
                        <div className="input-with-icon">
                          <User size={16} className="field-icon" />
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Master Suresh Rao" 
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="portal-input" 
                          />
                        </div>
                      </div>

                      <div className="form-field-group">
                        <label>Shop / Studio Name</label>
                        <div className="input-with-icon">
                          <Store size={16} className="field-icon" />
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Rao Heritage Tailors" 
                            value={shopName}
                            onChange={e => setShopName(e.target.value)}
                            className="portal-input" 
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                      <div className="form-field-group">
                        <label>Experience (Years)</label>
                        <div className="input-with-icon">
                          <Briefcase size={16} className="field-icon" />
                          <input 
                            type="number" 
                            required
                            placeholder="15" 
                            value={experienceYears}
                            onChange={e => setExperienceYears(e.target.value)}
                            className="portal-input" 
                          />
                        </div>
                      </div>

                      <div className="form-field-group">
                        <label>Primary Specialization</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Bridal Blouses, Suits, Kurtas" 
                          value={specialization}
                          onChange={e => setSpecialization(e.target.value)}
                          className="portal-input" 
                          style={{ paddingLeft: '12px' }}
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label>Tailor Shop Address</label>
                      <div className="input-with-icon">
                        <MapPin size={16} className="field-icon" />
                        <input 
                          type="text" 
                          required
                          placeholder="Shop 12, Gandhi Bazaar Main Road" 
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          className="portal-input" 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-field-group">
                        <label>City</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Bengaluru" 
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="portal-input" 
                          style={{ paddingLeft: '12px' }}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Pincode</label>
                        <input 
                          type="text" 
                          required
                          placeholder="560004" 
                          value={pincode}
                          onChange={e => setPincode(e.target.value)}
                          className="portal-input" 
                          style={{ paddingLeft: '12px' }}
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label>Photo / Avatar URL</label>
                      <div className="input-with-icon">
                        <Camera size={16} className="field-icon" />
                        <input 
                          type="url" 
                          placeholder="https://..." 
                          value={avatarUrl}
                          onChange={e => setAvatarUrl(e.target.value)}
                          className="portal-input" 
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label>Workshop Mobile / WhatsApp Number</label>
                      <div className="input-with-icon">
                        <Phone size={16} className="field-icon" />
                        <input 
                          type="text" 
                          required
                          placeholder="+91 98765 43210" 
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="portal-input" 
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-field-group">
                  <label>Master Tailor Email</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="field-icon" />
                    <input 
                      type="email" 
                      required
                      placeholder="rajesh@royalstitch.com" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="portal-input" 
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label>Password</label>
                  <div className="input-with-icon">
                    <Lock size={16} className="field-icon" />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="portal-input" 
                    />
                  </div>
                </div>

                <button type="submit" className="portal-submit-btn tailor">
                  <span>{isRegisterMode ? 'Register Atelier & Join Directory' : 'Open Workshop Atelier OS'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
