from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InvoiceBase(BaseModel):
    """
    Schema base para una Factura.
    """
    work_order_id: int
    payment_status: str = "Pendiente"

class InvoiceCreate(InvoiceBase):
    """
    Schema para generar una factura. 
    Se vincula a una OT completada.
    """
    generated_by_user_id: int

class InvoiceUpdate(BaseModel):
    """
    Schema para actualizar el estado de pago.
    """
    payment_status: Optional[str] = None

class Invoice(InvoiceBase):
    """
    Schema de respuesta.
    """
    id: int
    invoice_date: datetime
    total_amount: float
    generated_by_user_id: int

    class Config:
        from_attributes = True
        
class InvoiceDetailed(Invoice):
    """
    Schema detallado (opcional para el futuro).
    """
    pass
