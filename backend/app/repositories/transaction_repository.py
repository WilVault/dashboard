'''transaction_repository.py'''
from typing import Optional
from app.config import database
from app.models.transaction_model import Transaction, TransactionCategory, TransactionType


def get_transactions_by_person_id(
        person_id: int,
        transaction_type: str = None,
        transaction_category: str = None,
        title: str = None,
        date_from: str = None,
        date_to: str = None,
        page: int = 1,
        page_size: int = 20,
        account_name: str = None,
    ) -> tuple[list[Transaction], int, dict]:
    """
    Returns (transactions, total_count, summary) for a given person with optional filters and pagination.
    """
    conditions = ['a.person_id = %s']
    params = [person_id]

    if transaction_type:
        conditions.append('LOWER(tt.label) = LOWER(%s)')
        params.append(transaction_type)

    if transaction_category:
        conditions.append('LOWER(tc.label) = LOWER(%s)')
        params.append(transaction_category)

    if title:
        conditions.append('LOWER(t.title) LIKE LOWER(%s)')
        params.append(f'%{title}%')

    if date_from:
        conditions.append('t.transaction_date >= %s')
        params.append(date_from)

    if date_to:
        conditions.append('t.transaction_date < (%s::date + INTERVAL \'1 day\')')
        params.append(date_to)

    if account_name:
        conditions.append('LOWER(a.account_name) = LOWER(%s)')
        params.append(account_name)

    where_clause = 'WHERE ' + ' AND '.join(conditions)

    # total count
    count_rows = database.select_query(
        f'''
        SELECT COUNT(*) AS total
        FROM transaction t
        LEFT JOIN account a                 ON a.id  = t.account_id
        LEFT JOIN transaction_type tt       ON tt.id = t.transaction_type_id
        LEFT JOIN transaction_categories tc ON tc.id = t.transaction_category_id
        {where_clause};
        ''',
        params
    )
    total = count_rows[0]['total'] if count_rows else 0

    # summary — income, expenses, net
    summary_rows = database.select_query(
        f'''
        SELECT
            COALESCE(SUM(CASE
                WHEN LOWER(tt.label) IN ('income', 'initial_balance', 'transfer')
                AND t.amount > 0
                THEN t.amount ELSE 0
            END), 0) AS total_income,
            COALESCE(SUM(CASE
                WHEN LOWER(tt.label) = 'expense'
                THEN ABS(t.amount) ELSE 0
            END), 0) AS total_expenses
        FROM transaction t
        LEFT JOIN account a                 ON a.id  = t.account_id
        LEFT JOIN transaction_type tt       ON tt.id = t.transaction_type_id
        LEFT JOIN transaction_categories tc ON tc.id = t.transaction_category_id
        {where_clause};
        ''',
        params
    )
    total_income   = summary_rows[0]['total_income']   if summary_rows else 0
    total_expenses = summary_rows[0]['total_expenses'] if summary_rows else 0

    # snake case is intentional since frontend expect snake case also...
    summary = {
        'totalIncome':   str(total_income),
        'totalExpenses': str(total_expenses),
        'net':           str(total_income - total_expenses),
    }

    # paginated results
    offset = (page - 1) * page_size
    rows = database.select_query(
        f'''
        SELECT
            t.id,
            t.account_id,
            a.account_name,
            t.amount,
            t.title,
            t.description,
            t.transfer_ref_id,
            t.transaction_date,
            t.created_at,
            t.updated_at,
            t.transaction_type_id,
            tt.label    AS transaction_type,
            t.transaction_category_id,
            tc.label    AS transaction_category,
            tc.icon     AS transaction_category_icon
        FROM transaction t
        LEFT JOIN account a                 ON a.id  = t.account_id
        LEFT JOIN transaction_type tt       ON tt.id = t.transaction_type_id
        LEFT JOIN transaction_categories tc ON tc.id = t.transaction_category_id
        {where_clause}
        ORDER BY t.created_at DESC
        LIMIT %s OFFSET %s;
        ''',
        params + [page_size, offset]
    )

    return [Transaction.map(r) for r in rows], total, summary


