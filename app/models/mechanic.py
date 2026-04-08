from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import Base

class Mechanic(Base):
    """
    Modelo que representa a un Mecánico del equipo técnico.
    
    A diferencia de los 'Usuarios', los mecánicos son el personal operativo
    que realiza los servicios físicos en los vehículos.
    """
    __tablename__ = "mechanics"

    # Identificador único del mecánico
    id = Column(Integer, primary_key=True, index=True)
    
    # Información personal básica
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    
    # Especialidad técnica (ej. Frenos, Motores, Electricidad)
    specialty = Column(String, nullable=True)
    
    # Teléfono de contacto directo
    phone_number = Column(String, nullable=True)

    # --- Relaciones (Relationship) ---
    
    # Órdenes de trabajo que tiene o ha tenido asignadas este mecánico
    work_orders = relationship("WorkOrder", back_populates="assigned_mechanic")

    def __repr__(self) -> str:
        """Representación legible del mecánico."""
        return f"<Mechanic(id={self.id}, name='{self.first_name} {self.last_name}', specialty='{self.specialty}')>"
