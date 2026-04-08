from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.work_order_service import WorkOrderService

class WorkOrderBase(BaseModel):
    """
    Schema base para una Orden de Trabajo.
    """
    client_id: int
    vehicle_id: int
    mechanic_id: Optional[int] = None
    issue_description: str
    status: str = "Pendiente"

class WorkOrderCreate(WorkOrderBase):
    """
    Schema para abrir una nueva orden de trabajo.
    """
    created_by_user_id: int # El usuario que registra la entrada

class WorkOrderUpdate(BaseModel):
    """
    Schema para actualizar el estado, asignar mecánicos o cerrar la orden.
    """
    mechanic_id: Optional[int] = None
    issue_description: Optional[str] = None
    status: Optional[str] = None
    completion_date: Optional[datetime] = None

class WorkOrder(WorkOrderBase):
    """
    Schema de respuesta completo.
    """
    id: int
    created_by_user_id: int
    start_date: datetime
    completion_date: Optional[datetime] = None
    total_amount: float
    
    # Lista de servicios realizados en esta orden
    services_performed: List[WorkOrderService] = []

    class Config:
        from_attributes = True
