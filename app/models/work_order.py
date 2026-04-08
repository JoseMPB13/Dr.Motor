from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime

class WorkOrder(Base):
    """
    Modelo que representa una Orden de Trabajo (OT).
    
    Es el documento central del proceso del taller. Documenta qué vehículo
    está siendo reparado, qué cliente lo solicitó, qué mecánico está asignado
    y cuál es el problema reportado. También rastrea el estado y los costos.
    """
    __tablename__ = "work_orders"

    # Número de Orden de Trabajo
    id = Column(Integer, primary_key=True, index=True)
    
    # --- Referencias a otras Entidades ---
    
    # Cliente que autoriza el trabajo
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # Vehículo ingresado al taller
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    
    # Mecánico asignado (Puede ser NULL si la orden recién llega y no hay asignación)
    mechanic_id = Column(Integer, ForeignKey("mechanics.id"), nullable=True)
    
    # Usuario (Recepcionista/Admin) que dio de alta la orden en el sistema
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # --- Detalles de la Orden ---
    
    # Descripción detallada de la falla o solicitud del cliente
    issue_description = Column(String, nullable=False)
    
    # Estado del flujo (Pendiente -> En Progreso -> Completada -> Cancelada)
    status = Column(String, default="Pendiente", nullable=False)
    
    # Control de tiempos
    start_date = Column(DateTime, default=datetime.datetime.now, nullable=False)
    completion_date = Column(DateTime, nullable=True)
    
    # Resumen financiero acumulado (Suma de servicios y repuestos)
    total_amount = Column(Float, default=0.0, nullable=False)

    # --- Relaciones (Relationship) ---
    
    # Acceso directo al objeto cliente
    client = relationship("Client", back_populates="work_orders")
    
    # Acceso directo al objeto vehículo
    vehicle = relationship("Vehicle", back_populates="work_orders")
    
    # Mecánico encargado (si ya fue asignado)
    # Se asume que existe el modelo Mechanic en mechanic.py
    assigned_mechanic = relationship("Mechanic", back_populates="work_orders")
    
    # Usuario que registró la orden
    # foreign_keys es necesario si hay múltiples FK al mismo modelo (no es este caso, pero es buena práctica)
    creator_user = relationship("User", back_populates="work_orders_created", foreign_keys=[created_by_user_id])
    
    # Servicios específicos realizados en esta orden (Relación con tabla intermedia)
    services_performed = relationship("WorkOrderService", back_populates="work_order")
    
    # Factura generada a partir de esta orden (Uno a Uno)
    invoice = relationship("Invoice", back_populates="work_order", uselist=False)

    def __repr__(self) -> str:
        """Representación legible de la orden de trabajo."""
        return f"<WorkOrder(id={self.id}, status='{self.status}', total={self.total_amount})>"
