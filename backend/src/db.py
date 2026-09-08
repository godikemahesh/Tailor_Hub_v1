"""
TailorHub – Database Connection Engine
Async SQLAlchemy session factory connected to Supabase PostgreSQL.
"""

import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/tailorhub"
)

# Detect placeholder Supabase credentials
IS_PLACEHOLDER_DB = "your-project" in DATABASE_URL or "placeholder" in DATABASE_URL

engine = None
async_session_factory = None

if not IS_PLACEHOLDER_DB:
    try:
        engine = create_async_engine(DATABASE_URL, echo=False, pool_size=5, max_overflow=10)
        async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
    except Exception as e:
        print(f"[TailorHub DB] Engine init notice: {e}")


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def get_db():
    """FastAPI dependency – yields an async database session if available, else None."""
    if async_session_factory is None:
        yield None
        return

    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables (for development only — Supabase uses schema.sql)."""
    if engine is not None:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
