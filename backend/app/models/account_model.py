'''account_model.py'''
from marshmallow import Schema, fields, ValidationError, validate
from datetime import datetime
from typing import Optional


class AccountType:
    def __init__(self):
        self.account_type_id: int = None
        self.label: str = None

    @staticmethod
    def map(row: dict):
        if not row:
            return None

        at = AccountType()
        at.account_type_id = row.get("id")
        at.label = row.get("label")
        return at

    def serialize(self) -> dict:
        return AccountTypeSchema().dump(self)


class AccountTypeSchema(Schema):
    accountTypeId = fields.Int(attribute='account_type_id')
    label = fields.Str()

    class Meta:
        fields = ('accountTypeId', 'label')
        ordered = True


class Account:
    def __init__(self):
        self.account_id: int = None
        self.person_id: int = None
        self.account_name: str = None
        self.account_type: Optional[AccountType] = None
        self.color: Optional[str] = None
        self.icon: Optional[str] = None
        self.created_at: Optional[datetime] = None
        self.updated_at: Optional[datetime] = None

    @staticmethod
    def map(row: dict):
        if not row:
            return None

        a = Account()
        a.account_id   = row.get("id")
        a.person_id    = row.get("person_id")
        a.account_name = row.get("account_name")
        a.color        = row.get("color")
        a.icon         = row.get("icon")
        a.created_at   = row.get("created_at")
        a.updated_at   = row.get("updated_at")

        if row.get("account_type"):
            a.account_type = AccountType.map({
                "id":    row.get("account_type_id"),
                "label": row.get("account_type"),
            })

        return a

    def serialize(self) -> dict:
        return AccountSchema().dump(self)

    @staticmethod
    def validate_create(data: dict):
        try:
            validated = CreateAccountSchema().load(data)
            return True, validated
        except ValidationError as err:
            return False, err

    @staticmethod
    def validate_update(data: dict):
        try:
            validated = UpdateAccountSchema().load(data)
            return True, validated
        except ValidationError as err:
            return False, err


class AccountSchema(Schema):
    accountId   = fields.Int(attribute='account_id')
    personId    = fields.Int(attribute='person_id')
    accountName = fields.Str(attribute='account_name')
    accountType = fields.Nested(AccountTypeSchema, attribute='account_type', allow_none=True)
    color       = fields.Str(allow_none=True)
    icon        = fields.Str(allow_none=True)

    class Meta:
        fields = (
            'accountId',
            'personId',
            'accountName',
            'accountType',
            'color',
            'icon',
        )
        ordered = True


class CreateAccountSchema(Schema):
    account_name    = fields.Str(required=True, validate=validate.Length(min=1))
    account_type_id = fields.Int(required=True)
    initial_balance = fields.Decimal(required=True)  # can be 0, positive, or negative
    color           = fields.Str(load_default=None)
    icon            = fields.Str(load_default=None)


class UpdateAccountSchema(Schema):
    account_name    = fields.Str(validate=validate.Length(min=1))
    account_type_id = fields.Int()
    color           = fields.Str(allow_none=True)
    icon            = fields.Str(allow_none=True)