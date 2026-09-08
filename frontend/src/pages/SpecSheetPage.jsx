import React, { useState } from 'react';
import { 
  FileCheck2, 
  Download, 
  Printer, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Scissors, 
  Save, 
  RotateCcw,
  Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const FRONT_NECK_OPTIONS = [
  { id: 'sweetheart', label: 'Sweetheart', d: 'M 40,20 Q 75,55 100,45 Q 125,55 160,20' },
  { id: 'deep_u', label: 'Deep U-Neck', d: 'M 40,20 C 50,75 150,75 160,20' },
  { id: 'boat', label: 'Boat Neck', d: 'M 40,20 Q 100,32 160,20' },
  { id: 'v_neck', label: 'Classic V-Neck', d: 'M 40,20 L 100,60 L 160,20' },
  { id: 'square', label: 'Royal Square', d: 'M 40,20 L 55,55 L 145,55 L 160,20' }
];

const SLEEVE_OPTIONS = [
  { id: 'elbow_puff', label: 'Elbow-Length Puff', desc: 'Pleated gathers at shoulder & cuff' },
  { id: 'sleeveless', label: 'Sleeveless', desc: 'Piped armhole with bias binding' },
  { id: 'mega_sleeve', label: 'Cap / Mega Sleeve', desc: 'Short 4-inch angled cut' },
  { id: 'full_sleeve', label: 'Full Sleeve (Wrist)', desc: 'Fitted wrist with pearl loop buttons' }
];

const BACK_OPTIONS = [
  { id: 'deep_u_dori', label: 'Deep U with Latkan Dori', desc: 'Tie dori with tassels' },
  { id: 'potli_buttons', label: 'High Neck with Potli Buttons', desc: 'Fabric loop closures' },
  { id: 'teardrop_keyhole', label: 'Teardrop Keyhole', desc: 'Oval cutout with top clasp' },
  { id: 'sheer_net', label: 'Sheer Illusion Net Back', desc: 'Skin net with zardozi border' }
];

export default function SpecSheetPage() {
  const [garmentType, setGarmentType] = useState('blouse');
  const [clientName, setClientName] = useState('Ananya Sen');
  const [orderNumber, setOrderNumber] = useState('TH-8842');
  const [frontNeck, setFrontNeck] = useState('sweetheart');
  const [sleeveType, setSleeveType] = useState('elbow_puff');
  const [backType, setBackType] = useState('deep_u_dori');
  const [marginAllowance, setMarginAllowance] = useState(2.5); // inches
  const [hasPads, setHasPads] = useState(true);
  const [liningFabric, setLiningFabric] = useState('cotton');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedNeck = FRONT_NECK_OPTIONS.find(n => n.id === frontNeck) || FRONT_NECK_OPTIONS[0];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(43, 57, 144);
    doc.text('TAILORHUB — BESPOKE CUTTING JOB CARD', 20, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Official Master Atelier Blueprint • Anti-Dispute Specification Sheet`, 20, 28);
    doc.line(20, 32, 190, 32);

    // Job Metadata
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 27, 24);
    doc.text(`Job Order #: ${orderNumber}`, 20, 42);
    doc.text(`Client Name: ${clientName}`, 110, 42);
    doc.text(`Garment: ${garmentType.toUpperCase()} (Bespoke)`, 20, 50);
    doc.text(`Target Delivery: Sep 10, 2026`, 110, 50);

    // Specifications Box
    doc.setFillColor(247, 244, 238);
    doc.rect(20, 58, 170, 48, 'F');
    doc.rect(20, 58, 170, 48, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 57, 144);
    doc.text('LOCKED SPECIFICATIONS', 25, 66);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(`• Front Neckline: ${selectedNeck.label}`, 25, 74);
    doc.text(`• Sleeve Styling: ${SLEEVE_OPTIONS.find(s => s.id === sleeveType)?.label}`, 25, 82);
    doc.text(`• Back Style: ${BACK_OPTIONS.find(b => b.id === backType)?.label}`, 25, 90);
    doc.text(`• Padding: ${hasPads ? 'Included (Sewn-in)' : 'None'}  |  Lining: ${liningFabric.toUpperCase()}`, 25, 98);

    // Internal Seam Margin Highlight
    doc.setFillColor(254, 243, 199);
    doc.rect(20, 112, 170, 24, 'F');
    doc.rect(20, 112, 170, 24, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(`CRITICAL SEAM ALLOWANCE: ${marginAllowance} INCHES`, 25, 122);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    doc.text(`Master cutter MUST leave an internal margin of at least ${marginAllowance}" inside side seams for future body adjustments.`, 25, 129);

    // Sign-off
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Customer Digital Signature: [Verified on App]', 25, 150);
    doc.text('Master Tailor Sign-off: Rajesh Kumar (Royal Stitch)', 110, 150);

    doc.save(`TailorHub_JobCard_${orderNumber}.pdf`);
  };

  const handleSaveBlueprint = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="spec-sheet-container">
      {/* Header */}
      <div className="spec-page-header">
        <div>
          <div className="atelier-badge">
            <ShieldCheck size={14} />
            <span>Anti-Dispute Blueprint Studio</span>
          </div>
          <h1 className="atelier-title">Visual Spec Sheet & Job Card Builder</h1>
          <p className="atelier-subtitle">
            Configure modular garment visual anatomy. Lock 2.5" inner alteration margins to eliminate fabric disputes.
          </p>
        </div>

        <div className="quick-actions-bar">
          <button 
            type="button" 
            className="action-pill-btn secondary"
            onClick={handleDownloadPDF}
          >
            <Download size={15} />
            <span>Print Cutting Job Card (PDF)</span>
          </button>
          <button 
            type="button" 
            className="action-pill-btn primary"
            onClick={handleSaveBlueprint}
          >
            {savedSuccess ? <Check size={15} /> : <Save size={15} />}
            <span>{savedSuccess ? 'Spec Sheet Locked!' : 'Save & Lock Blueprint'}</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Visual Canvas on Left, Controls on Right */}
      <div className="spec-studio-grid">
        {/* Left: 2D Parametric SVG Garment Canvas */}
        <div className="garment-canvas-panel">
          <div className="canvas-header">
            <span className="canvas-label">2D Vector Blueprint Preview</span>
            <span className="canvas-badge-locked">
              <ShieldCheck size={13} />
              <span>Anti-Dispute Certified</span>
            </span>
          </div>

          <div className="svg-canvas-stage">
            <svg viewBox="0 0 200 240" className="garment-blueprint-svg">
              {/* Outer bodice silhouette */}
              <path 
                d="M 40,30 L 20,80 L 35,95 L 45,75 L 45,210 L 155,210 L 155,75 L 165,95 L 180,80 L 160,30 Z" 
                fill="#fdfbf7" 
                stroke="#2b3990" 
                strokeWidth="2.5" 
              />
              
              {/* Dynamic Neckline */}
              <path 
                d={selectedNeck.d} 
                fill="none" 
                stroke="#c99318" 
                strokeWidth="3" 
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

              {/* Waist Hemline */}
              <line x1="45" y1="210" x2="155" y2="210" stroke="#2b3990" strokeWidth="2" />

              {/* Seam Margin Callout Label */}
              <rect x="55" y="140" width="90" height="24" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
              <text x="100" y="156" textAnchor="middle" fill="#92400e" fontSize="9" fontWeight="700">
                {marginAllowance}" INNER SEAM MARGIN
              </text>

              {/* Neckline Label */}
              <text x="100" y="70" textAnchor="middle" fill="#7c7267" fontSize="8" fontWeight="600">
                {selectedNeck.label.toUpperCase()} NECK
              </text>
            </svg>
          </div>

          <div className="canvas-legend">
            <div className="legend-item">
              <span className="legend-swatch gold"></span>
              <span>Neckline: {selectedNeck.label}</span>
            </div>
            <div className="legend-item">
              <span className="legend-swatch red-dashed"></span>
              <span>Margin: {marginAllowance} Inch Allowance</span>
            </div>
            <div className="legend-item">
              <span className="legend-swatch blue"></span>
              <span>Sleeve: {SLEEVE_OPTIONS.find(s => s.id === sleeveType)?.label}</span>
            </div>
          </div>
        </div>

        {/* Right: Modular Spec Controls */}
        <div className="spec-controls-panel">
          {/* Client & Order details */}
          <div className="control-card">
            <h3 className="control-section-title">Order Information</h3>
            <div className="control-input-row">
              <div className="control-group">
                <label>Job Order Number</label>
                <input 
                  type="text" 
                  value={orderNumber} 
                  onChange={e => setOrderNumber(e.target.value)}
                  className="control-input"
                />
              </div>
              <div className="control-group">
                <label>Client Name</label>
                <input 
                  type="text" 
                  value={clientName} 
                  onChange={e => setClientName(e.target.value)}
                  className="control-input"
                />
              </div>
            </div>
          </div>

          {/* Front Neckline Selector */}
          <div className="control-card">
            <h3 className="control-section-title">Front Neckline Style</h3>
            <div className="neck-options-grid">
              {FRONT_NECK_OPTIONS.map(neck => (
                <button
                  key={neck.id}
                  type="button"
                  className={`neck-option-btn ${frontNeck === neck.id ? 'active' : ''}`}
                  onClick={() => setFrontNeck(neck.id)}
                >
                  <span className="neck-btn-title">{neck.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sleeve Style Selector */}
          <div className="control-card">
            <h3 className="control-section-title">Sleeve Styling</h3>
            <div className="sleeve-options-list">
              {SLEEVE_OPTIONS.map(s => (
                <label key={s.id} className={`radio-card-label ${sleeveType === s.id ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="sleeve" 
                    checked={sleeveType === s.id} 
                    onChange={() => setSleeveType(s.id)}
                  />
                  <div>
                    <div className="radio-card-title">{s.label}</div>
                    <div className="radio-card-sub">{s.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Back Cut Style */}
          <div className="control-card">
            <h3 className="control-section-title">Back Cut & Dori</h3>
            <div className="sleeve-options-list">
              {BACK_OPTIONS.map(b => (
                <label key={b.id} className={`radio-card-label ${backType === b.id ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="back" 
                    checked={backType === b.id} 
                    onChange={() => setBackType(b.id)}
                  />
                  <div>
                    <div className="radio-card-title">{b.label}</div>
                    <div className="radio-card-sub">{b.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Internal Seam Margin Slider (Anti-Dispute Hero Feature) */}
          <div className="control-card margin-highlight-card">
            <div className="margin-slider-header">
              <div>
                <h3 className="control-section-title text-amber">Internal Seam Alteration Margin</h3>
                <p style={{ fontSize: '0.8rem', color: '#7c7267' }}>
                  Fabric left inside side seams for future alterations.
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

          {/* Pads & Lining */}
          <div className="control-card">
            <h3 className="control-section-title">Lining & Cups Padding</h3>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input 
                  type="checkbox" 
                  checked={hasPads} 
                  onChange={e => setHasPads(e.target.checked)} 
                />
                <span>Include Bra Pads / Cups</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <span>Lining:</span>
                <select 
                  value={liningFabric} 
                  onChange={e => setLiningFabric(e.target.value)}
                  className="control-select"
                >
                  <option value="cotton">Pure Mulmul Cotton</option>
                  <option value="satin">Butter Crepe / Satin</option>
                  <option value="none">No Lining</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
