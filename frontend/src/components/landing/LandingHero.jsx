import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Mic, 
  Layers, 
  Scissors, 
  ShieldCheck, 
  Clock, 
  Check 
} from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="hero-section">
      {/* Pill Badge */}
      <div className="hero-pill-badge">
        <Sparkles size={14} className="sparkle-icon" />
        <span>Next-Gen Tailoring Studio OS • 99.4% Fit Accuracy</span>
      </div>

      {/* Main Headline */}
      <h1 className="hero-headline">
        Where Bespoke Craft Meets <br />
        <span className="hero-gradient-text">Precision Intelligence.</span>
      </h1>

      {/* Subheadline */}
      <p className="hero-subheadline">
        The complete digital operating system for modern tailoring ateliers and discerning clients. 
        Capture measurements hands-free with Voice Tape, eliminate disputes with 2D Visual Spec Sheets, 
        and digitize legacy registers in seconds.
      </p>

      {/* CTA Buttons */}
      <div className="hero-cta-group">
        <Link to="/app" className="btn-hero-primary">
          <span>Launch Atelier Platform</span>
          <ArrowRight size={18} />
        </Link>
        <a href="#demo-preview" className="btn-hero-secondary">
          <Layers size={18} />
          <span>Explore Interactive Demo</span>
        </a>
      </div>

      {/* Hero Mockup Widget */}
      <div className="hero-mockup-wrapper" id="demo-preview">
        {/* Floating Badges */}
        <div className="floating-stat-badge badge-top-left">
          <div style={{ color: '#22c55e', display: 'flex' }}><CheckCircle2 size={18} /></div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Zero-Dispute Guarantee</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>2.5" Seam Margin Locked</div>
          </div>
        </div>

        <div className="floating-stat-badge badge-bottom-right">
          <div style={{ color: '#e6af2e', display: 'flex' }}><Mic size={18} /></div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Voice Tape Listening</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>"Chest 38.5, Waist 32"</div>
          </div>
        </div>

        <div className="hero-mockup-frame">
          {/* Mockup Window Bar */}
          <div className="mockup-window-header">
            <div className="window-dots">
              <span className="window-dot dot-red"></span>
              <span className="window-dot dot-yellow"></span>
              <span className="window-dot dot-green"></span>
            </div>
            <div className="mockup-address-bar">
              <span>https://atelier.tailorhub.internal/studio-os/live-orders</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', color: '#64748b' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
                ● Live Sync Active
              </span>
            </div>
          </div>

          {/* Mockup Body Content */}
          <div className="mockup-body-grid">
            {/* Left Mockup Sidebar */}
            <div className="mockup-sidebar">
              <div className="mockup-brand-row">
                <Scissors size={18} color="#e6af2e" />
                <span>Royal Stitch Studio</span>
              </div>

              <div className="mockup-stat-card">
                <div className="mockup-stat-title">Active Workload</div>
                <div className="mockup-stat-val">14 / 20 Slots</div>
                <div style={{ fontSize: '0.7rem', color: '#e6af2e', marginTop: '2px' }}>70% Studio Capacity</div>
              </div>

              <div className="mockup-stat-card">
                <div className="mockup-stat-title">Voice Tape Profiles</div>
                <div className="mockup-stat-val">342 Captured</div>
                <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '2px' }}>Average 42s intake</div>
              </div>

              <div className="mockup-stat-card">
                <div className="mockup-stat-title">Dispute Rate</div>
                <div className="mockup-stat-val">0.00%</div>
                <div style={{ fontSize: '0.7rem', color: '#4ade80', marginTop: '2px' }}>100% Spec Confirmed</div>
              </div>
            </div>

            {/* Center Mockup Stage */}
            <div className="mockup-center-stage">
              <div className="stage-header">
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#e6af2e', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                    Live Production Order #TH-8842
                  </span>
                  <div className="stage-title">Bridal Silk Blouse & Dupatta Set</div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', background: 'rgba(230,175,46,0.15)', color: '#ffd978', border: '1px solid rgba(230,175,46,0.3)' }}>
                  Stitching in Progress
                </span>
              </div>

              {/* 5-Stage Visual Timeline */}
              <div className="mockup-timeline-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: '#94a3b8' }}>Client: <strong>Ananya Sen</strong> (Saved Profile: Self)</span>
                  <span style={{ color: '#e6af2e' }}>Delivery Target: Tomorrow, 5:00 PM</span>
                </div>

                <div className="timeline-progress-bar">
                  <div className="timeline-progress-fill"></div>
                  
                  <div className="timeline-step-node">
                    <div className="step-circle done"><Check size={14} /></div>
                    <span className="step-label">Received</span>
                  </div>

                  <div className="timeline-step-node">
                    <div className="step-circle done"><Check size={14} /></div>
                    <span className="step-label">Cutting</span>
                  </div>

                  <div className="timeline-step-node">
                    <div className="step-circle active">3</div>
                    <span className="step-label active">Stitching</span>
                  </div>

                  <div className="timeline-step-node">
                    <div className="step-circle">4</div>
                    <span className="step-label">Trial Ready</span>
                  </div>

                  <div className="timeline-step-node">
                    <div className="step-circle">5</div>
                    <span className="step-label">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Live Voice & Spec Status Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>Garment Anatomy</div>
                  <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 600 }}>Sweetheart Neck + Puff Sleeve</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Pads: Included • Lining: Pure Cotton</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>Fabric & Allowance</div>
                  <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 600 }}>Raw Silk Crimson • 2.5" Margin</div>
                  <div style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: '2px' }}>✓ Margin Locked in Blueprint</div>
                </div>
              </div>
            </div>

            {/* Right Mockup Panel */}
            <div className="mockup-right-panel">
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#e6af2e" />
                <span>Anti-Dispute Blueprint</span>
              </div>

              <div className="spec-preview-box">
                <div className="spec-preview-svg">
                  <svg viewBox="0 0 160 120" style={{ width: '130px', height: '100px' }}>
                    <path d="M 40,25 Q 80,65 120,25 L 135,110 L 25,110 Z" fill="none" stroke="#e6af2e" strokeWidth="2.5" />
                    <path d="M 40,25 Q 60,50 80,45 Q 100,50 120,25" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
                    <line x1="25" y1="110" x2="135" y2="110" stroke="#94a3b8" strokeWidth="1.5" />
                    <text x="80" y="85" textAnchor="middle" fill="#94a3b8" fontSize="8">2.5" INNER SEAM</text>
                  </svg>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Sweetheart Neck & Inner Margin Verified</div>
              </div>

              <Link to="/app" style={{ 
                marginTop: 'auto', 
                background: 'rgba(230,175,46,0.15)', 
                border: '1px solid rgba(230,175,46,0.3)', 
                color: '#ffd978', 
                padding: '8px', 
                borderRadius: '8px', 
                textAlign: 'center', 
                fontSize: '0.8rem',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'block'
              }}>
                Open Studio Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
