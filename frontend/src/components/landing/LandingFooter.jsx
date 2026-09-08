import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ShieldCheck, ArrowRight, Heart } from 'lucide-react';

export default function LandingFooter() {
  return (
    <>
      {/* Live Call-To-Action Banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <h2 className="cta-banner-heading">Ready to Modernize Your Atelier?</h2>
          <p className="cta-banner-sub">
            Join thousands of master tailors and fashion studios providing precision, 
            hands-free measurement intake, and zero-dispute bespoke craftsmanship.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/app" className="btn-hero-primary" style={{ padding: '0.9rem 2.25rem' }}>
              <span>Enter TailorHub Studio</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content-wrap">
          <div className="footer-brand-col">
            <div className="brand-logo-group">
              <div className="brand-logo-icon">
                <Scissors size={20} color="#e6af2e" />
              </div>
              <div className="brand-name-wrap">
                <span className="brand-title">Tailor<span>Hub</span></span>
                <span className="brand-subtitle">Atelier & Studio OS</span>
              </div>
            </div>
            <p>
              The unified digital platform empowering master tailoring artisans and customers 
              with AI voice capture, visual vector spec sheets, and 5-stage workshop management.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Capabilities</div>
            <ul className="footer-links-list">
              <li><a href="#features">Hands-Free Voice Tape</a></li>
              <li><a href="#features">Anti-Dispute Spec Sheet</a></li>
              <li><a href="#features">Old Book OCR Scanner</a></li>
              <li><a href="#features">5-Stage Order Progress</a></li>
              <li><a href="#features">Multi-Member Family Profiles</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Studio OS</div>
            <ul className="footer-links-list">
              <li><Link to="/app">Tailor Dashboard</Link></li>
              <li><Link to="/app">Customer Portal</Link></li>
              <li><Link to="/app">Live Order Tracker</Link></li>
              <li><Link to="/app">Cutting Job Cards</Link></li>
              <li><Link to="/app">Capacity Balancer</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Guarantees</div>
            <ul className="footer-links-list">
              <li><span style={{ color: '#4ade80' }}>✓ 99.4% Fit Accuracy</span></li>
              <li><span style={{ color: '#ffd978' }}>✓ Zero Dispute Seam Margins</span></li>
              <li><span style={{ color: '#38bdf8' }}>✓ Local Web Speech (Private)</span></li>
              <li><span style={{ color: '#cbd5e1' }}>✓ 24/7 Workshop Access</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-row">
          <div>
            © {new Date().getFullYear()} TailorHub Inc. Crafted with precision for bespoke fashion artisans.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Tailoring Heritage</span>
            <span style={{ color: '#e6af2e' }}>•</span>
            <span>Digital Precision</span>
          </div>
        </div>
      </footer>
    </>
  );
}
