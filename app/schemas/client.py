from pydantic import BaseModel, EmailStr
from typing import Optional, List

class ClientBase(BaseModel):
    """
    Schema base para un Cliente con los atributos compartidos.
    
    Esta clase define la estructura común para la entrada y salida de datos
    de un cliente en la API, asegurando tipos de datos consistentes.
    """
    first_name: str
    last_name: str
    phone_number: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None

class ClientCreate(ClientBase):
    """
    Schema para la creación de un nuevo Cliente.
    
    Hereda de ClientBase. Se utiliza en el cuerpo de las solicitudes POST
    para validar que los datos obligatorios (nombre, apellido, teléfono)
    estén presentes.
    """
    pass

class ClientUpdate(BaseModel):
    """
    Schema para actualizar un Cliente existente.
    
    Todos los campos son opcionales para permitir actualizaciones parciales
    (PATCH/PUT parcial).
    """
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None

class Client(ClientBase):
    """
    Schema completo para la respuesta de la API (Read).
    
    Incluye el ID único asignado por la base de datos.
    Se utiliza en las respuestas GET para enviar los datos al cliente.
    """
    id: int

    class Config:
        # Pydantic v2 usa 'from_attributes = True' para ser compatible con ORMs como SQLAlchemy.
        # Esto permite que Pydantic lea los atributos directamente del objeto de la base de datos.
        from_attributes = True
