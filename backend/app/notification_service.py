"""
Notification Service

Provides email (SMTP/SendGrid) and SMS (Twilio) notification support.
"""

import os
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr
from pydantic_settings import BaseSettings


class NotificationType(str, Enum):
    """Types of notifications"""
    STATUS_CHANGE = "status_change"
    APPOINTMENT_REMINDER = "appointment_reminder"
    DOCUMENT_REQUEST = "document_request"
    ADMIN_ALERT = "admin_alert"
    ELIGIBILITY_RESULT = "eligibility_result"


class NotificationPriority(str, Enum):
    """Notification priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationSettings(BaseSettings):
    """Settings for notification service"""
    # Email settings (SMTP or SendGrid)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    sendgrid_api_key: str = ""
    email_from: str = "noreply@visa-automation.com"
    email_from_name: str = "Visa Automation System"
    
    # SMS settings (Twilio)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    
    # Notification toggles
    email_enabled: bool = True
    sms_enabled: bool = False
    
    class Config:
        env_file = ".env"
        extra = "ignore"


class NotificationRecipient(BaseModel):
    """Recipient information for notifications"""
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    user_id: Optional[str] = None


class NotificationPayload(BaseModel):
    """Notification content"""
    subject: str
    body: str
    priority: NotificationPriority = NotificationPriority.MEDIUM
    metadata: Dict = {}


class NotificationResult(BaseModel):
    """Result of notification sending"""
    success: bool
    notification_id: str
    channels: List[str]  # ["email", "sms"]
    errors: List[str] = []
    sent_at: datetime


async def send_email(
    to_email: str,
    subject: str,
    body: str,
    settings: NotificationSettings = None
) -> Dict:
    """
    Send email notification via SMTP or SendGrid.
    """
    if settings is None:
        settings = NotificationSettings()
    
    if not settings.email_enabled:
        return {"success": False, "error": "Email notifications disabled"}
    
    # Try SendGrid first if API key is available
    if settings.sendgrid_api_key:
        try:
            return await _send_via_sendgrid(
                to_email, subject, body, settings
            )
        except Exception as e:
            pass
    
    # Fall back to SMTP
    if settings.smtp_user and settings.smtp_password:
        try:
            return await _send_via_smtp(
                to_email, subject, body, settings
            )
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    return {"success": False, "error": "No email configuration available"}


async def _send_via_sendgrid(
    to_email: str,
    subject: str,
    body: str,
    settings: NotificationSettings
) -> Dict:
    """Send email via SendGrid API"""
    import requests
    
    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        "Authorization": f"Bearer {settings.sendgrid_api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "personalizations": [{
            "to": [{"email": to_email}]
        }],
        "from": {
            "email": settings.email_from,
            "name": settings.email_from_name
        },
        "subject": subject,
        "content": [{
            "type": "text/plain",
            "value": body
        }]
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code in [200, 201, 202]:
        return {"success": True, "via": "sendgrid"}
    else:
        raise Exception(f"SendGrid error: {response.status_code} - {response.text}")


async def _send_via_smtp(
    to_email: str,
    subject: str,
    body: str,
    settings: NotificationSettings
) -> Dict:
    """Send email via SMTP"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    msg = MIMEMultipart()
    msg["From"] = f"{settings.email_from_name} <{settings.email_from}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    
    msg.attach(MIMEText(body, "plain"))
    
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
    
    return {"success": True, "via": "smtp"}


