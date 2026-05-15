"""Seed synthetic visa requirement data for 6 countries, 3+ visa types each.

Follows the pattern from backend/seed_db.py.
After seeding, rebuilds the FAISS index via app.rag.index_from_db().
"""

import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import async_session, init_db
from app.models import VisaTable
from sqlalchemy import delete

# ── Map index variables so alternative_visa_ids can reference by list index ──
# Indices correspond to each entry's position in VISA_REQUIREMENTS below.

IDX_US_B1B2 = 0
IDX_US_F1 = 1
IDX_US_H1B = 2
IDX_UK_VISITOR = 3
IDX_UK_TIER4 = 4
IDX_UK_SKILLED = 5
IDX_CAN_TRV = 6
IDX_CAN_STUDY = 7
IDX_CAN_EXPRESS = 8
IDX_AUS_600 = 9
IDX_AUS_500 = 10
IDX_AUS_TSS = 11
IDX_FRA_SCHENGEN = 12
IDX_FRA_STUDENT = 13
IDX_FRA_WORK = 14
IDX_JPN_TOURIST = 15
IDX_JPN_STUDENT = 16
IDX_JPN_WORK = 17

VISA_REQUIREMENTS = [
    # ─────────────────────────────────────────────────
    # United States (indices 0-2)
    # ─────────────────────────────────────────────────
    {
        "country": "United States",
        "visa_type": "B1/B2 Tourist/Business Visa",
        "min_age": 18,
        "max_age": None,
        "min_balance": 5000.0,
        "allowed_purposes": ["tourism", "business", "medical"],
        "documents": [
            "Valid passport (6+ months validity)",
            "DS-160 confirmation page",
            "Passport photo (2x2 in, white background)",
            "Bank statements (last 3 months)",
            "Travel itinerary",
            "Employment verification letter",
        ],
        "processing_time": "10-15 business days",
        "validity": "10 years",
        "max_stay_days": 180,
        "fee": 185.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "has_passport": "assessment.passport_number is not None",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "purpose_ok": "assessment.purpose in visa.allowed_purposes",
        },
        "alternative_visa_ids": [IDX_UK_VISITOR],
        "description": "For tourism, business visits, or medical treatment in the United States.",
    },
    {
        "country": "United States",
        "visa_type": "F-1 Student Visa",
        "min_age": 16,
        "max_age": None,
        "min_balance": 20000.0,
        "allowed_purposes": ["study"],
        "documents": [
            "Valid passport",
            "I-20 form from SEVIS-approved institution",
            "SEVIS fee receipt",
            "Academic transcripts and test scores",
            "Proof of sufficient funds",
            "DS-160 confirmation",
        ],
        "processing_time": "15-30 business days",
        "validity": "Duration of study",
        "max_stay_days": None,
        "fee": 160.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'study'",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_UK_TIER4, IDX_CAN_STUDY, IDX_AUS_500],
        "description": "For full-time academic study at accredited US institutions.",
    },
    {
        "country": "United States",
        "visa_type": "H-1B Work Visa",
        "min_age": 21,
        "max_age": None,
        "min_balance": 0.0,
        "allowed_purposes": ["work"],
        "documents": [
            "Valid passport",
            "Labor Condition Application (LCA) approval",
            "Form I-129 petition",
            "Educational credentials evaluation",
            "Employer support letter",
        ],
        "processing_time": "2-6 months",
        "validity": "3 years (renewable)",
        "max_stay_days": None,
        "fee": 190.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'work'",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_UK_SKILLED, IDX_CAN_EXPRESS],
        "description": "For specialist occupations requiring a bachelor's degree or higher.",
    },
    # ─────────────────────────────────────────────────
    # United Kingdom (indices 3-5)
    # ─────────────────────────────────────────────────
    {
        "country": "United Kingdom",
        "visa_type": "Standard Visitor Visa",
        "min_age": 18,
        "max_age": None,
        "min_balance": 3000.0,
        "allowed_purposes": ["tourism", "business"],
        "documents": [
            "Valid passport",
            "Travel itinerary and accommodation details",
            "Bank statements (last 3 months)",
            "Employment letter or proof of ties",
            "Travel insurance",
        ],
        "processing_time": "15 working days",
        "validity": "6 months (2-5-10 year options available)",
        "max_stay_days": 180,
        "fee": 115.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "has_passport": "assessment.passport_number is not None",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "purpose_ok": "assessment.purpose in visa.allowed_purposes",
        },
        "alternative_visa_ids": [IDX_US_B1B2, IDX_FRA_SCHENGEN],
        "description": "For tourism, visiting family, or short business trips to the UK.",
    },
    {
        "country": "United Kingdom",
        "visa_type": "Tier 4 Student Visa",
        "min_age": 16,
        "max_age": None,
        "min_balance": 15000.0,
        "allowed_purposes": ["study"],
        "documents": [
            "Valid passport",
            "CAS (Confirmation of Acceptance for Studies)",
            "English language proficiency evidence",
            "Academic transcripts",
            "Proof of maintenance funds",
            "ATAS certificate (if required)",
        ],
        "processing_time": "3-4 weeks",
        "validity": "Duration of study",
        "max_stay_days": None,
        "fee": 348.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'study'",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_US_F1, IDX_CAN_STUDY, IDX_AUS_500],
        "description": "For students aged 16+ pursuing education at UK institutions.",
    },
    {
        "country": "United Kingdom",
        "visa_type": "Skilled Worker Visa",
        "min_age": 18,
        "max_age": None,
        "min_balance": 0.0,
        "allowed_purposes": ["work"],
        "documents": [
            "Valid passport",
            "Certificate of Sponsorship from employer",
            "Job offer meeting skill and salary thresholds",
            "English language proficiency evidence",
            "Bank statements (if applying for dependents)",
        ],
        "processing_time": "8 weeks",
        "validity": "Up to 5 years",
        "max_stay_days": None,
        "fee": 610.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'work'",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_CAN_EXPRESS, IDX_AUS_TSS],
        "description": "For individuals with a job offer from a UK-licensed sponsor.",
    },
    # ─────────────────────────────────────────────────
    # Canada (indices 6-8)
    # ─────────────────────────────────────────────────
    {
        "country": "Canada",
        "visa_type": "Visitor Visa (TRV)",
        "min_age": 18,
        "max_age": None,
        "min_balance": 2500.0,
        "allowed_purposes": ["tourism", "business"],
        "documents": [
            "Valid passport",
            "Travel itinerary",
            "Proof of financial support",
            "Letter of invitation (if visiting family/friends)",
            "Employment letter or proof of ties",
        ],
        "processing_time": "20-30 business days",
        "validity": "Up to 10 years or passport expiry",
        "max_stay_days": 180,
        "fee": 100.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "has_passport": "assessment.passport_number is not None",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "purpose_ok": "assessment.purpose in visa.allowed_purposes",
        },
        "alternative_visa_ids": [IDX_UK_VISITOR, IDX_AUS_600],
        "description": "For short visits to Canada for tourism or business purposes.",
    },
    {
        "country": "Canada",
        "visa_type": "Study Permit",
        "min_age": 16,
        "max_age": None,
        "min_balance": 20000.0,
        "allowed_purposes": ["study"],
        "documents": [
            "Valid passport",
            "Letter of Acceptance from DLI",
            "Proof of financial support",
            "Statement of purpose",
            "Academic transcripts",
            "Immigration medical exam results",
        ],
        "processing_time": "5-10 weeks",
        "validity": "Duration of study + 90 days",
        "max_stay_days": None,
        "fee": 150.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'study'",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_US_F1, IDX_UK_TIER4, IDX_AUS_500],
        "description": "For international students at Canadian Designated Learning Institutions.",
    },
    {
        "country": "Canada",
        "visa_type": "Express Entry (PR)",
        "min_age": 18,
        "max_age": None,
        "min_balance": 15000.0,
        "allowed_purposes": ["work"],
        "documents": [
            "Valid passport",
            "Language test results (IELTS/TEF)",
            "Educational credential assessment (ECA)",
            "Proof of work experience",
            "Proof of settlement funds",
            "Police clearance certificate",
        ],
        "processing_time": "6-8 months",
        "validity": "Permanent resident status",
        "max_stay_days": None,
        "fee": 850.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "purpose_ok": "assessment.purpose == 'work'",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_UK_SKILLED, IDX_AUS_TSS],
        "description": "For skilled workers applying for permanent residence in Canada.",
    },
    # ─────────────────────────────────────────────────
    # Australia (indices 9-11)
    # ─────────────────────────────────────────────────
    {
        "country": "Australia",
        "visa_type": "Visitor Visa Subclass 600",
        "min_age": 18,
        "max_age": None,
        "min_balance": 3000.0,
        "allowed_purposes": ["tourism", "business"],
        "documents": [
            "Valid passport",
            "Completed visitor visa application form",
            "Bank statements (last 3 months)",
            "Travel itinerary and accommodation details",
            "Proof of employment or ties to home country",
        ],
        "processing_time": "20-35 business days",
        "validity": "Up to 12 months",
        "max_stay_days": 90,
        "fee": 145.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "has_passport": "assessment.passport_number is not None",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "purpose_ok": "assessment.purpose in visa.allowed_purposes",
        },
        "alternative_visa_ids": [IDX_US_B1B2, IDX_CAN_TRV],
        "description": "For tourism or business visitor activities in Australia.",
    },
    {
        "country": "Australia",
        "visa_type": "Student Visa Subclass 500",
        "min_age": 16,
        "max_age": None,
        "min_balance": 20000.0,
        "allowed_purposes": ["study"],
        "documents": [
            "Valid passport",
            "Confirmation of Enrolment (CoE)",
            "Genuine Student (GS) statement",
            "English language proficiency results",
            "Proof of financial capacity",
            "Overseas Student Health Cover (OSHC) receipt",
        ],
        "processing_time": "4-8 weeks",
        "validity": "Duration of study",
        "max_stay_days": None,
        "fee": 620.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'study'",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_UK_TIER4, IDX_CAN_STUDY, IDX_US_F1],
        "description": "For international students enrolled in registered Australian courses.",
    },
    {
        "country": "Australia",
        "visa_type": "Temporary Skill Shortage Visa (TSS)",
        "min_age": 18,
        "max_age": None,
        "min_balance": 0.0,
        "allowed_purposes": ["work"],
        "documents": [
            "Valid passport",
            "Skills assessment from relevant assessing authority",
            "English language test results",
            "Employer sponsorship nomination approval",
            "Proof of relevant work experience",
        ],
        "processing_time": "3-6 months",
        "validity": "Up to 4 years",
        "max_stay_days": None,
        "fee": 940.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'work'",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_UK_SKILLED, IDX_CAN_EXPRESS],
        "description": "For skilled workers sponsored by an Australian employer.",
    },
    # ─────────────────────────────────────────────────
    # France / Schengen (indices 12-14)
    # ─────────────────────────────────────────────────
    {
        "country": "France / Schengen",
        "visa_type": "Schengen Tourist Visa",
        "min_age": 18,
        "max_age": None,
        "min_balance": 2000.0,
        "allowed_purposes": ["tourism", "business"],
        "documents": [
            "Valid passport (3+ months beyond return)",
            "Schengen visa application form",
            "Travel itinerary and flight reservation",
            "Hotel booking confirmation",
            "Travel medical insurance (€30k minimum)",
            "Bank statements (last 3 months)",
        ],
        "processing_time": "15 calendar days",
        "validity": "Up to 5 years (multiply entry)",
        "max_stay_days": 90,
        "fee": 90.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "has_passport": "assessment.passport_number is not None",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "purpose_ok": "assessment.purpose in visa.allowed_purposes",
        },
        "alternative_visa_ids": [IDX_UK_VISITOR, IDX_CAN_TRV],
        "description": "For short stays in the Schengen Area (up to 90 days in 180-day period).",
    },
    {
        "country": "France / Schengen",
        "visa_type": "Long Stay Student Visa",
        "min_age": 16,
        "max_age": None,
        "min_balance": 12000.0,
        "allowed_purposes": ["study"],
        "documents": [
            "Valid passport",
            "Letter of acceptance from French institution",
            "Proof of accommodation in France",
            "Proof of financial resources (€615/month)",
            "Academic transcripts and diplomas",
            "OFII form",
        ],
        "processing_time": "4-8 weeks",
        "validity": "Duration of study (1-4 years)",
        "max_stay_days": None,
        "fee": 99.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'study'",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_UK_TIER4, IDX_FRA_WORK],
        "description": "For students enrolled in long-term programs at French educational institutions.",
    },
    {
        "country": "France / Schengen",
        "visa_type": "Work Visa / Passeport Talent",
        "min_age": 18,
        "max_age": None,
        "min_balance": 0.0,
        "allowed_purposes": ["work"],
        "documents": [
            "Valid passport",
            "Employment contract or promise of hire",
            "Work authorization from French authorities",
            "Educational and professional credentials",
            "Proof of qualifications",
        ],
        "processing_time": "4-8 weeks",
        "validity": "Up to 4 years (renewable)",
        "max_stay_days": None,
        "fee": 99.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'work'",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_UK_SKILLED, IDX_FRA_STUDENT],
        "description": "For highly skilled workers, researchers, and talent in France.",
    },
    # ─────────────────────────────────────────────────
    # Japan (indices 15-17)
    # ─────────────────────────────────────────────────
    {
        "country": "Japan",
        "visa_type": "Tourist Visa",
        "min_age": 18,
        "max_age": None,
        "min_balance": 3000.0,
        "allowed_purposes": ["tourism"],
        "documents": [
            "Valid passport",
            "Visa application form (with photo)",
            "Travel itinerary",
            "Flight reservation",
            "Hotel booking confirmation",
            "Bank statements or proof of funds",
        ],
        "processing_time": "5-7 business days",
        "validity": "3 months (single/double entry)",
        "max_stay_days": 90,
        "fee": 30.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "has_passport": "assessment.passport_number is not None",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "purpose_ok": "assessment.purpose in visa.allowed_purposes",
        },
        "alternative_visa_ids": [IDX_US_B1B2, IDX_FRA_SCHENGEN],
        "description": "For tourism visits to Japan (single or double entry).",
    },
    {
        "country": "Japan",
        "visa_type": "Student Visa",
        "min_age": 16,
        "max_age": None,
        "min_balance": 15000.0,
        "allowed_purposes": ["study"],
        "documents": [
            "Valid passport",
            "Certificate of Eligibility (CoE)",
            "Letter of acceptance from Japanese institution",
            "Academic transcripts",
            "Proof of financial capacity",
            "Passport-sized photo",
        ],
        "processing_time": "5-10 business days (after CoE)",
        "validity": "Duration of study (6 months to 2 years)",
        "max_stay_days": None,
        "fee": 50.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'study'",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_UK_TIER4, IDX_AUS_500],
        "description": "For international students enrolled at Japanese language schools or universities.",
    },
    {
        "country": "Japan",
        "visa_type": "Work Visa",
        "min_age": 22,
        "max_age": None,
        "min_balance": 0.0,
        "allowed_purposes": ["work"],
        "documents": [
            "Valid passport",
            "Certificate of Eligibility (CoE)",
            "Employment contract from Japanese employer",
            "University degree or equivalent qualifications",
            "CV and professional experience documents",
        ],
        "processing_time": "5-10 business days (after CoE)",
        "validity": "1-5 years (renewable)",
        "max_stay_days": None,
        "fee": 50.0,
        "eligibility_rules": {
            "age_ok": "assessment.age >= visa.min_age",
            "purpose_ok": "assessment.purpose == 'work'",
            "has_passport": "assessment.passport_number is not None",
        },
        "alternative_visa_ids": [IDX_US_H1B, IDX_UK_SKILLED],
        "description": "For professionals with a job offer from a Japanese employer.",
    },
]


