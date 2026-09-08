# Technical Research & Architecture Decisions: TailorHub

**Branch**: `001-tailorhub-features`  
**Date**: 2026-09-06  
**Status**: Completed  
**Subject**: Core platform architecture, Supabase PostgreSQL persistence, FastAPI backend, React frontend, and smart tailoring feature subsystems.

---

## 1. Backend Architecture: Python + FastAPI

- **Decision**: Python 3.11+ with **FastAPI**, **Pydantic v2**, and **SQLAlchemy 2.0** (asyncpg) / **Supabase Python SDK**.
- **Rationale**:
  - FastAPI offers native asynchronous I/O, automatic OpenAPI/Swagger documentation, and high-performance validation via Pydantic v2.
  - Native Python ecosystem provides direct access to OpenCV (`opencv-python-headless`), `pytesseract`, and `easyocr` for image processing without inter-process communication overhead.
  - Fast execution of background tasks (OCR processing, PDF generation, webhook dispatches) via FastAPI `BackgroundTasks`.
- **Alternatives Considered**:
  - *Node.js / Express*: Rejected because integrating OpenCV and Tesseract/EasyOCR requires clumsy native C++ bindings (`node-gyp`) or spawning Python child processes.
  - *Django*: Rejected due to heavyweight monolithic architecture, session overhead, and higher latency compared to FastAPI's async ASGI pipeline.

---

## 2. Frontend Architecture: React (Vite) + Human-Crafted Light Design System

