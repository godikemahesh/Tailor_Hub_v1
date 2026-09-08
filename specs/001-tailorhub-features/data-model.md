# Data Model Specification: TailorHub

**Branch**: `001-tailorhub-features`  
**Date**: 2026-09-06  
**Status**: Completed  
**Subject**: Relational and JSONB Data Schemas for PostgreSQL & Supabase

---

## 1. Entity-Relationship Overview

```
[users] (role: customer) ───< [measurement_profiles] (multi-member: Self, Dad, Mom, etc.)
   │                                  │
   │                                  │ (measurement snapshot)
   ▼                                  ▼
[orders] >─────────────────────── [orders]
   ▲                                  │
   │                                  ▼
[users] (role: tailor) ─────── [visual_spec_sheets] (2D SVG blueprint & Job Card)
   │                                  │
   ├─< [tailor_shops]                 ▼
   ├─< [digitized_register_pages] [outbound_call_logs]
   └─< [shop_capacity_calendar]
```

---

## 2. Core Entities

### 2.1 `users`
Represents an authenticated user in the system (either a customer or a tailoring business owner).
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `email` (VARCHAR(255), Unique, Not Null)
- `password_hash` (VARCHAR(255), Nullable for OAuth users)
- `google_id` (VARCHAR(255), Nullable, Unique)
- `role` (VARCHAR(20), Not Null, Check: `role IN ('customer', 'tailor', 'admin')`)
- `full_name` (VARCHAR(150), Not Null)
- `phone_number` (VARCHAR(20), Not Null)
- `preferred_language` (VARCHAR(10), Default `'en'`, Values: `'en'`, `'te'`, `'hi'`)
- `avatar_url` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)
- `updated_at` (TIMESTAMPTZ, Default `NOW()`)

---

### 2.2 `tailor_shops`
Business profile and operational configuration for tailors.
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `tailor_id` (UUID, Foreign Key $\rightarrow$ `users(id)`, On Delete Cascade, Unique)
- `shop_name` (VARCHAR(200), Not Null)
- `tagline` (VARCHAR(255), Nullable)
- `address` (TEXT, Not Null)
- `city` (VARCHAR(100), Not Null)
- `pincode` (VARCHAR(10), Not Null)
- `daily_capacity` (INT, Default 8, Not Null) — Max garments standard throughput per working day
- `express_surcharge_percent` (NUMERIC(5,2), Default 30.00) — Markup percentage for rush slots
- `standard_lead_days` (INT, Default 7) — Default turnaround days
- `supported_garments` (TEXT[], Default `ARRAY['blouse', 'kurta', 'shirt', 'trouser', 'suit', 'dress']`)
- `is_accepting_orders` (BOOLEAN, Default TRUE)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)
- `updated_at` (TIMESTAMPTZ, Default `NOW()`)

---

### 2.3 `measurement_profiles` (Multi-Member Swiggy-Style)
Allows customers to maintain multiple named measurement cards across family/household members.
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `customer_id` (UUID, Foreign Key $\rightarrow$ `users(id)`, On Delete Cascade)
- `member_name` (VARCHAR(100), Not Null) — e.g. "Self", "Dad", "Mom", "Aarav", "Pooja"
- `relationship_tag` (VARCHAR(50), Default `'self'`) — e.g. `'self'`, `'father'`, `'mother'`, `'spouse'`, `'child'`, `'friend'`
- `gender_category` (VARCHAR(20), Not Null, Check: `gender_category IN ('women', 'men', 'kids', 'unisex')`)
- `garment_type` (VARCHAR(50), Not Null) — e.g. `'blouse'`, `'shirt'`, `'trouser'`, `'suit'`, `'kurta'`, `'dress'`, `'pyjama'`
- `measurements` (JSONB, Not Null) — Standardized numeric dimensions in inches/cm:
  ```json
  {
    "bust_chest": 36.5,
    "waist": 30.0,
    "hips": 38.0,
    "full_length": 14.5,
    "shoulder_width": 14.0,
    "front_neck_depth": 6.5,
    "back_neck_depth": 8.5,
    "armhole": 16.0,
    "sleeve_length": 10.5,
    "sleeve_round": 12.0,
    "apex_point": 9.5,
    "unit": "inches"
  }
  ```
- `notes` (TEXT, Nullable) — e.g. "Prefers slightly loose armholes"
- `source` (VARCHAR(30), Default `'manual'`, Check: `source IN ('manual', 'voice_tape', 'ocr_digitized', 'sample_garment')`)
- `is_default` (BOOLEAN, Default FALSE)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)
- `updated_at` (TIMESTAMPTZ, Default `NOW()`)

---

