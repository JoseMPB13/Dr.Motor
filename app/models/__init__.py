from app.models.base import Base
from app.models.user import User
from app.models.client import Client
from app.models.vehicle import Vehicle
from app.models.mechanic import Mechanic
from app.models.service import Service
from app.models.work_order import WorkOrder
from app.models.work_order_service import WorkOrderService
from app.models.invoice import Invoice
from app.models.audit_log import AuditLog

# Esta lista expone todos los modelos para que FastAPI y Alembic puedan
# descubrirlos a través del metadato Base.metadata.
__all__ = [
    "Base",
    "User",
    "Client",
    "Vehicle",
    "Mechanic",
    "Service",
    "WorkOrder",
    "WorkOrderService",
    "Invoice",
    "AuditLog"
]
