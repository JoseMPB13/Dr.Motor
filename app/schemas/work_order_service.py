from pydantic import BaseModel
from typing import Optional

class WorkOrderServiceBase(BaseModel):
    """
    Schema base para un servicio dentro de una orden de trabajo.
    """
    service_id: int
    quantity: int = 1
    notes: Optional[str] = None

class WorkOrderServiceCreate(WorkOrderServiceBase):
    """
    Schema usado al añadir un servicio a una OT.
    El precio_at_time se tomará del catálogo actual durante la creación.
    """
    pass

class WorkOrderService(WorkOrderServiceBase):
    """
    Schema de respuesta que incluye el precio capturado históricamente.
    """
    work_order_id: int
    price_at_time: float

    class Config:
        from_attributes = True
