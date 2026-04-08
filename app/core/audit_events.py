import logging
from contextvars import ContextVar
from sqlalchemy import event
from typing import Optional
from app.core.config import settings

from sqlalchemy import text

# ContextVar para almacenar el ID del usuario actual de la solicitud
current_user_id_ctx: ContextVar[Optional[int]] = ContextVar("current_user_id", default=None)

def set_audit_user_id(user_id: Optional[int]):
    """Establece el ID del usuario en el contexto actual."""
    current_user_id_ctx.set(user_id)

def get_audit_user_id() -> Optional[int]:
    """Obtiene el ID del usuario del contexto actual."""
    return current_user_id_ctx.get()

def setup_audit_context(engine):
    """
    Configura el motor para manejar el contexto de usuario según el dialecto.
    """
    
    @event.listens_for(engine, "connect")
    def on_connect(dbapi_connection, connection_record):
        dialect = engine.dialect.name
        
        if dialect == "sqlite":
            # Función personalizada para SQLite
            dbapi_connection.create_function("audit_user_id", 0, get_audit_user_id)
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
            
    @event.listens_for(engine, "begin")
    def on_begin(conn):
        dialect = engine.dialect.name
        user_id = get_audit_user_id()
        
        if dialect == "mssql" and user_id is not None:
            # SESSION_CONTEXT para SQL Server
            conn.execute(text("EXEC sp_set_session_context @key=N'user_id', @value=:val"), {"val": user_id})
