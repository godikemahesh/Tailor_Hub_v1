"""
TailorHub – Master Tailor Showcase API
Browse artisanal creation showcases and publish new bespoke portfolios.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/showcases", tags=["Artisanal Showcases"])

# In-memory repository seeded with default master creations conforming to schema.sql
SHOWCASE_POSTS = [
    {
        "id": "post-1",
        "tailor_id": "tailor-1",
        "tailor_name": "Master Rajesh Kumar",
        "shop_name": "Royal Stitch Studio",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "distance_km": 1.4,
        "city": "Chennai",
        "title": "Crimson Bridal Silk Blouse with Antique Zardozi Work",
        "garment_category": "blouse",
        "description": "Completed this heritage bridal blouse for a bride needing zero-armhole pinching and a regal sweetheart cut. Hand-embroidered with antique metallic zardozi threads and pearl bead accents. Finished with our signature 2.5-inch safety inner margin for post-wedding alterations.",
        "fabric_details": "Pure Kanjeevaram Raw Silk with Cotton Mulmul Aster",
        "margin_inches": 2.5,
        "turnaround_days": 4,
        "estimated_price": 2400.0,
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80",
        "tags": ["#BridalBlouse", "#ZardoziEmbroidery", "#KanjeevaramSilk", "#2.5Margin"],
        "likes_count": 84,
        "created_at": "2 hours ago"
    },
    {
        "id": "post-2",
        "tailor_id": "tailor-2",
        "tailor_name": "Ustad Mohammed Irfan",
        "shop_name": "Savile Row Savvy Tailors",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        "distance_km": 2.8,
        "city": "Bengaluru",
        "title": "Royal Navy Bandhgala with Floating Canvas Chest",
        "garment_category": "bandhgala",
        "description": "Tailored this custom bespoke Bandhgala Jodhpuri suit using Savile Row floating horsehair canvas interlining. Clean natural shoulders, military mandarin collar, and horn buttons. Double piped internal pockets and generous seam allowance.",
        "fabric_details": "Super 130s Merino Italian Wool",
        "margin_inches": 2.0,
        "turnaround_days": 6,
        "estimated_price": 6800.0,
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
        "tags": ["#Bandhgala", "#BespokeSuit", "#SavileRowCraft", "#HandCut"],
        "likes_count": 126,
        "created_at": "Yesterday"
    },
    {
        "id": "post-3",
        "tailor_id": "tailor-3",
        "tailor_name": "Sharda Devi",
        "shop_name": "Sharda Ethnic Couture",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        "distance_km": 3.5,
        "city": "Gurugram",
        "title": "32-Kali Pastel Mint Georgette Anarkali Suit",
        "garment_category": "suit",
        "description": "32 custom-pleated panels for maximum flare and fluid motion. Features micro-gotapatti border stitching on the flare and hand-pleated churidar cuffs with hook fastenings. Reinforced armholes to prevent fabric fraying.",
        "fabric_details": "Pure Viscose Georgette with Butter Crepe Lining",
        "margin_inches": 2.5,
        "turnaround_days": 5,
        "estimated_price": 3800.0,
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80",
        "tags": ["#AnarkaliSuit", "#GotaPatti", "#PastelCouture", "#BespokeFit"],
        "likes_count": 95,
        "created_at": "2 days ago"
    },
    {
        "id": "post-4",
        "tailor_id": "tailor-2",
        "tailor_name": "Ustad Mohammed Irfan",
        "shop_name": "Savile Row Savvy Tailors",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        "distance_km": 2.8,
        "city": "Bengaluru",
        "title": "Hand-Rolled Collar Oxford Cotton Formal Shirt",
        "garment_category": "shirt",
        "description": "Single-needle 22-stitches-per-inch precision stitching. Cutaway spread collar designed specifically to sit upright without collapse under blazers. Mother-of-pearl cross-stitched buttons and french side gussets.",
        "fabric_details": "100% Giza Egyptian 2-Ply Cotton",
        "margin_inches": 1.5,
        "turnaround_days": 3,
        "estimated_price": 1600.0,
        "image_url": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=80",
        "tags": ["#OxfordShirt", "#EgyptianCotton", "#MotherOfPearl", "#HandFinished"],
        "likes_count": 67,
        "created_at": "3 days ago"
    }
]


class ShowcaseCreatePayload(BaseModel):
    title: str
    description: str
    garment_category: str = "blouse"
    fabric_details: Optional[str] = "Client Sourced Fabric"
    margin_inches: float = 2.5
    turnaround_days: int = 4
    estimated_price: float = 2400.0
    image_url: str
    tags: List[str] = []


@router.get("/")
async def list_showcases(category: Optional[str] = None):
    """Retrieve all master tailor creation showcases."""
    if category and category != "all":
        return [p for p in SHOWCASE_POSTS if p.get("garment_category") == category]
    return SHOWCASE_POSTS


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_showcase(payload: ShowcaseCreatePayload):
    """Publish a new bespoke design showcase."""
    new_post = {
        "id": f"post-{int(datetime.now().timestamp() * 1000)}",
        "tailor_id": "tailor-1",
        "tailor_name": "Master Rajesh Kumar",
        "shop_name": "Royal Stitch Studio",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "distance_km": 1.4,
        "city": "Chennai",
        "title": payload.title,
        "garment_category": payload.garment_category,
        "description": payload.description,
        "fabric_details": payload.fabric_details,
        "margin_inches": payload.margin_inches,
        "turnaround_days": payload.turnaround_days,
        "estimated_price": payload.estimated_price,
        "image_url": payload.image_url,
        "tags": payload.tags,
        "likes_count": 0,
        "created_at": "Just now"
    }
    SHOWCASE_POSTS.insert(0, new_post)
    return new_post


@router.post("/{post_id}/like")
async def like_showcase(post_id: str):
    """Like or appreciate a master tailor showcase."""
    for p in SHOWCASE_POSTS:
        if p["id"] == post_id:
            p["likes_count"] = p.get("likes_count", 0) + 1
            return {"status": "success", "likes_count": p["likes_count"]}
    raise HTTPException(status_code=404, detail="Showcase not found")
