-- ==============================================================================
-- TailorHub PostgreSQL Schema for Supabase
-- Target: Supabase SQL Editor (Clean Run / Idempotent)
-- Author: Spec Kit Architecture Team
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running (order respects FK constraints)
DROP TABLE IF EXISTS outbound_call_logs CASCADE;
DROP TABLE IF EXISTS digitized_register_pages CASCADE;
DROP TABLE IF EXISTS visual_spec_sheets CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS shop_capacity_calendar CASCADE;
DROP TABLE IF EXISTS measurement_profiles CASCADE;
DROP TABLE IF EXISTS tailor_shops CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- 3. Users Table (Customer and Tailor Accounts)
-- ==============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'tailor', 'admin')),
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en' CHECK (preferred_language IN ('en', 'te', 'hi')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==============================================================================
-- 4. Tailor Shops Table (Shop Settings & Capacity)
-- ==============================================================================
CREATE TABLE tailor_shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tailor_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_name VARCHAR(200) NOT NULL,
    tagline VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    daily_capacity INT NOT NULL DEFAULT 8 CHECK (daily_capacity > 0),
    express_surcharge_percent NUMERIC(5,2) NOT NULL DEFAULT 30.00,
    standard_lead_days INT NOT NULL DEFAULT 7,
    supported_garments TEXT[] DEFAULT ARRAY['blouse', 'kurta', 'shirt', 'trouser', 'suit', 'dress', 'pyjama', 'uniform'],
    is_accepting_orders BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tailor_shops_city ON tailor_shops(city);

-- ==============================================================================
-- 5. Measurement Profiles Table (Multi-Member Swiggy-Style)
-- ==============================================================================
CREATE TABLE measurement_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_name VARCHAR(100) NOT NULL, -- e.g. "Self", "Dad", "Mom", "Aarav"
    relationship_tag VARCHAR(50) DEFAULT 'self', -- self, father, mother, spouse, child, friend
    gender_category VARCHAR(20) NOT NULL CHECK (gender_category IN ('women', 'men', 'kids', 'unisex')),
    garment_type VARCHAR(50) NOT NULL, -- blouse, shirt, trouser, suit, kurta, dress, etc.
    measurements JSONB NOT NULL, -- structured numeric parameters
    notes TEXT,
    source VARCHAR(30) DEFAULT 'manual' CHECK (source IN ('manual', 'voice_tape', 'ocr_digitized', 'sample_garment')),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_measurements_customer ON measurement_profiles(customer_id);
CREATE INDEX idx_measurements_member ON measurement_profiles(customer_id, member_name);

-- ==============================================================================
-- 6. Orders Table (Custom Stitching Workflow)
-- ==============================================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id),
    tailor_id UUID NOT NULL REFERENCES users(id),
    member_name VARCHAR(100) NOT NULL,
    garment_type VARCHAR(50) NOT NULL,
    measurement_profile_id UUID REFERENCES measurement_profiles(id) ON DELETE SET NULL,
    measurements_snapshot JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'received' CHECK (status IN ('received', 'cutting', 'stitching', 'trial_ready', 'delivered', 'cancelled')),
    promised_date DATE NOT NULL,
    is_express BOOLEAN DEFAULT FALSE,
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    express_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    advance_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    cloth_received_notes TEXT,
    customer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_tailor ON orders(tailor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_promised_date ON orders(promised_date);

-- ==============================================================================
-- 7. Visual Spec Sheets Table (2D SVG Blueprint & Cutting Slip)
-- ==============================================================================
CREATE TABLE visual_spec_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    garment_type VARCHAR(50) NOT NULL,
    front_neck_style VARCHAR(50) NOT NULL DEFAULT 'round',
    back_neck_style VARCHAR(50) NOT NULL DEFAULT 'deep_u',
    sleeve_style VARCHAR(50) NOT NULL DEFAULT 'short',
    lining_type VARCHAR(50) NOT NULL DEFAULT 'cotton',
    pads_type VARCHAR(50) NOT NULL DEFAULT 'none',
    internal_margin_inches NUMERIC(3,1) NOT NULL DEFAULT 2.0,
    tassels_latkans BOOLEAN DEFAULT FALSE,
    dori_fasteners BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,
    blueprint_svg_data TEXT,
    job_card_pdf_url TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visual_spec_order ON visual_spec_sheets(order_id);

-- ==============================================================================
-- 8. Digitized Register Pages (Old Book OCR System)
-- ==============================================================================
CREATE TABLE digitized_register_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tailor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    raw_ocr_text TEXT,
    extracted_records JSONB NOT NULL DEFAULT '[]'::jsonb,
    verification_status VARCHAR(30) DEFAULT 'pending_review' CHECK (verification_status IN ('pending_review', 'partially_verified', 'completed')),
    verified_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_digitized_tailor ON digitized_register_pages(tailor_id);

-- ==============================================================================
-- 9. Outbound Call Logs Table (Pluggable Voice Telephony)
-- ==============================================================================
CREATE TABLE outbound_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    call_type VARCHAR(30) NOT NULL CHECK (call_type IN ('trial_ready', 'delivery_ready', 'reminder')),
    language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'te', 'hi')),
    status VARCHAR(30) NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'completed', 'busy', 'no_answer', 'failed')),
    duration_seconds INT DEFAULT 0,
    provider VARCHAR(30) DEFAULT 'simulated',
    tts_message_body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calls_order ON outbound_call_logs(order_id);

