from flask import jsonify

def api_response_format(message: str, data=None, status_code: int = 200):
    """
    Standardizes API responses across the application.
    """
    response = {
        "status": "success" if status_code < 400 else "error",
        "message": message,
        "data": data
    }
    return jsonify(response), status_code