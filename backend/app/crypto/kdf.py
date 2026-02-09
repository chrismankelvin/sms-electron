import hashlib

APP_SALT = b"SCHOOL_APP_INTERNAL_SALT"

def derive_db_key(activation_code: str, fingerprint: str) -> bytes:
    combined = activation_code.encode() + fingerprint.encode() + APP_SALT
    return hashlib.sha256(combined).digest()