### 2.4 `orders`
Primary transaction tracking each custom stitching job through the shop workflow.
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `order_number` (VARCHAR(30), Unique, Not Null) — e.g. `TH-2026-1001`
- `customer_id` (UUID, Foreign Key $\rightarrow$ `users(id)`)
- `tailor_id` (UUID, Foreign Key $\rightarrow$ `users(id)`)
- `member_name` (VARCHAR(100), Not Null) — Name of the individual being stitched for
- `garment_type` (VARCHAR(50), Not Null)
- `measurement_profile_id` (UUID, Foreign Key $\rightarrow$ `measurement_profiles(id)`)
- `measurements_snapshot` (JSONB, Not Null) — Immutable frozen copy of measurements at order time
- `status` (VARCHAR(30), Default `'received'`, Check: `status IN ('received', 'cutting', 'stitching', 'trial_ready', 'delivered', 'cancelled')`)
- `promised_date` (DATE, Not Null)
- `is_express` (BOOLEAN, Default FALSE)
- `base_price` (NUMERIC(10,2), Not Null)
- `express_fee` (NUMERIC(10,2), Default 0.00)
- `total_price` (NUMERIC(10,2), Not Null)
- `advance_paid` (NUMERIC(10,2), Default 0.00)
- `balance_due` (NUMERIC(10,2), Not Null)
- `cloth_received_notes` (TEXT, Nullable) — e.g. "Blue Kanchipuram silk + 1m cotton aster + matching latkans"
- `customer_notes` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)
- `updated_at` (TIMESTAMPTZ, Default `NOW()`)

---

### 2.5 `visual_spec_sheets`
Visual contract and blueprint specification attached to an order.
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `order_id` (UUID, Foreign Key $\rightarrow$ `orders(id)`, On Delete Cascade, Unique)
- `garment_type` (VARCHAR(50), Not Null)
- `front_neck_style` (VARCHAR(50), Not Null) — e.g. `'round'`, `'sweetheart'`, `'v_neck'`, `'boat'`, `'collar'`, `'square'`
- `back_neck_style` (VARCHAR(50), Not Null) — e.g. `'deep_u'`, `'keyhole'`, `'open_back'`, `'potli_buttons'`, `'high_back'`
- `sleeve_style` (VARCHAR(50), Not Null) — e.g. `'sleeveless'`, `'cap'`, `'short'`, `'elbow_length'`, `'full'`, `'puff'`
- `lining_type` (VARCHAR(50), Default `'cotton'`) — e.g. `'none'`, `'cotton'`, `'butter_crepe'`, `'satin'`
- `pads_type` (VARCHAR(50), Default `'none'`) — e.g. `'none'`, `'removable'`, `'stitched_in'`
- `internal_margin_inches` (NUMERIC(3,1), Default 2.0) — Extra folded fabric inside for future alterations
- `tassels_latkans` (BOOLEAN, Default FALSE)
- `dori_fasteners` (BOOLEAN, Default FALSE)
- `special_instructions` (TEXT, Nullable)
- `blueprint_svg_data` (TEXT, Nullable) — SVG vector markup
- `job_card_pdf_url` (TEXT, Nullable) — Rendered PDF cutting slip in storage
- `is_locked` (BOOLEAN, Default FALSE)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)

---

### 2.6 `digitized_register_pages`
Legacy register scans processed via OpenCV + Tesseract/EasyOCR.
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `tailor_id` (UUID, Foreign Key $\rightarrow$ `users(id)`, On Delete Cascade)
- `image_url` (TEXT, Not Null)
- `raw_ocr_text` (TEXT, Nullable)
- `extracted_records` (JSONB, Not Null) — Array of candidate customer records:
  ```json
  [
    {
      "candidate_name": "R. Lakshmi",
      "candidate_phone": "9848022338",
      "garment": "blouse",
      "measurements": { "length": 14.5, "chest": 36.0, "waist": 30.0 },
      "bounding_box": { "x": 45, "y": 120, "w": 380, "h": 210 },
      "confidence": 0.88,
      "verified": false
    }
  ]
  ```
- `verification_status` (VARCHAR(30), Default `'pending_review'`, Check: `verification_status IN ('pending_review', 'partially_verified', 'completed')`)
- `verified_count` (INT, Default 0)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)

---

### 2.7 `outbound_call_logs`
Logs of automated voice phone calls placed to customers.
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `order_id` (UUID, Foreign Key $\rightarrow$ `orders(id)`, On Delete Cascade)
- `customer_phone` (VARCHAR(20), Not Null)
- `call_type` (VARCHAR(30), Not Null, Check: `call_type IN ('trial_ready', 'delivery_ready', 'reminder')`)
- `language` (VARCHAR(10), Default `'en'`, Check: `language IN ('en', 'te', 'hi')`)
- `status` (VARCHAR(30), Default `'initiated'`, Check: `status IN ('initiated', 'ringing', 'completed', 'busy', 'no_answer', 'failed')`)
- `duration_seconds` (INT, Default 0)
- `provider` (VARCHAR(30), Default `'simulated'`) — e.g. `'simulated'`, `'twilio'`, `'exotel'`
- `tts_message_body` (TEXT, Not Null)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)

---

### 2.8 `shop_capacity_calendar`
Tracks tailor daily throughput to calculate express fees and prevent overbooking.
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `tailor_id` (UUID, Foreign Key $\rightarrow$ `users(id)`, On Delete Cascade)
- `slot_date` (DATE, Not Null)
- `booked_count` (INT, Default 0)
- `max_capacity` (INT, Default 8)
- `is_blocked` (BOOLEAN, Default FALSE)
- Unique constraint on `(tailor_id, slot_date)`

---

## 3. Order Status State Machine

```
[received] 
    │
    ▼ (Tailor starts fabric prep)
 [cutting]
    │
    ▼ (Master cutter completes fabric panels)
[stitching]
    │
    ▼ (Garment assembled, trial ready)
[trial_ready] ───► [Triggers Outbound Voice Call to Customer]
    │
    ▼ (Trial approved or final press complete)
[delivered]
```
*(At any stage prior to cutting, an order can transition to `cancelled` with full refund)*
