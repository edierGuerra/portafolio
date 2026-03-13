import base64
import hashlib
import hmac
import os

import bcrypt

_PBKDF2_ALGORITHM = "sha256"
_PBKDF2_ITERATIONS = 390000
_PBKDF2_SALT_BYTES = 16


def hash_password(password: str) -> str:
    salt = os.urandom(_PBKDF2_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac(
        _PBKDF2_ALGORITHM,
        password.encode("utf-8"),
        salt,
        _PBKDF2_ITERATIONS,
    )
    salt_b64 = base64.urlsafe_b64encode(salt).decode("utf-8")
    digest_b64 = base64.urlsafe_b64encode(digest).decode("utf-8")
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${salt_b64}${digest_b64}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        if stored_hash.startswith("pbkdf2_sha256$"):
            _, iter_raw, salt_b64, digest_b64 = stored_hash.split("$", 3)
            iterations = int(iter_raw)
            salt = base64.urlsafe_b64decode(salt_b64.encode("utf-8"))
            expected = base64.urlsafe_b64decode(digest_b64.encode("utf-8"))
            current = hashlib.pbkdf2_hmac(
                _PBKDF2_ALGORITHM,
                password.encode("utf-8"),
                salt,
                iterations,
            )
            return hmac.compare_digest(current, expected)

        if stored_hash.startswith("$2"):
            return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))

        # Compatibilidad temporal con contraseñas antiguas en texto plano.
        return hmac.compare_digest(password, stored_hash)
    except Exception:
        return False
