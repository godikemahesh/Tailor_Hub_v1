# Feature Specification: TailorHub – Smart Digital Tailoring & AI Management Platform

**Feature Branch**: `001-tailorhub-features`  
**Created**: 2026-09-06  
**Status**: Draft  
**Input**: Dual-interface Customer-Tailor management platform with AI-driven Old Register Digitization, integrated with Hands-Free Voice Tape Assistant, Visual Anti-Dispute Specification Sheet, Dynamic Capacity & Express Workload Balancer, and AI Vernacular Outbound Trial/Delivery Calls.

---

## Clarifications

### Session 2026-09-06
- Q: How should customers and tailors authenticate and access the TailorHub platform for the initial version? → A: Email & Password + Social Login (Google OAuth) on Responsive Web (delivering zero SMS-gateway dependency and immediate cross-platform access across mobile and desktop browsers).
- Q: Which AI/OCR processing engine should be used to digitize the handwritten tailoring registers? → A: Traditional Open-Source OCR (Tesseract / EasyOCR) running locally on the server with OpenCV image pre-processing (zero API costs, localized pipeline with deskewing and contrast thresholding; tailors verify candidate extractions on the HITL screen).
- Q: How should the Hands-Free "Voice Tape" Assistant process speech-to-text recognition? → A: Browser-Native Web Speech API (zero API cost, instant client-side transcription in Chromium browsers) scoped to English (`en-IN` / `en-US`) for initial development, with regional language expansions (Telugu/Hindi) deferred to subsequent phases.
- Q: How should the outbound customer voice call for trials and delivery be executed and tested during development? → A: Pluggable Telephony Adapter (interactive in-app call simulator with synthesized Web Speech TTS audio playback for local development and testing; switchable to Twilio/Exotel cloud telephony drivers via environment variables for production cellular calling).
- Q: How should the Visual "Anti-Dispute" Specification Sheet be generated, rendered, and shared? → A: Interactive Modular 2D SVG/Canvas Visualizer + Printable PDF Job Card (dynamic composite garment blueprint locking into a standardized cutting slip with measurements, style previews, and margin callouts).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Dual-Interface Shop & Order Management (Priority: P1)

As a customer or tailor, I want a unified digital interface where customers can maintain multiple saved measurement profiles for family members and friends (e.g., "Self", "Dad", "Mom", "Son", "Sister") across all garment types (blouses, shirts, trousers, suits, kurtas, dresses, pyjamas), book tailoring orders, and track order stages, while tailors can manage their customer database, set pricing, and update order progress digitally.

**Why this priority**: This forms the foundational operating system of TailorHub. Without multi-member customer profiles and core order lifecycle tracking, no advanced AI features can function.

**Independent Test**: Can be fully tested by onboarding 1 tailor and 1 customer, saving 2 distinct member measurement profiles under one customer account ("Self" - Blouse, "Dad" - Formal Shirt & Trouser), booking an order for "Dad", updating stages (Received → Cutting → Stitching → Trial → Delivered), and verifying both parties see synced status updates.

**Acceptance Scenarios**:
1. **Given** a customer, **When** they create measurement profiles, **Then** they can save multiple named member cards (e.g., "Self", "Dad", "Mom", "Kid") with custom nicknames, garment categories (Women's Blouse/Dress/Kurta, Men's Shirt/Pant/Suit/Pyjama, Kids wear), and specific dimensions.
2. **Given** an order checkout flow, **When** the customer initiates an order, **Then** they can choose from their saved member profiles with one click (similar to Swiggy saved addresses) without re-entering measurements.
3. **Given** an onboarded tailor, **When** a customer submits an order or the tailor creates a walk-in order, **Then** the order appears on the tailor's active dashboard with status `Received` showing the customer and member name.
4. **Given** an active order, **When** the tailor changes status to `Cutting`, `Stitching`, `Trial Ready`, or `Delivered`, **Then** the customer receives an instant order status update on their dashboard.

---

### User Story 2 - AI/OCR Old Register Digitization with Human-in-the-Loop (Priority: P1)

As a tailor with years of legacy handwritten paper registers, I want to photograph pages using my mobile camera so that AI/OCR automatically extracts customer names, phone numbers, garment types, and handwritten measurements into structured, searchable digital records after my verification.

**Why this priority**: Solves the #1 switching barrier for Indian tailors. Tailors will not abandon their physical books if they have to re-enter hundreds of past customer records manually.

**Independent Test**: Can be tested independently by uploading a photograph of a handwritten tailoring register page, verifying the OCR bounding box extraction, confirming/correcting the fields on the split-screen verification UI, and searching the created customer record by phone number.

