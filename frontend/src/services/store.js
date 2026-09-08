/**
 * TailorHub – Central Data Store & Service
 * Strictly adheres to schema.sql (users, tailor_shops, orders, visual_spec_sheets)
 * Synchronizes in-memory and persistent localStorage data for tailors and orders.
 */
import { ordersAPI } from './api';

// Initial curated master tailors conforming to schema.sql
const DEFAULT_TAILORS = [
  {
    id: 'shop-1',
    tailor_id: 'tailor-1',
    full_name: 'Master Rajesh Kumar',
    shop_name: 'Royal Stitch Studio',
    tagline: 'Master Tailor • Heritage Bespoke Specialist',
    experience_years: 18,
    specialization: 'Bridal Silk Blouses, Zardozi Hand Embroidery & Banarasi Sarees',
    address: '42 Heritage Weaver Lane, Near Silk Bazaar, T. Nagar',
    city: 'Chennai',
    pincode: '600017',
    distance_km: 1.4,
    daily_capacity: 12,
    available_slots: 5,
    rating: 4.9,
    reviews_count: 142,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    supported_garments: ['blouse', 'kurta', 'suit', 'dress'],
    base_stitching_rate: 1800,
    is_accepting_orders: true
  },
  {
    id: 'shop-2',
    tailor_id: 'tailor-2',
    full_name: 'Ustad Mohammed Irfan',
    shop_name: 'Savile Row Savvy Tailors',
    tagline: 'Savile Row Trained Master Cutter',
    experience_years: 24,
    specialization: 'Custom Tuxedos, Bandhgala Royal Suits & Oxford Shirts',
    address: '15 High Street, Commercial Zone, Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    distance_km: 2.8,
    daily_capacity: 8,
    available_slots: 3,
    rating: 4.95,
    reviews_count: 218,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    supported_garments: ['shirt', 'trouser', 'suit', 'blazer'],
    base_stitching_rate: 3200,
    is_accepting_orders: true
  },
  {
    id: 'shop-3',
    tailor_id: 'tailor-3',
    full_name: 'Sharda Devi',
    shop_name: 'Sharda Ethnic Couture',
    tagline: 'Fine Artisanal Finishing & Alteration Queen',
    experience_years: 14,
    specialization: 'Anarkali Suits, Designer Lehengas & Western Gowns',
    address: 'Shop 8, Sector 14 Market, Near Metro Gate 2',
    city: 'Gurugram',
    pincode: '122001',
    distance_km: 3.5,
    daily_capacity: 10,
    available_slots: 6,
    rating: 4.85,
    reviews_count: 96,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    supported_garments: ['blouse', 'kurta', 'dress', 'lehenga'],
    base_stitching_rate: 2200,
    is_accepting_orders: true
  }
];

