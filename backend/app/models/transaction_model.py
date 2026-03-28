'''transaction_model.py'''
from marshmallow import Schema, fields, ValidationError, validate, validates_schema
from datetime import datetime
from typing import Optional


class TransactionType:
    def __init__(self):
        self.transaction_type_id: int = None
        self.label: str = None
        self.description: str = None

    @staticmethod
    def map(row: dict):
        if not row:
            return None
        t = TransactionType()
        t.transaction_type_id = row.get("id")
        t.label = row.get("label")
        t.description = row.get('description')
        return t

    def serialize(self) -> dict:
        return TransactionTypeSchema().dump(self)


class TransactionTypeSchema(Schema):
    transactionTypeId = fields.Int(attribute='transaction_type_id')
    label = fields.Str()
    description = fields.Str()

    class Meta:
        fields = ('transactionTypeId', 'label', 'description')
        ordered = True


class TransactionCategory:
    def __init__(self):
        self.transaction_category_id: int = None
        self.label: str = None
        self.icon: Optional[str] = None

    @staticmethod
    def map(row: dict):
        if not row:
            return None
        c = TransactionCategory()
        c.transaction_category_id = row.get("id")
        c.label = row.get("label")
        c.icon  = row.get("icon")
        return c

    def serialize(self) -> dict:
        return TransactionCategorySchema().dump(self)


class TransactionCategorySchema(Schema):
    transactionCategoryId = fields.Int(attribute='transaction_category_id')
    label = fields.Str()
    icon  = fields.Str(allow_none=True)

    class Meta:
        fields = ('transactionCategoryId', 'label', 'icon')
        ordered = True


class Transaction:
    def __init__(self):
        self.transaction_id: int = None
        self.account_id: int = None
        self.account_name: Optional[str] = None
        self.transaction_type: Optional[TransactionType] = None
        self.transaction_category: Optional[TransactionCategory] = None
        self.amount: float = None
        self.title: str = None
        self.description: Optional[str] = None
        self.transfer_ref_id: Optional[str] = None
        self.created_at: Optional[datetime] = None
        self.updated_at: Optional[datetime] = None

    @staticmethod
    def map(row: dict):
        if not row:
            return None

        t = Transaction()
        t.transaction_id  = row.get("id")
        t.account_id      = row.get("account_id")
        t.account_name    = row.get("account_name")
        t.amount          = row.get("amount")
        t.title           = row.get("title")
        t.description     = row.get("description")
        t.transfer_ref_id = row.get("transfer_ref_id")
        t.created_at      = row.get("created_at")
        t.updated_at      = row.get("updated_at")

        if row.get("transaction_type"):
            t.transaction_type = TransactionType.map({
                "id":    row.get("transaction_type_id"),
                "label": row.get("transaction_type"),
                "description": row.get("transaction_type_description"),
            })

        if row.get("transaction_category"):
            t.transaction_category = TransactionCategory.map({
                "id":    row.get("transaction_category_id"),
                "label": row.get("transaction_category"),
                "icon":  row.get("transaction_category_icon"),
            })

        return t

    def serialize(self) -> dict:
        return TransactionSchema().dump(self)

    @staticmethod
    def validate_create(data: dict):
        try:
            validated = CreateTransactionSchema().load(data)
            return True, validated
        except ValidationError as err:
            return False, err

    @staticmethod
    def validate_create_transfer(data: dict):
        try:
            validated = CreateTransferSchema().load(data)
            return True, validated
        except ValidationError as err:
            return False, err


class TransactionSchema(Schema):
    transactionId       = fields.Int(attribute='transaction_id')
    accountId           = fields.Int(attribute='account_id')
    accountName         = fields.Str(attribute='account_name', allow_none=True)
    transactionType     = fields.Nested(TransactionTypeSchema, attribute='transaction_type', allow_none=True)
    transactionCategory = fields.Nested(TransactionCategorySchema, attribute='transaction_category', allow_none=True)
    amount              = fields.Decimal(as_string=True)
    title               = fields.Str()
    description         = fields.Str(allow_none=True)
    transferRefId       = fields.Str(attribute='transfer_ref_id', allow_none=True)
    createdAt           = fields.DateTime(attribute='created_at')
    updatedAt           = fields.DateTime(attribute='updated_at')

    class Meta:
        fields = (
            'transactionId',
            'accountId',
            'accountName',
            'transactionType',
            'transactionCategory',
            'amount',
            'title',
            'description',
            'transferRefId',
            'createdAt',
            'updatedAt',
        )
        ordered = True


class CreateTransactionSchema(Schema):
    """For income / expense transactions."""
    account_id              = fields.Int(required=True)
    transaction_category_id = fields.Int(required=True)
    transaction_type_id     = fields.Int(required=True)
    amount                  = fields.Decimal(required=True)
    title                   = fields.Str(required=True, validate=validate.Length(min=1))
    description             = fields.Str(load_default=None)


class CreateTransferSchema(Schema):
    """For transfer transactions — generates 2 rows under the hood."""
    from_account_id = fields.Int(required=True)
    to_account_id   = fields.Int(required=True)
    amount          = fields.Decimal(required=True, validate=validate.Range(min=0.01))
    title           = fields.Str(required=True, validate=validate.Length(min=1))
    description     = fields.Str(load_default=None)

    @validates_schema
    def validate_different_accounts(self, data, **kwargs):
        if data.get('from_account_id') == data.get('to_account_id'):
            raise ValidationError("from_account_id and to_account_id must be different.")