- **Decision**: **React 18+ with Vite**, utilizing a customized Vanilla CSS design token system (CSS variables), Lucide icons, and responsive sidebar navigation.
- **Rationale**:
  - Vite ensures near-instant HMR (Hot Module Replacement) and optimized production bundling.
  - A tailored Vanilla CSS token system gives 100% control over design aesthetics (warm tailoring accents: ivory `#FAFAF8`, crisp slate `#1E293B`, tailor's indigo `#3B82F6`, tape gold `#D97706`), avoiding generic cookie-cutter framework layouts.
  - Clean, dedicated sidebar tabs for both Customer and Tailor portals ensure glanceable, ergonomic navigation on tablets and desktops.
  - Browser-native Web Speech API (`SpeechRecognition`) and HTML5 SVG/Canvas visualizers integrate seamlessly into React state cycles.
- **Alternatives Considered**:
  - *Next.js*: Unnecessary SSR complexity for what is fundamentally an authenticated SPA (Single Page Application) with offline PWA ambitions.
  - *TailwindCSS*: Vanilla CSS tokens chosen to ensure custom micro-animations, bespoke garment diagrams, and strict control over print stylesheets for cutting slips.

---

## 3. Database & Authentication: PostgreSQL & Supabase

- **Decision**: **Supabase PostgreSQL** with Row Level Security (RLS), Supabase Storage for register scans, and JWT session handling.
- **Rationale**:
  - Supabase provides enterprise-grade PostgreSQL with instant REST/GraphQL APIs, real-time WebSocket subscriptions for live order tracking, and managed storage buckets.
  - Single consolidated `schema.sql` script allows zero-friction deployment directly into the Supabase SQL Editor.
  - PostgreSQL JSONB columns allow flexible, schema-agnostic measurement sets across 10+ garment types (blouse, shirt, trouser, suit, etc.) while preserving strict relational foreign keys for orders and users.
- **Alternatives Considered**:
  - *MongoDB / Document DB*: Rejected because transactional consistency across orders, shop capacity slots, and payments is critical in commercial MSME workflows.
  - *Pure SQLite*: Suitable for offline edge devices, but Supabase PostgreSQL allows multi-device synchronization between tailor counter, cutter table, and customer smartphones.

---

## 4. Multi-Member Saved Measurement Profiles ("Swiggy-Style")

- **Decision**: Normalized `measurement_profiles` table linked to `user_id` with `member_name` ("Self", "Dad", "Mom", "Kid Aarav"), `relationship_tag`, `gender_category`, `garment_type`, and `measurements` JSONB.
- **Rationale**:
  - Customers in India frequently order clothing for their spouse, parents, children, or wedding entourage under a single payment account.
  - Emulating Swiggy's saved address UX (where customers tap `[Self]`, `[Mom]`, or `[Add New Member]` at checkout) provides extreme convenience and zero repeat measuring.
  - Allows tailors creating walk-in orders to search: *"Show me measurements for Mrs. Sharma's daughter"*.
- **Alternatives Considered**:
  - *Single measurement profile per user account*: Rejected because it forces families to create separate accounts or continually overwrite existing numbers.

---

## 5. Universal Garment Schemas (Men, Women, Kids)

- **Decision**: Domain dictionary supporting 3 primary categories with standardized measurement parameter keys:
  - **Women**: Blouse (bust, waist, front neck, back neck, length, shoulder, armhole, sleeve length, sleeve round, apex point), Kurta/Kameez, Lehenga/Choli, Western Dress, Gown.
  - **Men**: Formal/Casual Shirt (chest, collar/neck, sleeve length, cuff, shoulder, length, waist), Trouser/Pant (waist, hip, inseam, outseam, thigh, bottom round, fly/crotch), Two-piece/Three-piece Suit (chest, waist, jacket length, shoulder, sleeve), Kurta-Pyjama.
  - **Kids / Uniforms**: School Uniform Shirt/Skirt/Pant, Ethnic Kurta, Frock.
- **Rationale**: A tailor shop in India rarely survives on blouses alone; neighborhood tailors serve school uniforms, bridal dresses, and men's festive outfits. Universal schemas future-proof the business.

---

## 6. Old Book OCR Pipeline: OpenCV + Tesseract / EasyOCR

- **Decision**: Local asynchronous processing pipeline with **OpenCV pre-processing** followed by **Tesseract / EasyOCR** and regex key-value extraction.
- **Pre-processing Steps**:
  1. Grayscale conversion and bilateral filtering (preserves edges while removing paper texture noise).
  2. Otsu's adaptive thresholding / CLAHE (Contrast Limited Adaptive Histogram Equalization) to handle faded ink and yellowed ledger paper.
  3. Hough Line Transform for deskewing tilted photographs taken on mobile cameras.
  4. Grid/line removal or morphological segmentation to isolate measurement boxes.
  5. OCR text extraction with regex dictionary (`r'(chest|bust|length|waist|neck|shoulder|arm)\s*[:=-]?\s*(\d+(?:\.\d+|\s*1\/2)?)'`).
  6. Return candidate JSON with cropped image bounding boxes to the Human-in-the-Loop (HITL) UI for 1-tap tailor confirmation.
- **Rationale**: Delivers zero external API charges, works completely offline or on local servers, and protects tailor data privacy.

---

## 7. Hands-Free "Voice Tape" Assistant

- **Decision**: Client-side **Web Speech API (`webkitSpeechRecognition`)** running in Chrome/Android mobile browsers, configured for English (`en-IN` / `en-US`), with continuous listening and audio feedback tones.
- **Pattern Matching Pipeline**:
  - Captures live speech events $\rightarrow$ Tokenizes string into garment terms and numeric values (handles spoken fractions like *"fourteen and half"* $\rightarrow$ `14.5`).
  - Auto-highlights the matching field on screen and advances cursor to the next expected dimension.
  - Zero server audio bandwidth consumption and zero cloud speech billing.

---

## 8. Visual "Anti-Dispute" Specification Sheet & PDF Job Card

- **Decision**: Modular **2D SVG Parametric Vector Engine** in React + client-side **`jsPDF` / Canvas** for instant print generation.
- **Components**:
  - Front Neck SVG generator (Round, Square, Sweetheart, V-Neck, Boat, Collar).
  - Back Neck SVG generator (Deep U, Keyhole, Open Back, Potli Button row, Dori).
  - Sleeve SVG generator (Cap, Short, Elbow, Full, Puff with Border).
  - Margin & Seam Allowance visual callout overlay (`+2.0" internal fold`).
  - One-click "Download Cutting Slip (PDF)" formatted for standard A5/A4 receipt printers to attach to cloth bundles.

---

## 9. Pluggable Outbound Telephony Engine

- **Decision**: Pluggable Driver Interface (`TelephonyService`):
  - **Development / Demo Driver**: `SimulatedTelephonyDriver` rendering an interactive in-browser incoming call modal with synthesized Web Speech TTS audio playback, DTMF keypad responses, and simulated call webhooks.
  - **Production Driver**: `TwilioDriver` / `ExotelDriver` using REST API and TwiML/XML for cellular outbound calls with regional text-to-speech.
- **Rationale**: Enables comprehensive end-to-end testing and demoing without requiring active Indian telecom DLT licenses, prepaid caller IDs, or external network connectivity.