async def send_sms(
    to_phone: str,
    message: str,
    settings: NotificationSettings = None
) -> Dict:
    """
    Send SMS notification via Twilio.
    """
    if settings is None:
        settings = NotificationSettings()
    
    if not settings.sms_enabled:
        return {"success": False, "error": "SMS notifications disabled"}
    
    if not all([settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_phone_number]):
        return {"success": False, "error": "Twilio configuration incomplete"}
    
    try:
        from twilio.rest import Client
        
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        
        twilio_message = client.messages.create(
            body=message,
            from_=settings.twilio_phone_number,
            to=to_phone
        )
        
        return {
            "success": True,
            "sid": twilio_message.sid,
            "via": "twilio"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


async def send_notification(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
    notification_type: NotificationType = NotificationType.STATUS_CHANGE,
    settings: NotificationSettings = None
) -> NotificationResult:
    """
    Send notification via configured channels (email/SMS).
    """
    if settings is None:
        settings = NotificationSettings()
    
    import uuid
    notification_id = str(uuid.uuid4())
    channels = []
    errors = []
    
    # Send email if available
    if recipient.email and settings.email_enabled:
        result = await send_email(
            recipient.email,
            payload.subject,
            payload.body,
            settings
        )
        if result.get("success"):
            channels.append("email")
        else:
            errors.append(f"Email failed: {result.get('error', 'Unknown error')}")
    
    # Send SMS if available
    if recipient.phone and settings.sms_enabled:
        result = await send_sms(recipient.phone, payload.body, settings)
        if result.get("success"):
            channels.append("sms")
        else:
            errors.append(f"SMS failed: {result.get('error', 'Unknown error')}")
    
    # Store notification in database
    await _store_notification(
        notification_id,
        recipient,
        payload,
        notification_type,
        channels,
        errors
    )
    
    return NotificationResult(
        success=len(channels) > 0,
        notification_id=notification_id,
        channels=channels,
        errors=errors,
        sent_at=datetime.utcnow()
    )


async def _store_notification(
    notification_id: str,
    recipient: NotificationRecipient,
    payload: NotificationPayload,
    notification_type: NotificationType,
    channels: List[str],
    errors: List[str]
):
    """Store notification record in database"""
    from .database import get_database
    
    db = get_database()
    
    notification_doc = {
        "notification_id": notification_id,
        "user_id": recipient.user_id,
        "recipient_email": recipient.email,
        "recipient_phone": recipient.phone,
        "type": notification_type.value,
        "subject": payload.subject,
        "body": payload.body,
        "priority": payload.priority.value,
        "metadata": payload.metadata,
        "channels": channels,
        "errors": errors,
        "sent_at": datetime.utcnow().isoformat()
    }
    
    await db.notifications.insert_one(notification_doc)


async def get_notification_history(
    user_email: str = None,
    limit: int = 50
) -> List[Dict]:
    """Get notification history for a user"""
    from .database import get_database
    
    db = get_database()
    query = {"recipient_email": user_email} if user_email else {}
    
    cursor = db.notifications.find(query).sort("sent_at", -1).limit(limit)
    notifications = await cursor.to_list(length=limit)
    
    for n in notifications:
        n["_id"] = str(n["_id"])
    
    return notifications


async def update_user_preferences(
    user_email: str,
    preferences: Dict
) -> Dict:
    """Update user notification preferences"""
    from .database import get_database
    
    db = get_database()
    
    prefs_doc = {
        "user_email": user_email,
        "email_enabled": preferences.get("email_enabled", True),
        "sms_enabled": preferences.get("sms_enabled", False),
        "phone": preferences.get("phone"),
        "notification_types": preferences.get("notification_types", []),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    await db.notification_preferences.update_one(
        {"user_email": user_email},
        {"$set": prefs_doc},
        upsert=True
    )
    
    return {"success": True, "updated": prefs_doc}


async def get_user_preferences(user_email: str) -> Dict:
    """Get user notification preferences"""
    from .database import get_database
    
    db = get_database()
    prefs = await db.notification_preferences.find_one({"user_email": user_email})
    
    if prefs:
        prefs["_id"] = str(prefs["_id"])
        return prefs
    
    return {
        "user_email": user_email,
        "email_enabled": True,
        "sms_enabled": False,
        "phone": None,
        "notification_types": []
    }


# ==================== Notification Triggers ====================

async def notify_status_change(
    user_email: str,
    old_status: str,
    new_status: str,
    additional_info: str = ""
):
    """Send notification on application status change"""
    prefs = await get_user_preferences(user_email)
    
    if not prefs.get("email_enabled"):
        return {"skipped": "email disabled"}
    
    subject = f"Visa Application Status Update: {old_status} → {new_status}"
    body = f"""Your visa application status has been updated:

Previous Status: {old_status}
New Status: {new_status}

{additional_info}

Log in to your dashboard for more details.

- Visa Automation System"""

    recipient = NotificationRecipient(email=user_email, user_id=user_email)
    payload = NotificationPayload(
        subject=subject,
        body=body,
        priority=NotificationPriority.HIGH,
        metadata={"old_status": old_status, "new_status": new_status}
    )
    
    return await send_notification(
        recipient,
        payload,
        NotificationType.STATUS_CHANGE
    )


async def notify_appointment_reminder(
    user_email: str,
    appointment_date: str,
    appointment_time: str,
    location: str,
    appointment_type: str
):
    """Send appointment reminder notification"""
    prefs = await get_user_preferences(user_email)
    
    if not prefs.get("email_enabled"):
        return {"skipped": "email disabled"}
    
    subject = f"Appointment Reminder: {appointment_type}"
    body = f"""Your {appointment_type} appointment is coming up:

Date: {appointment_date}
Time: {appointment_time}
Location: {location}

Please arrive 15 minutes early and bring all required documents.

- Visa Automation System"""

    recipient = NotificationRecipient(email=user_email, user_id=user_email)
    payload = NotificationPayload(
        subject=subject,
        body=body,
        priority=NotificationPriority.HIGH,
        metadata={"appointment_date": appointment_date, "location": location}
    )
    
    return await send_notification(
        recipient,
        payload,
        NotificationType.APPOINTMENT_REMINDER
    )


async def notify_admin_alert(
    admin_email: str,
    alert_type: str,
    message: str,
    severity: str = "medium"
):
    """Send alert to admin"""
    priority = NotificationPriority.URGENT if severity == "high" else NotificationPriority.MEDIUM
    
    subject = f"[{severity.upper()}] Admin Alert: {alert_type}"
    body = f"""Admin Alert - {alert_type}

{message}

Generated: {datetime.utcnow().isoformat()}"""

    recipient = NotificationRecipient(email=admin_email, user_id="admin")
    payload = NotificationPayload(
        subject=subject,
        body=body,
        priority=priority,
        metadata={"alert_type": alert_type, "severity": severity}
    )
    
    return await send_notification(
        recipient,
        payload,
        NotificationType.ADMIN_ALERT
    )