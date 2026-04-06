from flask import Blueprint, request, g
from app.repositories import dashboard_repository
from app.utilities.api_response_format import api_response_format
from app.utilities.auth import jwt_required

dashboard_blueprint = Blueprint('dashboard', __name__)

@dashboard_blueprint.route('/dashboard', methods=['GET'])
@jwt_required
def get_dashboard():
    try:
        person_id = int(g.user.get('sub'))
        date_from = request.args.get('dateFrom')
        date_to   = request.args.get('dateTo')

        data = dashboard_repository.get_dashboard(
            person_id = person_id,
            date_from = date_from,
            date_to   = date_to,
        )

        return api_response_format(
            message="Dashboard retrieved successfully",
            data=data,
            status_code=200
        )
    except Exception as e:
        return api_response_format(message=str(e), status_code=500)