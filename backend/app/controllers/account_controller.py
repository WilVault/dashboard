'''account_controller.py'''
from flask import Blueprint, g
from flask import request
from app.repositories import account_repository
from app.models.account_model import Account
from app.utilities.api_response_format import api_response_format
from app.utilities.auth import jwt_required


account_blueprint = Blueprint('accounts', __name__)


@account_blueprint.route('/accounts', methods=['GET'])
@jwt_required
def get_accounts():
    try:
        person_id = int(g.user.get('sub'))
        accounts = account_repository.get_accounts_by_person_id(person_id)

        return api_response_format(
            message="Accounts retrieved successfully",
            data={ 'accounts': [a.serialize() for a in accounts] },
            status_code=200
        )
    except Exception as e:
        return api_response_format(
            message=str(e),
            status_code=500
        )


@account_blueprint.route('/accounts/<int:account_id>', methods=['GET'])
@jwt_required
def get_account(account_id: int):
    try:
        person_id = int(g.user.get('sub'))
        account = account_repository.get_account_by_id(account_id)

        if not account:
            return api_response_format(
                message="Account not found",
                data={},
                status_code=404
            )

        if account.person_id != person_id:
            return api_response_format(
                message="Forbidden",
                data={},
                status_code=403
            )

        return api_response_format(
            message="Account retrieved successfully",
            data={ 'account': account.serialize() },
            status_code=200
        )
    except Exception as e:
        return api_response_format(
            message=str(e),
            status_code=500
        )


@account_blueprint.route('/accounts', methods=['POST'])
@jwt_required
def create_account():
    try:
        person_id = int(g.user.get('sub'))
        data = request.get_json()

        is_valid, result = Account.validate_create(data)
        if not is_valid:
            return api_response_format(
                message="Validation error",
                data={ 'errors': result.messages },
                status_code=400
            )

        account = account_repository.create_account(
            person_id       = person_id,
            account_name    = result.get('account_name'),
            account_type_id = result.get('account_type_id'),
            initial_balance = result.get('initial_balance'),
            color           = result.get('color'),
            icon            = result.get('icon'),
        )

        if not account:
            return api_response_format(
                message="Failed to create account",
                data={},
                status_code=500
            )

        return api_response_format(
            message="Account created successfully",
            data={ 'account': account.serialize() },
            status_code=201
        )
    except Exception as e:
        return api_response_format(
            message=str(e),
            status_code=500
        )

@account_blueprint.route('/account-types', methods=['GET'])
@jwt_required
def get_account_types():
    try:
        types = account_repository.get_all_account_types()
        return api_response_format(
            message="Account types retrieved successfully",
            data={ 'types': [t.serialize() for t in types] },
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)


@account_blueprint.route('/accounts/<int:account_id>/balance', methods=['GET'])
@jwt_required
def get_account_balance(account_id: int):
    try:
        person_id = int(g.user.get('sub'))

        account = account_repository.get_account_by_id(account_id)
        if not account:
            return api_response_format(message="Account not found", data={}, status_code=404)
        if account.person_id != person_id:
            return api_response_format(message="Forbidden", data={}, status_code=403)

        balance = account_repository.get_account_balance(account_id)
        return api_response_format(
            message="Account balance retrieved successfully",
            data={ 'balance': str(balance) },
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)


@account_blueprint.route('/accounts/<int:account_id>', methods=['DELETE'])
@jwt_required
def delete_account(account_id: int):
    try:
        person_id = int(g.user.get('sub'))

        account = account_repository.get_account_by_id(account_id)
        if not account:
            return api_response_format(message="Account not found", data={}, status_code=404)
        if account.person_id != person_id:
            return api_response_format(message="Forbidden", data={}, status_code=403)

        success = account_repository.delete_account(account_id)
        if not success:
            return api_response_format(message="Failed to delete account", data={}, status_code=500)

        return api_response_format(
            message="Account deleted successfully",
            data={},
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)


@account_blueprint.route('/accounts/net-worth', methods=['GET'])
@jwt_required
def get_net_worth():
    try:
        person_id = int(g.user.get('sub'))
        data = account_repository.get_net_worth(person_id)
        return api_response_format(
            message="Net worth retrieved successfully",
            data=data,
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)