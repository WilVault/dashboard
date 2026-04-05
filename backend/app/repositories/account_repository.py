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
            at.label AS account_type,
            COALESCE((
                SELECT SUM(t.amount)
                FROM transaction t
                WHERE t.account_id = a.id
            ), 0) AS balance,
            COALESCE((
                SELECT MAX(t.transaction_date)
                FROM transaction t
                WHERE t.account_id = a.id
            ), NULL) AS last_transaction_date
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
            at.label AS account_type,
            COALESCE((
                SELECT SUM(t.amount)
                FROM transaction t
                WHERE t.account_id = a.id
            ), 0) AS balance,
            COALESCE((
                SELECT MAX(t.transaction_date)
                FROM transaction t
                WHERE t.account_id = a.id
            ), NULL) AS last_transaction_date
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


def get_account_balance(account_id: int) -> float:
    rows = database.select_query(
        '''
        SELECT COALESCE(SUM(amount), 0) AS balance
        FROM transaction
        WHERE account_id = %s;
        ''',
        [account_id]
    )
    return float(rows[0]['balance']) if rows else 0.0


def get_all_account_types() -> list:
    rows = database.select_query('SELECT id, label FROM account_type ORDER BY id;')
    from app.models.account_model import AccountType
    return [AccountType.map(r) for r in rows]


def delete_account(account_id: int) -> bool:
    try:
        database.execute(
            'DELETE FROM account WHERE id = %s;',
            [account_id]
        )
        return True
    except Exception as e:
        print(f"delete_account error: {e}")
        return False

def get_net_worth(person_id: int) -> dict:
    from datetime import date

    # current balances per account
    rows = database.select_query(
        '''
        SELECT
            a.id         AS account_id,
            a.account_name,
            a.color,
            a.icon,
            at.label     AS account_type,
            COALESCE(SUM(t.amount), 0) AS balance
        FROM account a
        LEFT JOIN account_type at   ON at.id = a.account_type_id
        LEFT JOIN transaction t     ON t.account_id = a.id
        WHERE a.person_id = %s
        GROUP BY a.id, a.account_name, a.color, a.icon, at.label
        ORDER BY balance DESC;
        ''',
        [person_id]
    )

    total         = sum(float(r['balance']) for r in rows)
    account_count = len(rows)
    last_updated  = str(date.today())

    # net worth at start of current month (for % change)
    first_of_month = date.today().replace(day=1)
    prev_rows = database.select_query(
        '''
        SELECT COALESCE(SUM(t.amount), 0) AS total
        FROM transaction t
        JOIN account a ON a.id = t.account_id
        WHERE a.person_id = %s
          AND t.transaction_date < %s;
        ''',
        [person_id, str(first_of_month)]
    )
    prev_total = float(prev_rows[0]['total']) if prev_rows else 0.0

    if prev_total != 0:
        change_percent = round(((total - prev_total) / abs(prev_total)) * 100, 2)
    else:
        change_percent = 0.0

    # group by account type
    type_totals: dict = {}
    for r in rows:
        label = r['account_type'] or 'Other'
        type_totals[label] = type_totals.get(label, 0) + float(r['balance'])

    by_type = [{ 'label': k, 'total': v } for k, v in type_totals.items()]

    accounts = [
        {
            'accountId':   r['account_id'],
            'accountName': r['account_name'],
            'color':       r['color'],
            'icon':        r['icon'],
            'balance':     float(r['balance']),
        }
        for r in rows
    ]

    return {
        'total':          total,
        'account_count':  account_count,
        'last_updated':   last_updated,
        'change_percent': change_percent,
        'by_type':        by_type,
        'accounts':       accounts,
    }