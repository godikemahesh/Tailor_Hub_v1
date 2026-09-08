import React, { useState } from 'react';
import { 
  BookOpen, 
  Upload, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Save, 
  Layers, 
  Search,
  Check
} from 'lucide-react';

const SAMPLE_OCR_DATA = {
  clientName: 'Sunita Verma',
  phone: '9876543210',
  garment: 'Blouse (Sweetheart)',
  measurements: {
    chest: '36.0',
    waist: '30.0',
    shoulder: '14.5',
    length: '14.0',
    sleeve: '10.0'
  },
  deposit: '500',
  notes: 'Customer prefers deep back with dori. Deliver by Thursday.',
  confidence: {
    name: 98,
    phone: 99,
    chest: 94,
    waist: 91,
    deposit: 95
  }
};

export default function OldBookScannerPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);
  const [formData, setFormData] = useState(SAMPLE_OCR_DATA);
  const [committedSuccess, setCommittedSuccess] = useState(false);

  const handleSimulateScan = () => {
    setIsProcessing(true);
    setCommittedSuccess(false);
    setTimeout(() => {
      setIsProcessing(false);
      setHasScanned(true);
    }, 1200);
  };

  const handleCommit = () => {
    setCommittedSuccess(true);
    setTimeout(() => setCommittedSuccess(false), 3500);
  };

  return (
    <div className="scanner-container">
      {/* Header */}
      <div className="spec-page-header">
        <div>
          <div className="atelier-badge">
            <BookOpen size={14} />
            <span>Computer Vision & OCR Engine</span>
          </div>
          <h1 className="atelier-title">Legacy Register & Old Book Digitizer</h1>
          <p className="atelier-subtitle">
            Scan decades-old paper notebooks. OpenCV auto-deskews and binarizes handwritten text for Human-in-the-Loop verification.
          </p>
        </div>

        <div className="quick-actions-bar">
          <button 
            type="button" 
            className="action-pill-btn secondary"
            onClick={handleSimulateScan}
          >
            <Upload size={15} />
            <span>Upload Another Page</span>
          </button>
          <button 
            type="button" 
            className="action-pill-btn primary"
            onClick={handleCommit}
          >
            {committedSuccess ? <Check size={15} /> : <Save size={15} />}
            <span>{committedSuccess ? 'Saved to Cloud Database!' : 'Commit Verified Record'}</span>
          </button>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e0d8', margin: '1rem 0' }}>
          <div className="pulse-dot" style={{ width: '16px', height: '16px', margin: '0 auto 1rem' }}></div>
          <h3 style={{ fontSize: '1.1rem', color: '#1e1b18', marginBottom: '0.5rem' }}>
            Applying Otsu Binarization & Deskewing Filter...
          </h3>
          <p style={{ color: '#7c7267', fontSize: '0.85rem' }}>
            Extracting bounding boxes with Tesseract & EasyOCR model.
          </p>
        </div>
      )}

      {/* HITL Split Screen Layout */}
      {hasScanned && !isProcessing && (
        <div className="scanner-split-grid">
          {/* Left Column: Original Handwritten Register Crop */}
          <div className="scanner-crop-col">
            <div className="canvas-header">
              <span className="canvas-label">Original Handwritten Ledger Crop</span>
              <span className="pill-tag-mini text-amber">
                Deskewed & Binarized (Otsu)
              </span>
            </div>

            <div className="handwritten-ledger-box">
              {/* Simulated vintage ledger lines with highlighted OCR bounding boxes */}
              <div className="ledger-entry-paper">
                <div className="ledger-header-stamp">PAGE # 142 • ENTRY 08</div>
                
                <div className="ocr-bounding-box box-name">
                  <span className="ocr-box-tag">NAME (98%)</span>
                  <div className="handwriting-text">Sunita Verma</div>
                </div>

                <div className="ocr-bounding-box box-phone">
                  <span className="ocr-box-tag">PHONE (99%)</span>
                  <div className="handwriting-text">98765-43210</div>
                </div>

                <div className="ocr-bounding-box box-garment">
                  <span className="ocr-box-tag">GARMENT</span>
                  <div className="handwriting-text">Blouse (Sweetheart neck)</div>
                </div>

                <div className="ocr-bounding-box box-measurements">
                  <span className="ocr-box-tag">MEASUREMENTS (94%)</span>
                  <div className="handwriting-text">
                    Ch 36 • W 30 • Sh 14.5 • L 14 • Sl 10
                  </div>
                </div>

                <div className="ocr-bounding-box box-deposit">
                  <span className="ocr-box-tag">ADVANCE PAID</span>
                  <div className="handwriting-text">Adv. ₹500 Paid (Cash)</div>
                </div>
              </div>
            </div>

            <div className="ocr-tips-note">
              💡 <strong>Human-In-The-Loop Rule:</strong> Review green and amber bounding boxes. Edit any misrecognized cursive numerals on the right before saving.
            </div>
          </div>

          {/* Right Column: Verified Digital Form Fields */}
          <div className="scanner-form-col">
            <div className="canvas-header">
              <span className="canvas-label">Structured Digital Client Profile</span>
              <span className="canvas-badge-locked">
                <CheckCircle2 size={13} />
                <span>Ready to Commit</span>
              </span>
            </div>

            <div className="scanner-fields-card">
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label>Customer Full Name</label>
                  <span className="confidence-pill high">98% Match</span>
                </div>
                <input 
                  type="text" 
                  value={formData.clientName} 
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  className="control-input"
                />
              </div>

              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label>Mobile Number (Key Identifier)</label>
                  <span className="confidence-pill high">99% Match</span>
                </div>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="control-input"
                />
              </div>

              <div className="control-group">
                <label>Garment Style</label>
                <input 
                  type="text" 
                  value={formData.garment} 
                  onChange={e => setFormData({ ...formData, garment: e.target.value })}
                  className="control-input"
                />
              </div>

              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e1b18', margin: '1.25rem 0 0.5rem' }}>
                Extracted Body Measurements (Inches)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div className="control-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <label>Chest</label>
                    <span style={{ color: '#16a34a' }}>94%</span>
                  </div>
                  <input 
                    type="text" 
                    value={formData.measurements.chest} 
                    onChange={e => setFormData({ 
                      ...formData, 
                      measurements: { ...formData.measurements, chest: e.target.value } 
                    })}
                    className="control-input"
                  />
                </div>

                <div className="control-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <label>Waist</label>
                    <span style={{ color: '#16a34a' }}>91%</span>
                  </div>
                  <input 
                    type="text" 
                    value={formData.measurements.waist} 
                    onChange={e => setFormData({ 
                      ...formData, 
                      measurements: { ...formData.measurements, waist: e.target.value } 
                    })}
                    className="control-input"
                  />
                </div>

                <div className="control-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <label>Shoulder</label>
                    <span style={{ color: '#16a34a' }}>95%</span>
                  </div>
                  <input 
                    type="text" 
                    value={formData.measurements.shoulder} 
                    onChange={e => setFormData({ 
                      ...formData, 
                      measurements: { ...formData.measurements, shoulder: e.target.value } 
                    })}
                    className="control-input"
                  />
                </div>

                <div className="control-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <label>Length</label>
                    <span style={{ color: '#16a34a' }}>96%</span>
                  </div>
                  <input 
                    type="text" 
                    value={formData.measurements.length} 
                    onChange={e => setFormData({ 
                      ...formData, 
                      measurements: { ...formData.measurements, length: e.target.value } 
                    })}
                    className="control-input"
                  />
                </div>

                <div className="control-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <label>Sleeve</label>
                    <span style={{ color: '#16a34a' }}>93%</span>
                  </div>
                  <input 
                    type="text" 
                    value={formData.measurements.sleeve} 
                    onChange={e => setFormData({ 
                      ...formData, 
                      measurements: { ...formData.measurements, sleeve: e.target.value } 
                    })}
                    className="control-input"
                  />
                </div>

                <div className="control-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <label>Advance Paid</label>
                    <span style={{ color: '#16a34a' }}>₹</span>
                  </div>
                  <input 
                    type="text" 
                    value={formData.deposit} 
                    onChange={e => setFormData({ ...formData, deposit: e.target.value })}
                    className="control-input"
                  />
                </div>
              </div>

              <div className="control-group" style={{ marginTop: '1rem' }}>
                <label>Tailor Notes & Requests</label>
                <textarea 
                  rows={2} 
                  value={formData.notes} 
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="control-textarea"
                />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="action-pill-btn primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleCommit}
                >
                  {committedSuccess ? <Check size={16} /> : <Save size={16} />}
                  <span>{committedSuccess ? 'Committed to Database!' : 'Commit & Create Digital Customer Profile'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
