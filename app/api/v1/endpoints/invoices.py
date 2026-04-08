from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api import deps
from app.schemas.invoice import Invoice, InvoiceCreate, InvoiceUpdate
from app.crud import invoice as crud_invoice
from app.crud import work_order as crud_wo
from app.models.user import User as ModelUser

# --- Router para Facturación ---
router = APIRouter()

@router.get("/", response_model=List[Invoice])
def read_invoices(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Lista todas las facturas emitidas por el taller.
    """
    return crud_invoice.get_invoices(db, skip=skip, limit=limit)

@router.post("/", response_model=Invoice, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_in: InvoiceCreate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Genera una factura para una orden de trabajo.
    Lanza error si la OT ya tiene una factura o si la OT no existe.
    """
    # 1. Validar que la OT exista y esté completada (opcional, pero recomendado)
    db_wo = crud_wo.get_work_order(db, work_order_id=invoice_in.work_order_id)
    if not db_wo:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
        
    if db_wo.status != "Completada":
        raise HTTPException(
            status_code=400, 
            detail="Solo se pueden facturar órdenes de trabajo completadas"
        )
        
    # 2. Validar que no exista ya una factura para esta OT (relación 1-a-1)
    existing_invoice = crud_invoice.get_invoice_by_work_order(db, work_order_id=invoice_in.work_order_id)
    if existing_invoice:
        raise HTTPException(status_code=400, detail="Esta orden ya ha sido facturada")
        
    return crud_invoice.create_invoice(db=db, invoice=invoice_in)

@router.get("/{invoice_id}", response_model=Invoice)
def read_invoice(
    invoice_id: int, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Detalle de una factura específica.
    """
    db_invoice = crud_invoice.get_invoice(db, invoice_id=invoice_id)
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return db_invoice

@router.patch("/{invoice_id}", response_model=Invoice)
def pay_invoice(
    invoice_id: int, 
    status_in: InvoiceUpdate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Actualiza el estado de pago de una factura (ej. de 'Pendiente' a 'Pagada').
    """
    db_invoice = crud_invoice.get_invoice(db, invoice_id=invoice_id)
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
        
    return crud_invoice.update_invoice_status(db=db, db_invoice=db_invoice, status_in=status_in)
