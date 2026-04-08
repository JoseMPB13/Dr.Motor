from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.api import deps
from app.models.user import User as ModelUser

router = APIRouter()

@router.get("/")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Obtiene el resumen del dashboard delegando la lógica a SQL Server.
    """
    # 1. Ejecutar SP_GetDashboardStats que devuelve dos conjuntos de resultados
    result = db.execute(text("EXEC SP_GetDashboardStats"))
    
    # 2. Capturar primer resultado: Métricas generales
    stats_row = result.fetchone()
    if stats_row:
        stats = {
            "totalClients": stats_row[0],
            "activeOrders": stats_row[1],
            "totalRevenue": stats_row[2],
            "pendingRevenue": stats_row[3]
        }
    else:
        stats = {"totalClients": 0, "activeOrders": 0, "totalRevenue": 0, "pendingRevenue": 0}
    
    # 3. Mover al siguiente conjunto de resultados: Distribución de estados
    # En SQLAlchemy 2.0 con drivers como pyodbc, usamos el cursor subyacente
    if result.cursor.nextset():
        distribution_rows = result.fetchall()
        # Acceso por índice para evitar errores de mapeo en el segundo resultset
        distribution = { row[0]: row[1] for row in distribution_rows }
    else:
        distribution = {}

    return {
        "stats": stats,
        "distribution": distribution
    }
