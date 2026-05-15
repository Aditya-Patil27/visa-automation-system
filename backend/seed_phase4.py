"""Seed Phase 4 synthetic data: notifications, queries, admin activity.

Idempotent — clears existing data before reseeding.
"""

import asyncio
import json
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from app.database import async_session, init_db
from app.models import NotificationTable, QueryTable, QueryResponseTable
from sqlalchemy import delete


async def seed_notifications():
    await init_db()
    async with async_session() as session:
        await session.execute(delete(NotificationTable))
        now = datetime.utcnow()
        notifs = [
            NotificationTable(user_email="john@example.com", type="appointment", title="Appointment Confirmed", message="Your appointment on 2026-06-15 at 10:00 AM has been confirmed.", created_at=now - timedelta(hours=2)),
            NotificationTable(user_email="john@example.com", type="document", title="Document Approved", message="Your passport has been approved.", created_at=now - timedelta(hours=1), read=1),
            NotificationTable(user_email="jane@example.com", type="appointment", title="Appointment Reminder", message="Reminder: Your appointment is tomorrow at 2:00 PM.", created_at=now - timedelta(hours=12)),
            NotificationTable(user_email="jane@example.com", type="query", title="Query Response", message="Your visa status question has been answered.", created_at=now - timedelta(minutes=30)),
            NotificationTable(user_email="bob@example.com", type="document", title="Document Rejected", message="Your bank statement was rejected. Please upload a more recent one.", created_at=now - timedelta(days=1), read=0),
        ]
        for n in notifs:
            session.add(n)
        await session.commit()
        print(f"Seeded {len(notifs)} notifications")


async def seed_queries():
    await init_db()
    async with async_session() as session:
        await session.execute(delete(QueryResponseTable))
        await session.execute(delete(QueryTable))

        q1 = QueryTable(user_email="john@example.com", subject="Visa processing time", message="How long does it usually take for a US B1/B2 visa to be processed after the interview?", status="responded", created_at=datetime.utcnow() - timedelta(days=2))
        q2 = QueryTable(user_email="jane@example.com", subject="Document requirements for UK visa", message="Do I need to provide original bank statements or are copies acceptable?", status="open", created_at=datetime.utcnow() - timedelta(hours=6))
        q3 = QueryTable(user_email="bob@example.com", subject="Reschedule appointment", message="I need to reschedule my appointment due to a medical emergency. What's the process?", status="open", created_at=datetime.utcnow() - timedelta(hours=1))

        session.add_all([q1, q2, q3])
        await session.commit()
        await session.refresh(q1)

        r1 = QueryResponseTable(query_id=q1.id, responder_email="admin@visa.com", message="Standard processing for US B1/B2 visa is 10-15 business days after the interview. You can track your application status on the US embassy website using your CEAC barcode.", created_at=datetime.utcnow() - timedelta(days=1))
        session.add(r1)
        q1.status = "responded"

        await session.commit()
        print(f"Seeded {len([q1, q2, q3])} queries with responses")


async def seed_all():
    await seed_notifications()
    await seed_queries()
    print("Phase 4 seeding complete")


if __name__ == "__main__":
    asyncio.run(seed_all())