// Initial seeded orders adhering to schema.sql
const DEFAULT_ORDERS = [
  {
    id: 'ord-8842',
    order_number: 'TH-2026-8842',
    customer_id: 'cust-demo-1',
    customer_name: 'Ananya Sen',
    customer_phone: '+91 98765 43210',
    customer_address: 'Flat 402, Green Glen Layout, Bellandur',
    tailor_id: 'tailor-1',
    tailor_name: 'Master Rajesh Kumar',
    shop_name: 'Royal Stitch Studio',
    member_name: 'Self',
    garment_type: 'Silk Bridal Blouse',
    status: 'stitching',
    promised_date: 'Tomorrow, 5:00 PM',
    is_express: true,
    base_price: 2400,
    total_price: 2400,
    advance_paid: 1000,
    balance_due: 1400,
    measurements_snapshot: {
      chest: '36.0',
      waist: '30.0',
      shoulder: '14.5',
      front_length: '14.0',
      front_neck_depth: '6.5',
      back_neck_depth: '9.0',
      sleeve_length: '10.5',
      armhole: '15.0'
    },
    visual_specs: {
      front_neck_style: 'sweetheart',
      front_neck_label: 'Sweetheart Neck',
      back_neck_style: 'deep_u_dori',
      back_neck_label: 'Deep U with Latkan Dori',
      sleeve_style: 'elbow_puff',
      sleeve_label: 'Elbow-Length Puff Sleeve',
      lining_type: 'Pure Cotton Mulmul',
      pads_type: 'Included (Sewn-in)',
      internal_margin_inches: 2.5,
      fabric_color: 'Crimson Raw Silk',
      special_instructions: 'Customer requested 2.5" extra safe inner margin for wedding weight fluctuation. Golden latkans provided with fabric.'
    },
    created_at: '2026-09-05T10:30:00Z'
  },
  {
    id: 'ord-8841',
    order_number: 'TH-2026-8841',
    customer_id: 'cust-demo-2',
    customer_name: 'Ramesh Patel',
    customer_phone: '+91 98234 56789',
    customer_address: '12 Temple View Road, Mylapore',
    tailor_id: 'tailor-1',
    tailor_name: 'Master Rajesh Kumar',
    shop_name: 'Royal Stitch Studio',
    member_name: 'Dad',
    garment_type: 'Linen Formal Shirt & Trouser',
    status: 'cutting',
    promised_date: 'Sep 10, 2026',
    is_express: false,
    base_price: 3200,
    total_price: 3200,
    advance_paid: 1500,
    balance_due: 1700,
    measurements_snapshot: {
      chest: '40.0',
      waist: '34.0',
      shoulder: '17.5',
      length: '30.0',
      sleeve: '25.0',
      neck: '16.0'
    },
    visual_specs: {
      front_neck_style: 'v_neck',
      front_neck_label: 'Cutaway Spread Collar',
      back_neck_style: 'potli_buttons',
      back_neck_label: 'Classic Double Yoke Back',
      sleeve_style: 'full_sleeve',
      sleeve_label: 'Full Sleeve with 2" French Cuff',
      lining_type: 'No Lining',
      pads_type: 'None',
      internal_margin_inches: 2.0,
      fabric_color: 'Sky Blue Pure Italian Linen',
      special_instructions: 'Slim fit cut with pen pocket inside left breast. French seams throughout.'
    },
    created_at: '2026-09-04T14:15:00Z'
  }
];

