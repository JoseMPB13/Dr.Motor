from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AuditLogBase(BaseModel):
    table_name: str
    record_id: int
    operation_type: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    changed_by_user_id: Optional[int] = None
    timestamp: datetime

class AuditLog(AuditLogBase):
    id: int

    class Config:
        from_attributes = True
