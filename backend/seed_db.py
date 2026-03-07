import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def execute_seed():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client.visaflow

    print("Seeding Progress Tracker...")
    await db.progress.delete_many({})
    await db.progress.insert_one({
        "user_email": "testuser_1234@test.com",
        "progress_steps": [
            {"title": "Application Submitted", "date": "Oct 12, 2023", "status": "completed", "desc": "Successfully received and logged in the VFS portal."},
            {"title": "Document Verification", "date": "Oct 15, 2023", "status": "completed", "desc": "Financial statements, CAS, and transcripts validated by AI."},
            {"title": "Appointment Scheduled", "date": "Oct 28, 2023", "status": "current", "desc": "Embassy of the UK, London VFS Global Center.", "time": "10:30 AM"},
            {"title": "Visa Interview", "date": "Late October", "status": "upcoming", "desc": "Prepare for potential interview questions."},
            {"title": "Final Decision", "date": "Nov 15, 2023", "status": "upcoming", "desc": "Embassy communicates final outcome."}
        ],
        "stats": {
            "total_timeline": "34 Days",
            "approval_probability": 98.2,
            "wait_time": "12 Days"
        }
    })

    print("Seeding Tasks & Workflow...")
    await db.workflow.delete_many({})
    await db.workflow.insert_many([
        { "id": "APP-2091", "type": "Visa Decision", "priority": "High", "time": "2 hours ago", "user": "J. Smith (UK Tier 4)" },
        { "id": "APP-2088", "type": "Document Verification", "priority": "Medium", "time": "5 hours ago", "user": "M. Garcia (US B1/B2)" },
        { "id": "SYS-092", "type": "Rules Update Approval", "priority": "Low", "time": "1 day ago", "user": "System Auto-Draft" }
    ])

    print("Seeding Scraper Logs...")
    await db.scraper_logs.delete_many({})
    await db.scraper_logs.insert_many([
        {"timestamp": "2 mins ago", "action": "Scrape Embassy Data", "entity": "Berlin, Germany", "status": "Success"},
        {"timestamp": "3 hours ago", "action": "Scrape Error", "entity": "Ottawa, Canada", "status": "Retrying"},
        {"timestamp": "5 hours ago", "action": "Data Sync", "entity": "London, UK", "status": "Success"},
    ])

    print("Seeding Appointments...")
    await db.appointments.delete_many({})
    await db.appointments.insert_one({
        "user_email": "testuser_1234@test.com",
        "selected": {"date": "Oct 07, 2023", "time": "10:30 AM - 11:15 AM", "location": "US Consulate, London", "agent": "Agent Sarah Jenkins (Assigned)"},
        "available_slots": [{"day": 5, "count": 3}, {"day": 15, "ai_optimized": True}],
        "month": "October 2023"
    })

    print("Seeding Documents...")
    await db.documents.delete_many({})
    await db.documents.insert_one({
        "user_email": "testuser_1234@test.com",
        "active_processing": {"name": "Passport_Scan_Main.pdf", "type": "pdf", "size": "2.4 MB", "progress": 84},
        "checklist": [
            {"name": "Identity Proof", "desc": "Valid Passport", "status": "Verified"},
            {"name": "Bank Statement", "desc": "Last 6 Months", "status": "Pending"},
            {"name": "Digital Photo", "desc": "35x45mm, White BG", "status": "Action"}
        ]
    })

    print("Seeding available done!")

if __name__ == "__main__":
    asyncio.run(execute_seed())