export const store = {
  // ── Tailor Methods ──
  getTailors: () => {
    try {
      const stored = localStorage.getItem('tailorhub_tailors_list');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('tailorhub_tailors_list', JSON.stringify(DEFAULT_TAILORS));
    return DEFAULT_TAILORS;
  },

  addTailor: (newTailor) => {
    const current = store.getTailors();
    const tailor = {
      id: `shop-${Date.now()}`,
      tailor_id: newTailor.id || `tailor-${Date.now()}`,
      full_name: newTailor.full_name,
      shop_name: newTailor.shop_name || `${newTailor.full_name}'s Atelier`,
      tagline: newTailor.tagline || 'Master Custom Tailor',
      experience_years: parseInt(newTailor.experience_years) || 10,
      specialization: newTailor.specialization || 'Bespoke Alterations & Custom Fit',
      address: newTailor.address || 'Central Fashion Street',
      city: newTailor.city || 'Metropolitan Area',
      pincode: newTailor.pincode || '560001',
      distance_km: parseFloat((Math.random() * 3 + 1).toFixed(1)),
      daily_capacity: parseInt(newTailor.daily_capacity) || 10,
      available_slots: 7,
      rating: 5.0,
      reviews_count: 1,
      avatar_url: newTailor.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      supported_garments: ['blouse', 'shirt', 'kurta', 'suit', 'trouser'],
      base_stitching_rate: 1800,
      is_accepting_orders: true
    };
    const updated = [tailor, ...current];
    localStorage.setItem('tailorhub_tailors_list', JSON.stringify(updated));
    return tailor;
  },

  // ── Orders Methods ──
  getOrders: (userRole = 'all', userId = null) => {
    try {
      const stored = localStorage.getItem('tailorhub_orders_list');
      let orders = stored ? JSON.parse(stored) : DEFAULT_ORDERS;
      if (!stored) {
        localStorage.setItem('tailorhub_orders_list', JSON.stringify(DEFAULT_ORDERS));
      }
      if (userRole === 'tailor') {
        // Return orders for this tailor
        return orders;
      } else if (userRole === 'customer') {
        return orders;
      }
      return orders;
    } catch (e) {
      console.error(e);
      return DEFAULT_ORDERS;
    }
  },

  createOrder: (orderData) => {
    const current = store.getOrders();
    const orderNumber = `TH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_id: orderData.customer_id || 'cust-demo-1',
      customer_name: orderData.customer_name || (store.currentUser?.full_name || 'Customer'),
      customer_phone: orderData.customer_phone || '+91 98765 43210',
      customer_address: orderData.customer_address || '402 Sunrise Apartments, Indiranagar',
      tailor_id: orderData.tailor_id || 'tailor-1',
      tailor_name: orderData.tailor_name || 'Master Rajesh Kumar',
      shop_name: orderData.shop_name || 'Royal Stitch Studio',
      member_name: orderData.member_name || 'Self',
      garment_type: orderData.garment_type || 'Bespoke Garment',
      status: 'received',
      promised_date: orderData.promised_date || 'In 5 Days',
      is_express: orderData.is_express || false,
      base_price: orderData.base_price || 2200,
      total_price: orderData.total_price || 2200,
      advance_paid: orderData.advance_paid || 1000,
      balance_due: (orderData.total_price || 2200) - (orderData.advance_paid || 1000),
      measurements_snapshot: orderData.measurements_snapshot || {
        chest: '36.0',
        waist: '30.0',
        shoulder: '14.5',
        front_length: '14.0'
      },
      visual_specs: orderData.visual_specs || {
        front_neck_style: 'sweetheart',
        front_neck_label: 'Sweetheart Neck',
        back_neck_style: 'deep_u_dori',
        back_neck_label: 'Deep U with Latkan Dori',
        sleeve_style: 'elbow_puff',
        sleeve_label: 'Elbow Puff Sleeve',
        lining_type: 'Pure Cotton Mulmul',
        pads_type: 'Included (Sewn-in)',
        internal_margin_inches: 2.5,
        fabric_color: 'Customer Sourced Fabric',
        special_instructions: 'Customer customized via 2D visualizer.'
      },
      created_at: new Date().toISOString()
    };
    const updated = [newOrder, ...current];
    localStorage.setItem('tailorhub_orders_list', JSON.stringify(updated));
    return newOrder;
  },

  advanceOrderStatus: async (orderId) => {
    const orders = store.getOrders();
    const seq = ['received', 'cutting', 'stitching', 'trial_ready', 'delivered'];
    let targetOrder = null;
    let nextStatus = null;

    const updated = orders.map(order => {
      if (order.id === orderId) {
        const curr = seq.indexOf(order.status);
        if (curr < seq.length - 1) {
          nextStatus = seq[curr + 1];
          targetOrder = { ...order, status: nextStatus };
          return targetOrder;
        }
      }
      return order;
    });

    localStorage.setItem('tailorhub_orders_list', JSON.stringify(updated));

    // Automated Twilio Voice Call when status reaches trial_ready
    if (nextStatus === 'trial_ready' && targetOrder) {
      try {
        const callRes = await ordersAPI.directCall({
          phone_number: targetOrder.customer_phone || '+919876543210',
          customer_name: targetOrder.customer_name || 'Valued Customer',
          shop_name: targetOrder.shop_name || 'Royal Stitch Studio',
          garment_type: targetOrder.garment_type || 'Bespoke Garment',
          order_number: targetOrder.order_number || targetOrder.id,
          call_type: 'trial_ready'
        });

        const ordersWithCall = store.getOrders().map(o => {
          if (o.id === orderId) {
            return {
              ...o,
              last_call_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              last_call_status: callRes.data?.success ? 'Dispatched' : 'Call Status',
              last_call_driver: callRes.data?.driver,
              last_call_sid: callRes.data?.call_sid,
              last_call_error: callRes.data?.error
            };
          }
          return o;
        });
        localStorage.setItem('tailorhub_orders_list', JSON.stringify(ordersWithCall));
      } catch (err) {
        console.warn('[AutoCall Notification]', err);
      }
    }

    return store.getOrders();
  },

  triggerOrderCall: async (orderId, phoneOverride = null) => {
    const orders = store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const phoneToCall = phoneOverride || order.customer_phone || '+919876543210';
    try {
      const res = await ordersAPI.directCall({
        phone_number: phoneToCall,
        customer_name: order.customer_name || 'Valued Customer',
        shop_name: order.shop_name || 'Royal Stitch Studio',
        garment_type: order.garment_type || 'Bespoke Garment',
        order_number: order.order_number || order.id,
        call_type: order.status === 'trial_ready' ? 'trial_ready' : 'delivery_ready'
      });

      const updated = orders.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            customer_phone: phoneOverride || o.customer_phone,
            last_call_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            last_call_status: res.data?.success ? 'Dispatched' : 'Twilio Notice',
            last_call_driver: res.data?.driver,
            last_call_sid: res.data?.call_sid,
            last_call_error: res.data?.error
          };
        }
        return o;
      });
      localStorage.setItem('tailorhub_orders_list', JSON.stringify(updated));
      return res.data;
    } catch (e) {
      return { success: false, error: e.message || 'Call failed' };
    }
  },

  // ── Master Tailor Showcase Posts Methods ──
  getPosts: () => {
    try {
      const stored = localStorage.getItem('tailorhub_showcase_posts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('tailorhub_showcase_posts', JSON.stringify(DEFAULT_POSTS));
    return DEFAULT_POSTS;
  },

  createPost: (postData) => {
    const current = store.getPosts();
    const imagesList = postData.images && postData.images.length > 0 
      ? postData.images 
      : (postData.image_url ? [postData.image_url] : []);
    const primaryImg = imagesList[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80';

    const newPost = {
      id: `post-${Date.now()}`,
      tailor_id: postData.tailor_id || 'tailor-1',
      tailor_name: postData.tailor_name || 'Master Rajesh Kumar',
      shop_name: postData.shop_name || 'Royal Stitch Studio',
      avatar_url: postData.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      distance_km: postData.distance_km || 1.4,
      city: postData.city || 'Chennai',
      title: postData.title,
      garment_category: postData.garment_category || 'blouse',
      description: postData.description,
      fabric_details: postData.fabric_details || 'Pure Sourced Silk',
      margin_inches: postData.margin_inches || 2.5,
      front_neck: postData.front_neck || 'sweetheart',
      sleeve_style: postData.sleeve_style || 'elbow_puff',
      back_neck: postData.back_neck || 'deep_u_dori',
      turnaround_days: parseInt(postData.turnaround_days) || 4,
      estimated_price: parseFloat(postData.estimated_price) || 2400,
      image_url: primaryImg,
      images: imagesList,
      tags: postData.tags || ['#BespokeCraft', '#MasterTailor'],
      likes_count: 0,
      bookmarks_count: 0,
      is_liked: false,
      is_bookmarked: false,
      created_at: 'Just now'
    };
    const updated = [newPost, ...current];
    localStorage.setItem('tailorhub_showcase_posts', JSON.stringify(updated));
    return newPost;
  },

  likePost: (postId) => {
    const current = store.getPosts();
    const updated = current.map(p => {
      if (p.id === postId) {
        const liked = !p.is_liked;
        return {
          ...p,
          is_liked: liked,
          likes_count: liked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 1) - 1)
        };
      }
      return p;
    });
    localStorage.setItem('tailorhub_showcase_posts', JSON.stringify(updated));
    return updated;
  },

  bookmarkPost: (postId) => {
    const current = store.getPosts();
    const updated = current.map(p => {
      if (p.id === postId) {
        const bookmarked = !p.is_bookmarked;
        return {
          ...p,
          is_bookmarked: bookmarked,
          bookmarks_count: bookmarked ? (p.bookmarks_count || 0) + 1 : Math.max(0, (p.bookmarks_count || 1) - 1)
        };
      }
      return p;
    });
    localStorage.setItem('tailorhub_showcase_posts', JSON.stringify(updated));
    return updated;
  },

  // ── Tailor Records Management ──
  getRecords: () => {
    const stored = localStorage.getItem('tailorhub_records');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_RECORDS;
      }
    }
    localStorage.setItem('tailorhub_records', JSON.stringify(DEFAULT_RECORDS));
    return DEFAULT_RECORDS;
  },

  createRecord: (recordData) => {
    const records = store.getRecords();
    const newRecord = {
      id: recordData.id || `rec-${Date.now()}`,
      customer_name: recordData.customer_name || 'Valued Customer',
      customer_phone: recordData.customer_phone || '',
      customer_code: recordData.customer_code || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      garment_type: recordData.garment_type || 'Blouse',
      measurements: recordData.measurements || [],
      advance_paid: Number(recordData.advance_paid) || 0,
      notes: recordData.notes || '',
      source: recordData.source || 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newRecord, ...records];
    localStorage.setItem('tailorhub_records', JSON.stringify(updated));
    return newRecord;
  },

  updateRecord: (id, updates) => {
    const records = store.getRecords();
    const updated = records.map(r => r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r);
    localStorage.setItem('tailorhub_records', JSON.stringify(updated));
    return updated.find(r => r.id === id);
  },

  deleteRecord: (id) => {
    const records = store.getRecords();
    const updated = records.filter(r => r.id !== id);
    localStorage.setItem('tailorhub_records', JSON.stringify(updated));
    return updated;
  }
};

// Seed records demonstrating distinct customer tracking
const DEFAULT_RECORDS = [
  {
    id: 'rec-1',
    customer_name: 'Sunita Verma',
    customer_phone: '9876543210',
    customer_code: 'REC-SV782',
    garment_type: 'Blouse (Sweetheart)',
    measurements: [
      { key: 'Chest', value: '36.0', unit: 'inches' },
      { key: 'Waist', value: '30.0', unit: 'inches' },
      { key: 'Shoulder', value: '14.5', unit: 'inches' },
      { key: 'Length', value: '14.0', unit: 'inches' },
      { key: 'Sleeve Length', value: '10.0', unit: 'inches' }
    ],
    advance_paid: 500,
    notes: 'Customer prefers deep back with handmade dori latkan. Deliver by Thursday.',
    source: 'camera_ocr',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'rec-2',
    customer_name: 'Pooja Sharma',
    customer_phone: '9811223344',
    customer_code: 'REC-PS104',
    garment_type: 'Anarkali Kurta',
    measurements: [
      { key: 'Chest', value: '38.0', unit: 'inches' },
      { key: 'Waist', value: '32.0', unit: 'inches' },
      { key: 'Hips', value: '40.0', unit: 'inches' },
      { key: 'Length', value: '46.0', unit: 'inches' },
      { key: 'Armhole', value: '16.5', unit: 'inches' }
    ],
    advance_paid: 1000,
    notes: 'Flared 32-kali with churidar fit. Double safety seam margin.',
    source: 'voice_ai',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'rec-3',
    customer_name: 'Pooja Sharma',
    customer_phone: '9765432190',
    customer_code: 'REC-PS892',
    garment_type: 'Formal Blazer & Trousers',
    measurements: [
      { key: 'Chest', value: '34.0', unit: 'inches' },
      { key: 'Waist', value: '28.0', unit: 'inches' },
      { key: 'Shoulder', value: '15.0', unit: 'inches' },
      { key: 'Inseam', value: '30.0', unit: 'inches' },
      { key: 'Outseam', value: '39.0', unit: 'inches' }
    ],
    advance_paid: 1500,
    notes: 'Working at Tech Park. Distinct client from Pooja (Anarkali). Slim trouser cut.',
    source: 'manual',
    created_at: new Date().toISOString()
  }
];


// Seed showcase posts for Master Tailor creation feed
const DEFAULT_POSTS = [
  {
    id: 'post-1',
    tailor_id: 'tailor-1',
    tailor_name: 'Master Rajesh Kumar',
    shop_name: 'Royal Stitch Studio',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    distance_km: 1.4,
    city: 'Chennai',
    title: 'Crimson Bridal Silk Blouse with Antique Zardozi Work',
    garment_category: 'blouse',
    description: 'Completed this heritage bridal blouse for a bride needing zero-armhole pinching and a regal sweetheart cut. Hand-embroidered with antique metallic zardozi threads and pearl bead accents. Finished with our signature 2.5-inch safety inner margin for post-wedding alterations.',
    fabric_details: 'Pure Kanjeevaram Raw Silk with Cotton Mulmul Aster',
    margin_inches: 2.5,
    front_neck: 'sweetheart',
    sleeve_style: 'elbow_puff',
    back_neck: 'deep_u_dori',
    turnaround_days: 4,
    estimated_price: 2400,
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
    tags: ['#BridalBlouse', '#ZardoziEmbroidery', '#KanjeevaramSilk', '#2.5Margin'],
    likes_count: 84,
    bookmarks_count: 39,
    is_liked: false,
    is_bookmarked: false,
    created_at: '2 hours ago'
  },
  {
    id: 'post-2',
    tailor_id: 'tailor-2',
    tailor_name: 'Ustad Mohammed Irfan',
    shop_name: 'Savile Row Savvy Tailors',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    distance_km: 2.8,
    city: 'Bengaluru',
    title: 'Royal Navy Bandhgala with Floating Canvas Chest',
    garment_category: 'bandhgala',
    description: 'Tailored this custom bespoke Bandhgala Jodhpuri suit using Savile Row floating horsehair canvas interlining. Clean natural shoulders, military mandarin collar, and horn buttons. Double piped internal pockets and generous seam allowance.',
    fabric_details: 'Super 130s Merino Italian Wool',
    margin_inches: 2.0,
    front_neck: 'v_neck',
    sleeve_style: 'full_sleeve',
    back_neck: 'potli_buttons',
    turnaround_days: 6,
    estimated_price: 6800,
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80',
    tags: ['#Bandhgala', '#BespokeSuit', '#SavileRowCraft', '#HandCut'],
    likes_count: 126,
    bookmarks_count: 57,
    is_liked: false,
    is_bookmarked: false,
    created_at: 'Yesterday'
  },
  {
    id: 'post-3',
    tailor_id: 'tailor-3',
    tailor_name: 'Sharda Devi',
    shop_name: 'Sharda Ethnic Couture',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    distance_km: 3.5,
    city: 'Gurugram',
    title: '32-Kali Pastel Mint Georgette Anarkali Suit',
    garment_category: 'suit',
    description: '32 custom-pleated panels for maximum flare and fluid motion. Features micro-gotapatti border stitching on the flare and hand-pleated churidar cuffs with hook fastenings. Reinforced armholes to prevent fabric fraying.',
    fabric_details: 'Pure Viscose Georgette with Butter Crepe Lining',
    margin_inches: 2.5,
    front_neck: 'boat',
    sleeve_style: 'full_sleeve',
    back_neck: 'keyhole',
    turnaround_days: 5,
    estimated_price: 3800,
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
    tags: ['#AnarkaliSuit', '#GotaPatti', '#PastelCouture', '#BespokeFit'],
    likes_count: 95,
    bookmarks_count: 42,
    is_liked: false,
    is_bookmarked: false,
    created_at: '2 days ago'
  },
  {
    id: 'post-4',
    tailor_id: 'tailor-2',
    tailor_name: 'Ustad Mohammed Irfan',
    shop_name: 'Savile Row Savvy Tailors',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    distance_km: 2.8,
    city: 'Bengaluru',
    title: 'Hand-Rolled Collar Oxford Cotton Formal Shirt',
    garment_category: 'shirt',
    description: 'Single-needle 22-stitches-per-inch precision stitching. Cutaway spread collar designed specifically to sit upright without collapse under blazers. Mother-of-pearl cross-stitched buttons and french side gussets.',
    fabric_details: '100% Giza Egyptian 2-Ply Cotton',
    margin_inches: 1.5,
    front_neck: 'v_neck',
    sleeve_style: 'full_sleeve',
    back_neck: 'potli_buttons',
    turnaround_days: 3,
    estimated_price: 1600,
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=80',
    tags: ['#OxfordShirt', '#EgyptianCotton', '#MotherOfPearl', '#HandFinished'],
    likes_count: 67,
    bookmarks_count: 28,
    is_liked: false,
    is_bookmarked: false,
    created_at: '3 days ago'
  }
];

export default store;


