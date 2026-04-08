from sqlalchemy.orm import Session
from datetime import datetime

from app.models.invoice import Invoice as ModelInvoice
from app.models.work_order import WorkOrder as ModelWorkOrder
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate

def get_invoice(db: Session, invoice_id: int):
    """
    Obtiene una factura por ID.
    """
    return db.query(ModelInvoice).filter(ModelInvoice.id == invoice_id).first()

def get_invoice_by_work_order(db: Session, work_order_id: int):
    """
    Obtiene la factura asociada a una OT.
    """
    return db.query(ModelInvoice).filter(ModelInvoice.work_order_id == work_order_id).first()

def get_invoices(db: Session, skip: int = 0, limit: int = 100):
    """
    Lista las facturas emitidas.
    """
    return db.query(ModelInvoice).order_by(ModelInvoice.id).offset(skip).limit(limit).all()

def create_invoice(db: Session, invoice: InvoiceCreate):
    """
    Genera una factura a partir de una Orden de Trabajo.
    Captura el total_amount de la OT en ese momento.
    """
    # 1. Obtener la OT para jalar el monto acumulado
    db_wo = db.query(ModelWorkOrder).filter(ModelWorkOrder.id == invoice.work_order_id).first()
    if not db_wo:
        return None
        
    # 2. Crear la factura con el total de la OT
    db_invoice = ModelInvoice(
        work_order_id=invoice.work_order_id,
        total_amount=db_wo.total_amount,
        payment_status=invoice.payment_status,
        generated_by_user_id=invoice.generated_by_user_id,
        invoice_date=datetime.now()
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice_status(db: Session, db_invoice: ModelInvoice, status_in: InvoiceUpdate):
    """
    Permite marcar la factura como 'Pagada' o 'Anulada'.
    """
    if status_in.payment_status:
        db_invoice.payment_status = status_in.payment_status
        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)
    return db_invoice
