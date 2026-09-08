import React, { useState } from 'react';
import { 
  Mic, 
  FileCheck2, 
  BookOpen, 
  Users, 
  Layers, 
  Check, 
  Sparkles, 
  Scissors,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Volume2,
  PhoneCall,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    id: 'voice-tape',
    title: 'Hands-Free Voice Tape Intake',
    tabLabel: 'Voice Tape',
    tag: 'Audio Intake • Zero Typing',
    icon: Mic,
    headline: 'Keep both hands on the measuring tape and cloth.',
    desc: 'Speak customer measurements naturally as you hold the tape. The intelligent on-device speech engine automatically detects numbers, parses fractions ("14 and a half" → 14.5), and instantly auto-fills digital measurement cards with clear audio confirmation.',
    benefits: [
      'Complete a 10-point custom measurement card in under 45 seconds',
      'Real-time hands-free auto-fill with audio feedback confirmation',
      'Intelligent echo filtering that ignores ambient shop chatter',
      '1-tap manual adjustment if a customer requests a looser or tighter fit'
    ],
    route: '/records',
    actionText: 'Try Voice Tape in Studio',
    visualType: 'voice'
  },
  {
    id: 'spec-sheet',
    title: 'Anti-Dispute 2D Visual Spec Sheet',
    tabLabel: 'Visual Specs',
    tag: 'Dispute Prevention • 2D Parametric',
    icon: FileCheck2,
    headline: 'Eliminate "This isn\'t what I told you" forever.',
    desc: 'Select modular visual styles like Sweetheart Front Neck, Deep U with Dori, and Puff Sleeves. Lock 2.5-inch inner seam margins into an indisputable digital job card with a 1-click printable cutting blueprint with QR tracking.',
    benefits: [
      'Real-time 2D parametric vector preview of garment anatomy & necklines',
      'Interactive inner seam margin slider (1.0" to 3.0" alteration allowance)',
      '1-Click printable PDF "Cutting Job Card" with QR code tracking',
      'Both tailor & client sign off digitally before scissors touch fabric'
    ],
    route: '/spec-sheet',
    actionText: 'Design 2D Spec Blueprint',
    visualType: 'blueprint'
  },
  {
    id: 'ocr-scanner',
    title: 'Physical Register & Notebook Scanner',
    tabLabel: 'Book Scanner',
    tag: 'Legacy Migration • Smart OCR',
    icon: BookOpen,
    headline: 'Digitize decades of paper registers in seconds.',
    desc: 'Snap a photo of your handwritten tailor register or measurement diary. The vision pipeline applies contrast correction, deskewing, and smart character recognition with a human-in-the-loop side-by-side verification interface.',
    benefits: [
      'Automatic extraction of customer names, phone numbers, and measurements',
      'Side-by-side verification: original photo crop on left, editable inputs on right',
      'Instantly imports legacy customer records into searchable cloud profiles',
      'Never lose a past client’s measurements when physical books wear out'
    ],
    route: '/records',
    actionText: 'Scan Physical Register',
    visualType: 'ocr'
  },
  {
    id: 'telephony-calls',
    title: 'Automated Trial Voice Call Alerts',
    tabLabel: 'Auto Phone Calls',
    tag: 'Customer Experience • Voice Dispatch',
    icon: PhoneCall,
    headline: 'Zero missed trials. Automated voice calls to customers.',
    desc: 'When a garment reaches the "Trial Ready" stage on your cutting table, TailorHub automatically triggers a personalized voice phone call to the customer in their preferred language, confirming their outfit is ready for trial fitting.',
    benefits: [
      'Automatic voice call dispatched immediately when order status hits Trial Ready',
      'Speaks the customer’s name, garment type, and atelier studio location',
      'Eliminates unread text messages, delayed pickups, and workshop rack clutter',
      'Real-time call dispatch log with call status and confirmation timestamps'
    ],
    route: '/tailor',
    actionText: 'Explore Order OS & Calls',
    visualType: 'telephony'
  },
  {
    id: 'multi-member',
    title: 'Multi-Member Family Wardrobe Vault',
    tabLabel: 'Family Vault',
    tag: 'Client Portal • Multi-Member',
    icon: Users,
    headline: 'One account, every family member’s bespoke sizes.',
    desc: 'Customers can save separate profiles for Self, Mom, Dad, and Kids with universal garment types (Blouse, Kurta, Formal Shirt, Trouser, Suit). Book any stitch with 1-click profile selection without re-measuring.',
    benefits: [
      'Saved measurement profiles with universal fit tolerances for the entire household',
      'Relationship tags ([Self], [Dad], [Mom], [Aarav]) for frictionless repeat bookings',
      'Flexible fabric logistics: doorstep fabric pickup or direct studio drop-off',
      'Complete personal tailoring archive with past orders and fit notes'
    ],
    route: '/customer',
    actionText: 'Open Customer Wardrobe',
    visualType: 'family'
  },
  {
    id: 'order-os',
    title: '5-Stage Order OS & Capacity Balancer',
    tabLabel: 'Atelier OS',
    tag: 'Shop Operations • Workload Balancing',
    icon: Layers,
    headline: 'Full transparency from cutting table to trial mirror.',
    desc: 'Track every garment across 5 distinct stages: Received, Cutting, Stitching, Trial Ready, and Delivered. Dynamic capacity planning prevents overbooking during festival rushes.',
    benefits: [
      'Live status sync between Tailor Workshop and Customer Tracker',
      'Daily workload slot limiter (e.g. 14/20 active garments) to prevent overbooking',
      'Automated trial-ready notifications with pick-up reminders',
      'Financial overview: advance deposits, balance due, and daily stitching revenue'
    ],
    route: '/tailor',
    actionText: 'Launch Tailor Atelier OS',
    visualType: 'timeline'
  }
];

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState(FEATURES[0].id);

  const currentFeature = FEATURES.find(f => f.id === activeTab) || FEATURES[0];

  return (
    <section className="features-section" id="features">
      {/* Section Header */}
      <div className="section-badge-center">
        <div className="section-pill">
          <Sparkles size={14} />
          <span>Core Capabilities</span>
        </div>
      </div>
      <h2 className="section-main-heading">Built Specifically for Master Tailors & Clients</h2>
      <p className="section-description">
        Eliminate errors, save hours on administrative bookkeeping, and deliver a luxury bespoke experience 
        that keeps customers returning for every wedding and festive season.
      </p>

      {/* Tabs Bar */}
      <div className="features-tab-nav">
        {FEATURES.map(feat => {
          const Icon = feat.icon;
          const isActive = feat.id === activeTab;
          return (
            <button
              key={feat.id}
              className={`tab-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(feat.id)}
            >
              <Icon size={16} />
              <span>{feat.tabLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Showcase Card */}
      <div className="tab-showcase-card">
        {/* Left Column: Description & Benefits */}
        <div className="tab-info-col">
          <span className="feature-tag-mini">{currentFeature.tag}</span>
          <h3 className="tab-feature-title">{currentFeature.headline}</h3>
          <p className="tab-feature-text">{currentFeature.desc}</p>

          <ul className="feature-benefit-list">
            {currentFeature.benefits.map((benefit, i) => (
              <li key={i} className="feature-benefit-item">
                <span className="check-icon-circle"><Check size={14} /></span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div>
            <Link to={currentFeature.route} className="btn-hero-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
              <span>{currentFeature.actionText}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Simulation Panel */}
        <div className="tab-visual-col">
          {currentFeature.visualType === 'voice' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '6px 14px', 
                  borderRadius: '9999px', 
                  background: 'rgba(230,175,46,0.15)', 
                  border: '1px solid #e6af2e',
                  color: '#ffd978',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  <Volume2 size={14} />
                  <span>Listening to Measuring Tape...</span>
                </div>
              </div>

              {/* Animated Wave Bars */}
              <div className="voice-wave-container">
                {[30, 65, 45, 80, 50, 90, 70, 40, 85, 55, 75, 35, 60].map((h, idx) => (
                  <div 
                    key={idx} 
                    className="wave-bar" 
                    style={{ 
                      height: `${h}%`,
                      animationDelay: `${idx * 0.08}s` 
                    }}
                  />
                ))}
              </div>

              {/* Spoken token stream */}
              <div className="spoken-pill-stream">
                <span className="spoken-token detected">✓ Chest: 38.5"</span>
                <span className="spoken-token detected">✓ Waist: 32"</span>
                <span className="spoken-token detected">✓ Shoulder: 16.5"</span>
                <span className="spoken-token detected">✓ Length: 29"</span>
                <span className="spoken-token" style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>
                  🎙️ "Arm Hole 18..."
                </span>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                Instant auto-filling measurement card with audio cue confirmation
              </div>
            </div>
          )}

          {currentFeature.visualType === 'blueprint' && (
            <div className="blueprint-wireframe">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e6af2e' }}>SVG Parametric Garment</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
                  Anti-Dispute Locked
                </span>
              </div>

              {/* Garment SVG */}
              <svg viewBox="0 0 200 140" style={{ width: '100%', height: '140px' }}>
                {/* Outer garment silhouette */}
                <path d="M 50,20 Q 100,55 150,20 L 170,120 L 30,120 Z" fill="rgba(230,175,46,0.05)" stroke="#e6af2e" strokeWidth="2" />
                {/* Sweetheart neck curve */}
                <path d="M 50,20 Q 75,50 100,42 Q 125,50 150,20" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                {/* Seam margin guide */}
                <path d="M 58,26 L 40,112 L 160,112 L 142,26" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="4,4" />
                {/* Callout */}
                <circle cx="100" cy="42" r="3" fill="#38bdf8" />
                <text x="100" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">SWEETHEART FRONT NECK</text>
                <text x="100" y="85" textAnchor="middle" fill="#eab308" fontSize="8">INTERNAL SEAM MARGIN: 2.5 INCH</text>
              </svg>

              <div className="margin-slider-simulation">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
                  <span>Inner Alteration Margin:</span>
                  <strong style={{ color: '#e6af2e' }}>2.5 Inches (Standard Royal)</strong>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative' }}>
                  <div style={{ width: '83%', height: '100%', background: '#e6af2e', borderRadius: '3px' }}></div>
                </div>
              </div>
            </div>
          )}

          {currentFeature.visualType === 'ocr' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Old paper register */}
              <div style={{ background: '#13110e', border: '1px solid #382d1d', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.72rem', color: '#e6af2e', marginBottom: '8px', fontWeight: 600 }}>
                  📷 Original Register Crop
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#d5c4a1', lineHeight: '1.6', background: '#1c1813', padding: '10px', borderRadius: '6px', border: '1px dashed #504945' }}>
                  <div>Name: Sunita Verma</div>
                  <div>Phone: 98765-43210</div>
                  <div>Ch: 36, W: 30</div>
                  <div>Blouse Sweetheart</div>
                  <div>Adv: 500 Paid</div>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#8c7b64', marginTop: '6px' }}>
                  High-Contrast Binarized & Deskewed
                </div>
              </div>

              {/* Extracted Structured Record */}
              <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.72rem', color: '#4ade80', marginBottom: '8px', fontWeight: 600 }}>
                  ⚡ Digital Cloud Profile
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#f1f5f9' }}>
                    <strong>Client:</strong> Sunita Verma
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#f1f5f9' }}>
                    <strong>Phone:</strong> +91 98765 43210
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#4ade80' }}>
                    <strong>Chest:</strong> 36" • <strong>Waist:</strong> 30"
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: '4px', fontWeight: 600 }}>
                    ✓ 100% Verified into Ledger
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentFeature.visualType === 'telephony' && (
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(13,17,26,0.95) 100%)', 
              border: '1px solid rgba(34,197,94,0.3)', 
              borderRadius: '12px', 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: '#22c55e', 
                    color: '#07090e',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <PhoneCall size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                      Automated Voice Call Dispatched
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#4ade80' }}>
                      ● Connected • Stage: Trial Ready
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '9999px', background: 'rgba(34,197,94,0.2)', color: '#4ade80', fontWeight: 600 }}>
                  0:18 Active
                </span>
              </div>

              {/* Call Target Card */}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Target Customer:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffd978' }}>
                  Ananya Sen • +91 98765 43210
                </div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                  Order #TH-8842 (Bridal Silk Blouse)
                </div>
              </div>

              {/* Spoken Telephony Script Simulation */}
              <div style={{ 
                background: '#0a0e17', 
                borderRadius: '8px', 
                padding: '10px 12px', 
                fontSize: '0.75rem', 
                lineHeight: '1.5', 
                color: '#e2e8f0', 
                borderLeft: '3px solid #22c55e',
                fontStyle: 'italic'
              }}>
                "Namaskaram Ananya garu! Your Bridal Silk Blouse is completed and ready for trial fitting at Royal Stitch Studio. Please visit us at your earliest convenience!"
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#22c55e', fontWeight: 600 }}>
                <span>✓ Customer Alerted Automatically</span>
                <span>✓ Zero Fitting Delay</span>
              </div>
            </div>
          )}

          {currentFeature.visualType === 'family' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e6af2e', marginBottom: '4px' }}>
                Family Profile Vault & Switcher
              </div>
              
              {[
                { name: 'My Profile (Self)', tag: 'Self', garment: 'Silk Saree Blouse (34")', orders: 8, active: true },
                { name: 'Mom (Kavita)', tag: 'Mom', garment: 'Anarkali Kurta Set (38")', orders: 4, active: false },
                { name: 'Dad (Ramesh)', tag: 'Dad', garment: 'Formal Oxford Shirt (40")', orders: 6, active: false },
                { name: 'Aarav', tag: 'Son', garment: 'School Uniform Blazer (28")', orders: 2, active: false }
              ].map((member, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: member.active ? 'rgba(230,175,46,0.12)' : 'rgba(255,255,255,0.02)',
                    border: member.active ? '1px solid #e6af2e' : '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      background: member.active ? '#e6af2e' : '#334155',
                      color: member.active ? '#07090e' : '#ffffff',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: member.active ? '#ffd978' : '#e2e8f0' }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{member.garment}</div>
                    </div>
                  </div>

                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    background: member.active ? '#e6af2e' : 'rgba(255,255,255,0.05)',
                    color: member.active ? '#07090e' : '#cbd5e1',
                    fontWeight: 600
                  }}>
                    {member.active ? 'Selected' : 'Select'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {currentFeature.visualType === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e6af2e' }}>Workshop Status Flow</span>
                <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600 }}>Capacity: 14/20 Active ✓</span>
              </div>

              {[
                { step: '1. Order Received & Spec Locked', status: 'Completed', time: 'Yesterday, 10:30 AM', done: true },
                { step: '2. Pattern & Fabric Cutting', status: 'Completed', time: 'Yesterday, 4:15 PM', done: true },
                { step: '3. Master Stitching & Seam Margin', status: 'In Progress (Active)', time: 'Today, On Table', current: true },
                { step: '4. Trial Fitting & Automated Call', status: 'Ready to Dispatch', time: 'Tomorrow, 3:00 PM', done: false },
                { step: '5. Handover & Delivery', status: 'Pending', time: 'Saturday', done: false },
              ].map((stage, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: stage.current ? 'rgba(230,175,46,0.12)' : 'rgba(255,255,255,0.02)',
                    border: stage.current ? '1px solid rgba(230,175,46,0.35)' : '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '18px', 
                      height: '18px', 
                      borderRadius: '50%', 
                      background: stage.done ? '#22c55e' : (stage.current ? '#e6af2e' : '#334155'),
                      color: '#ffffff',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.65rem'
                    }}>
                      {stage.done ? '✓' : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: stage.current ? '#ffd978' : '#e2e8f0', fontWeight: stage.current ? 600 : 400 }}>
                      {stage.step}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{stage.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
