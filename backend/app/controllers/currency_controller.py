'''currency_controller.py'''
from flask import Blueprint
from app.repositories import currency_repository
from app.utilities.api_response_format import api_response_format


currency_blueprint = Blueprint('currencies', __name__)


@currency_blueprint.route('/currencies', methods=['GET'])
def get_all_currencies():
    try:
        currencies = currency_repository.get_all_currency()
        data = [c.serialize() for c in currencies if c]

        return api_response_format(
            message="Currencies retrieved successfully",
            data=data,
            status_code=200
        )
    except Exception as e:
        return api_response_format(
            message=str(e),
            status_code=500
        )