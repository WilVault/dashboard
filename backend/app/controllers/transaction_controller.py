'''transaction_controller.py'''
import uuid
from flask import Blueprint, request, g
from app.repositories import transaction_repository, account_repository
from app.config import database
from app.models.transaction_model import Transaction
from app.utilities.api_response_format import api_response_format
from app.utilities.auth import jwt_required

# Hardcoded IDs — match your seeded transaction_type and transaction_categories rows
TRANSFER_TYPE_ID    = 3  # 'transfer'    in transaction_type
TRANSFER_CATEGORY_ID = 10  # 'Transfer' in transaction_categories

transaction_blueprint = Blueprint('transactions', __name__)


@transaction_blueprint.route('/transactions', methods=['GET'])
@jwt_required
def get_transactions():
    try:
        person_id = int(g.user.get('sub'))

        transaction_type     = request.args.get('transactionType')
        transaction_category = request.args.get('transactionCategory')
        title                = request.args.get('title')
        date_from            = request.args.get('dateFrom')
        date_to              = request.args.get('dateTo')
        page                 = int(request.args.get('page', 1))
        page_size            = int(request.args.get('pageSize', 20))
        account_name         = request.args.get('accountName')

        transactions, total, summary = transaction_repository.get_transactions_by_person_id(
            person_id            = person_id,
            transaction_type     = transaction_type,
            transaction_category = transaction_category,
            title                = title,
            date_from            = date_from,
            date_to              = date_to,
            page                 = page,
            page_size            = page_size,
            account_name         = account_name,
        )

        return api_response_format(
            message="Transactions retrieved successfully",
            data={
                'summary': summary,
                'transactions': [t.serialize() for t in transactions],
                'pagination': {
                    'total':     total,
                    'page':      page,
                    'page_size': page_size,
                    'pages':     -(-total // page_size),
                }
            },
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)


@transaction_blueprint.route('/accounts/<int:account_id>/transactions', methods=['GET'])
@jwt_required
def get_transactions_by_account(account_id: int):
    try:
        person_id = int(g.user.get('sub'))

        account = account_repository.get_account_by_id(account_id)
        if not account:
            return api_response_format(message="Account not found", data={}, status_code=404)

        if account.person_id != person_id:
            return api_response_format(message="Forbidden", data={}, status_code=403)

        transactions = transaction_repository.get_transactions_by_account_id(account_id)

        return api_response_format(
            message="Transactions retrieved successfully",
            data={ 'transactions': [t.serialize() for t in transactions] },
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)


@transaction_blueprint.route('/transactions/<int:transaction_id>', methods=['GET'])
@jwt_required
def get_transaction(transaction_id: int):
    try:
        person_id = int(g.user.get('sub'))

        transaction = transaction_repository.get_transaction_by_id(transaction_id)
        if not transaction:
            return api_response_format(message="Transaction not found", data={}, status_code=404)

        account = account_repository.get_account_by_id(transaction.account_id)
        if not account or account.person_id != person_id:
            return api_response_format(message="Forbidden", data={}, status_code=403)

        return api_response_format(
            message="Transaction retrieved successfully",
            data={ 'transaction': transaction.serialize() },
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)


@transaction_blueprint.route('/transactions', methods=['POST'])
@jwt_required
def create_transaction():
    try:
        person_id = int(g.user.get('sub'))
        data = request.get_json()

        is_valid, result = Transaction.validate_create(data)
        if not is_valid:
            return api_response_format(
                message="Validation error",
                data={ 'errors': result.messages },
                status_code=400
            )

        # Ownership check
        account = account_repository.get_account_by_id(result.get('account_id'))
        if not account:
            return api_response_format(message="Account not found", data={}, status_code=404)
        if account.person_id != person_id:
            return api_response_format(message="Forbidden", data={}, status_code=403)

        transaction = transaction_repository.create_transaction(
            account_id              = result.get('account_id'),
            transaction_category_id = result.get('transaction_category_id'),
            transaction_type_id     = result.get('transaction_type_id'),
            amount                  = result.get('amount'),
            title                   = result.get('title'),
            description             = result.get('description'),
            transaction_date        = str(result.get('transaction_date')) if result.get('transaction_date') else None,
        )

        if not transaction:
            return api_response_format(message="Failed to create transaction", data={}, status_code=500)

        return api_response_format(
            message="Transaction created successfully",
            data={ 'transaction': transaction.serialize() },
            status_code=201
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)


@transaction_blueprint.route('/transactions/transfer', methods=['POST'])
@jwt_required
def create_transfer():
    try:
        person_id = int(g.user.get('sub'))
        data = request.get_json()

        is_valid, result = Transaction.validate_create_transfer(data)
        if not is_valid:
            return api_response_format(
                message="Validation error",
                data={ 'errors': result.messages },
                status_code=400
            )

        from_account_id = result.get('from_account_id')
        to_account_id   = result.get('to_account_id')

        # Ownership check on both accounts
        from_account = account_repository.get_account_by_id(from_account_id)
        to_account   = account_repository.get_account_by_id(to_account_id)

        if not from_account or not to_account:
            return api_response_format(message="One or both accounts not found", data={}, status_code=404)

        if from_account.person_id != person_id or to_account.person_id != person_id:
            return api_response_format(message="Forbidden", data={}, status_code=403)

        # Balance check — from account must have sufficient funds
        from_balance = account_repository.get_account_balance(from_account_id)
        transfer_amount = float(result.get('amount'))
        if transfer_amount > from_balance:
            return api_response_format(
                message=f"Insufficient balance to make transfer",
                data={},
                status_code=400
            )

        transfer_ref_id = str(uuid.uuid4())

        debit, credit = transaction_repository.create_transfer(
            from_account_id      = from_account_id,
            to_account_id        = to_account_id,
            amount               = result.get('amount'),
            title                = result.get('title'),
            description          = result.get('description'),
            transfer_ref_id      = transfer_ref_id,
            transfer_type_id     = TRANSFER_TYPE_ID,
            transfer_category_id = TRANSFER_CATEGORY_ID,
        )

        if not debit or not credit:
            return api_response_format(message="Failed to create transfer", data={}, status_code=500)

        return api_response_format(
            message="Transfer created successfully",
            data={
                'transfer_ref_id': transfer_ref_id,
                'debit':  debit.serialize(),
                'credit': credit.serialize(),
            },
            status_code=201
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)


@transaction_blueprint.route('/transaction-categories', methods=['GET'])
def get_transaction_categories():
    try:
        rows = database.select_query('SELECT id, label, icon FROM transaction_categories ORDER BY id;')
        return api_response_format(
            message="Transaction categories retrieved successfully",
            data={ 'categories': rows },
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)


@transaction_blueprint.route('/transaction-types', methods=['GET'])
def get_transaction_types():
    try:
        rows = database.select_query('SELECT id, label, description FROM transaction_type ORDER BY id;')
        return api_response_format(
            message="Transaction types retrieved successfully",
            data={ 'types': rows },
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)