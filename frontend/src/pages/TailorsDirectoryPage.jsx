import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  Star, 
  Search, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import './DesignAndBookPage.css';

export default function TailorsDirectoryPage() {
  const [tailors, setTailors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load all registered tailors from central store
    setTailors(store.getTailors());
  }, []);

  const filteredTailors = tailors.filter(t => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTailor = (tailor) => {
    // Direct customer to design their garment with this tailor selected
    navigate('/design-order', { state: { preSelectedTailor: tailor } });
  };

  return (
    <div className="design-book-container">
      {/* Header Banner */}
      <div className="atelier-header-banner customer-banner">
        <div>
          <div className="atelier-badge customer-badge">
            <Users size={14} />
            <span>Master Tailors Network</span>
          </div>
          <h1 className="atelier-title">Verified Bespoke Tailors Near You</h1>
          <p className="atelier-subtitle">
            Explore experienced master tailors, view verified specializations, workshop locations, and book custom stitching.
          </p>
        </div>

        <div className="search-bar-wrapper" style={{ maxWidth: '360px' }}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by tailor, city, or specialization..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="header-search-input"
          />
        </div>
      </div>

      {/* Tailor Cards Grid */}
      <div className="tailor-cards-grid">
        {filteredTailors.map(tailor => (
          <div key={tailor.id} className="tailor-card">
            <div className="tailor-card-header">
              {/* 1. Tailor Photo */}
              <img 
                src={tailor.avatar_url} 
                alt={tailor.full_name} 
                className="tailor-photo-img" 
              />

              <div className="tailor-main-info">
                {/* 2. Tailor Name */}
                <div className="tailor-name-row">
                  <h3 className="tailor-full-name">{tailor.full_name}</h3>
                  <div className="tailor-rating-badge">
                    <Star size={12} fill="#e6af2e" color="#e6af2e" />
                    <span>{tailor.rating}</span>
                    <span className="reviews-num">({tailor.reviews_count})</span>
                  </div>
                </div>

                <div className="tailor-shop-title">{tailor.shop_name}</div>
                
                {/* 5. Kms away from the user */}
                <div className="tailor-distance-pill">
                  <MapPin size={13} />
                  <span>{tailor.distance_km} kms away</span>
                </div>
              </div>
            </div>

            <div className="tailor-card-body">
              {/* 3. Experience Years */}
              <div className="tailor-detail-row">
                <Briefcase size={14} className="detail-icon" />
                <div>
                  <span className="detail-label">Experience:</span>
                  <strong className="detail-val">{tailor.experience_years} Years Master Craftsman</strong>
                </div>
              </div>

              {/* 4. Specialization */}
              <div className="tailor-detail-row">
                <Sparkles size={14} className="detail-icon" />
                <div>
                  <span className="detail-label">Specialization:</span>
                  <div className="specialization-text">{tailor.specialization}</div>
                </div>
              </div>

              {/* 6. Tailor Address */}
              <div className="tailor-detail-row">
                <MapPin size={14} className="detail-icon" />
                <div>
                  <span className="detail-label">Workshop Address:</span>
                  <div className="tailor-address-text">{tailor.address}, {tailor.city} - {tailor.pincode}</div>
                </div>
              </div>

              {/* Capacity Status */}
              <div className="tailor-capacity-pill">
                <span className="pulse-dot"></span>
                <span>Accepting Orders • {tailor.available_slots} slots available this week</span>
              </div>
            </div>

            {/* Footer */}
            <div className="tailor-card-footer">
              <div>
                <span className="rate-label">Base Stitching:</span>
                <div className="rate-value">₹ {tailor.base_stitching_rate || 1800}</div>
              </div>

              <button
                type="button"
                className="book-with-tailor-btn"
                onClick={() => handleSelectTailor(tailor)}
              >
                <span>Select Tailor & Customize Stitch</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
