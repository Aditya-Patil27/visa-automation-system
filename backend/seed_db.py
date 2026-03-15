import asyncio
import json
import sys
import os

# Ensure we can import the app package
sys.path.insert(0, os.path.dirname(__file__))

from app.database import async_session, init_db
from app.models import (
    ProgressTable, WorkflowTable, ScraperLogTable,
    AppointmentTable, DocumentTable,
)


async def execute_seed():
    await init_db()

    async with async_session() as session:
        print("Seeding Progress Tracker...")
        # clear existing
        from sqlalchemy import delete
        await session.execute(delete(ProgressTable))
        session.add(ProgressTable(
            user_email="testuser_1234@test.com",
            progress_steps=json.dumps([
                {"title": "Application Submitted", "date": "Oct 12, 2023", "status": "completed", "desc": "Successfully received and logged in the VFS portal."},
                {"title": "Document Verification", "date": "Oct 15, 2023", "status": "completed", "desc": "Financial statements, CAS, and transcripts validated by AI."},
                {"title": "Appointment Scheduled", "date": "Oct 28, 2023", "status": "current", "desc": "Embassy/Consulate, VFS Global Center.", "time": "10:30 AM"},
                {"title": "Visa Interview", "date": "Late October", "status": "upcoming", "desc": "Prepare for potential interview questions."},
                {"title": "Final Decision", "date": "Nov 15, 2023", "status": "upcoming", "desc": "Embassy communicates final outcome."}
            ]),
            stats=json.dumps({
                "total_timeline": "34 Days",
                "approval_probability": 98.2,
                "wait_time": "12 Days"
            })
        ))

        print("Seeding Tasks & Workflow...")
        await session.execute(delete(WorkflowTable))
        session.add_all([
            WorkflowTable(task_id="APP-2091", type="Visa Decision", priority="High", time="2 hours ago", user="J. Smith (Student Visa)"),
            WorkflowTable(task_id="APP-2088", type="Document Verification", priority="Medium", time="5 hours ago", user="M. Garcia (US B1/B2)"),
            WorkflowTable(task_id="SYS-092", type="Rules Update Approval", priority="Low", time="1 day ago", user="System Auto-Draft"),
        ])

        print("Seeding Scraper Logs...")
        await session.execute(delete(ScraperLogTable))
        session.add_all([
            ScraperLogTable(timestamp="2 mins ago", action="Scrape Embassy Data", entity="Berlin, Germany", status="Success"),
            ScraperLogTable(timestamp="3 hours ago", action="Scrape Error", entity="Ottawa, Canada", status="Retrying"),
            ScraperLogTable(timestamp="5 hours ago", action="Data Sync", entity="Multiple Embassies", status="Success"),
        ])

        print("Seeding Appointments...")
        await session.execute(delete(AppointmentTable))
        session.add(AppointmentTable(
            user_email="testuser_1234@test.com",
            selected=json.dumps({"date": "Oct 07, 2023", "time": "10:30 AM - 11:15 AM", "location": "Consulate / VAC", "agent": "Agent Sarah Jenkins (Assigned)"}),
            available_slots=json.dumps([{"day": 5, "count": 3}, {"day": 15, "ai_optimized": True}]),
            month="October 2023"
        ))

        print("Seeding Documents...")
        await session.execute(delete(DocumentTable))
        session.add(DocumentTable(
            user_email="testuser_1234@test.com",
            active_processing=json.dumps({"name": "Passport_Scan_Main.pdf", "type": "pdf", "size": "2.4 MB", "progress": 84}),
            checklist=json.dumps([
                {"name": "Identity Proof", "desc": "Valid Passport", "status": "Verified"},
                {"name": "Bank Statement", "desc": "Last 6 Months", "status": "Pending"},
                {"name": "Digital Photo", "desc": "35x45mm, White BG", "status": "Action"}
            ])
        ))

        await session.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(execute_seed())
