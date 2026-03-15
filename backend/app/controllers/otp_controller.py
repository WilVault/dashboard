'''otp_controller.py'''
from flask import Blueprint, request
from app.models.otp_model import OTP
from app.repositories import otp_repository
from app.services import otp_service
from app.utilities.api_response_format import api_response_format

otp_blueprint = Blueprint('otp', __name__)


@otp_blueprint.route('/otp/send', methods=['POST'])
def send_otp():
    try:
        body = request.get_json()
        is_valid, result = OTP.validate_send(body)

        if not is_valid:
            return api_response_format(
                message="Validation error",
                data=result.messages,
                status_code=400
            )

        email       = result['email']
        otp_type_id = result['otp_type_id']
        timezone    = result['timezone']

        otp = otp_service.generate_otp()

        created_at, expiration_at = otp_service.get_otp_timestamps(timezone)

        otp_repository.insert_otp(
            email=email,
            otp_type_id=otp_type_id,
            otp=otp,
            created_at=created_at,
            expiration_at=expiration_at,
            timezone=timezone
        )

        otp_service.send_otp_email(email=email, otp=otp)

        return api_response_format(
            message="OTP sent successfully",
            data={},
            status_code=200
        )
    except Exception as e:
        return api_response_format(
            message=str(e),
            status_code=500
        )


@otp_blueprint.route('/otp/verify', methods=['POST'])
def verify_otp():
    try:
        body = request.get_json()
        is_valid, result = OTP.validate_verify(body)

        if not is_valid:
            return api_response_format(
                message="Validation error",
                data=result.messages,
                status_code=400
            )

        email       = result['email']
        otp         = result['otp']
        otp_type_id = result['otp_type_id']

        otp_record = otp_repository.find_latest_by_email_and_type(email, otp_type_id)

        if not otp_record:
            return api_response_format(
                message="OTP not found",
                data={},
                status_code=404
            )

        if otp_service.is_otp_expired(otp_record.expiration_at, otp_record.timezone):
            return api_response_format(
                message="OTP has expired",
                data={},
                status_code=400
            )

        if otp != otp_record.otp:
            return api_response_format(
                message="Invalid OTP",
                data={},
                status_code=400
            )

        otp_repository.delete_otp_by_id(otp_record.id)

        return api_response_format(
            message="OTP verified successfully",
            data={},
            status_code=200
        )
    except Exception as e:
        return api_response_format(
            message=str(e),
            status_code=500
        )