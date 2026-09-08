import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  Volume2, 
  Save, 
  User, 
  RotateCcw, 
  Scissors, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

const GARMENT_TEMPLATES = {
  blouse: [
    { key: 'chest', label: 'Chest / Bust', hint: 'Around fullest part', unit: 'in' },
    { key: 'waist', label: 'Waist (Underbust)', hint: 'Where band sits', unit: 'in' },
    { key: 'shoulder', label: 'Shoulder Width', hint: 'Tip of shoulder to tip', unit: 'in' },
    { key: 'front_length', label: 'Blouse Length', hint: 'Shoulder to hem', unit: 'in' },
    { key: 'front_neck_depth', label: 'Front Neck Depth', hint: 'Depth from shoulder', unit: 'in' },
    { key: 'back_neck_depth', label: 'Back Neck Depth', hint: 'Depth at back center', unit: 'in' },
    { key: 'sleeve_length', label: 'Sleeve Length', hint: 'Shoulder to desired hem', unit: 'in' },
    { key: 'armhole', label: 'Armhole / Round', hint: 'Around arm joint', unit: 'in' }
  ],
  shirt: [
    { key: 'chest', label: 'Chest Circumference', hint: 'Around underarm', unit: 'in' },
    { key: 'waist', label: 'Waist Circumference', hint: 'At navel level', unit: 'in' },
    { key: 'shoulder', label: 'Full Shoulder Width', hint: 'Bone to bone across back', unit: 'in' },
    { key: 'shirt_length', label: 'Shirt Full Length', hint: 'Collar seam to hem', unit: 'in' },
    { key: 'sleeve_length', label: 'Sleeve Length', hint: 'Shoulder seam to wrist', unit: 'in' },
    { key: 'neck', label: 'Collar Band', hint: 'Base of neck + 1 finger', unit: 'in' },
    { key: 'cuff', label: 'Cuff Opening', hint: 'Around wrist bone', unit: 'in' }
  ],
  trouser: [
    { key: 'waist', label: 'Trouser Waist', hint: 'Where waistband sits', unit: 'in' },
    { key: 'hip', label: 'Hip / Seat', hint: 'Fullest part of buttocks', unit: 'in' },
    { key: 'outseam', label: 'Outseam Length', hint: 'Waistband to bottom shoe sole', unit: 'in' },
    { key: 'inseam', label: 'Inseam Length', hint: 'Crotch to ankle', unit: 'in' },
    { key: 'thigh', label: 'Thigh Round', hint: 'Widest part of thigh', unit: 'in' },
    { key: 'bottom', label: 'Leg Opening / Hem', hint: 'Desired cuff width', unit: 'in' }
  ]
};

