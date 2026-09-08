import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { store } from '../services/store';
import { 
  Scissors, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Star, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Calendar,
  Search,
  CheckCircle2,
  Users
} from 'lucide-react';
import './DesignAndBookPage.css';

const GARMENT_TYPES = [
  { id: 'blouse', label: 'Bridal & Saree Blouse', icon: '👘', basePrice: 2200 },
  { id: 'shirt', label: 'Formal & Casual Shirt', icon: '👔', basePrice: 1600 },
  { id: 'suit', label: 'Anarkali & Salwar Suit', icon: '👗', basePrice: 2800 },
  { id: 'trouser', label: 'Bespoke Trouser / Pant', icon: '👖', basePrice: 1400 },
  { id: 'bandhgala', label: 'Bandhgala / Jodhpuri Suit', icon: '🧥', basePrice: 6500 },
];

const FRONT_NECKS = [
  { id: 'sweetheart', label: 'Sweetheart Neck', d: 'M 40,20 Q 75,55 100,45 Q 125,55 160,20' },
  { id: 'deep_u', label: 'Deep U-Neck', d: 'M 40,20 C 50,75 150,75 160,20' },
  { id: 'boat', label: 'Boat Neck', d: 'M 40,20 Q 100,32 160,20' },
  { id: 'v_neck', label: 'Classic V-Neck', d: 'M 40,20 L 100,60 L 160,20' },
  { id: 'square', label: 'Royal Square', d: 'M 40,20 L 55,55 L 145,55 L 160,20' }
];

const SLEEVE_STYLES = [
  { id: 'elbow_puff', label: 'Elbow-Length Puff', desc: 'Pleated gathers at shoulder & elbow cuff' },
  { id: 'sleeveless', label: 'Sleeveless Style', desc: 'Piped armhole with bias binding' },
  { id: 'cap_sleeve', label: 'Cap / Mega Sleeve', desc: 'Short 4-inch angled cap sleeve' },
  { id: 'full_sleeve', label: 'Full Length Sleeve', desc: 'Fitted wrist with pearl loop buttons' }
];

const BACK_STYLES = [
  { id: 'deep_u_dori', label: 'Deep U with Latkan Dori', desc: 'Handcrafted dori tassels' },
  { id: 'potli_buttons', label: 'Potli Button Row', desc: 'Fabric loop closures' },
  { id: 'keyhole', label: 'Teardrop Keyhole', desc: 'Oval cutout with top hook' },
  { id: 'sheer_net', label: 'Sheer Illusion Back', desc: 'Skin net with border zardozi' }
];

