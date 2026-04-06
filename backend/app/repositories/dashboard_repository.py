'''dashboard_repository.py'''
from datetime import datetime, date, timedelta
from app.config import database


def _get_period_dates(date_from: str = None, date_to: str = None):
    """
    Returns (current_from, current_to, prev_from, prev_to) as date objects.
    If no dates provided, current = all-time (None, today), prev = None.
    """
    today = date.today()

    if date_from and date_to:
        current_from = datetime.strptime(date_from, '%Y-%m-%d').date()
        current_to   = datetime.strptime(date_to,   '%Y-%m-%d').date()
        delta        = (current_to - current_from).days + 1
        prev_to      = current_from - timedelta(days=1)
        prev_from    = prev_to - timedelta(days=delta - 1)
    else:
        current_from = None
        current_to   = today
        prev_from    = None
        prev_to      = None

    return current_from, current_to, prev_from, prev_to


def _build_date_condition(date_from, date_to, col='t.transaction_date') -> tuple[str, list]:
    """Returns (sql_condition, params) for a date range filter."""
    if date_from and date_to:
        return f'{col} BETWEEN %s AND %s', [str(date_from), str(date_to)]
    return '1=1', []


def get_net_worth(person_id: int, date_from: str = None, date_to: str = None) -> dict:
    current_from, current_to, prev_from, prev_to = _get_period_dates(date_from, date_to)

    # current net worth — always all-time sum of all transactions
    rows = database.select_query(
        '''
        SELECT COALESCE(SUM(t.amount), 0) AS value
        FROM transaction t
        JOIN account a ON a.id = t.account_id
        WHERE a.person_id = %s;
        ''',
        [person_id]
    )
    current_value = float(rows[0]['value']) if rows else 0.0

    # previous net worth — sum of transactions before current period start
    if current_from:
        prev_rows = database.select_query(
            '''
            SELECT COALESCE(SUM(t.amount), 0) AS value
            FROM transaction t
            JOIN account a ON a.id = t.account_id
            WHERE a.person_id = %s
              AND t.transaction_date < %s;
            ''',
            [person_id, str(current_from)]
        )
        prev_value = float(prev_rows[0]['value']) if prev_rows else 0.0
    else:
        prev_value = 0.0

    change_percent = round(((current_value - prev_value) / abs(prev_value)) * 100, 2) if prev_value != 0 else 0.0

    return { 'value': current_value, 'change_percent': change_percent }


def get_total_income(person_id: int, date_from: str = None, date_to: str = None) -> dict:
    current_from, current_to, prev_from, prev_to = _get_period_dates(date_from, date_to)
    date_cond, date_params = _build_date_condition(current_from, current_to)

    rows = database.select_query(
        f'''
        SELECT COALESCE(SUM(t.amount), 0) AS value
        FROM transaction t
        JOIN account a ON a.id = t.account_id
        JOIN transaction_type tt ON tt.id = t.transaction_type_id
        WHERE a.person_id = %s
          AND LOWER(tt.label) IN ('income', 'initial_balance', 'transfer')
          AND t.amount > 0
          AND {date_cond};
        ''',
        [person_id] + date_params
    )
    current_value = float(rows[0]['value']) if rows else 0.0

    prev_value = 0.0
    if prev_from and prev_to:
        prev_cond, prev_params = _build_date_condition(prev_from, prev_to)
        prev_rows = database.select_query(
            f'''
            SELECT COALESCE(SUM(t.amount), 0) AS value
            FROM transaction t
            JOIN account a ON a.id = t.account_id
            JOIN transaction_type tt ON tt.id = t.transaction_type_id
            WHERE a.person_id = %s
              AND LOWER(tt.label) IN ('income', 'initial_balance', 'transfer')
              AND t.amount > 0
              AND {prev_cond};
            ''',
            [person_id] + prev_params
        )
        prev_value = float(prev_rows[0]['value']) if prev_rows else 0.0

    change_percent = round(((current_value - prev_value) / abs(prev_value)) * 100, 2) if prev_value != 0 else 0.0

    return { 'value': current_value, 'change_percent': change_percent }


def get_total_expenses(person_id: int, date_from: str = None, date_to: str = None) -> dict:
    current_from, current_to, prev_from, prev_to = _get_period_dates(date_from, date_to)
    date_cond, date_params = _build_date_condition(current_from, current_to)

    rows = database.select_query(
        f'''
        SELECT COALESCE(SUM(ABS(t.amount)), 0) AS value
        FROM transaction t
        JOIN account a ON a.id = t.account_id
        JOIN transaction_type tt ON tt.id = t.transaction_type_id
        WHERE a.person_id = %s
          AND LOWER(tt.label) = 'expense'
          AND {date_cond};
        ''',
        [person_id] + date_params
    )
    current_value = float(rows[0]['value']) if rows else 0.0

    prev_value = 0.0
    if prev_from and prev_to:
        prev_cond, prev_params = _build_date_condition(prev_from, prev_to)
        prev_rows = database.select_query(
            f'''
            SELECT COALESCE(SUM(ABS(t.amount)), 0) AS value
            FROM transaction t
            JOIN account a ON a.id = t.account_id
            JOIN transaction_type tt ON tt.id = t.transaction_type_id
            WHERE a.person_id = %s
              AND LOWER(tt.label) = 'expense'
              AND {prev_cond};
            ''',
            [person_id] + prev_params
        )
        prev_value = float(prev_rows[0]['value']) if prev_rows else 0.0

    change_percent = round(((current_value - prev_value) / abs(prev_value)) * 100, 2) if prev_value != 0 else 0.0

    return { 'value': current_value, 'change_percent': change_percent }


