'''person_controller.py'''
from flask import Blueprint, request, g
from app.repositories import person_repository
from app.models.person_model import Person
from app.config.logger import log
from app.utilities.api_response_format import api_response_format
from app.utilities.auth import jwt_required


person_blueprint = Blueprint('persons', __name__)

@person_blueprint.route('/persons/me', methods=['GET'])
@jwt_required
def get_me():
    try:
        # the person_id is from access_token
        person_id = int(g.user.get('sub'))
        person = person_repository.get_person_by_id(person_id)

        if not person:
            return api_response_format(
                message="Person not found",
                data={},
                status_code=404
            )

        return api_response_format(
            message="User retrieved successfully",
            data={ 'user': person.serialize() },
            status_code=200
        )
    except Exception as e:
        return api_response_format(
            message=str(e),
            status_code=500
        )

@person_blueprint.route('/persons', methods=['GET'])
@jwt_required
def retrieve_persons():
    try:
        persons = person_repository.get_all_person()
        data = [p.serialize() for p in persons if p]

        return api_response_format(
            message="Persons retrieved successfully",
            data=data,
            status_code=200
        )
    except Exception as e:
        return api_response_format(
            message=str(e),
            status_code=500
        )

@person_blueprint.route('/persons/<int:person_id>', methods=['GET'])
def get_person(person_id: int):
    try:
        person = person_repository.get_person_by_id(person_id)
        if not person:
            return api_response_format(
                message=f"Person not found",
                data={},
                status_code=404
            )

        return api_response_format(
            message="Person retrieved successfully",
            data=person.serialize(),
            status_code=200
        )
    except Exception as e:
        return api_response_format(
            message=str(e),
            status_code=500
        )
