"""
TailorHub – Pydantic Request/Response Schemas
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID
from enum import Enum


# ── Enums ──
class UserRole(str, Enum):
    customer = "customer"
    tailor = "tailor"
    admin = "admin"

class GenderCategory(str, Enum):
    women = "women"
    men = "men"
    kids = "kids"
    unisex = "unisex"

class OrderStatus(str, Enum):
    received = "received"
    cutting = "cutting"
    stitching = "stitching"
    trial_ready = "trial_ready"
    delivered = "delivered"
    cancelled = "cancelled"

class MeasurementSource(str, Enum):
    manual = "manual"
    voice_tape = "voice_tape"
    ocr_digitized = "ocr_digitized"
    sample_garment = "sample_garment"

class CallType(str, Enum):
    trial_ready = "trial_ready"
    delivery_ready = "delivery_ready"
    reminder = "reminder"

class CallStatus(str, Enum):
    initiated = "initiated"
    ringing = "ringing"
    completed = "completed"
    busy = "busy"
    no_answer = "no_answer"
    failed = "failed"


# ── Auth Schemas ──
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2, max_length=150)
    phone_number: str = Field(min_length=10, max_length=20)
    role: UserRole
    preferred_language: str = "en"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: UUID
    email: str
    role: UserRole
    full_name: str
    phone_number: str
    preferred_language: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Tailor Shop Schemas ──
class ShopCreateRequest(BaseModel):
    shop_name: str = Field(min_length=2, max_length=200)
    tagline: Optional[str] = None
    address: str
    city: str
    pincode: str
    daily_capacity: int = Field(default=8, ge=1)
    express_surcharge_percent: float = 30.0
    standard_lead_days: int = 7
    supported_garments: List[str] = ["blouse", "kurta", "shirt", "trouser", "suit", "dress", "pyjama", "uniform"]

class ShopResponse(BaseModel):
    id: UUID
    tailor_id: UUID
    shop_name: str
    tagline: Optional[str]
    address: str
    city: str
    pincode: str
    daily_capacity: int
    express_surcharge_percent: float
    standard_lead_days: int
    supported_garments: List[str]
    is_accepting_orders: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Measurement Profile Schemas ──
class MeasurementProfileCreate(BaseModel):
    member_name: str = Field(min_length=1, max_length=100)
    relationship_tag: str = "self"
    gender_category: GenderCategory
    garment_type: str
    measurements: Dict[str, Any]
    notes: Optional[str] = None
    source: MeasurementSource = MeasurementSource.manual
    is_default: bool = False

class MeasurementProfileUpdate(BaseModel):
    member_name: Optional[str] = None
    relationship_tag: Optional[str] = None
    gender_category: Optional[GenderCategory] = None
    garment_type: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    source: Optional[MeasurementSource] = None
    is_default: Optional[bool] = None

class MeasurementProfileResponse(BaseModel):
    id: UUID
    customer_id: UUID
    member_name: str
    relationship_tag: str
    gender_category: str
    garment_type: str
    measurements: Dict[str, Any]
    notes: Optional[str]
    source: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Order Schemas ──
class OrderCreateRequest(BaseModel):
    tailor_id: UUID
    member_name: str
    garment_type: str
    measurement_profile_id: Optional[UUID] = None
    measurements_snapshot: Dict[str, Any]
    promised_date: date
    is_express: bool = False
    base_price: float = 0.0
    express_fee: float = 0.0
    total_price: float = 0.0
    advance_paid: float = 0.0
    balance_due: float = 0.0
    cloth_received_notes: Optional[str] = None
    customer_notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class TriggerCallRequest(BaseModel):
    call_type: str = "trial_ready"
    phone_number: Optional[str] = None
    customer_name: Optional[str] = None
    shop_name: Optional[str] = None
    garment_type: Optional[str] = None
    order_number: Optional[str] = None

class OrderResponse(BaseModel):
    id: UUID
    order_number: str
    customer_id: UUID
    tailor_id: UUID
    member_name: str
    garment_type: str
    measurement_profile_id: Optional[UUID] = None
    measurements_snapshot: Dict[str, Any] = {}
    status: str
    promised_date: date
    is_express: bool
    base_price: float
    express_fee: float = 0.0
    total_price: float
    advance_paid: float
    balance_due: float
    cloth_received_notes: Optional[str] = None
    customer_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Visual Spec Sheet Schemas ──
class VisualSpecSheetCreate(BaseModel):
    garment_type: str
    front_neck_style: str = "round"
    back_neck_style: str = "deep_u"
    sleeve_style: str = "short"
    lining_type: str = "cotton"
    pads_type: str = "none"
    internal_margin_inches: float = 2.0
    tassels_latkans: bool = False
    dori_fasteners: bool = False
    special_instructions: Optional[str] = None
    blueprint_svg_data: Optional[str] = None

class VisualSpecSheetResponse(BaseModel):
    id: UUID
    order_id: UUID
    garment_type: str
    front_neck_style: str
    back_neck_style: str
    sleeve_style: str
    lining_type: str
    pads_type: str
    internal_margin_inches: float
    tassels_latkans: bool
    dori_fasteners: bool
    special_instructions: Optional[str]
    blueprint_svg_data: Optional[str]
    job_card_pdf_url: Optional[str]
    is_locked: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Outbound Call Schemas ──
class OutboundCallRequest(BaseModel):
    order_id: UUID
    call_type: CallType
    language: str = "en"

class OutboundCallResponse(BaseModel):
    id: UUID
    order_id: UUID
    customer_phone: str
    call_type: str
    language: str
    status: str
    duration_seconds: int
    provider: str
    tts_message_body: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Capacity Schemas ──
class CapacitySlotResponse(BaseModel):
    slot_date: date
    booked_count: int
    max_capacity: int
    is_blocked: bool
    status: str  # available, heavy, full

    class Config:
        from_attributes = True


# ── OCR Schemas ──
class OCRExtractedRecord(BaseModel):
    customer_name: Optional[str] = None
    phone_number: Optional[str] = None
    garment_type: Optional[str] = None
    measurements: Dict[str, Any] = {}
    confidence: float = 0.0

class OCRResultResponse(BaseModel):
    id: UUID
    image_url: str
    raw_ocr_text: Optional[str]
    extracted_records: List[OCRExtractedRecord]
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Tailor Record Schemas (Multi-Modal Intake) ──
class MeasurementItem(BaseModel):
    key: str
    value: str
    unit: str = "inches"

class TailorRecordCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=150)
    customer_phone: str = Field(min_length=5, max_length=20)
    customer_code: Optional[str] = None
    garment_type: str = Field(default="Blouse")
    measurements: List[Dict[str, Any]] = []
    advance_paid: float = 0.0
    notes: Optional[str] = None
    source: str = "manual"  # manual, voice_ai, camera_ocr

class TailorRecordUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_code: Optional[str] = None
    garment_type: Optional[str] = None
    measurements: Optional[List[Dict[str, Any]]] = None
    advance_paid: Optional[float] = None
    notes: Optional[str] = None
    source: Optional[str] = None

class TailorRecordResponse(BaseModel):
    id: UUID
    tailor_id: UUID
    customer_name: str
    customer_phone: str
    customer_code: str
    garment_type: str
    measurements: List[Dict[str, Any]] = []
    advance_paid: float = 0.0
    notes: Optional[str] = None
    source: str = "manual"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Voice AI Intake Schemas ──
class VoiceParseRequest(BaseModel):
    transcript: str
    context_history: Optional[List[Dict[str, Any]]] = None
    current_measurements: Optional[List[Dict[str, Any]]] = None
    active_key: Optional[str] = None
    groq_api_key: Optional[str] = None

class VoiceParseResponse(BaseModel):
    recognized_measurements: List[Dict[str, Any]] = []
    active_key: Optional[str] = None
    audio_cue: Optional[str] = None  # "OK", "Done", "Next", "Got it" or None
    transcript_heard: Optional[str] = ""
    status: str = "success"


# ── Multimodal OCR Camera Schemas ──
class OCRScanRequest(BaseModel):
    image_base64: str
    garment_hint: Optional[str] = None
    groq_api_key: Optional[str] = None

class OCRScanResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    customer_name: Optional[str] = "Customer"
    customer_phone: Optional[str] = ""
    customer_code: Optional[str] = None
    garment_type: Optional[str] = "Blouse"
    measurements: List[Dict[str, Any]] = []
    advance_paid: Optional[float] = 0.0
    notes: Optional[str] = None
    raw_text: Optional[str] = None
    confidence: float = 0.95
    model_used: str = "llama-3.2-11b-vision-preview"