def get_savings_rate(income: dict, expenses: dict) -> dict:
    """Derived from already-computed income and expenses."""
    income_value   = income['value']
    expenses_value = expenses['value']

    if income_value > 0:
        current_rate = round(((income_value - expenses_value) / income_value) * 100, 2)
    else:
        current_rate = 0.0

    # change: compare current rate vs what it would have been in prev period
    # approximate using change percents
    prev_income   = income_value   / (1 + income['change_percent']   / 100) if income['change_percent']   != 0 else income_value
    prev_expenses = expenses_value / (1 + expenses['change_percent'] / 100) if expenses['change_percent'] != 0 else expenses_value

    if prev_income > 0:
        prev_rate = round(((prev_income - prev_expenses) / prev_income) * 100, 2)
    else:
        prev_rate = 0.0

    change_percent = round(current_rate - prev_rate, 2)

    return { 'value': current_rate, 'change_percent': change_percent }

def get_cash_flow(person_id: int, months: int = 6) -> list:
    """Returns income and expenses grouped by month for the last N months."""
    rows = database.select_query(
        f'''
        SELECT
            TO_CHAR(DATE_TRUNC('month', t.transaction_date), 'Mon YYYY') AS month,
            DATE_TRUNC('month', t.transaction_date)                       AS month_order,
            COALESCE(SUM(CASE
                WHEN LOWER(tt.label) IN ('income', 'initial_balance', 'transfer')
                AND t.amount > 0 THEN t.amount ELSE 0
            END), 0) AS income,
            COALESCE(SUM(CASE
                WHEN LOWER(tt.label) = 'expense'
                THEN ABS(t.amount) ELSE 0
            END), 0) AS expenses
        FROM transaction t
        JOIN account a           ON a.id  = t.account_id
        JOIN transaction_type tt ON tt.id = t.transaction_type_id
        WHERE a.person_id = %s
          AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '{months} months')
        GROUP BY month_order
        ORDER BY month_order ASC;
        ''',
        [person_id]
    )
    return [
        {
            'month':    r['month'],
            'income':   float(r['income']),
            'expenses': float(r['expenses']),
        }
        for r in rows
    ]

def get_spending_breakdown(person_id: int, date_from: str = None, date_to: str = None) -> list:
    current_from, current_to, _, _ = _get_period_dates(date_from, date_to)
    date_cond, date_params = _build_date_condition(current_from, current_to)

    rows = database.select_query(
        f'''
        SELECT
            tc.label                       AS category,
            tc.icon                        AS icon,
            COALESCE(SUM(ABS(t.amount)), 0) AS amount
        FROM transaction t
        JOIN account a                 ON a.id  = t.account_id
        JOIN transaction_type tt       ON tt.id = t.transaction_type_id
        JOIN transaction_categories tc ON tc.id = t.transaction_category_id
        WHERE a.person_id = %s
          AND LOWER(tt.label) = 'expense'
          AND {date_cond}
        GROUP BY tc.label, tc.icon
        ORDER BY amount DESC;
        ''',
        [person_id] + date_params
    )
    return [
        {
            'category': r['category'],
            'icon':     r['icon'],
            'amount':   float(r['amount']),
        }
        for r in rows
    ]

def get_recent_transactions(person_id: int) -> list:
    rows = database.select_query(
        '''
        SELECT
            t.id,
            t.title,
            t.amount,
            t.transaction_date,
            tt.label    AS transaction_type,
            tc.label    AS transaction_category,
            tc.icon     AS transaction_category_icon
        FROM transaction t
        JOIN account a                 ON a.id  = t.account_id
        JOIN transaction_type tt       ON tt.id = t.transaction_type_id
        JOIN transaction_categories tc ON tc.id = t.transaction_category_id
        WHERE a.person_id = %s
        ORDER BY t.transaction_date DESC, t.created_at DESC
        LIMIT 6;
        ''',
        [person_id]
    )
    return [
        {
            'id':                  r['id'],
            'title':               r['title'],
            'amount':              float(r['amount']),
            'transaction_date':    str(r['transaction_date']),
            'transaction_type':    r['transaction_type'],
            'transaction_category': r['transaction_category'],
            'transaction_category_icon': r['transaction_category_icon'],
        }
        for r in rows
    ]

def get_dashboard(person_id: int, date_from: str = None, date_to: str = None) -> dict:
    income   = get_total_income(person_id, date_from, date_to)
    expenses = get_total_expenses(person_id, date_from, date_to)

    return {
        'date_range':          { 'from': date_from, 'to': date_to },
        'net_worth':           get_net_worth(person_id, date_from, date_to),
        'total_income':        income,
        'total_expenses':      expenses,
        'savings_rate':        get_savings_rate(income, expenses),
        'cash_flow':           get_cash_flow(person_id, months=6),
        'spending_breakdown':    get_spending_breakdown(person_id, date_from, date_to),
        'recent_transactions':   get_recent_transactions(person_id),
    }
