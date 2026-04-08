from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api import deps
from app.schemas.service import Service, ServiceCreate, ServiceUpdate
from app.crud import service as crud_service
from app.models.user import User as ModelUser

# --- Router para el catálogo de servicios ---
router = APIRouter()

@router.get("/", response_model=List[Service])
def read_services(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Consulta el catálogo de servicios ofrecidos por el taller.
    """
    return crud_service.get_services(db, skip=skip, limit=limit)

@router.post("/", response_model=Service, status_code=status.HTTP_201_CREATED)
def create_service(
    service_in: ServiceCreate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Crea un nuevo servicio en el catálogo maestro.
    """
    db_service = crud_service.get_service_by_name(db, name=service_in.name)
    if db_service:
        raise HTTPException(status_code=400, detail="Este servicio ya existe en el catálogo")
    return crud_service.create_service(db=db, service=service_in)

@router.get("/{service_id}", response_model=Service)
def read_service(
    service_id: int, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Detalle de un servicio específico.
    """
    db_service = crud_service.get_service(db, service_id=service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return db_service

@router.put("/{service_id}", response_model=Service)
def update_service(
    service_id: int, 
    service_in: ServiceUpdate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Actualiza el catálogo (nombre, precio, descripción).
    """
    db_service = crud_service.get_service(db, service_id=service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return crud_service.update_service(db=db, db_service=db_service, service_in=service_in)

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Elimina un servicio del catálogo.
    """
    db_service = crud_service.get_service(db, service_id=service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    crud_service.delete_service(db=db, service_id=service_id)
    return None
