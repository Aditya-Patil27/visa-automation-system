"""Seed 45 synthetic users + 1 bypass demo user with realistic visa application data."""
import asyncio
import json
import random
from datetime import datetime, timedelta

from app.database import get_database, init_db
from app.security import get_password_hash
from app.models import (
    COLL_USERS, COLL_ASSESSMENTS, COLL_DOCUMENT_STATUS,
    COLL_APPOINTMENTS, COLL_NOTIFICATIONS, COLL_PROGRESS,
    COLL_QUERIES, COLL_QUERY_RESPONSES, COLL_VISAS,
)

COUNTRIES = ["United States", "United Kingdom", "India", "Australia", "Canada", "Schengen Area"]
VISA_TYPES = {
    "United States": "B1/B2 Tourist/Business Visa",
    "United Kingdom": "Standard Visitor Visa",
    "India": "e-Tourist Visa",
    "Australia": "Visitor Visa (Subclass 600)",
    "Canada": "Visitor Visa",
    "Schengen Area": "Schengen Tourist Visa",
}
PURPOSES = ["tourism", "business", "medical", "family visit"]
DOC_TYPES = [
    "passport", "bank_statement", "photograph", "travel_insurance",
    "flight_itinerary", "hotel_booking", "employment_letter",
    "invitation_letter", "visa_application_form", "proof_of_residence",
    "cover_letter",
]
DOC_STATUSES = ["uploaded", "pending_review", "approved", "rejected"]
ASSESSMENT_STATUSES = ["draft", "submitted", "completed"]
APPOINTMENT_STATUSES = ["confirmed", "completed", "cancelled"]
NOTIF_TYPES = ["auth", "document", "appointment", "system", "query"]

FIRST_NAMES = [
    "Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Arjun", "Divya", "Karan", "Isha",
    "Rahul", "Neha", "Siddharth", "Pooja", "Manish", "Kavita", "Deepak", "Sunita", "Amit", "Rekha",
    "Raj", "Meera", "Vivek", "Anjali", "Saurabh", "Lata", "Nitin", "Geeta", "Harsh", "Nalini",
    "Prakash", "Sarita", "Gaurav", "Maya", "Akash", "Ritu", "Tushar", "Bhavna", "Yash", "Chitra",
    "Om", "Jaya", "Kunal", "Radha", "Dev",
]
LAST_NAMES = [
    "Sharma", "Patel", "Verma", "Gupta", "Singh", "Kumar", "Joshi", "Reddy", "Nair", "Desai",
    "Mehta", "Agarwal", "Pillai", "Rao", "Chopra", "Malhotra", "Khan", "Das", "Saxena", "Arora",
    "Bose", "Sen", "Iyer", "Mishra", "Kapoor", "Thakur", "Bajaj", "Kohli", "Sethi", "Sood",
    "Bhat", "Srinivas", "Pandey", "Dubey", "Tiwari", "Gokhale", "Ranade", "Kulkarni", "Deshmukh", "Jadhav",
    "Pawar", "Sathe", "Bhave", "Paranjape", "Date",
]
CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow"]

random.seed(42)


def _randdate(days_ago_min: int, days_ago_max: int) -> str:
    d = datetime.utcnow() - timedelta(days=random.randint(days_ago_min, days_ago_max),
                                      hours=random.randint(0, 23), minutes=random.randint(0, 59))
    return d.isoformat()


def _pick(country: str) -> str:
    return VISA_TYPES.get(country, "Tourist Visa")