export default function DesignAndBookPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Customize, 2: Select Tailor, 3: Success Confirmation

  const FAMILY_MEMBERS = [
    { id: 'Self', name: user?.full_name ? `${user.full_name} (Self)` : 'My Fit Profile (Self)', relation: 'Self', defaultGarment: 'blouse' },
    { id: 'Mom', name: 'Mom (Kavita)', relation: 'Mom', defaultGarment: 'suit' },
    { id: 'Dad', name: 'Dad (Ramesh)', relation: 'Dad', defaultGarment: 'shirt' },
    { id: 'Aarav', name: 'Son (Aarav)', relation: 'Son', defaultGarment: 'shirt' },
  ];

  const referencePost = location.state?.referencePost;

  // Step 1: Customization State (Pre-filled if coming from an Explore Showcase post)
  const [selectedGarment, setSelectedGarment] = useState(referencePost?.garment_category || 'blouse');
  const [selectedMember, setSelectedMember] = useState(location.state?.member || 'Self');
  const [frontNeck, setFrontNeck] = useState(referencePost?.front_neck || 'sweetheart');
  const [sleeveStyle, setSleeveStyle] = useState(referencePost?.sleeve_style || 'elbow_puff');
  const [backStyle, setBackStyle] = useState(referencePost?.back_neck || 'deep_u_dori');
  const [marginAllowance, setMarginAllowance] = useState(referencePost?.margin_inches || 2.5); // inches
  const [hasPads, setHasPads] = useState(true);
  const [lining, setLining] = useState('Pure Mulmul Cotton');
  const [fabricNotes, setFabricNotes] = useState(
    referencePost
      ? `${referencePost.fabric_details || 'Pure Sourced Silk'} • Recreating style from Master ${referencePost.tailor_name}'s showcase "${referencePost.title}"`
      : 'Crimson Raw Silk • Golden tassels provided with fabric.'
  );

  // Step 2: Tailors List from store (includes all registered tailors!)
  const [tailors, setTailors] = useState([]);
  const [selectedTailor, setSelectedTailor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Step 3: Booked Order Info
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    // Load tailors (dynamic list including newly registered tailors!)
    const allTailors = store.getTailors();
    setTailors(allTailors);
    if (referencePost?.tailor_id) {
      const match = allTailors.find(t => t.tailor_id === referencePost.tailor_id);
      if (match) {
        setSelectedTailor(match);
        return;
      }
    }
    if (allTailors.length > 0) {
      setSelectedTailor(allTailors[0]);
    }
  }, [referencePost]);

  const activeNeck = FRONT_NECKS.find(n => n.id === frontNeck) || FRONT_NECKS[0];
  const activeGarment = GARMENT_TYPES.find(g => g.id === selectedGarment) || GARMENT_TYPES[0];

  const handleProceedToTailors = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookWithTailor = (tailor) => {
    setSelectedTailor(tailor);

    // Create the order with 2D visual specs conforming to schema.sql
    const orderPayload = {
      customer_id: user?.id || 'cust-demo-1',
      customer_name: user?.full_name || 'Customer',
      customer_phone: user?.phone_number || '+91 98765 43210',
      tailor_id: tailor.tailor_id,
      tailor_name: tailor.full_name,
      shop_name: tailor.shop_name,
      member_name: selectedMember,
      garment_type: `${activeGarment.label}`,
      base_price: tailor.base_stitching_rate || activeGarment.basePrice,
      total_price: tailor.base_stitching_rate || activeGarment.basePrice,
      advance_paid: 1000,
      promised_date: 'In 5 Days',
      measurements_snapshot: {
        chest: '36.0',
        waist: '30.0',
        shoulder: '14.5',
        front_length: '14.0',
        sleeve_length: '10.5'
      },
      visual_specs: {
        front_neck_style: frontNeck,
        front_neck_label: activeNeck.label,
        back_neck_style: backStyle,
        back_neck_label: BACK_STYLES.find(b => b.id === backStyle)?.label,
        sleeve_style: sleeveStyle,
        sleeve_label: SLEEVE_STYLES.find(s => s.id === sleeveStyle)?.label,
        lining_type: lining,
        pads_type: hasPads ? 'Included (Sewn-in)' : 'None',
        internal_margin_inches: marginAllowance,
        fabric_color: fabricNotes,
        special_instructions: `Custom design created by client. Internal seam margin of ${marginAllowance}" locked. Lining: ${lining}.`
      }
    };

    const newOrder = store.createOrder(orderPayload);
    setCreatedOrder(newOrder);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredTailors = tailors.filter(t => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="design-book-container">
      {/* Step Indicator Header */}
      <div className="flow-stepper-header">
        <div className="stepper-track">
          <div className={`track-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="track-number">{step > 1 ? '✓' : '1'}</div>
            <div className="track-label">
              <span className="step-num">Step 1</span>
              <span className="step-name">Customize 2D Garment</span>
            </div>
          </div>

          <div className="track-line"></div>

          <div className={`track-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="track-number">{step > 2 ? '✓' : '2'}</div>
            <div className="track-label">
              <span className="step-num">Step 2</span>
              <span className="step-name">Select Master Tailor</span>
            </div>
          </div>

          <div className="track-line"></div>

          <div className={`track-step ${step >= 3 ? 'active' : ''}`}>
            <div className="track-number">3</div>
            <div className="track-label">
              <span className="step-num">Step 3</span>
              <span className="step-name">Order Booked</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STEP 1: CUSTOMIZE GARMENT ── */}
      {step === 1 && (
        <div className="step-content-box">
          <div className="step-title-row">
            <div>
              <div className="step-badge-mini">Bespoke Design Studio</div>
              <h1 className="step-heading">Choose & Customize What to Order</h1>
              <p className="step-desc">
                Select your garment, personalize neckline, sleeves, and lock your 2.5" alteration margin.
              </p>
            </div>

            <button 
              type="button" 
              className="action-pill-btn primary"
              onClick={handleProceedToTailors}
            >
              <span>Next: Select Master Tailor</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Inspiration Showcase Reference Banner */}
          {referencePost && (
            <div className="inspiration-ref-banner">
              <div className="ref-banner-content">
                <img 
                  src={referencePost.image_url} 
                  alt={referencePost.title} 
                  className="ref-banner-thumb" 
                />
                <div className="ref-banner-text">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <Sparkles size={14} color="#e6af2e" />
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#e6af2e', fontWeight: 700 }}>
                      Recreating Master Tailor Creation
                    </span>
                  </div>
                  <h4>{referencePost.title}</h4>
                  <p>By {referencePost.tailor_name} ({referencePost.shop_name}) • {referencePost.fabric_details}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Estimated Stitching</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e6af2e' }}>₹{referencePost.estimated_price?.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Garment Selector Bar */}
          <div className="garment-cards-selector">
            {GARMENT_TYPES.map(g => (
              <div 
                key={g.id}
                className={`garment-select-card ${selectedGarment === g.id ? 'active' : ''}`}
                onClick={() => setSelectedGarment(g.id)}
              >
                <div className="garment-emoji">{g.icon}</div>
                <div className="garment-card-title">{g.label}</div>
                <div className="garment-card-rate">Starts from ₹{g.basePrice}</div>
              </div>
            ))}
          </div>

          {/* Family Member Selection */}
          <div className="family-selector-row">
            <span className="family-sel-label">Stitching For:</span>
            <div className="family-sel-chips">
              {FAMILY_MEMBERS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  className={`family-chip-btn ${selectedMember === m.id ? 'active' : ''}`}
                  onClick={() => setSelectedMember(m.id)}
                >
                  [{m.relation}] {m.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Studio Grid: 2D Live Vector Canvas on Left, Modular Controls on Right */}
          <div className="spec-studio-grid" style={{ marginTop: '1.5rem' }}>
            {/* Left: 2D Parametric SVG Garment Canvas */}
            <div className="garment-canvas-panel">
              <div className="canvas-header">
                <span className="canvas-label">2D Composite Blueprint Preview</span>
                <span className="canvas-badge-locked">
                  <ShieldCheck size={13} />
                  <span>2.5" Margin Locked</span>
                </span>
              </div>

              <div className="svg-canvas-stage">
                <svg viewBox="0 0 200 240" className="garment-blueprint-svg">
                  {/* Bodice silhouette */}
                  <path 
                    d="M 40,30 L 20,80 L 35,95 L 45,75 L 45,210 L 155,210 L 155,75 L 165,95 L 180,80 L 160,30 Z" 
                    fill="#fdfbf7" 
                    stroke="#2b3990" 
                    strokeWidth="2.5" 
                  />
                  
                  {/* Dynamic Neckline curve */}
                  <path 
                    d={activeNeck.d} 
                    fill="none" 
                    stroke="#c99318" 
                    strokeWidth="3.2" 
                    strokeLinecap="round" 
                  />

                  {/* Inner Seam Margin Visual Lines (dashed) */}
                  <line 
                    x1={45 + marginAllowance * 4} 
                    y1="75" 
                    x2={45 + marginAllowance * 4} 
                    y2="210" 
                    stroke="#dc2626" 
                    strokeWidth="1.5" 
                    strokeDasharray="4,4" 
                  />
                  <line 
                    x1={155 - marginAllowance * 4} 
                    y1="75" 
                    x2={155 - marginAllowance * 4} 
                    y2="210" 
                    stroke="#dc2626" 
                    strokeWidth="1.5" 
                    strokeDasharray="4,4" 
                  />

                  {/* Waist line */}
                  <line x1="45" y1="210" x2="155" y2="210" stroke="#2b3990" strokeWidth="2" />

                  {/* Callout */}
                  <rect x="50" y="135" width="100" height="26" rx="5" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
                  <text x="100" y="152" textAnchor="middle" fill="#92400e" fontSize="9" fontWeight="700">
                    {marginAllowance}" INNER SEAM MARGIN
                  </text>

                  <text x="100" y="70" textAnchor="middle" fill="#7c7267" fontSize="8" fontWeight="600">
                    {activeNeck.label.toUpperCase()}
                  </text>
                </svg>
              </div>

              <div className="canvas-legend">
                <div className="legend-item">
                  <span className="legend-swatch gold"></span>
                  <span>Neck: <strong>{activeNeck.label}</strong></span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch red-dashed"></span>
                  <span>Alteration Allowance: <strong>{marginAllowance} Inches</strong></span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch blue"></span>
                  <span>Sleeve: <strong>{SLEEVE_STYLES.find(s => s.id === sleeveStyle)?.label}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Modular Customization Controls */}
            <div className="spec-controls-panel">
              {/* Front Neckline */}
              <div className="control-card">
                <h3 className="control-section-title">1. Front Neckline Style</h3>
                <div className="neck-options-grid">
                  {FRONT_NECKS.map(n => (
                    <button
                      key={n.id}
                      type="button"
                      className={`neck-option-btn ${frontNeck === n.id ? 'active' : ''}`}
                      onClick={() => setFrontNeck(n.id)}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleeve Style */}
              <div className="control-card">
                <h3 className="control-section-title">2. Sleeve Style</h3>
                <div className="sleeve-options-list">
                  {SLEEVE_STYLES.map(s => (
                    <label key={s.id} className={`radio-card-label ${sleeveStyle === s.id ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="sleeve" 
                        checked={sleeveStyle === s.id} 
                        onChange={() => setSleeveStyle(s.id)}
                      />
                      <div>
                        <div className="radio-card-title">{s.label}</div>
                        <div className="radio-card-sub">{s.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Back Cut */}
              <div className="control-card">
                <h3 className="control-section-title">3. Back Cut & Latkan Dori</h3>
                <div className="sleeve-options-list">
                  {BACK_STYLES.map(b => (
                    <label key={b.id} className={`radio-card-label ${backStyle === b.id ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="back" 
                        checked={backStyle === b.id} 
                        onChange={() => setBackStyle(b.id)}
                      />
                      <div>
                        <div className="radio-card-title">{b.label}</div>
                        <div className="radio-card-sub">{b.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Internal Seam Margin Slider */}
              <div className="control-card margin-highlight-card">
                <div className="margin-slider-header">
                  <div>
                    <h3 className="control-section-title text-amber">Internal Seam Alteration Margin</h3>
                    <p style={{ fontSize: '0.8rem', color: '#7c7267' }}>
                      Inner fabric allowance for future adjustments.
                    </p>
                  </div>
                  <div className="margin-badge-value">
                    {marginAllowance} Inches
                  </div>
                </div>

                <input 
                  type="range" 
                  min="1.0" 
                  max="3.0" 
                  step="0.5" 
                  value={marginAllowance} 
                  onChange={e => setMarginAllowance(parseFloat(e.target.value))}
                  className="margin-range-slider"
                />

                <div className="slider-ticks-row">
                  <span>1.0" (Slim)</span>
                  <span>1.5"</span>
                  <span>2.0" (Standard)</span>
                  <span>2.5" (Royal Safe)</span>
                  <span>3.0" (Max)</span>
                </div>
              </div>

              {/* Pads, Lining & Notes */}
              <div className="control-card">
                <h3 className="control-section-title">Lining, Pads & Fabric Notes</h3>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={hasPads} 
                      onChange={e => setHasPads(e.target.checked)} 
                    />
                    <span>Include Padded Cups</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Lining Fabric:</span>
                    <select 
                      value={lining} 
                      onChange={e => setLining(e.target.value)}
                      className="control-select"
                    >
                      <option value="Pure Mulmul Cotton">Pure Mulmul Cotton</option>
                      <option value="Butter Crepe">Butter Crepe</option>
                      <option value="Satin Silk">Satin Silk</option>
                      <option value="None">No Lining</option>
                    </select>
                  </label>
                </div>

                <div className="control-group">
                  <label>Fabric Description & Tailor Instructions</label>
                  <textarea 
                    rows={2} 
                    value={fabricNotes}
                    onChange={e => setFabricNotes(e.target.value)}
                    className="control-textarea"
                  />
                </div>
              </div>

              {/* Bottom CTA to Step 2 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="action-pill-btn primary"
                  style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
                  onClick={handleProceedToTailors}
                >
                  <span>Select Master Tailor for this Design →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: SELECT TAILOR ── */}
      {step === 2 && (
        <div className="step-content-box">
          <div className="step-title-row">
            <div>
              <button 
                type="button" 
                className="action-pill-btn secondary"
                onClick={() => setStep(1)}
                style={{ marginBottom: '1rem' }}
              >
                <ArrowLeft size={15} />
                <span>Back to 2D Garment Customizer</span>
              </button>
              <h1 className="step-heading">Select Your Master Tailor</h1>
              <p className="step-desc">
                Review verified master ateliers nearby. Each card displays their photo, experience, specialization, distance away, and workshop address.
              </p>
            </div>

            <div className="search-bar-wrapper" style={{ maxWidth: '340px' }}>
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search tailors by name, city, or specialty..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="header-search-input"
              />
            </div>
          </div>

          {/* Current Customized Garment Pill Summary */}
          <div className="customized-summary-banner">
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#7c7267', fontWeight: 700 }}>Custom Outfit Blueprint:</span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e1b18' }}>
                {activeGarment.label} for [{selectedMember}]
              </div>
              <div style={{ fontSize: '0.82rem', color: '#574e44' }}>
                {activeNeck.label} • {SLEEVE_STYLES.find(s => s.id === sleeveStyle)?.label} • {marginAllowance}" Margin Locked
              </div>
            </div>
            <button 
              type="button" 
              className="action-pill-btn secondary"
              onClick={() => setStep(1)}
            >
              Edit Design
            </button>
          </div>

          {/* Master Tailors Cards Grid */}
          <div className="tailor-cards-grid">
            {filteredTailors.map(tailor => (
              <div key={tailor.id} className="tailor-card">
                <div className="tailor-card-header">
                  {/* Tailor Photo */}
                  <img 
                    src={tailor.avatar_url} 
                    alt={tailor.full_name} 
                    className="tailor-photo-img" 
                  />

                  <div className="tailor-main-info">
                    <div className="tailor-name-row">
                      <h3 className="tailor-full-name">{tailor.full_name}</h3>
                      <div className="tailor-rating-badge">
                        <Star size={12} fill="#e6af2e" color="#e6af2e" />
                        <span>{tailor.rating}</span>
                        <span className="reviews-num">({tailor.reviews_count})</span>
                      </div>
                    </div>

                    <div className="tailor-shop-title">{tailor.shop_name}</div>
                    
                    {/* Distance Pill */}
                    <div className="tailor-distance-pill">
                      <MapPin size={13} />
                      <span>{tailor.distance_km} kms away</span>
                    </div>
                  </div>
                </div>

                <div className="tailor-card-body">
                  {/* Experience Badge */}
                  <div className="tailor-detail-row">
                    <Briefcase size={14} className="detail-icon" />
                    <div>
                      <span className="detail-label">Experience:</span>
                      <strong className="detail-val">{tailor.experience_years} Years Master Craftsman</strong>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="tailor-detail-row">
                    <Sparkles size={14} className="detail-icon" />
                    <div>
                      <span className="detail-label">Specialization:</span>
                      <div className="specialization-text">{tailor.specialization}</div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="tailor-detail-row">
                    <MapPin size={14} className="detail-icon" />
                    <div>
                      <span className="detail-label">Workshop Address:</span>
                      <div className="tailor-address-text">{tailor.address}, {tailor.city} - {tailor.pincode}</div>
                    </div>
                  </div>

                  {/* Capacity / Slots */}
                  <div className="tailor-capacity-pill">
                    <span className="pulse-dot"></span>
                    <span>Accepting Orders • {tailor.available_slots} slots available this week</span>
                  </div>
                </div>

                {/* Footer with Price and Book Button */}
                <div className="tailor-card-footer">
                  <div>
                    <span className="rate-label">Stitching Rate:</span>
                    <div className="rate-value">₹ {tailor.base_stitching_rate || activeGarment.basePrice}</div>
                  </div>

                  <button
                    type="button"
                    className="book-with-tailor-btn"
                    onClick={() => handleBookWithTailor(tailor)}
                  >
                    <span>Book Order with this Tailor</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: ORDER BOOKED CONFIRMATION ── */}
      {step === 3 && createdOrder && (
        <div className="step-content-box order-success-box">
          <div className="success-icon-circle">
            <CheckCircle2 size={44} color="#ffffff" />
          </div>

          <h1 className="success-title">Order Booked Successfully!</h1>
          <p className="success-sub">
            Your custom design and 2D specification blueprint have been sent to <strong>{createdOrder.tailor_name}</strong> at <strong>{createdOrder.shop_name}</strong>.
          </p>

          <div className="success-receipt-card">
            <div className="receipt-header">
              <div>
                <span className="receipt-tag">Official Job Order</span>
                <div className="receipt-order-id">{createdOrder.order_number}</div>
              </div>
              <span className="receipt-stage-badge">Status: Received</span>
            </div>

            <div className="receipt-grid">
              <div>
                <span className="receipt-label">Customer</span>
                <div className="receipt-val">{createdOrder.customer_name}</div>
                <div style={{ fontSize: '0.75rem', color: '#7c7267' }}>{createdOrder.customer_phone}</div>
              </div>

              <div>
                <span className="receipt-label">Master Tailor</span>
                <div className="receipt-val">{createdOrder.tailor_name}</div>
                <div style={{ fontSize: '0.75rem', color: '#7c7267' }}>{createdOrder.shop_name}</div>
              </div>

              <div>
                <span className="receipt-label">Garment</span>
                <div className="receipt-val">{createdOrder.garment_type}</div>
                <div style={{ fontSize: '0.75rem', color: '#7c7267' }}>For [{createdOrder.member_name}]</div>
              </div>

              <div>
                <span className="receipt-label">Estimated Delivery</span>
                <div className="receipt-val">{createdOrder.promised_date}</div>
              </div>
            </div>

            {/* 2D Design Blueprint Snapshot */}
            <div className="receipt-specs-box">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2b3990', marginBottom: '8px' }}>
                Locked 2D Visual Blueprint Specifications:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#1e1b18', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Front Neckline:</strong> {createdOrder.visual_specs.front_neck_label}</li>
                <li><strong>Sleeve Style:</strong> {createdOrder.visual_specs.sleeve_label}</li>
                <li><strong>Back Cut:</strong> {createdOrder.visual_specs.back_neck_label}</li>
                <li><strong>Internal Alteration Margin:</strong> {createdOrder.visual_specs.internal_margin_inches} Inches (Anti-Dispute Locked)</li>
                <li><strong>Cups & Lining:</strong> {createdOrder.visual_specs.pads_type} • {createdOrder.visual_specs.lining_type}</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="button" 
              className="action-pill-btn secondary"
              onClick={() => navigate('/orders')}
            >
              View in Live Orders Tracker
            </button>
            <button 
              type="button" 
              className="action-pill-btn primary"
              onClick={() => navigate('/customer')}
            >
              Go to Customer Wardrobe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
