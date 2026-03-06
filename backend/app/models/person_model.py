'''person_model.py'''
from marshmallow import Schema, fields, ValidationError, validate
from datetime import datetime
from typing import Optional

class Person:
    def __init__(self):
        self.person_id: int = None
        self.email: str = None
        self.full_name: str = None
        self.password_hash: str = None
        self.profile_url: str = None
        self.profile_url_customized: bool = False
        self.timezone: str = None
        self.created_at: Optional[datetime] = None
        self.updated_at: Optional[datetime] = None

    @staticmethod
    def map(row: dict):
        if not row:
            return None

        p = Person()
        p.person_id = row.get("id")
        p.email = row.get("email")
        p.password_hash = row.get('password_hash')
        p.full_name = row.get("full_name")
        p.profile_url = row.get("profile_url")
        p.profile_url_customized = row.get("profile_url_customized", False)
        p.timezone = row.get("timezone")
        p.created_at = row.get("created_at")
        p.updated_at = row.get("updated_at")
        return p

    def serialize(self) -> dict:
        return PersonSchema().dump(self)

    @staticmethod
    def validate_login(data: dict):
        try:
            validated = LoginSchema().load(data)
            return True, validated
        except ValidationError as err:
            return False, err

    @staticmethod
    def validate_register(data: dict):
        try:
            validated = RegisterSchema().load(data)
            return True, validated
        except ValidationError as err:
            return False, err

class PersonSchema(Schema):
    person_id = fields.Int(attribute='person_id')
    email = fields.Str()
    full_name = fields.Str()
    profile_url = fields.Str()
    profile_url_customized = fields.Boolean()
    timezone = fields.Str()

    class Meta:
        fields = (
            'person_id',
            'email',
            'full_name',
            'profile_url',
            'profile_url_customized',
            'timezone'
        )
        ordered = True

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    full_name = fields.Str(required=True, validate=validate.Length(min=1))
    profile_url = fields.Str(required=True, validate=validate.Length(min=1))
    timezone = fields.Str(required=True, validate=validate.Length(min=1))