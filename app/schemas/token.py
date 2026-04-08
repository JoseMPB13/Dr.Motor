from pydantic import BaseModel, validator
from typing import Optional, Any

class Token(BaseModel):
    """
    Schema para la respuesta de autenticación exitosa.

    Contiene el token de acceso y su tipo (ej. 'bearer').
    """
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    """
    Schema para los datos internos decodificados de un JWT.

    Nos permite validar que el token sea íntegro y obtener la identidad (sub).
    El campo 'sub' se almacena como string en el JWT (str(user.id)),
    por lo que lo convertimos a int al deserializar.
    """
    sub: Optional[Any] = None
    role: Optional[str] = None
    email: Optional[str] = None

    @property
    def user_id(self) -> Optional[int]:
        """Retorna el ID del usuario como entero."""
        try:
            return int(self.sub) if self.sub is not None else None
        except (ValueError, TypeError):
            return None
