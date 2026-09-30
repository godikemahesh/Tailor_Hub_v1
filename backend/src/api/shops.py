"""
TailorHub – Tailor Shop API
Shop profile, pricing, and configuration management.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.db import get_db
from src.models.orm_models import User, TailorShop
from src.models.schemas import ShopCreateRequest, ShopResponse
from src.services.auth_service import get_current_user

router = APIRouter(prefix="/api/shops", tags=["Tailor Shops"])


@router.post("/", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
async def create_shop(
    request: ShopCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a tailor shop profile."""
    if current_user.role != "tailor":
        raise HTTPException(status_code=403, detail="Only tailors can create shops")

    existing = await db.execute(
        select(TailorShop).where(TailorShop.tailor_id == current_user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Shop already exists for this tailor")

    shop = TailorShop(
        tailor_id=current_user.id,
        shop_name=request.shop_name,
        tagline=request.tagline,
        address=request.address,
        city=request.city,
        pincode=request.pincode,
        daily_capacity=request.daily_capacity,
        express_surcharge_percent=request.express_surcharge_percent,
        standard_lead_days=request.standard_lead_days,
        supported_garments=request.supported_garments,
    )
    db.add(shop)
    await db.flush()
    await db.refresh(shop)
    return ShopResponse.model_validate(shop)


DEFAULT_SHOPS_FALLBACK = []


@router.get("/", response_model=List[ShopResponse])
async def list_shops(
    db: AsyncSession = Depends(get_db)
):
    """List all registered tailor shops for customer discovery."""
    if db is None:
        return []
    try:
        from sqlalchemy.orm import selectinload
        result = await db.execute(select(TailorShop).options(selectinload(TailorShop.owner)))
        shops = result.scalars().all()
        responses = []
        for s in shops:
            resp = ShopResponse.model_validate(s)
            if s.owner:
                resp.owner_name = s.owner.full_name
                resp.avatar_url = s.owner.avatar_url or "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
            else:
                resp.owner_name = s.shop_name
                resp.avatar_url = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
            resp.specialization = ", ".join(s.supported_garments) if s.supported_garments else (s.tagline or "Bespoke Tailoring")
            responses.append(resp)
        return responses
    except Exception as e:
        print(f"[Shops API] Database query notice: {e}")
        return []


@router.get("/me", response_model=ShopResponse)
async def get_my_shop(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current tailor's shop profile."""
    if current_user.role != "tailor":
        raise HTTPException(status_code=403, detail="Only tailors have shops")

    result = await db.execute(
        select(TailorShop).where(TailorShop.tailor_id == current_user.id)
    )
    shop = result.scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found. Please create one first.")
    return ShopResponse.model_validate(shop)


@router.put("/me", response_model=ShopResponse)
async def update_my_shop(
    request: ShopCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the current tailor's shop profile."""
    if current_user.role != "tailor":
        raise HTTPException(status_code=403, detail="Only tailors have shops")

    result = await db.execute(
        select(TailorShop).where(TailorShop.tailor_id == current_user.id)
    )
    shop = result.scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    for key, value in request.model_dump().items():
        setattr(shop, key, value)

    await db.flush()
    await db.refresh(shop)
    return ShopResponse.model_validate(shop)
