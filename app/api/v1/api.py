from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, 
    users, 
    clients, 
    vehicles, 
    mechanics, 
    services, 
    work_orders, 
    invoices,
    audit_logs,
    dashboard
)

# Enrutador principal v1
api_router = APIRouter()

# Registro de todos los módulos del sistema
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(mechanics.router, prefix="/mechanics", tags=["mechanics"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(work_orders.router, prefix="/work-orders", tags=["work-orders"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit-logs"])
