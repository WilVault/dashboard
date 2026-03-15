'''person_repository.py'''
from typing import Optional
from app.config import database
from app.models.person_model import Person

def get_all_person() -> list[Person]:
    query = '''
        SELECT
            p.id,
            p.email,
            p.full_name,
            p.profile_url,
            p.profile_url_customized,
            p.timezone,
            p.currency_id,
            c.currency,
            c.description AS currency_description,
            c.emoji AS currency_emoji
        FROM
            person p
        LEFT JOIN currency c ON c.id = p.currency_id
    '''
    rows = database.select_query(query)
    return [Person.map(r) for r in rows]

def get_person_by_id(person_id: int) -> Optional[Person]:
    query = '''
        SELECT
            p.id,
            p.email,
            p.full_name,
            p.profile_url,
            p.profile_url_customized,
            p.timezone,
            p.currency_id,
            c.currency,
            c.description AS currency_description,
            c.emoji AS currency_emoji
        FROM
            person p
        LEFT JOIN currency c ON c.id = p.currency_id
        WHERE
            p.id = %s
        LIMIT 1;
    '''
    rows = database.select_query(query, [person_id])
    if not rows:
        return None
    return Person.map(rows[0])

def find_by_email(email: str) -> Optional[Person]:
    query = '''
        SELECT
            id,
            email,
            full_name,
            password_hash
        FROM person
        WHERE email = %s
        LIMIT 1;
    '''
    rows = database.select_query(query, [email])
    if not rows:
        return None
    return Person.map(rows[0])

def create_person(
        email: str,
        full_name: str,
        password_hash: str,
        profile_url: str,
        profile_url_customized: bool = False,
        timezone: str = None,
        currency_id: int = None
    ) -> Optional[Person]:
    query = '''
        INSERT INTO person (email, full_name, password_hash, profile_url, profile_url_customized, timezone, currency_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, email, full_name, profile_url, profile_url_customized, timezone, currency_id;
    '''
    rows = database.select_query(query, [email, full_name, password_hash, profile_url, profile_url_customized, timezone, currency_id])
    if not rows:
        return None
    return Person.map(rows[0])