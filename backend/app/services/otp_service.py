'''otp_service.py'''
import random
import resend
import os
from datetime import datetime, timedelta, timezone as dt_timezone
from zoneinfo import ZoneInfo


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def get_otp_timestamps(timezone: str):
    tz = ZoneInfo(timezone)
    now = datetime.now(tz)
    expiration = now + timedelta(minutes=5)
    return now, expiration


def is_otp_expired(expiration_at: datetime, timezone: str) -> bool:
    tz = ZoneInfo(timezone)
    now = datetime.now(tz)

    if expiration_at.tzinfo is None:
       # expiration_at = expiration_at.replace(tzinfo=tz)
       expiration_at = expiration_at.replace(tzinfo=dt_timezone.utc).astimezone(tz)


    return now > expiration_at


def send_otp_email(email: str, otp: str, otp_type_label: str = "Verification"):
    resend.api_key = os.getenv("RESEND_API_KEY")

    params = {
        "from": os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev"),
        "to": [email],
        "subject": f"Your {otp_type_label} Code",
        "html": f"""
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
        </head>
        <body style="margin:0; padding:0; background-color:#08080E; font-family: 'DM Mono', 'Courier New', monospace;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#08080E; padding: 40px 0;">
            <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color:#0C0C17; border-radius:16px; overflow:hidden; border: 1px solid #1a1a2e;">

                <!-- Header -->
                <tr>
                    <td align="center" style="padding: 36px 40px 24px;">
                    <p style="margin:0; font-size:36px; font-weight:900; color:#C9FA30; letter-spacing:4px;">WILVAULT</p>
                    <p style="margin:6px 0 0; font-size:11px; color:#4A4A68; letter-spacing:3px;">YOUR PERSONAL FINANCE TRACKER</p>
                    </td>
                </tr>

                <!-- Divider -->
                <tr>
                    <td style="padding: 0 40px;">
                    <div style="height:1px; background-color:#1a1a2e;"></div>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding: 36px 40px;">
                    <p style="margin:0 0 8px; font-size:13px; color:#4A4A68; text-transform:uppercase; letter-spacing:2px;">{otp_type_label}</p>
                    <p style="margin:0 0 28px; font-size:14px; color:#ffffff; line-height:1.6;">
                        Use the code below to proceed. It expires in <span style="color:#C9FA30; font-weight:bold;">5 minutes</span>.
                    </p>

                    <!-- OTP Box -->
                    <div style="background-color:#090911; border: 1.5px solid #C9FA30; border-radius:12px; padding: 28px 0; text-align:center; margin-bottom:28px;">
                        <p style="margin:0 0 8px; font-size:11px; color:#4A4A68; letter-spacing:2px; text-transform:uppercase;">Verification Code</p>
                        <p style="margin:0; font-size:42px; font-weight:900; letter-spacing:14px; color:#C9FA30; padding-left:14px;">{otp}</p>
                    </div>

                    <p style="margin:0; font-size:12px; color:#4A4A68; line-height:1.6;">
                        If you did not request this, you can safely ignore this email. Do not share this code with anyone.
                    </p>
                    </td>
                </tr>

                <!-- Divider -->
                <tr>
                    <td style="padding: 0 40px;">
                    <div style="height:1px; background-color:#1a1a2e;"></div>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td align="center" style="padding: 24px 40px 36px;">
                    <p style="margin:0; font-size:11px; color:#4A4A68;">© 2025 Wilvault. All rights reserved.</p>
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
        """
    }

    resend.Emails.send(params)
