"""Debug the failing assessment."""
import asyncio, json, traceback
from bson import ObjectId
from app.database import get_database

db = get_database()


async def debug():
    doc = await db.assessments.find_one({"_id": ObjectId("6a06e5d81af8a32975c60fb7")})
    if not doc:
        print("Assessment not found")
        return
    print("Status:", doc.get("status"))
    raw = doc.get("form_data", "{}")
    print("Raw form_data length:", len(raw))

    form_data = json.loads(raw)
    all_steps = {}
    for k, v in form_data.items():
        if isinstance(v, dict):
            all_steps.update(v)
    print("Keys in all_steps:", list(all_steps.keys()))

    dest = all_steps.get("destination_country", "")
    print("Destination:", dest)

    from app.models import COLL_VISAS
    visa_doc = await db[COLL_VISAS].find_one({"country": {"$regex": f"^{dest}$", "$options": "i"}})
    if visa_doc:
        print("Visa found:", visa_doc.get("visa_type"))
    else:
        print("Visa NOT found for:", dest)
        return

    assessment_data = {
        "age": all_steps.get("age", 25),
        "bank_balance": all_steps.get("bank_balance", 0),
        "purpose": all_steps.get("purpose", ""),
        "passport_number": all_steps.get("passport_number", ""),
        "destination_country": dest,
    }
    print("Assessment data:", assessment_data)

    from app.eligibility import assess_eligibility
    try:
        result = await assess_eligibility(assessment_data, visa_doc)
        print("Eligibility OK:", result.get("overall_eligible"))
    except Exception as e:
        traceback.print_exc()


asyncio.run(debug())
