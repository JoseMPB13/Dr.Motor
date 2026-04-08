from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models.audit_log import AuditLog as AuditLogModel
from app.schemas.audit_log import AuditLog as AuditLogSchema

router = APIRouter()

@router.get("/", response_model=List[AuditLogSchema])
def read_audit_logs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(deps.get_current_active_admin_user)
):
    """
    Retrieve audit logs. Only accessible by admins.
    """
    logs = db.query(AuditLogModel).order_by(AuditLogModel.id.desc()).offset(skip).limit(limit).all()
    return logs
