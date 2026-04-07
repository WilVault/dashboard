'''person_controller.py'''
from flask import Blueprint, request, g
from app.repositories import person_repository
from app.models.person_model import Person
from app.config.logger import log
from app.utilities.api_response_format import api_response_format
from app.utilities.auth import jwt_required
from app.utilities.avatar import generate_default_avatar
from app.services.s3_service import upload_bytes_to_s3, get_avatar_key


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

@person_blueprint.route('/persons/upload-default-avatar', methods=['POST'])
def upload_default_avatar():
    try:
        data = request.get_json()
        email = data.get('email')
        full_name = data.get('full_name')

        if not email or not full_name:
            return api_response_format(
                message="email and full_name are required",
                data={},
                status_code=400
            )

        avatar_bytes = generate_default_avatar(full_name, email)
        key = get_avatar_key(email)
        url = upload_bytes_to_s3(avatar_bytes, key)

        if not url:
            return api_response_format(
                message="Failed to upload avatar",
                data={},
                status_code=500
            )

        return api_response_format(
            message="Default avatar uploaded successfully",
            data={ 'profile_url': url },
            status_code=200
        )

    except Exception as e:
        return api_response_format(
            message=str(e),
            data={},
            status_code=500
        )

@person_blueprint.route('/persons/profile-url', methods=['PATCH'])
def update_profile_url():
    try:
        data = request.get_json()
        email = data.get('email')
        profile_url = data.get('profile_url')
        profile_url_customized = data.get('profile_url_customized', False)

        if not email or not profile_url:
            return api_response_format(
                message="email and profile_url are required",
                data={},
                status_code=400
            )

        success = person_repository.update_profile_url(email, profile_url, profile_url_customized)

        if not success:
            return api_response_format(
                message="Failed to update profile url",
                data={},
                status_code=500
            )

        return api_response_format(
            message="Profile url updated successfully",
            data={},
            status_code=200
        )

    except Exception as e:
        return api_response_format(
            message=str(e),
            data={},
            status_code=500
        )

@person_blueprint.route('/persons/upload-custom-avatar', methods=['POST'])
def upload_custom_avatar():
    try:
        email = request.form.get('email')
        file = request.files.get('file')

        if not email or not file:
            return api_response_format(
                message="email and file are required",
                data={},
                status_code=400
            )

        file_bytes = file.read()
        content_type = file.content_type or 'image/png'
        key = get_avatar_key(email)
        url = upload_bytes_to_s3(file_bytes, key, content_type)

        if not url:
            return api_response_format(
                message="Failed to upload avatar",
                data={},
                status_code=500
            )

        return api_response_format(
            message="Avatar uploaded successfully",
            data={ 'profile_url': url },
            status_code=200
        )

    except Exception as e:
        return api_response_format(
            message=str(e),
            data={},
            status_code=500
        )

@person_blueprint.route('/persons/me', methods=['PATCH'])
@jwt_required
def update_me():
    try:
        person_id = int(g.user.get('sub'))
        data = request.get_json()

        full_name   = data.get('full_name')
        currency_id = data.get('currency_id')

        success = person_repository.update_person(
            person_id   = person_id,
            full_name   = full_name,
            currency_id = currency_id,
        )

        if not success:
            return api_response_format(message="Failed to update profile", data={}, status_code=500)

        person = person_repository.get_person_by_id(person_id)
        return api_response_format(
            message="Profile updated successfully",
            data={ 'user': person.serialize() },
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)


@person_blueprint.route('/persons/me', methods=['DELETE'])
@jwt_required
def delete_me():
    try:
        person_id = int(g.user.get('sub'))

        success = person_repository.delete_person(person_id)
        if not success:
            return api_response_format(message="Failed to delete account", data={}, status_code=500)

        return api_response_format(
            message="Account deleted successfully",
            data={},
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)