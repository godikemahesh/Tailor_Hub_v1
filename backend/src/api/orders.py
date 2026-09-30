"""
TailorHub – Orders API
Order creation, listing, status progression, and tailor/customer views.
"""

import random
import string
from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func

from src.db import get_db
from src.models.orm_models import User, Order, MeasurementProfile
from src.models.schemas import OrderCreateRequest, OrderStatusUpdate, OrderResponse, TriggerCallRequest
from src.services.auth_service import get_current_user
from src.services.telephony_service import trigger_outbound_call

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# Valid status transitions
STATUS_FLOW = {
    "received": ["cutting", "cancelled"],
    "cutting": ["stitching", "cancelled"],
    "stitching": ["trial_ready"],
    "trial_ready": ["delivered"],
    "delivered": [],
    "cancelled": [],
}


def generate_order_number() -> str:
    """Generate a unique order number like TH-2026-A3F7."""
    from datetime import datetime
    year = datetime.now().year
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"TH-{year}-{suffix}"


DEFAULT_ORDERS_FALLBACK = []


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    request: OrderCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new stitching order."""
    from datetime import datetime, timedelta
    promised = request.promised_date or (datetime.utcnow().date() + timedelta(days=7))

    if db is None:
        import uuid
        order_dict = request.model_dump()
        order_dict["id"] = uuid.uuid4()
        order_dict["order_number"] = generate_order_number()
        order_dict["customer_id"] = current_user.id if current_user.role == "customer" else request.tailor_id
        order_dict["tailor_id"] = request.tailor_id if current_user.role == "customer" else current_user.id
        order_dict["status"] = "received"
        order_dict["promised_date"] = promised
        order_dict["created_at"] = datetime.utcnow()
        return OrderResponse.model_validate(order_dict)

    order = Order(
        order_number=generate_order_number(),
        customer_id=current_user.id if current_user.role == "customer" else request.tailor_id,
        tailor_id=request.tailor_id if current_user.role == "customer" else current_user.id,
        member_name=request.member_name,
        garment_type=request.garment_type,
        measurement_profile_id=request.measurement_profile_id,
        measurements_snapshot=request.measurements_snapshot or {},
        promised_date=promised,
        is_express=request.is_express,
        base_price=request.base_price,
        express_fee=request.express_fee,
        total_price=request.total_price,
        advance_paid=request.advance_paid,
        balance_due=request.balance_due,
        cloth_received_notes=request.cloth_received_notes,
        customer_notes=request.customer_notes,
    )
    db.add(order)
    await db.flush()
    await db.refresh(order)

    if request.visual_specs:
        from src.models.orm_models import VisualSpecSheet
        v_specs = request.visual_specs
        v_sheet = VisualSpecSheet(
            order_id=order.id,
            garment_type=order.garment_type,
            front_neck_style=v_specs.get("front_neck_style", "round"),
            back_neck_style=v_specs.get("back_neck_style", "deep_u"),
            sleeve_style=v_specs.get("sleeve_style", "short"),
            lining_type=v_specs.get("lining_type", "cotton"),
            pads_type=v_specs.get("pads_type", "none"),
            internal_margin_inches=float(v_specs.get("internal_margin_inches") or 2.0),
            special_instructions=v_specs.get("special_instructions")
        )
        db.add(v_sheet)
        await db.flush()

    from sqlalchemy.orm import selectinload
    stmt = (
        select(Order)
        .where(Order.id == order.id)
        .options(
            selectinload(Order.customer),
            selectinload(Order.tailor).selectinload(User.shop),
            selectinload(Order.visual_spec_sheet)
        )
    )
    res = await db.execute(stmt)
    loaded_order = res.scalar_one()

    resp = OrderResponse.model_validate(loaded_order)
    if loaded_order.customer:
        resp.customer_name = loaded_order.customer.full_name
        resp.customer_phone = loaded_order.customer.phone_number
    if loaded_order.tailor:
        resp.tailor_name = loaded_order.tailor.full_name
        if loaded_order.tailor.shop:
            resp.shop_name = loaded_order.tailor.shop.shop_name
    if loaded_order.visual_spec_sheet:
        resp.visual_specs = {
            "front_neck_style": loaded_order.visual_spec_sheet.front_neck_style,
            "back_neck_style": loaded_order.visual_spec_sheet.back_neck_style,
            "sleeve_style": loaded_order.visual_spec_sheet.sleeve_style,
            "lining_type": loaded_order.visual_spec_sheet.lining_type,
            "pads_type": loaded_order.visual_spec_sheet.pads_type,
            "internal_margin_inches": float(loaded_order.visual_spec_sheet.internal_margin_inches or 2.0),
            "special_instructions": loaded_order.visual_spec_sheet.special_instructions
        }
    return resp


@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List orders for the current user (customer sees their orders, tailor sees shop orders)."""
    if db is None:
        return []
    try:
        from sqlalchemy.orm import selectinload
        query = select(Order).options(
            selectinload(Order.customer),
            selectinload(Order.tailor).selectinload(User.shop),
            selectinload(Order.visual_spec_sheet)
        )
        if current_user.role == "customer":
            query = query.where(Order.customer_id == current_user.id)
        elif current_user.role == "tailor":
            query = query.where(Order.tailor_id == current_user.id)
        if status_filter:
            query = query.where(Order.status == status_filter)
        query = query.order_by(Order.created_at.desc())
        result = await db.execute(query)
        orders = result.scalars().all()
        responses = []
        for o in orders:
            resp = OrderResponse.model_validate(o)
            if o.customer:
                resp.customer_name = o.customer.full_name
                resp.customer_phone = o.customer.phone_number
            if o.tailor:
                resp.tailor_name = o.tailor.full_name
                if o.tailor.shop:
                    resp.shop_name = o.tailor.shop.shop_name
            if o.visual_spec_sheet:
                resp.visual_specs = {
                    "front_neck_style": o.visual_spec_sheet.front_neck_style,
                    "back_neck_style": o.visual_spec_sheet.back_neck_style,
                    "sleeve_style": o.visual_spec_sheet.sleeve_style,
                    "lining_type": o.visual_spec_sheet.lining_type,
                    "pads_type": o.visual_spec_sheet.pads_type,
                    "internal_margin_inches": float(o.visual_spec_sheet.internal_margin_inches or 2.0),
                    "special_instructions": o.visual_spec_sheet.special_instructions
                }
            responses.append(resp)
        return responses
    except Exception as e:
        print(f"[Orders API] Query notice: {e}")
        return []


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific order by ID."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify access
    if current_user.role == "customer" and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == "tailor" and order.tailor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return OrderResponse.model_validate(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: UUID,
    request: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update order status (tailor only). Enforces valid status transitions."""
    if current_user.role != "tailor":
        raise HTTPException(status_code=403, detail="Only tailors can update order status")

    result = await db.execute(
        select(Order).where(
            and_(Order.id == order_id, Order.tailor_id == current_user.id)
        )
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Validate status transition
    allowed = STATUS_FLOW.get(order.status, [])
    if request.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{order.status}' to '{request.status}'. Allowed: {allowed}"
        )

    order.status = request.status
    await db.flush()
    await db.refresh(order)

    # Automated Twilio Call Trigger when status becomes trial_ready
    if request.status == "trial_ready":
        try:
            cust_res = await db.execute(select(User).where(User.id == order.customer_id))
            cust_user = cust_res.scalar_one_or_none()
            phone = cust_user.phone_number if (cust_user and cust_user.phone_number) else "+919876543210"
            c_name = cust_user.full_name if cust_user else (order.member_name or "Valued Customer")

            trigger_outbound_call(
                customer_phone=phone,
                customer_name=c_name,
                shop_name=current_user.full_name or "Master Atelier",
                garment_type=order.garment_type,
                order_number=order.order_number,
                call_type="trial_ready"
            )
        except Exception as exc:
            print(f"[AutoCall Notice] {exc}")

    return OrderResponse.model_validate(order)


@router.post("/direct-call")
async def trigger_direct_call(
    request: TriggerCallRequest,
    current_user: User = Depends(get_current_user)
):
    """Directly trigger an automated voice call via Twilio for any phone number."""
    phone = request.phone_number or "+919876543210"
    cust_name = request.customer_name or "Valued Customer"
    shop_name = request.shop_name or (current_user.full_name if current_user else "Master Atelier")
    garment = request.garment_type or "Bespoke Garment"
    order_num = request.order_number or "TH-2026-TRIAL"
    call_type = request.call_type or "trial_ready"

    result = trigger_outbound_call(
        customer_phone=phone,
        customer_name=cust_name,
        shop_name=shop_name,
        garment_type=garment,
        order_number=order_num,
        call_type=call_type
    )
    return result


@router.post("/{order_id}/trigger-call")
async def trigger_order_call(
    order_id: str,
    request: Optional[TriggerCallRequest] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger an automated voice call for an order."""
    phone = request.phone_number if (request and request.phone_number) else None
    cust_name = request.customer_name if (request and request.customer_name) else None
    shop_name = request.shop_name if (request and request.shop_name) else None
    garment = request.garment_type if (request and request.garment_type) else "Bespoke Garment"
    order_num = request.order_number if (request and request.order_number) else str(order_id)
    call_type = (request.call_type if request else "trial_ready") or "trial_ready"

    if db is not None:
        try:
            import uuid
            oid = uuid.UUID(order_id) if isinstance(order_id, str) else order_id
            res = await db.execute(select(Order).where(Order.id == oid))
            order = res.scalar_one_or_none()
            if order:
                garment = order.garment_type
                order_num = order.order_number
                if not phone or not cust_name:
                    c_res = await db.execute(select(User).where(User.id == order.customer_id))
                    cust = c_res.scalar_one_or_none()
                    if cust:
                        phone = phone or cust.phone_number
                        cust_name = cust_name or cust.full_name
        except Exception as e:
            print(f"[Order Lookup Notice] {e}")

    phone = phone or "+919876543210"
    cust_name = cust_name or "Valued Customer"
    shop_name = shop_name or (current_user.full_name if current_user else "Master Atelier")

    result = trigger_outbound_call(
        customer_phone=phone,
        customer_name=cust_name,
        shop_name=shop_name,
        garment_type=garment,
        order_number=order_num,
        call_type=call_type
    )
    return result


@router.get("/stats/summary")
async def order_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get order statistics for dashboard (tailor view)."""
    if current_user.role != "tailor":
        raise HTTPException(status_code=403, detail="Tailor access only")

    base = select(func.count(Order.id)).where(Order.tailor_id == current_user.id)

    total = (await db.execute(base)).scalar() or 0
    active = (await db.execute(
        base.where(Order.status.in_(["received", "cutting", "stitching", "trial_ready"]))
    )).scalar() or 0
    delivered = (await db.execute(base.where(Order.status == "delivered"))).scalar() or 0
    today_due = (await db.execute(
        base.where(and_(Order.promised_date == date.today(), Order.status != "delivered"))
    )).scalar() or 0

    return {
        "total_orders": total,
        "active_orders": active,
        "delivered_orders": delivered,
        "due_today": today_due
    }