**Acceptance Scenarios**:
1. **Given** a photo of a handwritten register page, **When** the tailor submits it to the digitization module, **Then** the system extracts structured key-value pairs (Customer Name, Phone Number, Garment Category, and individual numeric measurement values).
2. **Given** extracted candidate fields, **When** presented to the tailor on a side-by-side verification screen, **Then** the tailor can review, edit any misread digits, and tap "Confirm & Save".
3. **Given** confirmed records, **When** the tailor searches by customer name or phone number, **Then** the digitized historical profile and previous measurements load in under 1 second.

---

### User Story 3 - Hands-Free "Voice Tape" Measurement Assistant (Priority: P2)

As a tailor physically measuring a customer with a measuring tape, I want to speak the measurements aloud in English (e.g., Indian English numbers and garment labels) so that the app captures and fills the measurement card hands-free without me touching the smartphone.

**Why this priority**: During customer intake, tailors have both hands occupied with the measuring tape and cloth. Requiring screen taps or typing causes tailors to revert to paper scribbling.

**Independent Test**: Can be tested independently by opening a new measurement form, activating the "Voice Tape" listener, speaking 5 distinct measurement values with garment labels in English (*"Chest 36, Waist 30, Length 14.5"*), and verifying the fields populate accurately.

**Acceptance Scenarios**:
1. **Given** an active measurement screen on a Chromium browser, **When** the tailor taps "Start Voice Tape" and speaks *"Chest 36, Waist 30, Length 14.5"*, **Then** the browser Web Speech API captures the transcript and auto-populates `Chest: 36"`, `Waist: 30"`, and `Length: 14.5"` into the respective fields.
2. **Given** ambient noise or an ambiguous spoken number, **When** confidence is below threshold, **Then** the system sounds a soft prompt or visually highlights the field for clarification.
3. **Given** completion of dictation, **When** the tailor says *"Save measurements"* or taps save, **Then** the measurement card is committed to the customer's profile.

---

### User Story 4 - Visual "Anti-Dispute" Specification Sheet (Priority: P2)

As a customer and tailor, I want to interactively select modular garment components using a 2D SVG/Canvas visualizer (necklines, sleeve cuts, back styles, lining, pads, and internal seam margin) and generate a locked, printable PDF "Job Card", eliminating miscommunication and fabric-ruining disputes.

**Why this priority**: Verbal miscommunication regarding neck depths, sleeve styles, and latkans is the most frequent cause of customer dissatisfaction and wasted expensive fabric.

**Independent Test**: Can be tested independently by creating a custom blouse/suit order, selecting visual design tags (Sweetheart Front Neck, Deep U Back with Dori, Elbow-length Puff Sleeve, 2-inch inner seam margin), verifying the dynamic SVG canvas composite render, and exporting the finalized PDF Job Card.

**Acceptance Scenarios**:
1. **Given** an order configuration screen, **When** the user selects modular visual style options (Front Neck, Back Cut, Sleeve Cut, Lining/Padding, and Margin), **Then** an interactive 2D SVG/Canvas composite visual diagram updates in real-time.
2. **Given** a finalized specification sheet, **When** the order is submitted, **Then** the blueprint is locked and a downloadable/printable PDF "Cutting Job Card" is generated with composite diagrams, measurement specs, and internal seam margin callouts.
3. **Given** a master tailor at the cutting table, **When** they view the active order or printed Job Card, **Then** the exact visual neckline curves and specified internal margin (e.g., *"Keep 2.0 inch internal seam allowance"*) are clearly visible with zero ambiguity.

---

### User Story 5 - Dynamic Capacity & "Express Stitching" Workload Balancer (Priority: P3)

As a tailor, I want the system to track my daily production capacity (e.g., max garments per day) and show a color-coded workload calendar so that I do not over-promise during festival/wedding rushes, while automatically applying express surcharges for urgent rush orders.

**Why this priority**: Tailors frequently over-commit during festive seasons, resulting in delayed deliveries, midnight stress, and lost customer trust.

**Independent Test**: Can be tested independently by setting a tailor capacity of 5 garments/day, booking 5 orders on Date X (triggering "Full" status), attempting a 6th rush order on Date X, and verifying the system prompts for express surcharge approval.

**Acceptance Scenarios**:
1. **Given** a tailor profile, **When** the tailor configures their daily garment capacity threshold (e.g., 6 units/day), **Then** the calendar displays days as Green (Available), Yellow (Near Capacity), or Red (Booked).
2. **Given** a delivery date that is already at maximum capacity (Red), **When** a customer requests that specific rush delivery date, **Then** the system calculates an automated "Express Stitching Surcharge" (e.g., +30% or flat rush fee).
3. **Given** an express order acceptance, **When** confirmed, **Then** the tailor's queue prioritizes the express order with an urgent badge and updated timeline.

