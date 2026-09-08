# Implementation Plan: TailorHub – Smart Digital Tailoring Platform

**Branch**: `001-tailorhub-features` | **Date**: 2026-09-06 | **Spec**: [specs/001-tailorhub-features/spec.md](file:///c:/Users/vijen/Downloads/tailor_app/specs/001-tailorhub-features/spec.md)

**Input**: Feature specification covering dual-interface management, multi-member saved measurement profiles ("Swiggy-style"), universal garment support, OpenCV+OCR register digitization, Web Speech voice tape, 2D SVG visual anti-dispute blueprint, dynamic capacity balancing, and pluggable outbound call notifications.

---

## Summary

TailorHub is a full-stack smart digital tailoring business management platform built with **Python (FastAPI)** for high-throughput async processing and local computer vision, **React 18+ (Vite)** for a modern, human-crafted light-themed UI with responsive sidebar tabs, and **PostgreSQL (Supabase)** for relational persistence with JSONB measurement schemas. 

The application empowers both tailors (who digitize old books, auto-capture measurements hands-free, and schedule capacity) and customers (who maintain multi-member measurement profiles and track orders in real-time).

---

## Technical Context

**Language/Version**: 
- Backend: Python 3.11+
- Frontend: JavaScript (ES2022+) / JSX, HTML5, CSS3

**Primary Dependencies**: 
- Backend: `fastapi`, `uvicorn`, `pydantic` (v2), `sqlalchemy` (v2.0 asyncpg), `python-multipart`, `opencv-python-headless`, `pytesseract` / `easyocr`, `supabase-py`, `reportlab`
- Frontend: `react`, `react-dom`, `vite`, `lucide-react`, `jspdf`, `canvas-confetti`

**Storage**: 
- Primary Database: PostgreSQL (hosted on Supabase)
- Document/Blob Storage: Supabase Storage Buckets (`register-scans`, `job-cards-pdf`)
- Schema file: [schema.sql](file:///c:/Users/vijen/Downloads/tailor_app/schema.sql)

**Testing**: 
- Backend: `pytest`, `httpx` (async API client test suite)
- Frontend: Vitest + React Testing Library

**Target Platform**: 
- Responsive Web Application (optimized for Chromium Android/Desktop for Web Speech API and camera access)

**Project Type**: 
- Full-stack Web Application (`frontend/` + `backend/`)

**Performance Goals**: 
- Sub-50ms API response time for customer profile and measurement fetches
- Sub-3 second OpenCV + OCR extraction pipeline on standard mobile register photos
- Instant (<100ms) client-side SVG blueprint rendering upon component selection

**Constraints**: 
- Zero external speech API billing (client-side Web Speech API in English)
- Zero external OCR API billing (local OpenCV + Tesseract/EasyOCR pipeline)
- Pluggable telephony simulator enabling full local testing without telecom DLT licenses

---

## Constitution Check

*GATE: Passed*
- Core services are decoupled and independently testable.
- API follows RESTful conventions documented in [api-spec.json](file:///c:/Users/vijen/Downloads/tailor_app/specs/001-tailorhub-features/contracts/api-spec.json).
- Database conforms to normalized 3NF relational structure with JSONB flexibility for garment measurements.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-tailorhub-features/
├── plan.md              # This file
├── research.md          # Tech stack evaluation and architectural decisions
├── data-model.md        # Entities, schemas, JSON structures, and state transitions
├── schema.sql           # PostgreSQL DDL script for Supabase SQL Editor
├── contracts/
│   └── api-spec.json    # OpenAPI REST contract for FastAPI
└── quickstart.md        # Environment setup and 5 end-to-end validation scenarios
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── auth.py             # Login, registration, token issuance
│   │   ├── measurements.py     # Multi-member measurement profile CRUD
│   │   ├── orders.py           # Order lifecycle, pricing & status updates
│   │   ├── visual_specs.py     # Spec sheet locking and PDF Job Card export
│   │   ├── ocr_engine.py       # OpenCV preprocessing + OCR extraction
│   │   ├── telephony.py        # Pluggable call engine (simulator / Twilio)
│   │   └── capacity.py         # Shop calendar and express surcharge calculator
│   ├── models/
│   │   ├── schemas.py          # Pydantic v2 request/response models
│   │   └── orm_models.py       # SQLAlchemy database entity models
│   ├── services/
│   │   ├── ocr_service.py      # OpenCV binarization, deskewing & text parsing
│   │   ├── telephony_service.py # Telephony adapter interface and mock driver
│   │   └── pdf_service.py      # ReportLab cutting slip generator
│   └── main.py                 # FastAPI application entrypoint & CORS setup
├── tests/
│   ├── test_measurements.py
│   ├── test_orders.py
│   └── test_ocr.py
├── requirements.txt
└── .env.example

frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Sidebar.jsx             # Clean light-theme tab navigation
│   │   │   ├── Header.jsx              # Role indicator, profile & notifications
│   │   │   └── Modal.jsx               # Reusable dialog modal
│   │   ├── landing/
│   │   │   ├── LandingHero.jsx         # Wow-factor hero section with visuals
│   │   │   ├── FeatureShowcase.jsx     # Interactive feature highlights
│   │   │   └── TestimonialsPricing.jsx # MSME pricing and trust builders
│   │   ├── measurements/
│   │   │   ├── MemberProfileCard.jsx   # Swiggy-style member card (Self, Dad, etc.)
│   │   │   ├── VoiceTapeModal.jsx      # Web Speech hands-free tape listener
│   │   │   └── MeasurementForm.jsx     # Dynamic universal garment inputs
│   │   ├── visualizer/
│   │   │   ├── GarmentCanvas.jsx       # 2D SVG interactive composite visualizer
│   │   │   └── JobCardPreview.jsx      # Printable cutting slip with margin callout
│   │   ├── tailor/
│   │   │   ├── DashboardOverview.jsx   # Active order pipeline & stage counters
│   │   │   ├── OldBookScanner.jsx      # Register upload & HITL split-screen review
│   │   │   ├── CapacityCalendar.jsx    # Green/Yellow/Red workload scheduler
│   │   │   └── TelephonySimulator.jsx  # Interactive outbound voice call modal
│   │   └── customer/
│   │       ├── OrderTracker.jsx        # Visual 5-stage progress timeline
│   │       └── BookingWizard.jsx       # Order creation with member profile selection
│   ├── context/
│   │   └── AuthContext.jsx             # Active session & role switching (Tailor/Customer)
│   ├── services/
│   │   ├── api.js                      # Axios/Fetch client wrapper
│   │   └── supabaseClient.js           # Supabase client initialization
│   ├── styles/
│   │   ├── variables.css               # Warm tailoring light design tokens
│   │   ├── layout.css                  # Sidebar, grid, and navigation layouts
│   │   └── visualizer.css              # Vector garment preview styling
│   ├── App.jsx                         # Main router and view orchestrator
│   └── main.jsx                        # React root entrypoint
├── index.html
├── package.json
└── vite.config.js
```

---

## Complexity Tracking

| Decision | Why Needed | Simpler Alternative Rejected Because |
|:---|:---|:---|
| Multi-Member Profiles table | Indian households order clothes for family members (spouses, parents, children) under one account. | Single profile per account would force families to overwrite measurements or create multiple logins. |
| Pluggable Telephony Adapter | Voice calls must be tested without paying for telecom sender IDs or Indian DLT regulatory registration during dev. | Hardcoding Twilio/Exotel blocks all local development without active paid telecom credits. |
| Client-Side Web Speech API | Measuring tailors cannot touch screens while holding tape and fabric. | Server-side audio streaming introduces latency, bandwidth overhead, and server GPU/cloud cost. |
