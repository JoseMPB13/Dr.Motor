from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api import deps
from app.schemas.mechanic import Mechanic, MechanicCreate, MechanicUpdate
from app.crud import mechanic as crud_mechanic
from app.models.user import User as ModelUser

# --- Router para mecánicos ---
router = APIRouter()

@router.get("/", response_model=List[Mechanic])
def read_mechanics(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Lista el personal mecánico del taller.
    """
    return crud_mechanic.get_mechanics(db, skip=skip, limit=limit)

@router.post("/", response_model=Mechanic, status_code=status.HTTP_201_CREATED)
def create_mechanic(
    mechanic_in: MechanicCreate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Registra un nuevo mecánico en la plantilla.
    """
    return crud_mechanic.create_mechanic(db=db, mechanic=mechanic_in)

@router.get("/{mechanic_id}", response_model=Mechanic)
def read_mechanic(
    mechanic_id: int, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Obtiene los detalles de un mecánico por ID.
    """
    db_mechanic = crud_mechanic.get_mechanic(db, mechanic_id=mechanic_id)
    if not db_mechanic:
        raise HTTPException(status_code=404, detail="Mecánico no encontrado")
    return db_mechanic

@router.put("/{mechanic_id}", response_model=Mechanic)
def update_mechanic(
    mechanic_id: int, 
    mechanic_in: MechanicUpdate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Actualiza la información (especialidad, teléfono) de un mecánico.
    """
    db_mechanic = crud_mechanic.get_mechanic(db, mechanic_id=mechanic_id)
    if not db_mechanic:
        raise HTTPException(status_code=404, detail="Mecánico no encontrado")
    return crud_mechanic.update_mechanic(db=db, db_mechanic=db_mechanic, mechanic_in=mechanic_in)

@router.delete("/{mechanic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mechanic(
    mechanic_id: int, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Baja de un mecánico del sistema.
    """
    db_mechanic = crud_mechanic.get_mechanic(db, mechanic_id=mechanic_id)
    if not db_mechanic:
        raise HTTPException(status_code=404, detail="Mecánico no encontrado")
    crud_mechanic.delete_mechanic(db=db, mechanic_id=mechanic_id)
    return None