async def seed():
    """Synchronous-style async seed — create all synthetic data in MongoDB."""
    await init_db()
    db = get_database()

    existing = await db[COLL_USERS].count_documents({})
    if existing > 10:
        print(f"Database already has {existing} users — skipping synthetic seed")
        return

    # Fetch visa records to map country -> visa _id
    visa_rows = await db[COLL_VISAS].find().to_list(length=50)
    visa_by_country: dict = {}
    for r in visa_rows:
        visa_by_country[r["country"]] = str(r["_id"])

    # ── 1. Create bypass demo user ──────────────────────────────────────
    bypass_email = "bypass@demo.com"
    bypass_exists = await db[COLL_USERS].find_one({"email": bypass_email})
    if not bypass_exists:
        await db[COLL_USERS].insert_one({
            "email": bypass_email,
            "hashed_password": get_password_hash("bypass123"),
            "role": "employee",
            "bypass": True,
            "name": "Demo User",
            "created_at": _randdate(30, 60),
        })
        print(f"  Created bypass user: {bypass_email} / bypass123")
    else:
        print(f"  Bypass user already exists: {bypass_email}")

    # Notifications for bypass user
    existing_notifs = await db[COLL_NOTIFICATIONS].count_documents({"user_email": bypass_email})
    if existing_notifs == 0:
        notifs = [
            {"user_email": bypass_email, "type": "auth", "title": "Welcome to VisaAI",
             "message": "Your demo account is ready. Explore all features!", "created_at": _randdate(1, 5)},
            {"user_email": bypass_email, "type": "system", "title": "Demo Mode Active",
             "message": "Document validation is bypassed for this account.", "created_at": _randdate(1, 5)},
            {"user_email": bypass_email, "type": "appointment", "title": "Demo Appointment",
             "message": "A mock appointment has been created for demonstration.", "created_at": _randdate(0, 1)},
        ]
        await db[COLL_NOTIFICATIONS].insert_many(notifs)

    # Appointment for bypass user
    if await db[COLL_APPOINTMENTS].count_documents({"user_email": bypass_email}) == 0:
        await db[COLL_APPOINTMENTS].insert_one({
            "user_email": bypass_email, "date": (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d"),
            "time_slot": "10:00 AM", "status": "confirmed",
            "location": "VFS Global, Mumbai", "notes": "Demo appointment — no real visit needed",
            "created_at": _randdate(0, 1),
        })

    # Progress for bypass user
    if await db[COLL_PROGRESS].count_documents({"user_email": bypass_email}) == 0:
        await db[COLL_PROGRESS].insert_one({
            "user_email": bypass_email,
            "progress_steps": json.dumps([
                {"step": 1, "title": "Application Submitted", "status": "completed", "date": _randdate(5, 10)},
                {"step": 2, "title": "Documents Verified", "status": "completed", "date": _randdate(3, 5)},
                {"step": 3, "title": "Biometric Appointment", "status": "completed", "date": _randdate(1, 3)},
                {"step": 4, "title": "Visa Processing", "status": "in_progress", "date": _randdate(0, 1)},
            ]),
            "stats": json.dumps({"completion": 75, "days_remaining": 12}),
        })

    # ── 2. Create 45 synthetic users ────────────────────────────────────
    print("  Creating synthetic users...")
    user_batch = []
    for i in range(45):
        first = FIRST_NAMES[i % len(FIRST_NAMES)]
        last = LAST_NAMES[i % len(LAST_NAMES)]
        email = f"{first.lower()}.{last.lower()}{i}@example.com"
        role = "admin" if i < 3 else "employee"
        user_batch.append({
            "email": email,
            "hashed_password": get_password_hash("pass1234"),
            "role": role,
            "name": f"{first} {last}",
            "city": random.choice(CITIES),
            "bypass": False,
            "created_at": _randdate(10, 90),
        })
    await db[COLL_USERS].insert_many(user_batch)
    print(f"  Created {len(user_batch)} synthetic users")

    # ── 3. Create assessments ────────────────────────────────────────────
    print("  Creating assessments...")
    assessment_batch = []
    for i in range(45):
        email = user_batch[i]["email"]
        country = random.choice(COUNTRIES)
        age = random.randint(22, 65)
        balance = random.choice([1500, 3000, 5000, 8000, 12000, 20000, 50000])
        purpose = random.choice(PURPOSES)
        passport = f"PP{random.randint(100000, 999999)}"
        status = random.choices(ASSESSMENT_STATUSES, weights=[0.2, 0.5, 0.3])[0]

        steps = {str(s): {"age": age, "bank_balance": balance, "purpose": purpose,
                          "passport_number": passport, "destination_country": country,
                          "nationality": "Indian", "intended_stay_days": random.randint(7, 30)}
                 for s in range(1, 4)}

        # Determine eligibility outcome
        eligible = True
        score = random.randint(60, 100)
        result = {
            "overall_eligible": eligible,
            "score": score,
            "visa_type": _pick(country),
            "country": country,
            "matched_requirements": ["age", "funds", "purpose", "passport"],
            "missing_requirements": [],
            "actionable_feedback": [],
        }
        if status == "submitted":
            eligible = random.choice([True, False])
            score = random.randint(40, 95) if eligible else random.randint(10, 45)
            result["overall_eligible"] = eligible
            result["score"] = score
            if not eligible:
                result["matched_requirements"] = random.sample(["age", "funds", "purpose", "passport"], random.randint(1, 3))
                result["missing_requirements"] = [f"Insufficient balance" if "funds" not in result["matched_requirements"] else "Passport not valid"]
                result["actionable_feedback"] = ["Please provide additional documentation"]

        assessment_batch.append({
            "user_email": email,
            "status": status,
            "current_step": 3 if status != "draft" else random.randint(1, 2),
            "form_data": json.dumps(steps),
            "eligibility_score": score if status != "draft" else None,
            "is_eligible": 1 if eligible else 0,
            "result_details": json.dumps(result) if status != "draft" else "{}",
            "created_at": _randdate(5, 60),
        })
    await db[COLL_ASSESSMENTS].insert_many(assessment_batch)
    print(f"  Created {len(assessment_batch)} assessments")

    # ── 4. Create document status entries ────────────────────────────────
    print("  Creating document status entries...")
    doc_batch = []
    admin_emails = [u["email"] for u in user_batch[:3]]
    for i in range(45):
        email = user_batch[i]["email"]
        user_docs = random.sample(DOC_TYPES, random.randint(3, 6))
        for dt in user_docs:
            # Most documents approved, some pending, some rejected as "fake"
            status = random.choices(
                ["approved", "pending_review", "rejected", "uploaded"],
                weights=[0.4, 0.25, 0.1, 0.25],
            )[0]
            entry = {
                "user_email": email,
                "document_type": dt,
                "filename": f"{dt}_{random.randint(1000,9999)}.pdf",
                "status": status,
            }
            if status in ("approved", "rejected"):
                entry["reviewed_by"] = random.choice(admin_emails)
                entry["reviewed_at"] = _randdate(1, 10)
            if status == "rejected":
                reasons = [
                    "Document appears to be digitally altered — signatures mismatch",
                    "Bank statement does not match official format",
                    "Passport number format invalid — possible forgery",
                    "Photograph does not meet ICAO standards",
                    "Travel insurance policy number not found in issuer database",
                    "Hotel booking reference invalid — booking not confirmed",
                    "Employment letter suspected to be forged — company letterhead mismatch",
                    "Invitation letter lacks official stamp — suspected forgery",
                    "Financial documents appear tampered — inconsistent data",
                    "Cover letter AI-generated — lacks personalization expected for this visa type",
                ]
                entry["reviewer_notes"] = random.choice(reasons)
            doc_batch.append(entry)
    await db[COLL_DOCUMENT_STATUS].insert_many(doc_batch)
    print(f"  Created {len(doc_batch)} document status entries")

    # ── 5. Create appointments ───────────────────────────────────────────
    print("  Creating appointments...")
    appoint_batch = []
    for i in range(45):
        email = user_batch[i]["email"]
        if random.random() > 0.6:
            continue
        future = random.randint(-10, 30)
        status = "completed" if future < 0 else ("cancelled" if random.random() < 0.1 else "confirmed")
        appoint_batch.append({
            "user_email": email,
            "date": (datetime.utcnow() + timedelta(days=future)).strftime("%Y-%m-%d"),
            "time_slot": f"{random.randint(9, 16)}:00 {'AM' if random.randint(0,1) == 0 else 'PM'}",
            "status": status,
            "location": f"VFS Global, {random.choice(CITIES)}",
            "notes": "" if status == "completed" else "Rescheduled from earlier date",
            "created_at": _randdate(5, 30),
        })
    if appoint_batch:
        await db[COLL_APPOINTMENTS].insert_many(appoint_batch)
    print(f"  Created {len(appoint_batch)} appointments")

    # ── 6. Create notifications ──────────────────────────────────────────
    print("  Creating notifications...")
    notif_batch = []
    for i in range(45):
        email = user_batch[i]["email"]
        for _ in range(random.randint(2, 5)):
            ntype = random.choice(NOTIF_TYPES)
            titles = {
                "auth": ["Account Created", "Password Changed", "Login from new device"],
                "document": ["Document Approved", "Document Rejected", "Document Pending Review", "New Document Uploaded"],
                "appointment": ["Appointment Confirmed", "Appointment Reminder", "Appointment Cancelled"],
                "system": ["Visa Requirements Updated", "System Maintenance", "New Feature Available"],
                "query": ["Support Ticket Created", "Query Resolved", "Admin Responded to Query"],
            }
            title = random.choice(titles[ntype])
            messages = {
                "Document Rejected": f"Your document was flagged as potentially fraudulent. Please re-upload a valid copy.",
                "Document Approved": "Your document has been verified successfully.",
                "Appointment Reminder": "Your biometric appointment is tomorrow at the embassy.",
                "Account Created": "Welcome to VisaAI! Your account has been created successfully.",
            }
            message = messages.get(title, f"{title} — no further action needed.")
            notif_batch.append({
                "user_email": email,
                "type": ntype,
                "title": title,
                "message": message,
                "read": random.choice([0, 1]),
                "created_at": _randdate(0, 30),
            })
    await db[COLL_NOTIFICATIONS].insert_many(notif_batch)
    print(f"  Created {len(notif_batch)} notifications")

    # ── 7. Create progress entries ───────────────────────────────────────
    print("  Creating progress entries...")
    progress_batch = []
    for i in range(45):
        email = user_batch[i]["email"]
        completed_steps = random.randint(1, 4)
        steps = []
        for s in range(1, 5):
            steps.append({
                "step": s,
                "title": ["Application Submitted", "Documents Verified", "Biometric Appointment", "Visa Processing"][s - 1],
                "status": "completed" if s <= completed_steps else ("in_progress" if s == completed_steps + 1 else "pending"),
                "date": _randdate(s * 5, s * 10) if s <= completed_steps else None,
            })
        progress_batch.append({
            "user_email": email,
            "progress_steps": json.dumps(steps),
            "stats": json.dumps({"completion": completed_steps * 25, "days_remaining": random.randint(5, 30)}),
        })
    await db[COLL_PROGRESS].insert_many(progress_batch)
    print(f"  Created {len(progress_batch)} progress entries")

    # ── 8. Create support queries ────────────────────────────────────────
    print("  Creating support queries...")
    query_batch = []
    for i in range(45):
        email = user_batch[i]["email"]
        if random.random() > 0.5:
            continue
        subjects = [
            "Missing document from checklist", "Appointment rescheduling request",
            "Visa fee payment issue", "Passport return tracking",
            "Biometric appointment location change", "Additional documents required",
            "Status of my application", "Incorrect information on application",
        ]
        query_batch.append({
            "user_email": email,
            "subject": random.choice(subjects),
            "message": "I need assistance regarding my visa application. Please provide an update.",
            "status": random.choice(["open", "responded", "closed"]),
            "created_at": _randdate(2, 20),
        })
    if query_batch:
        await db[COLL_QUERIES].insert_many(query_batch)
    print(f"  Created {len(query_batch)} support queries")

    print("\n[Synthetic data seeding complete!]")
    print(f"   Bypass user: bypass@demo.com / bypass123")
    print(f"   Regular users: <first>.<last><n>@example.com / pass1234")
    print(f"   Total synthetic users: {len(user_batch)}")


if __name__ == "__main__":
    asyncio.run(seed())
