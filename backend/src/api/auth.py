"""
TailorHub – Authentication API Endpoints
Register, Login, and Get Current User.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.db import get_db
from src.models.orm_models import User, TailorShop
from src.models.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse, RoleUpdateRequest
from src.services.auth_service import (
    hash_password, verify_password, create_access_token, get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new customer or tailor account."""
    phone = (request.phone_number or "").strip()
    if not phone:
        phone = "+91 98765 43210"

    role_val = request.role.value if hasattr(request.role, "value") else str(request.role)

    if db is None:
        import uuid
        from datetime import datetime
        dummy_id = uuid.uuid4()
        token = create_access_token(data={
            "sub": str(dummy_id),
            "role": role_val,
            "full_name": request.full_name,
            "shop_name": request.shop_name,
            "email": request.email
        })
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=dummy_id,
                email=request.email,
                role=role_val,
                full_name=request.full_name,
                phone_number=phone,
                preferred_language=request.preferred_language,
                avatar_url=request.avatar_url,
                shop_name=request.shop_name or (f"{request.full_name}'s Atelier" if role_val == "tailor" else None),
                address=request.address,
                city=request.city,
                pincode=request.pincode,
                experience_years=request.experience_years,
                specialization=request.specialization,
                created_at=datetime.utcnow()
            )
        )

    # Check if email already exists
    existing = await db.execute(select(User).where(User.email == request.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists"
        )

    # Create user
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        role=role_val,
        full_name=request.full_name,
        phone_number=phone,
        preferred_language=request.preferred_language,
        avatar_url=request.avatar_url,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    # If role is tailor, also automatically provision the TailorShop record
    shop_data = None
    if role_val == "tailor":
        shop_data = TailorShop(
            tailor_id=user.id,
            shop_name=request.shop_name or f"{user.full_name}'s Atelier",
            address=request.address or "Main Atelier Studio",
            city=request.city or "Bengaluru",
            pincode=request.pincode or "560001",
            daily_capacity=8,
            express_surcharge_percent=30.00,
            standard_lead_days=7,
            is_accepting_orders=True
        )
        db.add(shop_data)
        await db.flush()

    # Generate token
    token = create_access_token(data={
        "sub": str(user.id),
        "role": user.role,
        "full_name": user.full_name,
        "shop_name": shop_data.shop_name if shop_data else None,
        "email": user.email
    })

    user_resp = UserResponse.model_validate(user)
    if shop_data:
        user_resp.shop_name = shop_data.shop_name
        user_resp.address = shop_data.address
        user_resp.city = shop_data.city
        user_resp.pincode = shop_data.pincode

    return TokenResponse(
        access_token=token,
        user=user_resp
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with email and password."""
    if db is None:
        import uuid
        from datetime import datetime
        role = "tailor" if "tailor" in request.email.lower() else "customer"
        name = request.email.split("@")[0].replace(".", " ").title() if role == "customer" else "Master Tailor"
        dummy_id = uuid.uuid4()
        token = create_access_token(data={
            "sub": str(dummy_id),
            "role": role,
            "full_name": name,
            "email": request.email
        })
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=dummy_id,
                email=request.email,
                role=role,
                full_name=name,
                phone_number="+91 98765 43210",
                preferred_language="en",
                avatar_url=None,
                shop_name=f"{name}'s Atelier" if role == "tailor" else None,
                created_at=datetime.utcnow()
            )
        )

    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user_resp = UserResponse.model_validate(user)
    shop_name_val = None
    if user.role == "tailor":
        try:
            shop_res = await db.execute(select(TailorShop).where(TailorShop.tailor_id == user.id))
            shop = shop_res.scalar_one_or_none()
            if shop:
                user_resp.shop_name = shop.shop_name
                user_resp.address = shop.address
                user_resp.city = shop.city
                user_resp.pincode = shop.pincode
                shop_name_val = shop.shop_name
        except Exception as e:
            print(f"[Auth Shop Lookup] {e}")

    token = create_access_token(data={
        "sub": str(user.id),
        "role": user.role,
        "full_name": user.full_name,
        "shop_name": shop_name_val,
        "email": user.email
    })

    return TokenResponse(
        access_token=token,
        user=user_resp
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get the currently authenticated user's profile."""
    resp = UserResponse.model_validate(current_user)
    if current_user.role == "tailor" and db is not None:
        try:
            shop_res = await db.execute(select(TailorShop).where(TailorShop.tailor_id == current_user.id))
            shop = shop_res.scalar_one_or_none()
            if shop:
                resp.shop_name = shop.shop_name
                resp.address = shop.address
                resp.city = shop.city
                resp.pincode = shop.pincode
        except Exception:
            pass
    return resp


@router.patch("/role", response_model=UserResponse)
async def update_role(
    request: RoleUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Switch or upgrade the authenticated user's role (customer <-> tailor)."""
    new_role = request.role.value if hasattr(request.role, "value") else str(request.role)

    if db is not None:
        result = await db.execute(select(User).where(User.id == current_user.id))
        user_in_db = result.scalar_one_or_none()
        if user_in_db:
            user_in_db.role = new_role
            if new_role == "tailor":
                existing_shop = await db.execute(select(TailorShop).where(TailorShop.tailor_id == user_in_db.id))
                if not existing_shop.scalar_one_or_none():
                    shop = TailorShop(
                        tailor_id=user_in_db.id,
                        shop_name=f"{user_in_db.full_name}'s Atelier",
                        address="Main Workshop Studio",
                        city="Bengaluru",
                        pincode="560001",
                        daily_capacity=8,
                        express_surcharge_percent=30.00,
                        standard_lead_days=7,
                        is_accepting_orders=True
                    )
                    db.add(shop)
            await db.commit()
            await db.refresh(user_in_db)
            return UserResponse.model_validate(user_in_db)

    current_user.role = new_role
    return UserResponse.model_validate(current_user)
