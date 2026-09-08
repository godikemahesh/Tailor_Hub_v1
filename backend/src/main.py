"""
TailorHub – FastAPI Application Entrypoint
CORS configuration, route mounting, and startup hooks.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# ── Import Routers ──
from src.api.auth import router as auth_router
from src.api.measurements import router as measurements_router
from src.api.orders import router as orders_router
from src.api.shops import router as shops_router
from src.api.showcases import router as showcases_router
from src.api.records import router as records_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    print(">> TailorHub API starting up...")
    yield
    print(">> TailorHub API shutting down...")


# ── Create FastAPI App ──
app = FastAPI(
    title="TailorHub API",
    description="Smart Digital Platform for Customer–Tailor Connectivity and Complete Tailoring Business Management",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS Middleware ──
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:3000")
cors_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount Routers ──
app.include_router(auth_router)
app.include_router(measurements_router)
app.include_router(orders_router)
app.include_router(shops_router)
app.include_router(showcases_router)
app.include_router(records_router)


# ── Health Check ──
@app.get("/api/health", tags=["System"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "TailorHub API", "version": "0.1.0"}


@app.get("/", tags=["System"])
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to TailorHub API",
        "docs": "/docs",
        "health": "/api/health"
    }
