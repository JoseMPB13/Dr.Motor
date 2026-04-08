import bcrypt
from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt

from app.core.config import settings

# --- Hash de Contraseñas ---
# Usando la librería bcrypt directamente para evitar incompatibilidades 
# con las versiones más recientes en Python 3.13.

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica que una contraseña en texto plano coincida con su hash almacenado.
    """
    try:
        # bcrypt requiere que el input sean bytes
        password_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except (ValueError, TypeError, Exception):
        # Si el hash en la DB es inválido o no es un hash de bcrypt, 
        # devolvemos False en lugar de lanzar una excepción (500 error).
        return False

def get_password_hash(password: str) -> str:
    """
    Genera un hash seguro para una contraseña dada usando bcrypt.
    """
    # Usar gensalt para generar una sal aleatoria
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

# --- Gestión de Tokens (JWT) ---

def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict] = None
) -> str:
    """
    Genera un JSON Web Token (JWT) firmado para autenticación.
    Incluye claims adicionales como rol y email del usuario.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Datos base del token
    to_encode = {"exp": expire, "sub": str(subject)}

    # Añadir claims extra (role, email) si se proveen
    if extra_claims:
        to_encode.update(extra_claims)

    # Firmar el token con la llave secreta y el algoritmo configurado
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt
