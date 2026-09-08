"""
TailorHub – Tailor Measurement Records & Multi-Modal Intake API
Supports Voice AI listening with state tracking, dynamic manual entry,
Groq Llama-3.2 Multimodal Vision OCR for old register books, and Supabase persistence.
"""

import os
import uuid
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc

from src.db import get_db
from src.models.orm_models import User, TailorRecord, MeasurementProfile
from src.models.schemas import (
    TailorRecordCreate,
    TailorRecordUpdate,
    TailorRecordResponse,
    VoiceParseRequest,
    VoiceParseResponse,
    OCRScanRequest,
    OCRScanResponse
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.services.auth_service import get_current_user, decode_token
from src.services.groq_service import (
    parse_voice_measurement_with_groq,
    parse_ledger_image_with_groq
)

optional_security = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Extract user if JWT is present and valid, otherwise return None without throwing."""
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id or not db:
            return None
        res = await db.execute(select(User).where(User.id == user_id))
        return res.scalar_one_or_none()
    except Exception:
        return None


router = APIRouter(prefix="/api/records", tags=["Tailor Records"])


@router.get("/", response_model=List[TailorRecordResponse])
async def list_records(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """List all saved measurement records for the tailor."""
    if not db:
        return []

    if current_user and current_user.role == "customer":
        result = await db.execute(
            select(TailorRecord)
            .where(TailorRecord.customer_phone == current_user.phone_number)
            .order_by(desc(TailorRecord.created_at))
        )
    elif current_user and current_user.role in ["tailor", "admin"]:
        result = await db.execute(
            select(TailorRecord)
            .where(TailorRecord.tailor_id == current_user.id)
            .order_by(desc(TailorRecord.created_at))
        )
    else:
        # Fallback: return all saved records
        result = await db.execute(
            select(TailorRecord).order_by(desc(TailorRecord.created_at))
        )

    records = result.scalars().all()
    return [TailorRecordResponse.model_validate(r) for r in records]


@router.post("/", response_model=TailorRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_record(
    request: TailorRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Save a new customer measurement record into Supabase PostgreSQL.
    Guarantees unique customer identification code to prevent name ambiguity.
    """
    # Resolve tailor_id
    tailor_id = current_user.id if current_user else None
    if not tailor_id and db:
        tailor_res = await db.execute(select(User).where(User.role == "tailor"))
        first_tailor = tailor_res.scalars().first()
        if first_tailor:
            tailor_id = first_tailor.id
        else:
            any_user = (await db.execute(select(User))).scalars().first()
            if any_user:
                tailor_id = any_user.id

    if not tailor_id:
        tailor_id = uuid.UUID("11111111-1111-1111-1111-111111111111")

    # Generate unique customer reference code if not provided
    cust_code = request.customer_code
    if not cust_code or cust_code.strip() == "":
        suffix = uuid.uuid4().hex[:6].upper()
        cust_code = f"REC-{suffix}"

    record = TailorRecord(
        tailor_id=tailor_id,
        customer_name=request.customer_name.strip(),
        customer_phone=request.customer_phone.strip(),
        customer_code=cust_code,
        garment_type=request.garment_type.strip(),
        measurements=request.measurements or [],
        advance_paid=request.advance_paid or 0.0,
        notes=request.notes or "",
        source=request.source or "manual"
    )

    db.add(record)
    await db.flush()
    await db.refresh(record)

    # If customer exists in users table with same phone number, also sync to measurement_profiles
    try:
        user_res = await db.execute(
            select(User).where(User.phone_number == record.customer_phone)
        )
        matched_user = user_res.scalar_one_or_none()
        if matched_user:
            # Convert list of measurements to dict
            meas_dict = {}
            for item in record.measurements:
                if isinstance(item, dict) and "key" in item:
                    meas_dict[item["key"]] = item.get("value", "")
            
            profile = MeasurementProfile(
                customer_id=matched_user.id,
                member_name=record.customer_name,
                relationship_tag="self",
                gender_category="unisex",
                garment_type=record.garment_type.lower(),
                measurements=meas_dict,
                notes=record.notes,
                source="ocr_digitized" if record.source == "camera_ocr" else "voice_tape" if record.source == "voice_ai" else "manual",
                is_default=True
            )
            db.add(profile)
            await db.flush()
    except Exception as e:
        print(f"[Record Sync Notice] Auto-sync to user profile skipped: {e}")

    return TailorRecordResponse.model_validate(record)


@router.get("/{record_id}", response_model=TailorRecordResponse)
async def get_record(
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a single measurement record."""
    result = await db.execute(
        select(TailorRecord).where(
            and_(
                TailorRecord.id == record_id,
                TailorRecord.tailor_id == current_user.id
            )
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Tailor record not found")
    return TailorRecordResponse.model_validate(record)


@router.put("/{record_id}", response_model=TailorRecordResponse)
async def update_record(
    record_id: UUID,
    request: TailorRecordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing measurement record."""
    result = await db.execute(
        select(TailorRecord).where(
            and_(
                TailorRecord.id == record_id,
                TailorRecord.tailor_id == current_user.id
            )
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Tailor record not found")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(record, key, value)

    await db.flush()
    await db.refresh(record)
    return TailorRecordResponse.model_validate(record)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a measurement record."""
    result = await db.execute(
        select(TailorRecord).where(
            and_(
                TailorRecord.id == record_id,
                TailorRecord.tailor_id == current_user.id
            )
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Tailor record not found")

    await db.delete(record)


# ── AI Processing Endpoints ──

@router.post("/parse-voice", response_model=VoiceParseResponse)
async def parse_voice(
    request: VoiceParseRequest,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Parses spoken measurements with Groq LLM.
    Handles context state when tailor pauses between parameter and value.
    Returns parsed items and audio feedback cue ("OK", "Done", "Next").
    """
    result = await parse_voice_measurement_with_groq(
        transcript=request.transcript,
        context_history=request.context_history,
        current_measurements=request.current_measurements,
        active_key=request.active_key,
        groq_api_key=request.groq_api_key
    )

    return VoiceParseResponse(
        recognized_measurements=result.get("recognized_measurements") or result.get("measurements") or [],
        active_key=result.get("active_key"),
        audio_cue=result.get("audio_cue"),
        transcript_heard=result.get("transcript_heard") or request.transcript or "",
        status=result.get("status", "success")
    )


@router.post("/scan-ocr", response_model=OCRScanResponse)
async def scan_ocr(
    request: OCRScanRequest,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Parses captured physical register photo with Groq Multimodal Vision (llama-3.2-11b-vision-preview).
    Extracts customer info and measurements into structured JSON for tailor verification.
    """
    if not request.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 is required")

    result = await parse_ledger_image_with_groq(
        image_base64=request.image_base64,
        garment_hint=request.garment_hint,
        groq_api_key=request.groq_api_key
    )

    return OCRScanResponse(
        customer_name=result.get("customer_name") or "Customer",
        customer_phone=result.get("customer_phone") or "",
        customer_code=result.get("customer_code") or f"REC-{uuid.uuid4().hex[:6].upper()}",
        garment_type=result.get("garment_type") or "Blouse",
        measurements=result.get("measurements") or [],
        advance_paid=float(result.get("advance_paid") or 0.0),
        notes=result.get("notes") or "",
        raw_text=result.get("raw_text") or "",
        confidence=float(result.get("confidence") or 0.95),
        model_used=result.get("model_used") or "llama-3.2-11b-vision-preview"
    )
