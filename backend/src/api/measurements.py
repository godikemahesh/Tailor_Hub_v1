"""
TailorHub – Measurement Profiles CRUD API
Multi-member family measurement profile management.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from src.db import get_db
from src.models.orm_models import User, MeasurementProfile
from src.models.schemas import (
    MeasurementProfileCreate, MeasurementProfileUpdate, MeasurementProfileResponse
)
from src.services.auth_service import get_current_user

router = APIRouter(prefix="/api/measurements", tags=["Measurement Profiles"])


@router.get("/", response_model=List[MeasurementProfileResponse])
async def list_profiles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all measurement profiles for the current customer."""
    result = await db.execute(
        select(MeasurementProfile)
        .where(MeasurementProfile.customer_id == current_user.id)
        .order_by(MeasurementProfile.is_default.desc(), MeasurementProfile.created_at.desc())
    )
    profiles = result.scalars().all()
    return [MeasurementProfileResponse.model_validate(p) for p in profiles]


@router.post("/", response_model=MeasurementProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    request: MeasurementProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new measurement profile (e.g., 'Self', 'Dad', 'Mom')."""
    # If this is set as default, unset other defaults for same garment type
    if request.is_default:
        existing_defaults = await db.execute(
            select(MeasurementProfile).where(
                and_(
                    MeasurementProfile.customer_id == current_user.id,
                    MeasurementProfile.garment_type == request.garment_type,
                    MeasurementProfile.is_default == True
                )
            )
        )
        for profile in existing_defaults.scalars().all():
            profile.is_default = False

    profile = MeasurementProfile(
        customer_id=current_user.id,
        member_name=request.member_name,
        relationship_tag=request.relationship_tag,
        gender_category=request.gender_category,
        garment_type=request.garment_type,
        measurements=request.measurements,
        notes=request.notes,
        source=request.source,
        is_default=request.is_default,
    )
    db.add(profile)
    await db.flush()
    await db.refresh(profile)
    return MeasurementProfileResponse.model_validate(profile)


@router.get("/{profile_id}", response_model=MeasurementProfileResponse)
async def get_profile(
    profile_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific measurement profile by ID."""
    result = await db.execute(
        select(MeasurementProfile).where(
            and_(
                MeasurementProfile.id == profile_id,
                MeasurementProfile.customer_id == current_user.id
            )
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Measurement profile not found")
    return MeasurementProfileResponse.model_validate(profile)


@router.put("/{profile_id}", response_model=MeasurementProfileResponse)
async def update_profile(
    profile_id: UUID,
    request: MeasurementProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing measurement profile."""
    result = await db.execute(
        select(MeasurementProfile).where(
            and_(
                MeasurementProfile.id == profile_id,
                MeasurementProfile.customer_id == current_user.id
            )
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Measurement profile not found")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    await db.flush()
    await db.refresh(profile)
    return MeasurementProfileResponse.model_validate(profile)


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    profile_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a measurement profile."""
    result = await db.execute(
        select(MeasurementProfile).where(
            and_(
                MeasurementProfile.id == profile_id,
                MeasurementProfile.customer_id == current_user.id
            )
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Measurement profile not found")
    await db.delete(profile)


@router.get("/customer/{customer_id}", response_model=List[MeasurementProfileResponse])
async def list_customer_profiles(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List measurement profiles for a specific customer (tailor view)."""
    if current_user.role != "tailor" and current_user.id != customer_id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(
        select(MeasurementProfile)
        .where(MeasurementProfile.customer_id == customer_id)
        .order_by(MeasurementProfile.is_default.desc(), MeasurementProfile.created_at.desc())
    )
    profiles = result.scalars().all()
    return [MeasurementProfileResponse.model_validate(p) for p in profiles]
