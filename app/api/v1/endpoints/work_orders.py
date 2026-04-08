from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api import deps
from app.schemas.work_order import WorkOrder, WorkOrderCreate, WorkOrderUpdate
from app.schemas.work_order_service import WorkOrderService, WorkOrderServiceCreate
from app.crud import work_order as crud_wo
from app.crud import vehicle as crud_vehicle
from app.crud import invoice as crud_invoice
from app.models.user import User as ModelUser

# --- Router para órdenes de trabajo ---
router = APIRouter()

@router.get("/", response_model=List[WorkOrder])
def read_work_orders(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Lista las órdenes de trabajo registradas.
    """
    return crud_wo.get_work_orders(db, skip=skip, limit=limit)

@router.post("/", response_model=WorkOrder, status_code=status.HTTP_201_CREATED)
def create_work_order(
    wo_in: WorkOrderCreate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Abre una nueva orden de trabajo para un vehículo.
    """
    # Validar vehículo
    vehicle = crud_vehicle.get_vehicle(db, vehicle_id=wo_in.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
        
    return crud_wo.create_work_order(db=db, work_order=wo_in)

@router.get("/{work_order_id}", response_model=WorkOrder)
def read_work_order(
    work_order_id: int, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Detalle de una orden de trabajo específica.
    """
    db_wo = crud_wo.get_work_order(db, work_order_id=work_order_id)
    if not db_wo:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    return db_wo

@router.post("/{work_order_id}/services", response_model=WorkOrderService)
def add_service_to_order(
    work_order_id: int, 
    service_in: WorkOrderServiceCreate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Añade un servicio del catálogo a la orden de trabajo.
    Captura automáticamente el precio actual del catálogo.
    """
    db_wo = crud_wo.get_work_order(db, work_order_id=work_order_id)
    if not db_wo:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
        
    # Verificar si la orden ya está pagada y bloqueada
    invoice = crud_invoice.get_invoice_by_work_order(db, work_order_id=work_order_id)
    if invoice and invoice.payment_status == "Pagada" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta orden ya está pagada y bloqueada. Solo administradores pueden modificarla."
        )
        
    db_wo_svc = crud_wo.add_service_to_work_order(db, work_order_id=work_order_id, service_in=service_in)
    if not db_wo_svc:
        raise HTTPException(status_code=400, detail="El servicio no existe en el catálogo")
        
    return db_wo_svc

@router.put("/{work_order_id}", response_model=WorkOrder)
def update_work_order_status(
    work_order_id: int, 
    wo_in: WorkOrderUpdate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Cambia el estado de la orden o asigna mecánicos.
    """
    db_wo = crud_wo.get_work_order(db, work_order_id=work_order_id)
    if not db_wo:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
        
    # Verificar si la orden ya está pagada y bloqueada
    invoice = crud_invoice.get_invoice_by_work_order(db, work_order_id=work_order_id)
    if invoice and invoice.payment_status == "Pagada" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación prohibida: La orden ya fue facturada y pagada."
        )
        
    return crud_wo.update_work_order(db=db, db_wo=db_wo, wo_in=wo_in)