async def seed():
    """Seed the database with synthetic visa requirement data and rebuild FAISS."""
    await init_db()

    async with async_session() as session:
        # Clear existing visa data
        await session.execute(delete(VisaTable))

        for v in VISA_REQUIREMENTS:
            row = VisaTable(
                country=v["country"],
                visa_type=v["visa_type"],
                processing_time=v.get("processing_time"),
                min_age=v.get("min_age", 18),
                max_age=v.get("max_age"),
                min_balance=v.get("min_balance", 0.0),
                description=v.get("description", ""),
                validity=v.get("validity"),
                max_stay_days=v.get("max_stay_days"),
                fee=v.get("fee"),
            )
            row.set_documents(v["documents"])
            row.set_allowed_purposes(v["allowed_purposes"])
            row.set_eligibility_rules(v.get("eligibility_rules", {}))
            row.set_alternative_visa_ids(v.get("alternative_visa_ids", []))
            session.add(row)

        await session.commit()
        print(f"Seeded {len(VISA_REQUIREMENTS)} visa records across 6 countries")

    # Rebuild FAISS index after seeding
    from app.rag import index_from_db

    await index_from_db()
    print("FAISS index rebuilt successfully.")


async def generate_appointment_slots():
    """Generate 30 days of appointment slots starting from today.
    8 slots per weekday (9AM-5PM), ~40% randomly booked for test users."""
    from app.models import AppointmentTable
    from datetime import date, timedelta
    import random

    await init_db()
    async with async_session() as session:
        # Clear existing slots
        await session.execute(delete(AppointmentTable))

        test_emails = ["john@example.com", "jane@example.com", "bob@example.com",
                       "alice@example.com", "testuser@example.com"]
        time_slots = [f"{h}:00 {'AM' if h < 12 else 'PM'}" for h in range(9, 17)]
        start = date.today()
        count = 0

        for day_offset in range(30):
            d = start + timedelta(days=day_offset)
            if d.weekday() >= 5:
                continue
            date_str = d.strftime("%Y-%m-%d")
            for ts in time_slots:
                is_booked = random.random() < 0.4
                if is_booked:
                    status = random.choices(["confirmed", "cancelled", "completed"], weights=[60, 20, 20])[0]
                    row = AppointmentTable(
                        user_email=random.choice(test_emails),
                        visa_type_id=random.randint(1, 5),
                        date=date_str, time_slot=ts, status=status,
                    )
                else:
                    row = AppointmentTable(
                        user_email="", visa_type_id=None,
                        date=date_str, time_slot=ts, status="available",
                    )
                session.add(row)
                count += 1

        await session.commit()
        print(f"Generated {count} appointment slots (30 days, Mon-Fri)")

    return count


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--slots":
        asyncio.run(generate_appointment_slots())
    else:
        asyncio.run(seed())
