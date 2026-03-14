'''currency_repository.py'''
from app.config import database
from app.models.currency_model import Currency


def get_all_currency() -> list[Currency]:
    query = '''
        SELECT
            id,
            currency,
            description,
            emoji
        FROM
            currency
        ORDER BY
            id ASC;
    '''
    rows = database.select_query(query)
    return [Currency.map(r) for r in rows]