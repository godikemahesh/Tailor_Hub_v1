import React from 'react';
import { Mic, FileCheck, Truck, Sparkles } from 'lucide-react';

export default function WorkflowSection() {
  const steps = [
    {
      number: '01',
      icon: Mic,
      title: 'Intake Hands-Free or Snap Paper Books',
      desc: 'Speak client measurements as you hold the measuring tape. Or snap a photo of decades-old paper registers to automatically build structured digital customer profiles.'
    },
    {
      number: '02',
      icon: FileCheck,
      title: 'Lock Modular Specs & 2.5" Margins',
      desc: 'Customize necklines, back cuts, and sleeves in live 2D SVG vectors. Lock inner alteration margins and generate a print-ready PDF Cutting Job Card with QR tracking.'
    },
    {
      number: '03',
      icon: Truck,
      title: 'Advance 5 Stages & Live Customer Sync',
      desc: 'Move garments smoothly through Received, Cutting, Stitching, Trial Ready, and Delivered. Clients see live progress updates with zero anxious phone calls.'
    }
  ];

  return (
    <section className="workflow-section" id="workflow">
      <div className="section-badge-center">
        <div className="section-pill">
          <Sparkles size={14} />
          <span>Operational Flow</span>
        </div>
      </div>
      <h2 className="section-main-heading">From Measuring Tape to Perfect Fit</h2>
      <p className="section-description">
        Three streamlined steps that replace chaotic notebooks, illegible handwriting, and fabric disputes forever.
      </p>

      <div className="workflow-cards-grid">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="workflow-card">
              <div className="step-badge-number">{s.number}</div>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '10px', 
                background: 'rgba(230,175,46,0.12)', 
                color: '#e6af2e', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.25rem' 
              }}>
                <Icon size={20} />
              </div>
              <h3 className="workflow-title">{s.title}</h3>
              <p className="workflow-desc">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
