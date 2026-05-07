"""
Razorpay Payment Routes
- POST /api/payment/create-order  — create a Razorpay order
- POST /api/payment/verify        — verify payment signature
"""
import hmac
import hashlib
import time
import httpx
from fastapi import APIRouter, HTTPException
from app.config import settings
from app.database.mongo import users_col, is_mongo_ready

router = APIRouter()

# ── Credentials from settings (loaded from .env) ─────────────────────────────
RAZORPAY_KEY_ID     = settings.RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET = settings.RAZORPAY_KEY_SECRET

PLAN_PRICES = {
    "monthly": 99900,   # ₹999 in paise
    "yearly":  799900,  # ₹7999 in paise
}


# ─── Create Order ─────────────────────────────────────────────────────────────
@router.post("/create-order")
async def create_order(body: dict):
    """
    Create a Razorpay order.
    Returns order_id, amount, currency for the frontend checkout.
    """
    plan    = body.get("plan", "monthly")
    email   = body.get("email", "")
    amount  = PLAN_PRICES.get(plan, PLAN_PRICES["monthly"])

    if amount < 100:
        raise HTTPException(status_code=400, detail="Amount must be at least ₹1 (100 paise)")

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Payment gateway not configured")

    receipt = f"deva_{plan}_{int(time.time())}"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(
                "https://api.razorpay.com/v1/orders",
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
                json={
                    "amount":   amount,
                    "currency": "INR",
                    "receipt":  receipt,
                    "notes": {
                        "plan":  plan,
                        "email": email,
                    },
                },
            )

        if res.status_code == 401:
            raise HTTPException(status_code=401, detail="Payment gateway authentication failed")
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Razorpay error: {res.text}")

        data = res.json()
        return {
            "order_id": data["id"],
            "amount":   data["amount"],
            "currency": data["currency"],
            "key_id":   RAZORPAY_KEY_ID,   # safe to send to frontend
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


# ─── Verify Payment ───────────────────────────────────────────────────────────
@router.post("/verify")
async def verify_payment(body: dict):
    """
    Verify Razorpay payment signature.
    HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    """
    order_id   = body.get("razorpay_order_id", "")
    payment_id = body.get("razorpay_payment_id", "")
    signature  = body.get("razorpay_signature", "")
    email      = body.get("email", "")
    plan       = body.get("plan", "monthly")

    if not all([order_id, payment_id, signature]):
        raise HTTPException(status_code=400, detail="Missing payment fields")

    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Payment gateway not configured")

    # Verify signature
    message  = f"{order_id}|{payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Payment signature verification failed")

    # Grant pro status in MongoDB (non-blocking if DB unavailable)
    if email and is_mongo_ready():
        try:
            await users_col().update_one(
                {"email": email.strip().lower()},
                {"$set": {
                    "is_pro": True,
                    "pro_plan": plan,
                    "pro_payment_id": payment_id,
                    "pro_order_id": order_id,
                }},
                upsert=False,
            )
        except Exception:
            pass  # Non-critical — frontend sets isPro in localStorage

    return {
        "success": True,
        "message": "Payment verified. Pro access granted.",
        "payment_id": payment_id,
        "plan": plan,
    }