---

### User Story 6 - AI Vernacular Outbound Call for Trials & Delivery (Priority: P3)

As a tailor with completed or trial-ready garments, I want the system to place an automated outbound phone call to the customer in their preferred language (Telugu, Hindi, English) announcing that their order is ready for trial or pickup, saving me hours of manual daily calling.

**Why this priority**: Tailors spend 30–60 minutes every evening manually calling customers who often do not answer. Automated phone calls ensure immediate reach and professional communication.

**Independent Test**: Can be tested independently by moving an order to `Trial Ready`, triggering the outbound call service to a verified test phone number, and verifying the customer receives a synthesized voice call in the chosen language delivering the shop name, order ID, and shop operating hours.

**Acceptance Scenarios**:
1. **Given** an order marked as `Trial Ready` or `Ready for Pickup`, **When** the tailor triggers "Notify via Call", **Then** an outbound telephone call is placed to the customer's registered phone number.
2. **Given** the customer answers the call, **When** the call connects, **Then** the AI voice engine speaks a clear vernacular message (e.g., in Telugu: *"నమస్కారం [కస్టమర్ పేరు] గారు, మీ బ్లౌజ్ ఆర్డర్ నంబర్ #[ID] శ్రీ బాలాజీ టైలర్స్ వద్ద ట్రయల్ కోసం సిద్ధంగా ఉంది..."*).
3. **Given** the call concludes, **When** the telecom webhook reports delivery status (Answered / Busy / No Answer), **Then** the call status and timestamp are logged on the tailor's order dashboard.

---

## Edge Cases

- **Poor Quality / Faded Register Scans:** When a handwritten book has water damage, torn margins, or faded pencil marks, the OCR confidence flag must drop below threshold, highlighting uncertain characters with red bounding boxes for mandatory tailor review.
- **Dialect & Pronunciation Variations in Voice Tape:** Background sewing machine noise or dialect differences (e.g., regional Telugu/Hindi number colloquialisms) must be filtered with noise-cancellation and a confirmation fallback tone.
- **Customer Alteration After Cutting Has Begun:** If a customer attempts to change neckline or design on the Visual Spec Sheet after status has progressed to `Cutting` or `Stitching`, the system must block self-service edits and prompt the customer to contact the tailor directly.
- **Unanswered Outbound Calls:** If the customer's phone is switched off or unanswered, the system retries once after 2 hours and falls back to an SMS/WhatsApp status alert.
- **Partial Measurements Given:** If a customer or tailor omits a mandatory measurement (e.g., armhole missing for a blouse), the system prevents order submission with a specific missing measurement warning.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide dual role-based access via a responsive web application (desktop and mobile browser optimized): Customer Portal (search, booking, measurement profiles, order tracking) and Tailor Portal (shop profile, pricing, measurement archive, queue management).
- **FR-001a**: System MUST authenticate users using Email & Password and Google OAuth, eliminating external SMS-gateway dependencies for initial prototyping while retaining a mobile number field for operational communications.
- **FR-002**: System MUST support persistent, multi-member Customer Digital Measurement Profiles allowing customers to create, label, and manage saved measurement profiles for various individuals (e.g., "Self", "Dad", "Mom", "Brother", "Kid") across universal garment categories for men, women, and children (Blouses, Kurtas/Kameez, Formal Shirts, Trousers/Pants, Full Suits/Blazers, Pyjamas, Dresses, Gowns, and Uniforms).
- **FR-003**: System MUST provide an Old Book Digitization module utilizing open-source OCR (Tesseract / EasyOCR) coupled with an OpenCV image pre-processing pipeline (deskewing, adaptive binarization, noise removal, and grid line detection) running locally on the application server to extract structured fields (Customer Name, Mobile Number, Garment Type, and Measurement values) from photographed register pages with zero third-party API costs.
- **FR-004**: System MUST provide a Human-in-the-Loop (HITL) split-screen verification interface showing the original cropped register snippet alongside editable extracted text before committing to the database.
- **FR-005**: System MUST provide a Hands-Free Voice Tape Assistant utilizing the browser-native Web Speech API configured for English speech-to-text recognition (`en-IN` / `en-US`), dynamically parsing spoken garment measurement labels and numeric values to auto-populate matching form fields with zero typing and zero server-side audio processing.
- **FR-006**: System MUST provide an interactive modular 2D SVG/Canvas component visualizer allowing users to dynamically assemble garment components (front necklines, back neck styles, sleeve cuts, lining type, pads, and internal seam allowance margin) into a live vector preview.
- **FR-007**: System MUST lock and generate a finalized, downloadable and printable PDF "Job Card / Cutting Slip" containing the composite vector diagram, measurement specs, order details, and internal seam allowance margin for shop-floor cutting.
- **FR-008**: System MUST provide a Tailor Capacity Manager allowing tailors to set maximum daily garment completion thresholds and view color-coded capacity states (Available, Heavy, Full).
- **FR-009**: System MUST automatically calculate and apply configurable Express Stitching surcharges when orders are scheduled into high-capacity slots.
- **FR-010**: System MUST integrate an automated Outbound Telephony engine using a pluggable adapter pattern: providing an interactive browser-based audio call simulator with SpeechSynthesis TTS for local development and testing, with configurable webhook drivers for Twilio/Exotel to place real cellular phone calls in Telugu, Hindi, and English in production environments.
- **FR-011**: System MUST log all outbound call attempts, durations, and status outcomes (Answered, Busy, Failed) on the tailor's order management console.
- **FR-012**: System MUST provide an AI-driven style and occasion recommendation engine that suggests compatible silhouettes and patterns based on selected fabric type and occasion.

