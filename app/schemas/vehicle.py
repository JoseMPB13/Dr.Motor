from pydantic import BaseModel
from typing import Optional

class VehicleBase(BaseModel):
    """
    Schema base para un Vehículo.
    """
    client_id: int
    make: str
    model: str
    year: int
    license_plate: str
    vin: Optional[str] = None

class VehicleCreate(VehicleBase):
    """
    Schema para registrar un nuevo vehículo en el sistema.
    """
    pass

class VehicleUpdate(BaseModel):
    """
    Schema para actualizar datos de un vehículo (ej. corregir un VIN o año).
    """
    client_id: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    license_plate: Optional[str] = None
    vin: Optional[str] = None

class Vehicle(VehicleBase):
    """
    Schema de respuesta.
    """
    id: int

    class Config:
        from_attributes = True
        
class VehicleDetailed(Vehicle):
    """
    Schema de respuesta detallado que puede incluir información del dueño (Client).
    (Se implementará cuando los esquemas de clientes estén integrales).
    """
    pass
