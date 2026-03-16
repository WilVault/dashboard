"""s3_service_test.py"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from dotenv import load_dotenv
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.env')))

from app.utilities.avatar import generate_default_avatar
from app.services.s3_service import upload_bytes_to_s3, get_avatar_key

email = "1231231asda@gmail.com"
full_name = "Luke Gonzales"

avatar_bytes = generate_default_avatar(full_name, email)
key = get_avatar_key(email)
url = upload_bytes_to_s3(avatar_bytes, key)

print(url)