from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime

class Invoice(Base):
    """
    Modelo que representa la Factura de cobro.
    
    Se genera una vez que la Orden de Trabajo ha sido completada.
    Representa el compromiso de pago final del cliente.
    """
    __tablename__ = "invoices"

    # Identificador único de factura
    id = Column(Integer, primary_key=True, index=True)
    
    # Enlace único con la orden de trabajo (Una factura -> Una orden)
    work_order_id = Column(Integer, ForeignKey("work_orders.id"), unique=True, nullable=False)
    
    # Fecha de emisión del documento
    invoice_date = Column(DateTime, default=datetime.datetime.now, nullable=False)
    
    # Monto total calculado final a cobrar
    total_amount = Column(Float, nullable=False)
    
    # Estado transaccional ('Pendiente', 'Pagada', 'Anulada')
    payment_status = Column(String, default="Pendiente", nullable=False)
    
    # Usuario que procesó la facturación
    generated_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # --- Relaciones (Relationship) ---
    
    # Orden de trabajo de la cual proviene esta factura
    work_order = relationship("WorkOrder", back_populates="invoice")
    
    # Usuario administrativo que emitió el cobro
    generator_user = relationship(
        "User", 
        back_populates="invoices_generated", 
        foreign_keys=[generated_by_user_id]
    )

    def __repr__(self) -> str:
        """Representación legible de la factura."""
        return f"<Invoice(id={self.id}, total={self.total_amount}, status='{self.payment_status}')>"
