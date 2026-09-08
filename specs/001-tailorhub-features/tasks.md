# Tasks: TailorHub – Smart Digital Tailoring Platform

**Branch**: `001-tailorhub-features`  
**Date**: 2026-09-06  
**Status**: Ready for Implementation  
**Spec**: [specs/001-tailorhub-features/spec.md](file:///c:/Users/vijen\Downloads\tailor_app\specs\001-tailorhub-features\spec.md)  
**Plan**: [specs/001-tailorhub-features/plan.md](file:///c:/Users/vijen\Downloads\tailor_app\specs\001-tailorhub-features\plan.md)  
**Database**: [schema.sql](file:///c:/Users/vijen\Downloads\tailor_app\schema.sql)  

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for FastAPI backend and React frontend.

- [ ] T001 Create project directory structure for `backend/` and `frontend/` per implementation plan
- [ ] T002 [P] Configure Python backend dependencies in `backend/requirements.txt` (`fastapi`, `uvicorn`, `pydantic`, `sqlalchemy`, `asyncpg`, `python-multipart`, `opencv-python-headless`, `pytesseract`, `easyocr`, `supabase`)
- [ ] T003 [P] Initialize React Vite project in `frontend/` with `package.json`, `vite.config.js`, and `index.html`
- [ ] T004 [P] Create environment templates: `backend/.env.example` and `frontend/.env.example`
- [ ] T005 [P] Create warm tailoring light design tokens (ivory, linen, tailor indigo, tape gold) in `frontend/src/styles/variables.css` and base layout in `frontend/src/styles/layout.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Setup Supabase & SQLAlchemy database connection engine in `backend/src/db.py`
- [ ] T007 [P] Define core SQLAlchemy ORM models in `backend/src/models/orm_models.py` (`User`, `TailorShop`, `MeasurementProfile`, `Order`, `VisualSpecSheet`, `DigitizedRegisterPage`, `OutboundCallLog`, `ShopCapacityCalendar`)
- [ ] T008 [P] Define Pydantic request/response schemas in `backend/src/models/schemas.py`
- [ ] T009 [P] Implement authentication service (JWT token generation, bcrypt password hashing) in `backend/src/services/auth_service.py`
- [ ] T010 [P] Implement auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`) in `backend/src/api/auth.py`
- [ ] T011 Implement FastAPI entrypoint with CORS, route mounts, and error handling in `backend/src/main.py`
- [ ] T012 [P] Setup React AuthContext and Supabase client in `frontend/src/context/AuthContext.jsx` and `frontend/src/services/api.js`
- [ ] T013 [P] Build Sidebar navigation component with clean light theme tabs in `frontend/src/components/common/Sidebar.jsx`
- [ ] T014 [P] Build Header with role switcher (Tailor / Customer) and notifications in `frontend/src/components/common/Header.jsx`
- [ ] T015 Build high-conversion visual Landing Page (`LandingHero.jsx`, `FeatureShowcase.jsx`) in `frontend/src/components/landing/` showcasing core platform capabilities

**Checkpoint**: Foundation ready — database connected, authentication ready, and shell UI running.

---

## Phase 3: User Story 1 - Core Dual-Interface Shop & Order OS with Multi-Member Profiles (Priority: P1) 🎯 MVP

**Goal**: Enable customers to maintain multiple saved measurement profiles ("Swiggy-style" for Self, Dad, Mom, Aarav) across universal garments and book orders, while tailors manage customers, pricing, and 5-stage order progress digitally.

**Independent Test**: Onboard 1 tailor and 1 customer, save 2 distinct member measurement profiles under the customer ("Self" - Blouse, "Dad" - Formal Shirt), submit an order for "Dad", advance stages (`received` $\rightarrow$ `cutting` $\rightarrow$ `stitching` $\rightarrow$ `trial_ready` $\rightarrow$ `delivered`), and verify both parties see synced status updates.

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement multi-member measurement profiles CRUD API in `backend/src/api/measurements.py`
- [ ] T017 [P] [US1] Implement order creation, list filtering, and status progression API in `backend/src/api/orders.py`
- [ ] T018 [P] [US1] Implement tailor shop profile and pricing configuration API in `backend/src/api/shops.py`
- [ ] T019 [P] [US1] Build Swiggy-style member card list with custom relationship tags (`[Self]`, `[Dad]`, `[Mom]`, `[Son]`) in `frontend/src/components/measurements/MemberProfileCard.jsx`
- [ ] T020 [US1] Build universal garment measurement intake form (blouse, shirt, trouser, suit, dress, kurta, uniform) in `frontend/src/components/measurements/MeasurementForm.jsx`
- [ ] T021 [US1] Build Tailor Dashboard with active order queue, status pill updates, and financial summaries in `frontend/src/components/tailor/DashboardOverview.jsx`
- [ ] T022 [US1] Build Customer Order Tracker with visual 5-stage timeline in `frontend/src/components/customer/OrderTracker.jsx`
- [ ] T023 [US1] Build Booking Wizard allowing 1-click member profile selection at checkout in `frontend/src/components/customer/BookingWizard.jsx`

**Checkpoint**: User Story 1 is fully functional and delivers a complete, standalone MSME tailoring MVP!

---

## Phase 4: User Story 2 - AI/OCR Old Book Digitization with Human-in-the-Loop (Priority: P1)

**Goal**: Allow tailors to photograph legacy paper registers, run local OpenCV image pre-processing + Tesseract/EasyOCR extraction, and verify/commit structured customer records in a split-screen UI.

**Independent Test**: Upload a sample image of a handwritten register page, verify bounding box extractions on the split-screen verification UI, correct candidate numbers, and commit to the database, confirming the customer record is searchable by phone number.

### Implementation for User Story 2

- [ ] T024 [P] [US2] Implement OpenCV image pre-processing pipeline (deskewing, Otsu binarization, noise removal) in `backend/src/services/ocr_service.py`
- [ ] T025 [P] [US2] Implement OCR text parsing and key-value regex extractor for names, phones, and measurements in `backend/src/api/ocr_engine.py`
- [ ] T026 [US2] Implement register upload endpoint with bounding box coordinate generation in `backend/src/api/ocr_engine.py`
- [ ] T027 [US2] Build register photo camera/file upload screen in `frontend/src/components/tailor/OldBookScanner.jsx`
- [ ] T028 [US2] Build interactive Human-in-the-Loop (HITL) split-screen verification screen (original crop on left, editable text on right) in `frontend/src/components/tailor/OldBookScanner.jsx`
- [ ] T029 [US2] Connect verification confirmation to auto-generate permanent `users` and `measurement_profiles` records in `backend/src/api/ocr_engine.py`

**Checkpoint**: User Stories 1 AND 2 are both functional independently, solving the legacy data switching barrier!

---

## Phase 5: User Story 3 - Hands-Free "Voice Tape" Assistant (Priority: P2)

**Goal**: Allow tailors holding measuring tape and cloth to speak measurements aloud in English, auto-populating form fields with zero typing and zero server audio costs.

**Independent Test**: Open the measurement intake form, activate the microphone, speak *"Chest 38, Waist 32, Full length 29, Shoulder 17"*, and verify the browser Web Speech API parses the numbers and populates the matching inputs with green success indicators.

### Implementation for User Story 3

- [ ] T030 [P] [US3] Implement browser-native Web Speech API listener hook in `frontend/src/hooks/useVoiceTape.js`
- [ ] T031 [P] [US3] Implement speech tokenizer and garment slot-matching parser (handling number strings, fractions like "14 and half" $\rightarrow$ `14.5`) in `frontend/src/utils/voiceParser.js`
- [ ] T032 [US3] Build interactive Voice Tape modal with prominent pulse-ring microphone button in `frontend/src/components/measurements/VoiceTapeModal.jsx`
- [ ] T033 [US3] Add audio feedback tones, active field advance, and manual override controls in `frontend/src/components/measurements/VoiceTapeModal.jsx`

**Checkpoint**: Tailors can capture a full 10-point measurement card in under 60 seconds completely hands-free!

---

## Phase 6: User Story 4 - Visual "Anti-Dispute" Specification Sheet & PDF Job Card (Priority: P2)

**Goal**: Replace verbal instructions with an interactive 2D SVG/Canvas visualizer and generate a locked, printable PDF "Cutting Job Card" with internal seam margin callouts.

**Independent Test**: Create an order, select modular visual options (Sweetheart Front Neck, Deep U Back with Dori, Elbow-Length Puff Sleeve, 2.5-inch inner margin), observe the live composite SVG render, and download the print-ready PDF Cutting Job Card.

### Implementation for User Story 4

- [ ] T034 [P] [US4] Build 2D SVG parametric vector garment generator for necklines, backs, and sleeves in `frontend/src/components/visualizer/GarmentCanvas.jsx`
- [ ] T035 [US4] Build modular visual specification builder with pads, lining, and internal seam margin slider in `frontend/src/components/visualizer/SpecSheetBuilder.jsx`
- [ ] T036 [US4] Implement spec sheet locking and blueprint persistence endpoints in `backend/src/api/visual_specs.py`
- [ ] T037 [US4] Implement printable PDF "Cutting Job Card" generator (with QR code, measurements, and margin callout) in `frontend/src/utils/pdfGenerator.js`

**Checkpoint**: Visual specification blueprint eliminates fabric-ruining disputes between tailors and customers!

---

## Phase 7: User Story 5 - Dynamic Capacity & "Express Stitching" Workload Balancer (Priority: P3)

**Goal**: Prevent festive/wedding season overbooking with a color-coded capacity calendar and automated express surcharges for rush delivery requests.

**Independent Test**: Set tailor daily limit to 5 garments, book 5 orders on Date X (triggering "Full/Red"), attempt a rush booking on Date X, and verify the system displays an express surcharge notice (+30%) and flags the order as Express.

### Implementation for User Story 5

- [ ] T038 [P] [US5] Implement shop capacity tracking and express surcharge computation in `backend/src/api/capacity.py`
- [ ] T039 [US5] Build interactive color-coded workload calendar (Green: Available, Yellow: Heavy, Red: Full) in `frontend/src/components/tailor/CapacityCalendar.jsx`
- [ ] T040 [US5] Integrate dynamic date slot picker and express surcharge approval notice into customer order flow in `frontend/src/components/customer/BookingWizard.jsx`

---

## Phase 8: User Story 6 - AI Outbound Voice Call for Trials & Delivery (Priority: P3)

**Goal**: Automatically trigger voice phone calls to customers when garments reach `Trial Ready` or `Delivered`, with an interactive audio simulator for development.

**Independent Test**: Move an order to `Trial Ready`, click "Notify via Voice Call", hear the synthesized audio speech playback with order ID and shop timings, and verify the call outcome is logged.

### Implementation for User Story 6

- [ ] T041 [P] [US6] Implement pluggable telephony adapter interface with mock and webhook drivers in `backend/src/services/telephony_service.py`
- [ ] T042 [US6] Implement outbound call trigger API and call log repository in `backend/src/api/telephony.py`
- [ ] T043 [US6] Build interactive in-browser phone call simulator with Web Speech Synthesis TTS in `frontend/src/components/tailor/TelephonySimulator.jsx`
- [ ] T044 [US6] Display outbound call status badges and retry controls on Tailor Orders Dashboard in `frontend/src/components/tailor/DashboardOverview.jsx`

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: UI refinement, end-to-end integration validation, and production readiness.

- [ ] T045 End-to-end validation of all 5 scenarios from `quickstart.md`
- [ ] T046 Style polish, smooth animations, and light theme contrast audit across mobile and desktop viewports
- [ ] T047 Verify Supabase database schema compatibility and sample seed data loading from `schema.sql`
- [ ] T048 Update developer documentation and create root launch script (`start-dev.bat` / `npm run dev`)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**.
- **User Story 1 (Phase 3)**: Depends on Phase 2 — Deliver as core working MVP.
- **User Story 2 (Phase 4)**: Can start after Phase 2 (runs in parallel or sequence with US1).
- **User Story 3 (Phase 5)**: Depends on Phase 3 measurement form.
- **User Story 4 (Phase 6)**: Depends on Phase 3 order creation.
- **User Story 5 (Phase 7)**: Depends on Phase 3 order scheduling.
- **User Story 6 (Phase 8)**: Depends on Phase 3 order status progression.
- **Polish (Phase 9)**: Runs after desired user stories are completed.
