from sqlalchemy import create_engine, event, Table
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.mssql.base import MSDialect
from app.core.config import settings
from app.core.audit_events import setup_audit_context

# Forzar desactivación de cláusula OUTPUT en SQL Server (conflicto con triggers)
# En SQLAlchemy 2.0, esto se aplica a través de eventos en los metadatos
@event.listens_for(Table, "after_parent_attach")
def set_implicit_returning(target, parent):
    target.implicit_returning = False

# --- Configuración del Motor de Base de Datos ---

# Configuración de base de datos dinámica según el motor detectado
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

# Motor de base de datos SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args=connect_args,
    # El pool_pre_ping es esencial para conexiones persistentes en SQL Server
    pool_pre_ping=True if not is_sqlite else False
)

# Configurar el contexto de auditoría (Triggers)
setup_audit_context(engine)

# --- Sesión de Base de Datos ---

# SessionLocal es una fábrica de sesiones de base de datos.
# No es una sesión en sí, sino una clase que instancia sesiones cuando es llamada.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependencia de FastAPI que proporciona una sesión de base de datos por solicitud.
    
    Asegura que cada solicitud HTTP tenga su propia conexión a la base de datos y que
    esta se cierre correctamente una vez finalizada la operación (éxito o error).
    
    Yields:
        Session: Sesión activa de SQLAlchemy para interactuar con la BD.
    """
    db = SessionLocal()
    try:
        # Entrega la sesión al controlador/función solicitante
        yield db
    finally:
        # Cierra la sesión sin importar el resultado para liberar recursos
        db.close()
