import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import WorkflowSection from '../components/landing/WorkflowSection';
import LandingFooter from '../components/landing/LandingFooter';
import '../components/landing/landing.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Dynamic ambient lighting glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>
      <div className="ambient-glow-3"></div>
      <div className="grid-mesh-overlay"></div>

      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main>
        <LandingHero />
        <FeatureShowcase />
        <WorkflowSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
