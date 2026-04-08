from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    """
    Schema base para un Usuario con atributos comunes.
    """
    email: EmailStr
    is_active: Optional[bool] = True
    role: Optional[str] = "recepcionista"

class UserCreate(UserBase):
    """
    Schema para registrar un nuevo usuario en el sistema.
    """
    password: str

class UserUpdate(BaseModel):
    """
    Schema para actualizar datos de un usuario. Todos los campos son opcionales.
    """
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None

class User(UserBase):
    """
    Schema de respuesta para la API. Oculta la contraseña.
    """
    id: int

    class Config:
        from_attributes = True
