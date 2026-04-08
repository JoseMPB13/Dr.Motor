from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Vehicle(Base):
    """
    Modelo que representa a un Vehículo en el taller.
    
    Cada vehículo está asociado a un dueño (Cliente) y es el objeto sobre el
    cual se realizan las órdenes de trabajo. Se almacenan datos técnicos para
    identificarlo correctamente y llevar un historial de reparaciones.
    """
    __tablename__ = "vehicles"

    # Identificador único del vehículo en el sistema
    id = Column(Integer, primary_key=True, index=True)
    
    # Clave foránea que lo asocia a su dueño legal
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # Información básica de identificación
    make = Column(String, nullable=False) # Fabricante (ej. Toyota)
    model = Column(String, nullable=False) # Modelo (ej. Corolla)
    year = Column(Integer, nullable=False) # Año de fabricación
    
    # Identificadores únicos y obligatorios para tránsito y legalidad
    license_plate = Column(String, unique=True, index=True, nullable=False) # Placa
    
    # Número de Identificación del Vehículo (Opcional, pero recomendado)
    vin = Column(String, unique=True, index=True, nullable=True)

    # --- Relaciones (Relationship) ---
    
    # El dueño del vehículo (Cada vehículo pertenece a un único cliente)
    owner = relationship("Client", back_populates="vehicles")
    
    # Historial de intervenciones mecánicas realizadas a este vehículo
    work_orders = relationship("WorkOrder", back_populates="vehicle")

    def __repr__(self) -> str:
        """Representación legible del vehículo para depuración."""
        return f"<Vehicle(id={self.id}, plate='{self.license_plate}', model='{self.model}')>"
