from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base

class User(Base):
    """
    Modelo que representa a un Usuario del sistema.
    
    Los usuarios son los empleados del taller (Administradores o Recepcionistas)
    que acceden a la plataforma para gestionar las operaciones diarias.
    """
    __tablename__ = "users"

    # Identificador único de usuario
    id = Column(Integer, primary_key=True, index=True)
    
    # Credenciales de acceso
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Estado de la cuenta (permite deshabilitar accesos sin borrar el historial)
    is_active = Column(Boolean, default=True)
    
    # Rol jerárquico ('admin' o 'recepcionista')
    role = Column(String, default="recepcionista", nullable=False)

    # --- Relaciones (Relationship) ---
    
    # Órdenes de trabajo que este usuario ha registrado en el sistema
    work_orders_created = relationship(
        "WorkOrder", 
        back_populates="creator_user", 
        foreign_keys="[WorkOrder.created_by_user_id]"
    )
    
    # Facturas que este usuario ha emitido
    invoices_generated = relationship(
        "Invoice", 
        back_populates="generator_user", 
        foreign_keys="[Invoice.generated_by_user_id]"
    )
    
    # Acciones registradas en la bitácora por este usuario
    audit_logs = relationship("AuditLog", back_populates="changer_user")

    def __repr__(self) -> str:
        """Representación legible del usuario."""
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
