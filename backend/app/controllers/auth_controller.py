from flask import Blueprint, request
from app.repositories import person_repository
from app.models.person_model import Person
from app.config.logger import log
from app.utilities.api_response_format import api_response_format
import bcrypt
from app.utilities.auth import generate_token

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/login', methods=['POST'])
def login():
    is_valid, result = Person.validate_login(request.get_json())

    if not is_valid:
        return api_response_format(
            message=result.messages,
            data={},
            status_code=400
        )

    person = person_repository.find_by_email(result.get('email'))

    if not person:
        return api_response_format(
            message="Invalid credentials",
            data={},
            status_code=401
        )

    password_match = bcrypt.checkpw(
        result.get('password').encode(),
        person.password_hash.encode()
    )

    if not password_match:
        return api_response_format(
            message="Invalid credentials",
            data={},
            status_code=401
        )

    token = generate_token(person.person_id, person.email)

    return api_response_format(
        message="Login successful",
        data={
            'access_token': token,
        },
        status_code=200
    )

@auth_blueprint.route('/register', methods=['POST'])
def register():
    is_valid, result = Person.validate_register(request.get_json())

    if not is_valid:
        return api_response_format(
            message=result.messages,
            data={},
            status_code=400
        )

    existing = person_repository.find_by_email(result.get('email'))
    if existing:
        return api_response_format(
            message="Email already in use",
            data={},
            status_code=409
        )

    password_hash = bcrypt.hashpw(
        result.get('password').encode(),
        bcrypt.gensalt()
    ).decode()

    person = person_repository.create_person(
        email=result.get('email'),
        full_name=result.get('full_name'),
        password_hash=password_hash,
        profile_url=result.get('profile_url'),
        profile_url_customized=result.get('profile_url_customized'),
        timezone=result.get('timezone'),
        currency_id=result.get('currency_id'),
    )

    if not person:
        return api_response_format(
            message="Registration failed",
            data={},
            status_code=500
        )

    person = person_repository.get_person_by_id(person.person_id)
    token = generate_token(person.person_id, person.email)

    return api_response_format(
        message="Registration successful",
        data={
            'access_token': token,
            'person': person.serialize()
        },
        status_code=201
    )

@auth_blueprint.route('/validate-email', methods=['POST'])
def validate_email():
    data = request.get_json()
    email = data.get('email') if data else None

    if not email:
        return api_response_format(
            message="Email is required",
            data={},
            status_code=400
        )

    existing = person_repository.find_by_email(email)

    if existing:
        return api_response_format(
            message="Email already in use",
            data={ 'exists': True },
            status_code=409
        )

    return api_response_format(
        message="Email is available",
        data={ 'exists': False },
        status_code=200
    )