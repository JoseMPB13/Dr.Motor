from pydantic import BaseModel
from typing import Optional

class MechanicBase(BaseModel):
    """
    Schema base para un Mecánico.
    """
    first_name: str
    last_name: str
    specialty: Optional[str] = None
    phone_number: Optional[str] = None

class MechanicCreate(MechanicBase):
    """
    Schema para la creación de un nuevo mecánico.
    """
    pass

class MechanicUpdate(BaseModel):
    """
    Schema para actualizar datos de un mecánico.
    """
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialty: Optional[str] = None
    phone_number: Optional[str] = None

class Mechanic(MechanicBase):
    """
    Schema de respuesta para el frontend.
    """
    id: int

    class Config:
        from_attributes = True