export default function MeasurementsPage() {
  const [selectedGarment, setSelectedGarment] = useState('blouse');
  const [clientName, setClientName] = useState('Ananya Sen');
  const [measurements, setMeasurements] = useState({
    chest: '36.0',
    waist: '30.0',
    shoulder: '14.5',
    front_length: '14.0',
    front_neck_depth: '6.5',
    back_neck_depth: '9.0',
    sleeve_length: '10.5',
    armhole: '15.0'
  });

  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [spokenHistory, setSpokenHistory] = useState([
    'Listening started...',
    'Detected: "Chest 36"',
    'Detected: "Waist 30 and half" → 30.5',
    'Detected: "Shoulder 14.5"'
  ]);
  const [savedAlert, setSavedAlert] = useState(false);

  const toggleVoiceAssistant = () => {
    if (!isVoiceListening) {
      setIsVoiceListening(true);
      // Simulate live spoken input sequence
      setTimeout(() => {
        setSpokenHistory(prev => [...prev, 'Heard: "Front length 14, Front neck 7"']);
        setMeasurements(prev => ({ ...prev, front_length: '14.0', front_neck_depth: '7.0' }));
      }, 1500);
      setTimeout(() => {
        setSpokenHistory(prev => [...prev, 'Heard: "Back neck 9 and half" → 9.5']);
        setMeasurements(prev => ({ ...prev, back_neck_depth: '9.5' }));
      }, 3200);
    } else {
      setIsVoiceListening(false);
    }
  };

  const handleFieldChange = (key, value) => {
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  const activeFields = GARMENT_TEMPLATES[selectedGarment] || GARMENT_TEMPLATES.blouse;

  return (
    <div className="measurements-container">
      {/* Header */}
      <div className="spec-page-header">
        <div>
          <div className="atelier-badge">
            <Mic size={14} />
            <span>Hands-Free Measurement Vault</span>
          </div>
          <h1 className="atelier-title">Universal Intake & Voice Tape</h1>
          <p className="atelier-subtitle">
            Capture precision body measurements hands-free without putting down the tape measure.
          </p>
        </div>

        <div className="quick-actions-bar">
          <button 
            type="button" 
            className={`action-pill-btn ${isVoiceListening ? 'listening-active' : 'primary'}`}
            onClick={toggleVoiceAssistant}
          >
            {isVoiceListening ? <MicOff size={16} /> : <Mic size={16} />}
            <span>{isVoiceListening ? 'Stop Voice Tape' : 'Activate Hands-Free Voice Tape'}</span>
          </button>
          <button 
            type="button" 
            className="action-pill-btn secondary"
            onClick={handleSave}
          >
            {savedAlert ? <Check size={16} /> : <Save size={16} />}
            <span>{savedAlert ? 'Profile Saved!' : 'Save Measurements'}</span>
          </button>
        </div>
      </div>

      {/* Voice Assistant Live Status Card */}
      {isVoiceListening && (
        <div className="voice-tape-banner">
          <div className="voice-banner-left">
            <div className="voice-pulse-circle">
              <Mic size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e1b18' }}>
                Voice Tape Active — Speak measurements aloud
              </div>
              <div style={{ fontSize: '0.8rem', color: '#7c7267' }}>
                Say: <em>"Chest 38 and half, Waist 32, Length 14"</em>
              </div>
            </div>
          </div>

          <div className="voice-banner-transcription">
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#805b10', fontWeight: 600 }}>
              Live Recognition Stream:
            </div>
            <div style={{ fontSize: '0.85rem', color: '#1e1b18', fontWeight: 500 }}>
              {spokenHistory[spokenHistory.length - 1]}
            </div>
          </div>
        </div>
      )}

      {/* Garment Type Tabs */}
      <div className="garment-type-tabs">
        <button 
          type="button" 
          className={`garment-tab-btn ${selectedGarment === 'blouse' ? 'active' : ''}`}
          onClick={() => setSelectedGarment('blouse')}
        >
          Saree Blouse (8 Points)
        </button>
        <button 
          type="button" 
          className={`garment-tab-btn ${selectedGarment === 'shirt' ? 'active' : ''}`}
          onClick={() => setSelectedGarment('shirt')}
        >
          Formal & Casual Shirt (7 Points)
        </button>
        <button 
          type="button" 
          className={`garment-tab-btn ${selectedGarment === 'trouser' ? 'active' : ''}`}
          onClick={() => setSelectedGarment('trouser')}
        >
          Formal Trouser / Pant (6 Points)
        </button>
      </div>

      {/* Measurement Input Cards Grid */}
      <div className="meas-inputs-grid">
        {activeFields.map(field => {
          const val = measurements[field.key] || '';
          const hasVal = val.length > 0;
          return (
            <div key={field.key} className={`meas-input-card ${hasVal ? 'filled' : ''}`}>
              <div className="meas-card-header">
                <span className="meas-title">{field.label}</span>
                {hasVal && <CheckCircle2 size={16} color="#16a34a" />}
              </div>
              <p className="meas-hint">{field.hint}</p>

              <div className="meas-input-row">
                <input 
                  type="text" 
                  value={val} 
                  onChange={e => handleFieldChange(field.key, e.target.value)}
                  placeholder="0.0"
                  className="meas-text-field"
                />
                <span className="meas-unit">{field.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client notes and family tag */}
      <div className="meas-footer-card">
        <div className="control-group">
          <label>Client Name / Family Member</label>
          <input 
            type="text" 
            value={clientName} 
            onChange={e => setClientName(e.target.value)}
            className="control-input"
          />
        </div>
        <div className="control-group">
          <label>Special Body Posture & Fit Instructions</label>
          <textarea 
            rows={2} 
            placeholder="e.g. Sloping right shoulder, prefers snug armhole, extra ease in back waist..."
            className="control-textarea"
          />
        </div>
      </div>
    </div>
  );
}
