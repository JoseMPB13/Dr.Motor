from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.models.base import Base

class Service(Base):
    """
    Modelo que representa el Catálogo de Servicios ofrecidos por el taller.
    
    Define las tareas estandarizadas que se pueden cobrar a un cliente,
    como 'Cambio de Aceite' o 'Alineación y Balanceo'.
    """
    __tablename__ = "services"

    # Identificador único del servicio
    id = Column(Integer, primary_key=True, index=True)
    
    # Nombre descriptivo único para evitar duplicidad de catálogo
    name = Column(String, unique=True, index=True, nullable=False)
    
    # Explicación detallada de lo que incluye el servicio
    description = Column(String, nullable=True)
    
    # Precio base del servicio (puede variar en la orden de trabajo final)
    price = Column(Float, nullable=False)
    
    # Tiempo estimado de realización en minutos (para gestión de agenda)
    estimated_duration_minutes = Column(Integer, nullable=True)

    # --- Relaciones (Relationship) ---
    
    # Referencia a todas las veces que este servicio ha sido incluido en una OT
    work_order_services = relationship("WorkOrderService", back_populates="service_item")

    def __repr__(self) -> str:
        """Representación legible del servicio."""
        return f"<Service(id={self.id}, name='{self.name}', price={self.price})>"
