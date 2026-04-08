from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime

class AuditLog(Base):
    """
    Modelo de Bitácora de Auditoría (Audit Log).
    
    Registra quién hizo qué y cuándo en las tablas principales del sistema.
    Es fundamental para la trazabilidad y seguridad de la información.
    """
    __tablename__ = "audit_logs"

    # Identificador único de bitácora
    id = Column(Integer, primary_key=True, index=True)
    
    # Nombre de la tabla afectada (ej. 'users', 'clients')
    table_name = Column(String, nullable=False)
    
    # ID del registro modificado en dicha tabla
    record_id = Column(Integer, nullable=False)
    
    # Tipo de acción realizada ('INSERT', 'UPDATE', 'DELETE')
    operation_type = Column(String, nullable=False)
    
    # Estado ANTES del cambio (en formato JSON string o texto plano)
    old_value = Column(Text, nullable=True)
    
    # Estado DESPUÉS del cambio
    new_value = Column(Text, nullable=True)
    
    # Usuario que realizó la acción
    changed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Marca de tiempo exacta del movimiento
    timestamp = Column(DateTime, default=datetime.datetime.now, nullable=False)

    # --- Relaciones (Relationship) ---
    
    # Usuario responsable de la modificación
    changer_user = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        """Representación de la entrada de auditoría."""
        return f"<AuditLog(id={self.id}, table='{self.table_name}', action='{self.operation_type}')>"
