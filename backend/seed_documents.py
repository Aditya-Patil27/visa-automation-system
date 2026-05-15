"""Seed synthetic document records and appointments for Phase 3 testing.

Generates Fernet-encrypted dummy documents and enhanced AppointmentTable records.
Idempotent — clears existing data before reseeding.
"""

import asyncio
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from app.database import async_session, init_db
from app.models import UserDocumentTable, DocumentStatusTable, DocumentTable, AppointmentTable
from sqlalchemy import delete


DUMMY_FILE_CONTENT = b"This is a synthetic test document for visa application processing."


async def seed_documents():
    """Seed UserDocumentTable with encrypted dummy files per document type."""
    from app.encryption import encrypt_data

    await init_db()
    async with async_session() as session:
        await session.execute(delete(UserDocumentTable))
        await session.execute(delete(DocumentStatusTable))

        test_users = [
            ("john@example.com", "John"),
            ("jane@example.com", "Jane"),
            ("bob@example.com", "Bob"),
        ]
        doc_types = ["passport", "bank_statement", "photograph", "travel_insurance",
                     "flight_itinerary", "employment_letter"]
        count = 0

        for email, name in test_users:
            for dt in doc_types:
                encrypted = encrypt_data(DUMMY_FILE_CONTENT)
                filename = f"{name}_{dt}.pdf"
                status = "uploaded"

                doc = UserDocumentTable(
                    user_email=email, filename=filename,
                    content_type="application/pdf", document_type=dt,
                    status=status, is_encrypted=1,
                    encrypted_data=encrypted, ocr_text=f"[Synthetic OCR] {name} {dt} document",
                    created_at=datetime.utcnow(),
                )
                session.add(doc)

                status_row = DocumentStatusTable(
                    user_email=email, document_type=dt,
                    filename=filename, status=status,
                )
                session.add(status_row)
                count += 1

        await session.commit()
        print(f"Seeded {count} encrypted documents for {len(test_users)} users")


async def seed_document_checklists():
    """Seed DocumentTable with realistic checklists for test users."""
    await init_db()
    async with async_session() as session:
        await session.execute(delete(DocumentTable))

        test_users = [
            "john@example.com", "jane@example.com", "bob@example.com",
        ]
        for email in test_users:
            row = DocumentTable(
                user_email=email,
                active_processing=json.dumps({}),
                checklist=json.dumps([
                    {"name": "Valid Passport", "status": "Verified", "icon": "passport"},
                    {"name": "Bank Statements", "status": "Pending", "icon": "account_balance"},
                    {"name": "Travel Insurance", "status": "Not Uploaded", "icon": "health_and_safety"},
                    {"name": "Flight Itinerary", "status": "Verified", "icon": "flight"},
                    {"name": "Accommodation Proof", "status": "Pending", "icon": "hotel"},
                ]),
            )
            session.add(row)

        await session.commit()
        print(f"Seeded checklists for {len(test_users)} users")


async def seed_appointments():
    """Seed AppointmentTable with sample appointments for test users."""
    await init_db()
    async with async_session() as session:
        await session.execute(delete(AppointmentTable))

        appointments = [
            AppointmentTable(user_email="john@example.com", visa_type_id=1,
                date="2026-06-15", time_slot="10:00 AM", status="confirmed",
                location="VFS Global Center"),
            AppointmentTable(user_email="jane@example.com", visa_type_id=3,
                date="2026-06-18", time_slot="2:00 PM", status="confirmed",
                location="VFS Global Center"),
            AppointmentTable(user_email="bob@example.com", visa_type_id=2,
                date="2026-06-10", time_slot="9:00 AM", status="completed",
                location="VFS Global Center"),
            AppointmentTable(user_email="john@example.com", visa_type_id=4,
                date="2026-05-20", time_slot="11:00 AM", status="cancelled",
                location="VFS Global Center"),
        ]
        for a in appointments:
            session.add(a)

        await session.commit()
        print(f"Seeded {len(appointments)} sample appointments")


async def seed_all():
    await seed_documents()
    await seed_document_checklists()
    await seed_appointments()


if __name__ == "__main__":
    asyncio.run(seed_all())
