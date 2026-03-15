from flask import Flask
from app.config import database
from app.controllers.person_controller import person_blueprint
from app.controllers.auth_controller import auth_blueprint
from app.controllers.currency_controller import currency_blueprint
from app.controllers.otp_controller import otp_blueprint
from flask_cors import CORS
import os


def create_app():
    app = Flask(__name__)
    url_prefix='/api'

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": os.getenv('ALLOWED_ORIGINS', '').split(',')}})

    # Connect to DB
    database.connect()

    # Register blueprints
    app.register_blueprint(auth_blueprint, url_prefix=url_prefix)
    app.register_blueprint(person_blueprint, url_prefix=url_prefix)
    app.register_blueprint(currency_blueprint, url_prefix=url_prefix)
    app.register_blueprint(otp_blueprint, url_prefix=url_prefix)

    # Disable auto sorting in api response structure
    app.json.sort_keys = False

    return app