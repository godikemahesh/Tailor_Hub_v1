import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingNavbar() {
  return (
    <div className="landing-nav-wrapper">
      <nav className="landing-nav">
        <Link to="/" className="brand-logo-group">
          <div className="brand-logo-icon">
            <Scissors size={20} color="#e6af2e" />
          </div>
          <div className="brand-name-wrap">
            <span className="brand-title">Tailor<span>Hub</span></span>
            <span className="brand-subtitle">Studio OS & Atelier Platform</span>
          </div>
        </Link>

        <div className="nav-links-desktop">
          <a href="#features" className="nav-link-item">Capabilities</a>
          <a href="#voice-tape" className="nav-link-item">Voice Tape</a>
          <a href="#spec-sheet" className="nav-link-item">Anti-Dispute Specs</a>
          <a href="#workflow" className="nav-link-item">How It Works</a>
        </div>

        <div className="nav-cta-actions">
          <Link to="/login" className="nav-btn-ghost">
            Sign In / Portals
          </Link>
          <Link to="/app" className="nav-btn-primary">
            <span>Launch Atelier App</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>
    </div>
  );
}
