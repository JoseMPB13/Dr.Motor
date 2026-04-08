from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core import security
from app.core.database import get_db
from app.core.config import settings
from app.crud import user as crud_user
from app.schemas.token import Token

# Definición del enrutador para autenticación
router = APIRouter()

@router.post("/token", response_model=Token)
def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Endpoint para el inicio de sesión del personal del taller.
    Devuelve un JWT que incluye el rol y email del usuario en el payload.
    """
    # Intentar obtener el usuario por email (form_data.username)
    user = crud_user.get_user_by_email(db, email=form_data.username)

    # Validar existencia del usuario y coincidencia de contraseña
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validar que la cuenta esté activa
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )

    # Crear el token de acceso incluyendo role y email en el payload
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id,
        expires_delta=access_token_expires,
        extra_claims={
            "role": user.role,
            "email": user.email,
        }
    )

    # Devolver el pack de autenticación estándar
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
