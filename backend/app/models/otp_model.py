'''otp_model.py'''
from marshmallow import Schema, fields, ValidationError, validate
from datetime import datetime
from typing import Optional


class OTP:
    def __init__(self):
        self.id: int = None
        self.email: str = None
        self.otp_type_id: int = None
        self.created_at: Optional[datetime] = None
        self.expiration_at: Optional[datetime] = None
        self.timezone: str = None
        self.otp: str = None

    @staticmethod
    def map(row: dict):
        if not row:
            return None

        o = OTP()
        o.id            = row.get('id')
        o.email         = row.get('email')
        o.otp_type_id   = row.get('otp_type_id')
        o.created_at    = row.get('created_at')
        o.expiration_at = row.get('expiration_at')
        o.timezone      = row.get('timezone')
        o.otp           = row.get('otp')
        return o

    def serialize(self) -> dict:
        return OTPSchema().dump(self)

    @staticmethod
    def validate_send(data: dict):
        try:
            validated = SendOTPSchema().load(data)
            return True, validated
        except ValidationError as err:
            return False, err

    @staticmethod
    def validate_verify(data: dict):
        try:
            validated = VerifyOTPSchema().load(data)
            return True, validated
        except ValidationError as err:
            return False, err


class OTPSchema(Schema):
    id           = fields.Int()
    email        = fields.Str()
    otpTypeId    = fields.Int(attribute='otp_type_id')
    createdAt    = fields.DateTime(attribute='created_at')
    expirationAt = fields.DateTime(attribute='expiration_at')
    timezone     = fields.Str()

    class Meta:
        fields = ('id', 'email', 'otpTypeId', 'createdAt', 'expirationAt', 'timezone')
        ordered = True


class SendOTPSchema(Schema):
    email       = fields.Email(required=True)
    otp_type_id = fields.Int(required=True)
    timezone    = fields.Str(required=True, validate=validate.Length(min=1))


class VerifyOTPSchema(Schema):
    email       = fields.Email(required=True)
    otp         = fields.Str(required=True, validate=validate.Length(min=6, max=6))
    otp_type_id = fields.Int(required=True)