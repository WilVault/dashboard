'''account_repository.py'''
from typing import Optional
from app.config import database
from app.models.account_model import Account

INITIAL_BALANCE_TYPE_ID     = 4   # 'initial_balance' in transaction_type
INITIAL_BALANCE_CATEGORY_ID = 9   # 'Initial Balance' in transaction_categories


def get_accounts_by_person_id(person_id: int) -> list[Account]:
    query = '''
        SELECT
            a.id,
            a.person_id,
            a.account_name,
            a.color,
            a.icon,
            a.account_type_id,
            at.label AS account_type
        FROM account a
        LEFT JOIN account_type at ON at.id = a.account_type_id
        WHERE a.person_id = %s
    '''
    rows = database.select_query(query, [person_id])
    return [Account.map(r) for r in rows]


def get_account_by_id(account_id: int) -> Optional[Account]:
    query = '''
        SELECT
            a.id,
            a.person_id,
            a.account_name,
            a.color,
            a.icon,
            a.account_type_id,
            at.label AS account_type
        FROM account a
        LEFT JOIN account_type at ON at.id = a.account_type_id
        WHERE a.id = %s
        LIMIT 1;
    '''
    rows = database.select_query(query, [account_id])
    if not rows:
        return None
    return Account.map(rows[0])


def create_account(
        person_id: int,
        account_name: str,
        account_type_id: int,
        initial_balance: float,
        color: str = None,
        icon: str = None,
    ) -> Optional[Account]:
    # 1. Insert account
    rows = database.select_query(
        '''
        INSERT INTO account (person_id, account_name, account_type_id, color, icon)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id;
        ''',
        (person_id, account_name, account_type_id, color, icon)
    )
    if not rows:
        return None
    account_id = rows[0]['id']

    # 2. Insert initial balance transaction
    database.execute(
        '''
        INSERT INTO transaction (
            account_id,
            transaction_category_id,
            transaction_type_id,
            amount,
            title
        )
        VALUES (%s, %s, %s, %s, %s);
        ''',
        (
            account_id,
            INITIAL_BALANCE_CATEGORY_ID,
            INITIAL_BALANCE_TYPE_ID,
            initial_balance,
            'Initial Balance',
        )
    )

    return get_account_by_id(account_id)