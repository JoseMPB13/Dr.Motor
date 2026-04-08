from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import Base

class Client(Base):
    """
    Modelo que representa a un Cliente en el taller.
    
    Un cliente es la entidad principal que solicita servicios para sus vehículos.
    Mantenemos su información de contacto básica para poder comunicarnos sobre el
    estado de sus reparaciones y facturación.
    """
    __tablename__ = "clients"

    # Identificador único autoincremental
    id = Column(Integer, primary_key=True, index=True)
    
    # Información personal obligatoria
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    
    # Número de teléfono para contacto rápido (obligatorio)
    phone_number = Column(String, nullable=False)
    
    # Correo electrónico opcional para envío de facturas digitales
    email = Column(String, unique=True, index=True, nullable=True)
    
    # Dirección física para registros del taller
    address = Column(String, nullable=True)

    # --- Relaciones (Relationship) ---
    
    # Un cliente puede tener registrados múltiples vehículos (Uno a Muchos)
    # back_populates enlaza con el atributo 'owner' en la clase Vehicle.
    vehicles = relationship("Vehicle", back_populates="owner")
    
    # Un cliente puede haber solicitado múltiples órdenes de trabajo históricamente
    work_orders = relationship("WorkOrder", back_populates="client")

    def __repr__(self) -> str:
        """Representación legible del objeto cliente para depuración."""
        return f"<Client(id={self.id}, name='{self.first_name} {self.last_name}')>"
