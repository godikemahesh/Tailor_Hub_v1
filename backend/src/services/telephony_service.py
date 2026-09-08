"""
TailorHub – Telephony Voice Notification Service
Triggers automated AI voice calls to customers via Twilio when an order becomes trial-ready or completed.
"""

import os
import re
from typing import Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

TELEPHONY_DRIVER = os.getenv("TELEPHONY_DRIVER", "twilio")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "")


def normalize_phone_number(phone: str) -> str:
    """Format phone number into E.164 format required by Twilio."""
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    if not cleaned.startswith('+'):
        if len(cleaned) == 10:
            return f"+91{cleaned}"
        elif len(cleaned) == 12 and cleaned.startswith('91'):
            return f"+{cleaned}"
    return cleaned


def build_voice_script(
    customer_name: str,
    shop_name: str,
    garment_type: str,
    order_number: str,
    call_type: str = "trial_ready"
) -> str:
    """Generate professional personalized automated voice notification script."""
    c_name = customer_name or "Valued Customer"
    s_name = shop_name or "Your Master Atelier"
    g_type = garment_type or "bespoke outfit"
    ord_no = order_number or ""

    if call_type == "trial_ready":
        return (
            f"Hello {c_name}. This is an automated update from {s_name} on TailorHub. "
            f"We are delighted to inform you that your bespoke {g_type}, order number {ord_no}, "
            f"has finished precision stitching and is now ready for your trial fitting. "
            f"Please visit the workshop at your earliest convenience. Thank you for choosing master craftsmanship!"
        )
    elif call_type == "delivery_ready":
        return (
            f"Hello {c_name}. This is {s_name} calling through TailorHub. "
            f"Your tailored {g_type}, order {ord_no}, has completed final finishing and quality check. "
            f"It is now ready for delivery and pickup. Thank you!"
        )
    else:
        return (
            f"Hello {c_name}. This is a friendly reminder from {s_name} regarding your order {ord_no} on TailorHub. "
            f"Your {g_type} is ready at our atelier. Have a wonderful day!"
        )


def trigger_outbound_call(
    customer_phone: str,
    customer_name: str,
    shop_name: str,
    garment_type: str,
    order_number: str,
    call_type: str = "trial_ready"
) -> Dict[str, Any]:
    """
    Trigger automated voice call to the customer using Twilio Voice API.
    Gracefully falls back to simulation mode if credentials are unset or driver is simulator.
    """
    to_phone = normalize_phone_number(customer_phone)
    message_text = build_voice_script(customer_name, shop_name, garment_type, order_number, call_type)

    if TELEPHONY_DRIVER == "twilio" and TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER:
        try:
            from twilio.rest import Client
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

            # TwiML Say voice response in clear Indian-English accent
            twiml_content = (
                f'<Response>'
                f'<Pause length="1"/>'
                f'<Say voice="Polly.Aditi" language="en-IN">{message_text}</Say>'
                f'<Pause length="1"/>'
                f'<Say voice="Polly.Aditi" language="en-IN">Repeating message: {message_text}</Say>'
                f'</Response>'
            )

            call = client.calls.create(
                twiml=twiml_content,
                to=to_phone,
                from_=TWILIO_FROM_NUMBER
            )

            return {
                "success": True,
                "driver": "twilio",
                "call_sid": call.sid,
                "to": to_phone,
                "from": TWILIO_FROM_NUMBER,
                "status": call.status,
                "message": message_text
            }
        except Exception as e:
            print(f"[Twilio Error] {e}")
            return {
                "success": False,
                "driver": "twilio",
                "error": str(e),
                "to": to_phone,
                "message": message_text
            }

    # Simulation driver fallback for dev
    return {
        "success": True,
        "driver": "simulator",
        "call_sid": f"SIM-CALL-{int(datetime.now().timestamp())}",
        "to": to_phone,
        "from": TWILIO_FROM_NUMBER or "+14142409384",
        "status": "completed",
        "message": message_text
    }