### Key Entities

- **User**: Represents Customer or Tailor (ID, Email, PasswordHash, GoogleID, Name, MobilePhone, Role [Customer/Tailor], PreferredLanguage, Address, CreatedAt).
- **TailorShop**: Represents the tailor business (ID, OwnerID, ShopName, Address, DailyCapacity, ExpressSurchargePercent, SupportedGarments).
- **MeasurementProfile**: Represents saved member dimensions (ID, CustomerID, MemberName [e.g. "Self", "Dad", "Mom"], RelationshipTag, GenderCategory [Men/Women/Kids/Unisex], GarmentType, MeasurementsJSON [e.g., chest, waist, hips, length, shoulder, collar, inseam, sleeves], Source [Manual / VoiceTape / OCR_Legacy], Notes, LastUpdated).
- **Order**: Represents a stitching job (ID, CustomerID, TailorID, MemberName, GarmentType, Status [Received, Cutting, Stitching, Trial_Ready, Delivered], VisualSpecSheetID, MeasurementProfileID, PromisedDate, IsExpress, PricingBreakdown).
- **VisualSpecSheet**: Represents the visual contract (ID, OrderID, FrontNeckStyle, BackNeckStyle, SleeveStyle, LiningType, InternalMarginInches, ExtraNotes, BlueprintImageURL).
- **DigitizedRegisterPage**: Represents a scanned legacy book record (ID, TailorID, ImageURL, ExtractedDataJSON, VerificationStatus [Pending, Verified, Rejected], ExtractedCustomerCount).
- **OutboundCallLog**: Represents voice call notifications (ID, OrderID, CustomerPhone, Language, NotificationType [Trial / Delivery], CallStatus, Timestamp).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Legacy Onboarding Speed**: Tailors can photograph, verify, and digitize a standard 10-customer register page in under 3 minutes with ≥ 95% post-verification data accuracy.
- **SC-002**: **Voice Tape Measurement Velocity**: Tailors can capture a complete 10-point blouse measurement set using the Hands-Free Voice Tape Assistant in under 60 seconds with zero manual typing.
- **SC-003**: **Dispute Reduction**: 100% of custom orders have a locked Visual Specification Sheet; post-delivery customer rework/dispute rate reduced by ≥ 60% compared to traditional verbal orders.
- **SC-004**: **Call Notification Reach**: Automated outbound trial/delivery calls successfully reach ≥ 85% of customers on the day garments become ready without requiring manual tailor dialing.
- **SC-005**: **Workload Protection**: Zero overbooking beyond tailor-defined daily capacity thresholds unless explicitly overridden via confirmed Express Stitching surcharge.

---

## Assumptions

- **Language Support Scope**: Phase 1 voice tape STT and outbound voice calling will focus on Telugu, Hindi, and Indian English; additional regional languages (Tamil, Kannada, Marathi) will be added in subsequent phases.
- **Connectivity**: Voice Tape intake and Outbound Telephony require active internet/cellular connectivity; basic measurement and order viewing will support offline-first caching for shop use.
- **Hardware**: Tailors have access to a standard Android/iOS smartphone with a working camera and microphone.
- **Telephony Compliance**: Outbound voice calls will strictly comply with telecom regulatory guidelines (TRAI / DLT commercial calling hours and consent rules in India).
- **Verification Guarantee**: The Old Book OCR pipeline will always enforce a tailor verification step before creating permanent customer records, avoiding noisy or corrupted data entry.
