'''otp_repository.py'''
from typing import Optional
from app.config import database
from app.models.otp_model import OTP


def insert_otp(
    email: str,
    otp_type_id: int,
    otp: str,
    created_at,
    expiration_at,
    timezone: str
) -> Optional[OTP]:
    query = '''
        INSERT INTO otp (email, otp_type_id, otp, created_at, expiration_at, timezone)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, email, otp_type_id, otp, created_at, expiration_at, timezone;
    '''
    rows = database.select_query(query, [email, otp_type_id, otp, created_at, expiration_at, timezone])
    if not rows:
        return None
    return OTP.map(rows[0])


def find_latest_by_email_and_type(email: str, otp_type_id: int) -> Optional[OTP]:
    query = '''
        SELECT id, email, otp_type_id, otp, created_at, expiration_at, timezone
        FROM otp
        WHERE email = %s AND otp_type_id = %s
        ORDER BY created_at DESC
        LIMIT 1;
    '''
    rows = database.select_query(query, [email, otp_type_id])
    if not rows:
        return None
    return OTP.map(rows[0])


def delete_otp_by_id(otp_id: int) -> bool:
    query = '''
        DELETE FROM otp WHERE id = %s;
    '''
    database.execute(query, [otp_id])
    return True