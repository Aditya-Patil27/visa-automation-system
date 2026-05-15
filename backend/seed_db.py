"""Seed MongoDB with visa requirement data."""
import asyncio
import json
from app.database import get_database, init_db
from app.models import COLL_VISAS


SEED_VISAS = [
    {"country": "United States", "visa_type": "B1/B2 Tourist/Business Visa",
     "documents": ["Valid passport", "DS-160 confirmation", "Photo", "Bank statements"],
     "processing_time": "10-15 business days", "min_age": 18, "min_balance": 5000.0,
     "allowed_purposes": ["tourism", "business", "medical"], "description": "For tourism, business visits, or medical treatment.",
     "validity": "10 years", "max_stay_days": 180, "fee": 185.0},
    {"country": "United Kingdom", "visa_type": "Standard Visitor Visa",
     "documents": ["Valid passport", "Bank statements", "Travel itinerary"],
     "processing_time": "15 working days", "min_age": 18, "min_balance": 3000.0,
     "allowed_purposes": ["tourism", "business"], "description": "For tourism, family visits, or business meetings.",
     "fee": 115.0},
    {"country": "India", "visa_type": "e-Tourist Visa",
     "documents": ["Valid passport", "Photo", "Return ticket", "Hotel booking"],
     "processing_time": "3-5 working days", "min_age": 18, "min_balance": 1000.0,
     "allowed_purposes": ["tourism", "business", "medical"],
     "description": "Electronic Tourist Visa for India.", "validity": "1 year", "max_stay_days": 90, "fee": 25.0},
    {"country": "Australia", "visa_type": "Visitor Visa (Subclass 600)",
     "documents": ["Valid passport", "Bank statements", "Travel itinerary", "Employment letter"],
     "processing_time": "20-30 days", "min_age": 18, "min_balance": 5000.0,
     "allowed_purposes": ["tourism", "business"], "description": "For tourism or business visits.",
     "validity": "Up to 12 months", "max_stay_days": 90, "fee": 145.0},
    {"country": "Canada", "visa_type": "Visitor Visa",
     "documents": ["Valid passport", "Photos", "Travel history", "Bank statements", "Travel itinerary"],
     "processing_time": "14-30 days", "min_age": 18, "min_balance": 5000.0,
     "allowed_purposes": ["tourism", "business"], "description": "For tourism or business visits to Canada.",
     "validity": "Up to 10 years", "max_stay_days": 180, "fee": 100.0},
    {"country": "Schengen Area", "visa_type": "Schengen Tourist Visa",
     "documents": ["Valid passport", "Travel insurance", "Flight reservation", "Hotel booking", "Bank statements", "Employment letter"],
     "processing_time": "15 calendar days", "min_age": 18, "min_balance": 5000.0,
     "allowed_purposes": ["tourism", "business", "family visit"],
     "description": "Short-stay visa for Schengen Area.", "validity": "Up to 5 years", "max_stay_days": 90, "fee": 80.0},
]


async def seed():
    await init_db()
    db = get_database()
    existing = await db[COLL_VISAS].count_documents({})
    if existing > 0:
        print(f"MongoDB already has {existing} visa records — skipping seed")
        return
    for visa in SEED_VISAS:
        await db[COLL_VISAS].insert_one(visa)
    print(f"Seeded {len(SEED_VISAS)} visa records into MongoDB")


if __name__ == "__main__":
    asyncio.run(seed())