-- ==============================================================================
-- 10. Shop Capacity Calendar (Workload & Express Balancer)
-- ==============================================================================
CREATE TABLE shop_capacity_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tailor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    booked_count INT NOT NULL DEFAULT 0,
    max_capacity INT NOT NULL DEFAULT 8,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tailor_id, slot_date)
);

CREATE INDEX idx_capacity_tailor_date ON shop_capacity_calendar(tailor_id, slot_date);

-- ==============================================================================
-- 11. Automated Triggers: Update updated_at Timestamps
-- ==============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tailor_shops
BEFORE UPDATE ON tailor_shops
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_measurements
BEFORE UPDATE ON measurement_profiles
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_capacity
BEFORE UPDATE ON shop_capacity_calendar
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==============================================================================
-- 12. Sample Seed Data (Ready for Immediate Testing)
-- ==============================================================================

-- Insert 1 Demo Tailor
INSERT INTO users (id, email, password_hash, role, full_name, phone_number, preferred_language)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'master.tailor@tailorhub.com',
    '$2b$12$KIXe28xH/01/demoTailorHashSampleKeyOnly...',
    'tailor',
    'Ramesh Master (Sri Balaji Tailors)',
    '+91-9848011223',
    'en'
);

-- Insert Tailor Shop Configuration
INSERT INTO tailor_shops (tailor_id, shop_name, tagline, address, city, pincode, daily_capacity, express_surcharge_percent)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Sri Balaji Designer Tailors',
    'Specialist in Bridal Blouses, Suits, Dresses & Uniforms',
    'Plot #42, Main Road, Beside Vijaya Bank',
    'Hyderabad',
    '500072',
    6,
    35.00
);

-- Insert 1 Demo Customer
INSERT INTO users (id, email, password_hash, role, full_name, phone_number, preferred_language)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'priya.sharma@example.com',
    '$2b$12$KIXe28xH/01/demoCustomerHashSampleKey...',
    'customer',
    'Priya Sharma',
    '+91-9876543210',
    'en'
);

-- Insert Multi-Member Saved Measurement Profiles for Priya Sharma (Swiggy-Style)
-- 1. Self (Blouse)
INSERT INTO measurement_profiles (customer_id, member_name, relationship_tag, gender_category, garment_type, measurements, notes, source, is_default)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Self (Priya)',
    'self',
    'women',
    'blouse',
    '{"bust_chest": 36.0, "waist": 30.0, "full_length": 14.5, "shoulder_width": 14.0, "front_neck_depth": 6.5, "back_neck_depth": 8.5, "armhole": 16.0, "sleeve_length": 10.5, "sleeve_round": 12.0, "apex_point": 9.5, "unit": "inches"}'::jsonb,
    'Keep 2-inch margin inside; prefers boat neck',
    'manual',
    TRUE
);

-- 2. Dad (Formal Shirt)
INSERT INTO measurement_profiles (customer_id, member_name, relationship_tag, gender_category, garment_type, measurements, notes, source, is_default)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Dad (Mr. Sharma)',
    'father',
    'men',
    'shirt',
    '{"bust_chest": 40.0, "waist": 36.0, "full_length": 29.5, "shoulder_width": 18.0, "collar": 16.0, "sleeve_length": 24.5, "cuff": 9.5, "unit": "inches"}'::jsonb,
    'Comfort regular fit, double chest pocket',
    'manual',
    FALSE
);

-- 3. Kid (Aarav - School Uniform)
INSERT INTO measurement_profiles (customer_id, member_name, relationship_tag, gender_category, garment_type, measurements, notes, source, is_default)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Aarav (Son)',
    'child',
    'kids',
    'uniform',
    '{"bust_chest": 28.0, "waist": 24.0, "full_length": 21.0, "shoulder_width": 12.0, "trouser_length": 28.0, "inseam": 20.0, "unit": "inches"}'::jsonb,
    'Standard school uniform specs with badge loop',
    'manual',
    FALSE
);

-- Insert 1 Sample Active Order for Priya (Bridal Blouse)
INSERT INTO orders (
    id,
    order_number,
    customer_id,
    tailor_id,
    member_name,
    garment_type,
    measurements_snapshot,
    status,
    promised_date,
    is_express,
    base_price,
    express_fee,
    total_price,
    advance_paid,
    balance_due,
    cloth_received_notes
)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'TH-2026-0001',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Self (Priya)',
    'blouse',
    '{"bust_chest": 36.0, "waist": 30.0, "full_length": 14.5, "shoulder_width": 14.0, "front_neck_depth": 6.5, "back_neck_depth": 8.5, "armhole": 16.0, "sleeve_length": 10.5, "sleeve_round": 12.0, "apex_point": 9.5, "unit": "inches"}'::jsonb,
    'received',
    CURRENT_DATE + INTERVAL '5 days',
    FALSE,
    850.00,
    0.00,
    850.00,
    500.00,
    350.00,
    'Maroon Kanchi Silk + 1m cotton aster + gold beaded latkans'
);

-- Insert Visual Spec Sheet for Order TH-2026-0001
INSERT INTO visual_spec_sheets (
    order_id,
    garment_type,
    front_neck_style,
    back_neck_style,
    sleeve_style,
    lining_type,
    pads_type,
    internal_margin_inches,
    tassels_latkans,
    dori_fasteners,
    special_instructions
)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'blouse',
    'sweetheart',
    'deep_u',
    'elbow_length',
    'cotton',
    'stitched_in',
    2.5,
    TRUE,
    TRUE,
    'Ensure gold piping on back sweetheart curve. Fold 2.5 inch internal margin for loosening.'
);
