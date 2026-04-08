from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.models.work_order import WorkOrder as ModelWorkOrder
from app.models.work_order_service import WorkOrderService as ModelWOService
from app.models.service import Service as ModelService
from app.schemas.work_order import WorkOrderCreate, WorkOrderUpdate
from app.schemas.work_order_service import WorkOrderServiceCreate

def get_work_order(db: Session, work_order_id: int):
    """
    Obtiene una orden de trabajo por ID.
    """
    return db.query(ModelWorkOrder).filter(ModelWorkOrder.id == work_order_id).first()

def get_work_orders(db: Session, skip: int = 0, limit: int = 100):
    """
    Lista las órdenes de trabajo.
    """
    return db.query(ModelWorkOrder).order_by(ModelWorkOrder.id).offset(skip).limit(limit).all()

def create_work_order(db: Session, work_order: WorkOrderCreate):
    """
    Crea la cabecera de la orden de trabajo.
    """
    db_wo = ModelWorkOrder(
        client_id=work_order.client_id,
        vehicle_id=work_order.vehicle_id,
        mechanic_id=work_order.mechanic_id,
        created_by_user_id=work_order.created_by_user_id,
        issue_description=work_order.issue_description,
        status=work_order.status
    )
    db.add(db_wo)
    db.commit()
    db.refresh(db_wo)
    return db_wo

def add_service_to_work_order(db: Session, work_order_id: int, service_in: WorkOrderServiceCreate):
    """
    Añade un servicio a la OT y captura el precio actual del catálogo.
    Calcula y actualiza el total_amount de la orden.
    """
    # 1. Obtener el servicio del catálogo para capturar el precio actual
    service_catalog = db.query(ModelService).filter(ModelService.id == service_in.service_id).first()
    if not service_catalog:
        return None
    
    # 2. Crear la línea de servicio con el precio estático (snapshot)
    db_wo_service = ModelWOService(
        work_order_id=work_order_id,
        service_id=service_in.service_id,
        quantity=service_in.quantity,
        price_at_time=service_catalog.price,
        notes=service_in.notes
    )
    db.add(db_wo_service)
    
    # 3. Actualizar el total de la orden de trabajo
    db_wo = db.query(ModelWorkOrder).filter(ModelWorkOrder.id == work_order_id).first()
    db_wo.total_amount += (service_catalog.price * service_in.quantity)
    
    db.commit()
    db.refresh(db_wo_service)
    return db_wo_service

def update_work_order(db: Session, db_wo: ModelWorkOrder, wo_in: WorkOrderUpdate):
    """
    Actualiza el estado de la orden. 
    Si el estado cambia a 'Completada', se setea la fecha de finalización.
    """
    update_data = wo_in.model_dump(exclude_unset=True)
    
    if update_data.get("status") == "Completada" and not db_wo.completion_date:
        db_wo.completion_date = datetime.now()
        
    for field, value in update_data.items():
        setattr(db_wo, field, value)
    
    db.add(db_wo)
    db.commit()
    db.refresh(db_wo)
    return db_wo