def get_transactions_by_account_id(account_id: int) -> list[Transaction]:
    rows = database.select_query(
        '''
        SELECT
            t.id,
            t.account_id,
            a.account_name,
            t.amount,
            t.title,
            t.description,
            t.transfer_ref_id,
            t.transaction_date,
            t.created_at,
            t.updated_at,
            t.transaction_type_id,
            tt.label    AS transaction_type,
            t.transaction_category_id,
            tc.label    AS transaction_category,
            tc.icon     AS transaction_category_icon
        FROM transaction t
        LEFT JOIN account a                 ON a.id  = t.account_id
        LEFT JOIN transaction_type tt       ON tt.id = t.transaction_type_id
        LEFT JOIN transaction_categories tc ON tc.id = t.transaction_category_id
        WHERE t.account_id = %s
        ORDER BY t.created_at DESC;
        ''',
        [account_id]
    )
    return [Transaction.map(r) for r in rows]


def get_transaction_by_id(transaction_id: int) -> Optional[Transaction]:
    rows = database.select_query(
        '''
        SELECT
            t.id,
            t.account_id,
            a.account_name,
            t.amount,
            t.title,
            t.description,
            t.transfer_ref_id,
            t.transaction_date,
            t.created_at,
            t.updated_at,
            t.transaction_type_id,
            tt.label    AS transaction_type,
            t.transaction_category_id,
            tc.label    AS transaction_category,
            tc.icon     AS transaction_category_icon
        FROM transaction t
        LEFT JOIN account a                 ON a.id  = t.account_id
        LEFT JOIN transaction_type tt       ON tt.id = t.transaction_type_id
        LEFT JOIN transaction_categories tc ON tc.id = t.transaction_category_id
        WHERE t.id = %s
        LIMIT 1;
        ''',
        [transaction_id]
    )
    if not rows:
        return None
    return Transaction.map(rows[0])


def create_transaction(
        account_id: int,
        transaction_category_id: int,
        transaction_type_id: int,
        amount: float,
        title: str,
        description: str = None,
        transfer_ref_id: str = None,
        transaction_date: str = None,
    ) -> Optional[Transaction]:
    query = '''
        INSERT INTO transaction (
            account_id,
            transaction_category_id,
            transaction_type_id,
            amount,
            title,
            description,
            transfer_ref_id,
            transaction_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
    '''
    rows = database.select_query(query, [
        account_id,
        transaction_category_id,
        transaction_type_id,
        amount,
        title,
        description,
        transfer_ref_id,
        transaction_date,
    ])
    if not rows:
        return None
    return get_transaction_by_id(rows[0]['id'])


def create_transfer(
        from_account_id: int,
        to_account_id: int,
        amount: float,
        title: str,
        transfer_ref_id: str,
        transfer_type_id: int,
        transfer_category_id: int,
        description: str = None,
    ) -> tuple[Optional[Transaction], Optional[Transaction]]:
    """Inserts 2 rows atomically — debit (negative) and credit (positive)."""
    query = '''
        INSERT INTO transaction (
            account_id,
            transaction_category_id,
            transaction_type_id,
            amount,
            title,
            description,
            transfer_ref_id
        )
        VALUES
            (%s, %s, %s, %s, %s, %s, %s),
            (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
    '''
    rows = database.select_query(query, [
        # debit row (sender) — negative
        from_account_id, transfer_category_id, transfer_type_id, -abs(amount), title, description, transfer_ref_id,
        # credit row (receiver) — positive
        to_account_id,   transfer_category_id, transfer_type_id, +abs(amount), title, description, transfer_ref_id,
    ])

    if not rows or len(rows) < 2:
        return None, None

    debit  = get_transaction_by_id(rows[0]['id'])
    credit = get_transaction_by_id(rows[1]['id'])
    return debit, credit

def get_all_transaction_categories() -> list:
    rows = database.select_query('SELECT id, label, icon FROM transaction_categories ORDER BY id;')
    from app.models.transaction_model import TransactionCategory
    return [TransactionCategory.map(r) for r in rows]


def get_all_transaction_types() -> list:
    rows = database.select_query('SELECT id, label, description FROM transaction_type ORDER BY id;')
    from app.models.transaction_model import TransactionType
    return [TransactionType.map(r) for r in rows]