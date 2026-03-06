import os
import psycopg2
from psycopg2.extras import RealDictCursor

_conn = None


def connect():
    global _conn
    _conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    _conn.autocommit = True
    print('Database connected.')


def select_query(query: str, params=None) -> list[dict]:
    with _conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


def execute(query: str, params=None):
    with _conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query, params)