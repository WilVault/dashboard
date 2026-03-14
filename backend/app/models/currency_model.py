from marshmallow import Schema, fields


class Currency:
    def __init__(self):
        self.currency_id: int = None
        self.currency: str = None
        self.description: str = None
        self.emoji: str = None

    @staticmethod
    def map(row: dict):
        if not row:
            return None

        c = Currency()
        c.currency_id = row.get("id")
        c.currency = row.get("currency")
        c.description = row.get("description")
        c.emoji = row.get("emoji")
        return c

    def serialize(self) -> dict:
        return CurrencySchema().dump(self)


class CurrencySchema(Schema):
    currencyId = fields.Int(attribute='currency_id')
    currency = fields.Str()
    description = fields.Str()
    emoji = fields.Str()

    class Meta:
        fields = (
            'currencyId',
            'currency',
            'description',
            'emoji',
        )
        ordered = True