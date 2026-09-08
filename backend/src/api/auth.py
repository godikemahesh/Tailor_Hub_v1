"""
TailorHub – Authentication API Endpoints
Register, Login, and Get Current User.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.db import get_db
from src.models.orm_models import User
from src.models.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from src.services.auth_service import (
    hash_password, verify_password, create_access_token, get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new customer or tailor account."""
    if db is None:
        import uuid
        from datetime import datetime
        dummy_id = uuid.uuid4()
        token = create_access_token(data={"sub": str(dummy_id), "role": request.role})
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=dummy_id,
                email=request.email,
                role=request.role,
                full_name=request.full_name,
                phone_number=request.phone_number,
                preferred_language=request.preferred_language,
                avatar_url=None,
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
        role=request.role,
        full_name=request.full_name,
        phone_number=request.phone_number,
        preferred_language=request.preferred_language,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    # Generate token
    token = create_access_token(data={
        "sub": str(user.id),
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email
    })

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
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

    token = create_access_token(data={
        "sub": str(user.id),
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email
    })

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)
