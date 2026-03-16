'''s3_service.py'''
import boto3
import os
from botocore.exceptions import ClientError

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
REGION = os.getenv('AWS_REGION')

def get_avatar_key(email: str) -> str:
    """
    Converts email to a safe S3 path.
    e.g. juan@example.com → avatars/juan_at_example_com/profile_picture/avatar.png
    """
    sanitized = email.replace('@', '_at_').replace('.', '_')
    return f"avatars/{sanitized}/profile_picture/avatar.png"

def upload_bytes_to_s3(file_bytes: bytes, key: str, content_type: str = 'image/png') -> str | None:
    """
    Uploads raw bytes to S3 and returns the public URL.
    Returns None if upload fails.
    """
    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )
        return f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{key}"
    except ClientError as e:
        print(f"S3 upload error: {e}")
        return None