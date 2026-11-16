from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import re

app = FastAPI(
    title="DISCOUNT API",
    description="Demo API for product comparison, price history, coupons and offers.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "chrome-extension://*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clearly labelled sample records. Replace with authorised provider integrations.
PRODUCTS = [
    {
        "id": "phone-001", "name": "DemoPhone X 128GB", "brand": "DemoPhone",
        "category": "Mobiles", "variant": "128GB / Midnight", "image": "",
        "demo": True, "updated_at": "Demo data — not a live price feed",
        "listings": [
            {"store": "Amazon India", "price": 29999, "delivery": 0, "url": "https://www.amazon.in/"},
            {"store": "Flipkart", "price": 29499, "delivery": 0, "url": "https://www.flipkart.com/"},
            {"store": "Croma", "price": 30999, "delivery": 99, "url": "https://www.croma.com/"},
        ],
        "history": [31999, 31499, 30999, 31999, 30499, 29999, 29499],
    },
    {
        "id": "headphones-001", "name": "SoundBeat Wireless Headphones", "brand": "SoundBeat",
        "category": "Audio", "variant": "Black", "image": "",
        "demo": True, "updated_at": "Demo data — not a live price feed",
        "listings": [
            {"store": "Amazon India", "price": 2499, "delivery": 0, "url": "https://www.amazon.in/"},
            {"store": "Flipkart", "price": 2399, "delivery": 40, "url": "https://www.flipkart.com/"},
        ],
        "history": [2999, 2899, 2799, 2699, 2599, 2499, 2399],
    },
    {
        "id": "laptop-001", "name": "WorkBook Air 13", "brand": "WorkBook",
        "category": "Laptops", "variant": "16GB / 512GB", "image": "",
        "demo": True, "updated_at": "Demo data — not a live price feed",
        "listings": [
            {"store": "Croma", "price": 74990, "delivery": 0, "url": "https://www.croma.com/"},
            {"store": "Reliance Digital", "price": 75990, "delivery": 0, "url": "https://www.reliancedigital.in/"},
        ],
        "history": [79990, 78990, 77990, 76990, 75990, 74990, 74990],
    },
]

COUPONS = [
    {"id": "coupon-demo-1", "code": "DEMO10", "title": "Sample 10% coupon",
     "store": "Example Store", "discount": "10%", "min_order": 1000,
     "max_discount": 500, "valid_until": "2099-12-31", "status": "DEMO — NOT VERIFIED"},
]
BANK_OFFERS = [
    {"id": "bank-demo-1", "bank": "Example Bank", "card": "Eligible credit card",
     "discount": "₹500 instant discount", "min_transaction": 10000,
     "max_discount": 500, "valid_until": "2099-12-31",
     "status": "DEMO — CHECK ISSUER TERMS"},
]

class AlertRequest(BaseModel):
    product_id: str
    target_price: float = Field(gt=0)
    email: Optional[str] = None

class PriceCalculation(BaseModel):
    product_price: float = Field(ge=0)
    delivery: float = Field(default=0, ge=0)
    coupon_discount: float = Field(default=0, ge=0)
    bank_discount: float = Field(default=0, ge=0)

@app.get("/health")
def health():
    return {"status": "ok", "service": "discount-api", "mode": "demo"}

@app.get("/api/products")
def list_products(q: str = Query(default="", max_length=120), category: Optional[str] = None):
    term = q.strip().lower()
    results = PRODUCTS
    if term:
        results = [p for p in results if term in p["name"].lower() or term in p["brand"].lower()]
    if category:
        results = [p for p in results if p["category"].lower() == category.lower()]
    return {"items": results, "count": len(results), "data_mode": "demo"}

@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/api/compare/{product_id}")
def compare_product(product_id: str):
    product = get_product(product_id)
    listings = sorted(product["listings"], key=lambda x: x["price"] + x["delivery"])
    return {
        "product_id": product_id,
        "variant": product["variant"],
        "demo": True,
        "listings": listings,
        "lowest_effective_price": listings[0]["price"] + listings[0]["delivery"] if listings else None,
        "warning": "Sample data only. Confirm price and variant on the retailer website."
    }

@app.get("/api/products/{product_id}/history")
def price_history(product_id: str):
    product = get_product(product_id)
    return {
        "product_id": product_id,
        "demo": True,
        "currency": "INR",
        "points": [{"day": f"Day {i+1}", "price": value} for i, value in enumerate(product["history"])],
        "warning": "Illustrative demo history; not historical market data."
    }

@app.get("/api/coupons")
def coupons(store: Optional[str] = None):
    items = COUPONS
    if store:
        items = [c for c in items if c["store"].lower() == store.lower()]
    return {"items": items, "data_mode": "demo"}

@app.get("/api/bank-offers")
def bank_offers():
    return {"items": BANK_OFFERS, "data_mode": "demo"}

@app.post("/api/calculate")
def calculate(data: PriceCalculation):
    gross = data.product_price + data.delivery
    discount = min(gross, data.coupon_discount + data.bank_discount)
    return {"gross": round(gross, 2), "discount": round(discount, 2),
            "final_price": round(gross - discount, 2),
            "note": "Demo calculator. Check offer eligibility and stacking rules."}

@app.post("/api/alerts")
def create_alert(data: AlertRequest):
    if not any(p["id"] == data.product_id for p in PRODUCTS):
        raise HTTPException(status_code=404, detail="Product not found")
    # Persistence and delivery are intentionally not faked in this starter.
    return {"created": False, "mode": "demo",
            "message": "Alert endpoint is a starter. Configure authentication, database persistence and notification delivery before use."}
