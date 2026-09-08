import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { store } from '../services/store';
import { 
  Compass, 
  Sparkles, 
  Heart, 
  Bookmark, 
  Share2, 
  MessageSquare, 
  Plus, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Scissors, 
  X, 
  Send,
  Check,
  Eye,
  Sliders,
  Award,
  Upload,
  Camera,
  Trash2
} from 'lucide-react';
import './ExplorePage.css';

const CATEGORIES = [
  { id: 'all', label: 'All Bespoke Styles', icon: '✨' },
  { id: 'blouse', label: 'Bridal & Sarees', icon: '👘' },
  { id: 'bandhgala', label: 'Royal Suits & Bandhgalas', icon: '🧥' },
  { id: 'suit', label: 'Anarkalis & Kurtas', icon: '👗' },
  { id: 'shirt', label: 'Bespoke Shirts', icon: '👔' },
];

function PostMediaGallery({ post }) {
  const images = (post.images && post.images.length > 0) ? post.images : [post.image_url];
  const [currentIdx, setCurrentIdx] = useState(0);

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="post-media-wrapper" style={{ position: 'relative' }}>
      <img 
        src={images[currentIdx]} 
        alt={`${post.title} - ${currentIdx + 1}`} 
        className="post-hero-image" 
      />

      {images.length > 1 && (
        <>
          <button 
            type="button"
            onClick={prevImage}
            title="Previous photograph"
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(15,23,42,0.65)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 5,
              fontSize: '1.2rem',
              fontWeight: 700
            }}
          >
            ‹
          </button>
          <button 
            type="button"
            onClick={nextImage}
            title="Next photograph"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(15,23,42,0.65)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 5,
              fontSize: '1.2rem',
              fontWeight: 700
            }}
          >
            ›
          </button>

          {/* Image Dots Indicator */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            zIndex: 5,
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(4px)',
            padding: '4px 8px',
            borderRadius: '12px'
          }}>
            {images.map((_, idx) => (
              <span 
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIdx(idx); }}
                style={{
                  width: idx === currentIdx ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: idx === currentIdx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>
        </>
      )}

      <div className="post-image-badge-floating">
        <span className="floating-pill">
          <ShieldCheck size={13} />
          <span>Verified Atelier Craft</span>
        </span>
        {images.length > 1 && (
          <span className="floating-pill" style={{ background: 'rgba(15,23,42,0.75)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Camera size={13} />
            <span>{currentIdx + 1}/{images.length}</span>
          </span>
        )}
        <span className="floating-pill turnaround">
          <Clock size={13} />
          <span>⚡ {post.turnaround_days}-Day Delivery</span>
        </span>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTailor = user?.role === 'tailor';

  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [inquiryModalPost, setInquiryModalPost] = useState(null);
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [shareToast, setShareToast] = useState('');

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('blouse');
  const [newDescription, setNewDescription] = useState('');
  const [newFabric, setNewFabric] = useState('');
  const [newMargin, setNewMargin] = useState(2.5);
  const [newTurnaround, setNewTurnaround] = useState(4);
  const [newPrice, setNewPrice] = useState(2400);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [newTags, setNewTags] = useState('#BespokeCut, #MasterCraft');

  useEffect(() => {
    // Load posts from central store
    setPosts(store.getPosts());
  }, []);

  const handleLike = (postId) => {
    const updated = store.likePost(postId);
    setPosts(updated);
  };

  const handleBookmark = (postId) => {
    const updated = store.bookmarkPost(postId);
    setPosts(updated);
  };

  const handleShare = (post) => {
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(`Link to "${post.title}" copied to clipboard!`);
    setTimeout(() => setShareToast(''), 3000);
  };

  const handleRecreateOrder = (post) => {
    // Navigate directly to 2D customizer with this post as reference and this tailor pre-selected!
    navigate('/design-order', {
      state: {
        referencePost: post,
        preSelectedTailorId: post.tailor_id,
        preSelectedCategory: post.garment_category
      }
    });
  };

  const handleOpenInquiry = (post) => {
    setInquiryModalPost(post);
    setInquirySent(false);
    setInquiryText(`Hello Master ${post.tailor_name}, I saw your showcase of "${post.title}". I would love to get this crafted with my own fabric. Are you taking orders this week?`);
  };

  const handleSendInquiry = (e) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquiryModalPost(null);
      setInquirySent(false);
    }, 2000);
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadError('');
    const readFiles = [];
    let processedCount = 0;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files (JPG, PNG, WEBP) are supported.');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setUploadError('Images should be under 8MB each.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        readFiles.push(event.target.result);
        processedCount++;
        if (processedCount === files.length) {
          setUploadedImages(prev => [...prev, ...readFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePublishSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    if (uploadedImages.length === 0) {
      setUploadError('Please upload at least one photograph of your tailoring creation.');
      return;
    }

    const tagsArray = newTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => (t.startsWith('#') ? t : `#${t}`));

    const created = store.createPost({
      tailor_id: user?.id || 'tailor-1',
      tailor_name: user?.full_name || 'Master Rajesh Kumar',
      shop_name: user?.shop_name || 'Royal Stitch Studio',
      avatar_url: user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      distance_km: 1.4,
      city: user?.city || 'Chennai',
      title: newTitle,
      garment_category: newCategory,
      description: newDescription,
      fabric_details: newFabric || 'Client Sourced Fabric',
      margin_inches: parseFloat(newMargin),
      turnaround_days: parseInt(newTurnaround),
      estimated_price: parseFloat(newPrice),
      images: uploadedImages,
      image_url: uploadedImages[0],
      tags: tagsArray.length > 0 ? tagsArray : ['#BespokeCraft', '#MasterTailor']
    });

    setPosts(store.getPosts());
    setShowPublishModal(false);
    
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewFabric('');
    setUploadedImages([]);
    setUploadError('');
  };

  const filteredPosts = posts.filter(post => {
    const matchesCat = selectedCategory === 'all' || post.garment_category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      post.title.toLowerCase().includes(query) ||
      post.tailor_name.toLowerCase().includes(query) ||
      post.shop_name.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.fabric_details?.toLowerCase().includes(query) ||
      post.tags?.some(t => t.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="explore-container">
      {/* Share Toast */}
      {shareToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#e6af2e',
          padding: '12px 20px',
          borderRadius: '10px',
          border: '1px solid rgba(230, 175, 46, 0.4)',
          zIndex: 9999,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <Check size={16} />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="atelier-header-banner customer-banner">
        <div>
          <div className="atelier-badge customer-badge">
            <Compass size={14} />
            <span>Artisanal Master Creations Feed</span>
          </div>
          <h1 className="atelier-title">Explore Bespoke Tailor Creations</h1>
          <p className="atelier-subtitle">
            Discover finished masterpieces by verified master tailors. Inspect artisanal stitch details, fabric drape, safety allowances, and re-create any piece with 1-click.
          </p>
        </div>

        <div className="quick-actions-bar">
          <button 
            type="button" 
            className="action-pill-btn primary"
            onClick={() => setShowPublishModal(true)}
          >
            <Plus size={16} />
            <span>{isTailor ? 'Publish Design Showcase' : 'Post Creation Demo'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="explore-filter-bar">
        <div className="filter-top-row">
          <div className="explore-category-pills">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`category-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="search-bar-wrapper" style={{ minWidth: '280px' }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by tailor, style, fabric, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header-search-input"
            />
          </div>
        </div>
      </div>

      {/* Feed Stream */}
      <div className="explore-feed-stream">
        {filteredPosts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e0d8',
            color: '#64748b'
          }}>
            <Compass size={36} style={{ color: '#c8921e', marginBottom: '12px' }} />
            <h3 style={{ color: '#0f172a', marginBottom: '6px' }}>No creations found</h3>
            <p>Try selecting a different category or adjusting your search term.</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <article key={post.id} className="showcase-post-card">
              {/* Post Header */}
              <div className="post-header">
                <div className="post-author-info">
                  <img 
                    src={post.avatar_url} 
                    alt={post.tailor_name} 
                    className="post-author-avatar" 
                  />
                  <div>
                    <div className="post-author-name-row">
                      <span className="post-author-name">{post.tailor_name}</span>
                      <span className="post-verified-badge">
                        <Award size={12} />
                        <span>Master Tailor</span>
                      </span>
                    </div>
                    <div className="post-author-shop">
                      <span>{post.shop_name}</span>
                      <span>•</span>
                      <span className="post-distance-pill">
                        <MapPin size={12} style={{ display: 'inline', marginRight: '2px' }} />
                        {post.distance_km} km away ({post.city})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="post-time-meta">
                  <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {post.created_at}
                </div>
              </div>

              {/* Multi-Photo Interactive Gallery */}
              <PostMediaGallery post={post} />

              {/* Post Body */}
              <div className="post-body">
                <h2 className="post-title">{post.title}</h2>
                <p className="post-narrative">{post.description}</p>

                {/* Artisanal Specification Chips */}
                <div className="post-spec-chips-grid">
                  <div className="spec-chip-item">
                    <span className="spec-chip-label">Fabric / Sourced</span>
                    <span className="spec-chip-val">{post.fabric_details || 'Pure Sourced Silk'}</span>
                  </div>
                  <div className="spec-chip-item">
                    <span className="spec-chip-label">Safety Inner Margin</span>
                    <span className="spec-chip-val highlight">{post.margin_inches}" Allowance</span>
                  </div>
                  <div className="spec-chip-item">
                    <span className="spec-chip-label">Turnaround Time</span>
                    <span className="spec-chip-val">{post.turnaround_days} Days Express</span>
                  </div>
                  <div className="spec-chip-item">
                    <span className="spec-chip-label">Est. Stitching Rate</span>
                    <span className="spec-chip-val price">₹ {post.estimated_price?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags-row">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="post-tag-item">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Action Bar */}
                <div className="post-actions-row">
                  <div className="post-social-group">
                    <button 
                      type="button" 
                      className={`social-action-btn ${post.is_liked ? 'liked' : ''}`}
                      onClick={() => handleLike(post.id)}
                      title="Appreciate this creation"
                    >
                      <Heart size={16} fill={post.is_liked ? '#e11d48' : 'none'} />
                      <span>{post.likes_count || 0}</span>
                    </button>

                    <button 
                      type="button" 
                      className={`social-action-btn ${post.is_bookmarked ? 'bookmarked' : ''}`}
                      onClick={() => handleBookmark(post.id)}
                      title="Save to Wardrobe Vault"
                    >
                      <Bookmark size={16} fill={post.is_bookmarked ? '#c8921e' : 'none'} />
                      <span>{post.bookmarks_count || 0}</span>
                    </button>

                    <button 
                      type="button" 
                      className="social-action-btn"
                      onClick={() => handleOpenInquiry(post)}
                      title="Direct message to atelier"
                    >
                      <MessageSquare size={16} />
                      <span>Consult</span>
                    </button>

                    <button 
                      type="button" 
                      className="social-action-btn"
                      onClick={() => handleShare(post)}
                      title="Share style link"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>

                  {/* KILLER CTA: Order This Exact Style */}
                  <button 
                    type="button" 
                    className="recreate-order-cta-btn"
                    onClick={() => handleRecreateOrder(post)}
                  >
                    <Sparkles size={16} className="cta-sparkle" />
                    <span>Order This Exact Style →</span>
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Publish New Creation Modal */}
      {showPublishModal && (
        <div className="modal-backdrop" onClick={() => setShowPublishModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#c8921e" />
                <h3 className="modal-title">Publish New Artisanal Creation</h3>
              </div>
              <button 
                type="button" 
                className="close-modal-btn"
                onClick={() => setShowPublishModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePublishSubmit}>
              <div className="publish-modal-body">
                <div className="publish-form-grid">
                  <div className="form-group-field">
                    <label>Garment Showcase Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Royal Maroon Silk Blouse with Gold Latkans"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="form-input-box"
                    />
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group-field">
                      <label>Category</label>
                      <select 
                        value={newCategory} 
                        onChange={e => setNewCategory(e.target.value)}
                        className="form-select-box"
                      >
                        <option value="blouse">Bridal & Saree Blouse</option>
                        <option value="bandhgala">Bandhgala / Jodhpuri Suit</option>
                        <option value="suit">Anarkali & Salwar Suit</option>
                        <option value="shirt">Formal / Casual Shirt</option>
                        <option value="trouser">Bespoke Trouser</option>
                      </select>
                    </div>

                    <div className="form-group-field">
                      <label>Fabric Details *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Pure Kanjeevaram Raw Silk"
                        value={newFabric}
                        onChange={e => setNewFabric(e.target.value)}
                        className="form-input-box"
                      />
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label>Craftsmanship Story & Cut Technique *</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Describe the silhouette, challenges solved (e.g. zero armhole pinching), embroidery details, or hand finishing..."
                      value={newDescription}
                      onChange={e => setNewDescription(e.target.value)}
                      className="form-textarea-box"
                    />
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group-field">
                      <label>Safety Inner Margin ({newMargin}")</label>
                      <input 
                        type="range" 
                        min="1.0" 
                        max="3.0" 
                        step="0.5" 
                        value={newMargin}
                        onChange={e => setNewMargin(e.target.value)}
                      />
                    </div>

                    <div className="form-group-field">
                      <label>Turnaround (Days)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="14" 
                        value={newTurnaround}
                        onChange={e => setNewTurnaround(e.target.value)}
                        className="form-input-box"
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group-field">
                      <label>Estimated Stitching Rate (₹)</label>
                      <input 
                        type="number" 
                        min="500" 
                        step="100" 
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        className="form-input-box"
                      />
                    </div>

                    <div className="form-group-field">
                      <label>Tags (comma-separated)</label>
                      <input 
                        type="text" 
                        placeholder="#Handmade, #Bridal, #FrenchSeam"
                        value={newTags}
                        onChange={e => setNewTags(e.target.value)}
                        className="form-input-box"
                      />
                    </div>
                  </div>

                  {/* Multi-Image File Uploader */}
                  <div className="form-group-field">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Upload Garment Photographs (Multiple Allowed)</span>
                      {uploadedImages.length > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                          ✓ {uploadedImages.length} {uploadedImages.length === 1 ? 'photo' : 'photos'} attached
                        </span>
                      )}
                    </label>

                    {/* Drag-and-drop / File Selector */}
                    <div 
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        textAlign: 'center',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => document.getElementById('garment-photos-input')?.click()}
                    >
                      <input 
                        id="garment-photos-input"
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageFilesChange}
                        style={{ display: 'none' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca' }}>
                          <Upload size={20} />
                        </div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                          Click to browse or upload atelier photos
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Upload multiple angles: front neck, back dori, seam finish, lining (PNG, JPG, WEBP)
                        </div>
                      </div>
                    </div>

                    {uploadError && (
                      <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#dc2626', background: '#fee2e2', padding: '6px 10px', borderRadius: '6px' }}>
                        {uploadError}
                      </div>
                    )}

                    {/* Image Thumbnails Gallery */}
                    {uploadedImages.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Attached Photos ({uploadedImages.length})
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: '8px' }}>
                          {uploadedImages.map((img, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                position: 'relative', 
                                height: '84px', 
                                borderRadius: '8px', 
                                overflow: 'hidden', 
                                border: idx === 0 ? '2px solid #2b3990' : '1px solid #cbd5e1',
                                background: '#000'
                              }}
                            >
                              <img 
                                src={img} 
                                alt={`upload-${idx}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                              {idx === 0 && (
                                <span style={{
                                  position: 'absolute',
                                  bottom: '2px',
                                  left: '2px',
                                  background: '#2b3990',
                                  color: '#fff',
                                  fontSize: '0.62rem',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  fontWeight: 700
                                }}>
                                  Cover
                                </span>
                              )}
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                title="Remove photo"
                                style={{
                                  position: 'absolute',
                                  top: '3px',
                                  right: '3px',
                                  background: 'rgba(0,0,0,0.65)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  padding: 0
                                }}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="action-pill-btn secondary"
                  onClick={() => setShowPublishModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="action-pill-btn primary"
                >
                  <Sparkles size={15} />
                  <span>Publish to Explore Feed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Inquire / Consultation Modal */}
      {inquiryModalPost && (
        <div className="modal-backdrop" onClick={() => setInquiryModalPost(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Consult Master Tailor</h3>
              <button 
                type="button" 
                className="close-modal-btn"
                onClick={() => setInquiryModalPost(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="inquire-modal-card">
                <div className="atelier-contact-preview">
                  <img 
                    src={inquiryModalPost.avatar_url} 
                    alt={inquiryModalPost.tailor_name} 
                    className="atelier-contact-avatar"
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{inquiryModalPost.tailor_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{inquiryModalPost.shop_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#c8921e', fontWeight: 600, marginTop: '2px' }}>
                      📍 {inquiryModalPost.city} • {inquiryModalPost.distance_km} km away
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fbf7ec', border: '1px solid #e7d8b5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#805b10' }}>
                  Inquiring about: <strong>{inquiryModalPost.title}</strong>
                </div>

                {inquirySent ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>
                    <CheckCircle2 size={36} style={{ display: 'block', margin: '0 auto 8px auto' }} />
                    Inquiry sent successfully to {inquiryModalPost.tailor_name}! They will call / WhatsApp you shortly.
                  </div>
                ) : (
                  <form onSubmit={handleSendInquiry}>
                    <div className="form-group-field" style={{ marginBottom: '1rem' }}>
                      <label>Your Message / Fabric Questions</label>
                      <textarea 
                        rows={4}
                        required
                        value={inquiryText}
                        onChange={e => setInquiryText(e.target.value)}
                        className="form-textarea-box"
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button 
                        type="button" 
                        className="action-pill-btn secondary"
                        onClick={() => setInquiryModalPost(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="action-pill-btn primary"
                      >
                        <Send size={15} />
                        <span>Send Direct Inquiry</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
