"""
TailorHub – SQLAlchemy ORM Models
Maps to the PostgreSQL schema defined in schema.sql for Supabase.
"""

import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Boolean, Integer, Numeric, Text, Date,
    DateTime, ForeignKey, UniqueConstraint, CheckConstraint, JSON
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship
from src.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    google_id = Column(String(255), unique=True, nullable=True)
    role = Column(String(20), nullable=False)  # customer, tailor, admin
    full_name = Column(String(150), nullable=False)
    phone_number = Column(String(20), nullable=False)
    preferred_language = Column(String(10), default="en")
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    shop = relationship("TailorShop", back_populates="owner", uselist=False)
    measurement_profiles = relationship("MeasurementProfile", back_populates="customer")
    customer_orders = relationship("Order", foreign_keys="Order.customer_id", back_populates="customer")
    tailor_orders = relationship("Order", foreign_keys="Order.tailor_id", back_populates="tailor")


class TailorShop(Base):
    __tablename__ = "tailor_shops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tailor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    shop_name = Column(String(200), nullable=False)
    tagline = Column(String(255), nullable=True)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False, index=True)
    pincode = Column(String(10), nullable=False)
    daily_capacity = Column(Integer, nullable=False, default=8)
    express_surcharge_percent = Column(Numeric(5, 2), nullable=False, default=30.00)
    standard_lead_days = Column(Integer, nullable=False, default=7)
    supported_garments = Column(ARRAY(Text), default=["blouse", "kurta", "shirt", "trouser", "suit", "dress", "pyjama", "uniform"])
    is_accepting_orders = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="shop")


class MeasurementProfile(Base):
    __tablename__ = "measurement_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    member_name = Column(String(100), nullable=False)
    relationship_tag = Column(String(50), default="self")
    gender_category = Column(String(20), nullable=False)  # women, men, kids, unisex
    garment_type = Column(String(50), nullable=False)
    measurements = Column(JSONB, nullable=False)
    notes = Column(Text, nullable=True)
    source = Column(String(30), default="manual")  # manual, voice_tape, ocr_digitized, sample_garment
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("User", back_populates="measurement_profiles")


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String(30), unique=True, nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    tailor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    member_name = Column(String(100), nullable=False)
    garment_type = Column(String(50), nullable=False)
    measurement_profile_id = Column(UUID(as_uuid=True), ForeignKey("measurement_profiles.id", ondelete="SET NULL"), nullable=True)
    measurements_snapshot = Column(JSONB, nullable=False)
    status = Column(String(30), default="received")  # received, cutting, stitching, trial_ready, delivered, cancelled
    promised_date = Column(Date, nullable=False)
    is_express = Column(Boolean, default=False)
    base_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    express_fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    total_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    advance_paid = Column(Numeric(10, 2), nullable=False, default=0.00)
    balance_due = Column(Numeric(10, 2), nullable=False, default=0.00)
    cloth_received_notes = Column(Text, nullable=True)
    customer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("User", foreign_keys=[customer_id], back_populates="customer_orders")
    tailor = relationship("User", foreign_keys=[tailor_id], back_populates="tailor_orders")
    visual_spec_sheet = relationship("VisualSpecSheet", back_populates="order", uselist=False)
    call_logs = relationship("OutboundCallLog", back_populates="order")


class VisualSpecSheet(Base):
    __tablename__ = "visual_spec_sheets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    garment_type = Column(String(50), nullable=False)
    front_neck_style = Column(String(50), nullable=False, default="round")
    back_neck_style = Column(String(50), nullable=False, default="deep_u")
    sleeve_style = Column(String(50), nullable=False, default="short")
    lining_type = Column(String(50), nullable=False, default="cotton")
    pads_type = Column(String(50), nullable=False, default="none")
    internal_margin_inches = Column(Numeric(3, 1), nullable=False, default=2.0)
    tassels_latkans = Column(Boolean, default=False)
    dori_fasteners = Column(Boolean, default=False)
    special_instructions = Column(Text, nullable=True)
    blueprint_svg_data = Column(Text, nullable=True)
    job_card_pdf_url = Column(Text, nullable=True)
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="visual_spec_sheet")


class DigitizedRegisterPage(Base):
    __tablename__ = "digitized_register_pages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tailor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(Text, nullable=False)
    raw_ocr_text = Column(Text, nullable=True)
    extracted_records = Column(JSONB, nullable=False, default=[])
    verification_status = Column(String(30), default="pending_review")
    verified_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class TailorRecord(Base):
    __tablename__ = "tailor_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tailor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(20), nullable=False, index=True)
    customer_code = Column(String(30), nullable=False, index=True)
    garment_type = Column(String(50), nullable=False)
    measurements = Column(JSONB, nullable=False, default=[])
    advance_paid = Column(Numeric(10, 2), default=0.00)
    notes = Column(Text, nullable=True)
    source = Column(String(30), default="manual")  # manual, voice_ai, camera_ocr
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)



class OutboundCallLog(Base):
    __tablename__ = "outbound_call_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_phone = Column(String(20), nullable=False)
    call_type = Column(String(30), nullable=False)  # trial_ready, delivery_ready, reminder
    language = Column(String(10), nullable=False, default="en")
    status = Column(String(30), nullable=False, default="initiated")
    duration_seconds = Column(Integer, default=0)
    provider = Column(String(30), default="simulated")
    tts_message_body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="call_logs")


class ShopCapacityCalendar(Base):
    __tablename__ = "shop_capacity_calendar"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tailor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    slot_date = Column(Date, nullable=False)
    booked_count = Column(Integer, nullable=False, default=0)
    max_capacity = Column(Integer, nullable=False, default=8)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("tailor_id", "slot_date", name="uix_tailor_slot_date"),
    )
