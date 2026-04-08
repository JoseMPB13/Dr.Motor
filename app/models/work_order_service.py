from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class WorkOrderService(Base):
    """
    Modelo Intermedio que asocia Servicios con Órdenes de Trabajo.
    
    Esta tabla es crucial porque captura el 'Precio al momento' (para que
    si el catálogo de servicios sube de precio, las órdenes viejas no cambien)
    y permite añadir notas específicas por ejecución.
    """
    __tablename__ = "work_order_services"

    # Claves primarias compuestas
    work_order_id = Column(Integer, ForeignKey("work_orders.id"), primary_key=True)
    service_id = Column(Integer, ForeignKey("services.id"), primary_key=True)
    
    # Cuántas veces se aplicó el servicio (ej. si aplica por unidad)
    quantity = Column(Integer, default=1, nullable=False)
    
    # PRECIO HISTÓRICO: El valor del servicio al momento de crear la orden.
    # Es vital para mantener la integridad contable histórica.
    price_at_time = Column(Float, nullable=False)
    
    # Observaciones técnicas detectadas durante este servicio específico
    notes = Column(String, nullable=True)

    # --- Relaciones (Relationship) ---
    
    # Vuelve a la orden de trabajo principal
    work_order = relationship("WorkOrder", back_populates="services_performed")
    
    # Conecta con el catálogo de servicios
    service_item = relationship("Service", back_populates="work_order_services")

    def __repr__(self) -> str:
        """Representación de la relación servicio-orden."""
        return f"<WorkOrderService(wo={self.work_order_id}, svc={self.service_id}, price={self.price_at_time})>"
