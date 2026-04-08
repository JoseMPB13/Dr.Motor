from pydantic import BaseModel
from typing import Optional

class ServiceBase(BaseModel):
    """
    Schema base para un Servicio del catálogo.
    """
    name: str
    description: Optional[str] = None
    price: float
    estimated_duration_minutes: Optional[int] = None

class ServiceCreate(ServiceBase):
    """
    Schema para registrar un nuevo tipo de servicio.
    """
    pass

class ServiceUpdate(BaseModel):
    """
    Schema para actualizar un servicio (ej. cambio de precio).
    """
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None

class Service(ServiceBase):
    """
    Schema de respuesta.
    """
    id: int

    class Config:
        from_attributes = True
