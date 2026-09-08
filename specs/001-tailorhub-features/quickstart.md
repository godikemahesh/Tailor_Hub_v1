# Quickstart & Validation Guide: TailorHub

**Branch**: `001-tailorhub-features`  
**Date**: 2026-09-06  
**Status**: Ready for Validation  

---

## 1. Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18.x or higher (npm / npx)
- **Database**: PostgreSQL (Supabase project or local PostgreSQL 15+)
- **System OCR**: `tesseract-ocr` (optional for local image testing)

---

## 2. Environment Setup

### 2.1 Supabase Database Initialization
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project $\rightarrow$ Navigate to **SQL Editor**.
3. Copy the entire contents of [schema.sql](file:///c:/Users/vijen/Downloads/tailor_app/schema.sql) and paste it into the editor.
4. Click **Run**.
5. *Verification*: The 8 tables (`users`, `tailor_shops`, `measurement_profiles`, `orders`, `visual_spec_sheets`, `digitized_register_pages`, `outbound_call_logs`, `shop_capacity_calendar`) and seed data are created.

### 2.2 Backend Environment (`backend/`)
Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql+asyncpg://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres
SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
SUPABASE_KEY=[YOUR_ANON_OR_SERVICE_KEY]
JWT_SECRET=tailorhub_super_secret_jwt_key_2026
PORT=8000
TELEPHONY_PROVIDER=simulated
```

Install backend dependencies:
```bash
cd backend
pip install fastapi uvicorn pydantic sqlalchemy asyncpg python-multipart opencv-python-headless pytesseract easyocr
python -m uvicorn main:app --reload --port 8000
```

### 2.3 Frontend Environment (`frontend/`)
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

Run Vite development server:
```bash
cd frontend
npm install
npm run dev
```

---

## 3. End-to-End Validation Scenarios

### Scenario 1: Multi-Member Measurement Profiles ("Swiggy-Style")
1. Open the frontend in your browser: `http://localhost:5173`.
2. Log in as Customer (`priya.sharma@example.com`).
3. Navigate to **Saved Measurements** tab on the sidebar.
4. Verify you see the seeded cards:
   - `Self (Priya)` - Blouse
   - `Dad (Mr. Sharma)` - Formal Shirt
   - `Aarav (Son)` - School Uniform
5. Click **+ Add Member Profile**, select relation `Mother`, garment `Kurta/Kameez`, fill dimensions, and save.
6. *Outcome*: New member profile card appears instantly and is selectable during order checkout.

### Scenario 2: Hands-Free "Voice Tape" Assistant
1. In the tailor portal (`master.tailor@tailorhub.com`), click **New Measurement**.
2. Select Garment Type: `Men's Shirt` or `Blouse`.
3. Click the prominent microphone button: **"Start Voice Tape"**.
4. Speak aloud into your microphone in English:
   > *"Chest 38, Waist 32, Full length 29, Shoulder 17"*
5. *Outcome*: The Web Speech API recognizes the speech, parses the keywords, and populates the matching input boxes hands-free with green confirmation badges.

### Scenario 3: Visual "Anti-Dispute" Specification Sheet & PDF Job Card
1. Open an active order or start a new order configuration.
2. Select neckline options: `Front: Sweetheart`, `Back: Deep U with Dori`, `Sleeves: Elbow-Length Puff`, `Inner Margin: 2.5 inches`.
3. Observe the live 2D SVG canvas render the composite vector garment.
4. Click **"Generate Cutting Job Card (PDF)"**.
5. *Outcome*: A clean, print-ready PDF is generated showing the exact neckline curvature, sleeve specs, measurements, and margin callout for the master cutter.

### Scenario 4: Old Book OCR Digitization (Human-in-the-Loop)
1. In the Tailor Console, navigate to the **Old Book Digitizer** tab.
2. Upload a sample image of a handwritten register page.
3. Click **"Process Register Page"**.
4. The system runs OpenCV filtering and OCR extraction, displaying the original crop on the left and editable candidate fields on the right.
5. Review and edit any numbers, then click **"Confirm & Save to Customer Records"**.
6. *Outcome*: Extracted customer records are committed to the database and become instantly searchable by phone number.

### Scenario 5: Order Stage Progression & Automated Outbound Call
1. In the Tailor Orders dashboard, locate order `TH-2026-0001`.
2. Advance status from `Stitching` to `Trial Ready`.
3. Click **"Notify via Voice Call"**.
4. With the default `simulated` provider, an interactive call modal pops up with synthesized voice speech:
   > *"Namaskaram Priya garu! Your Bridal Blouse (Order #TH-2026-0001) is ready for trial at Sri Balaji Tailors..."*
5. Complete the call and verify the call outcome is logged under `outbound_call_logs`.
