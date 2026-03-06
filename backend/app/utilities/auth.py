import jwt
import os
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, g
from app.utilities.api_response_format import api_response_format


def generate_token(person_id: int, email: str) -> str:
    payload = {
        'sub': str(person_id),
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }
    return jwt.encode(payload, os.getenv('SECRET_KEY'), algorithm='HS256')

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        try:
            payload = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
            g.user = payload
        except jwt.ExpiredSignatureError:
            return api_response_format('Token expired', status_code=401)
        except jwt.InvalidTokenError as e:
            return api_response_format('Invalid token', status_code=401)
        return f(*args, **kwargs)
    return decorated