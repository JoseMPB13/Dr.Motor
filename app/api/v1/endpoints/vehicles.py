from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api import deps
from app.schemas.vehicle import Vehicle, VehicleCreate, VehicleUpdate
from app.crud import vehicle as crud_vehicle
from app.crud import client as crud_client
from app.models.user import User as ModelUser

# --- Router para vehículos ---
router = APIRouter()

@router.get("/", response_model=List[Vehicle])
def read_vehicles(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Lista todos los vehículos registrados en el taller.
    """
    return crud_vehicle.get_vehicles(db, skip=skip, limit=limit)

@router.post("/", response_model=Vehicle, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Registra un vehículo. 
    Lanza un error 404 si el cliente_id no existe y un 400 si la placa está duplicada.
    """
    # Validar existencia del cliente
    client = crud_client.get_client(db, client_id=vehicle_in.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="El cliente ingresado no existe")
    
    # Validar duplicidad de placa
    db_vehicle = crud_vehicle.get_vehicle_by_plate(db, license_plate=vehicle_in.license_plate)
    if db_vehicle:
        raise HTTPException(status_code=400, detail="Esta placa ya está registrada")
    
    return crud_vehicle.create_vehicle(db=db, vehicle=vehicle_in)

@router.get("/{vehicle_id}", response_model=Vehicle)
def read_vehicle(
    vehicle_id: int, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Obtiene los detalles técnicos de un vehículo por ID.
    """
    db_vehicle = crud_vehicle.get_vehicle(db, vehicle_id=vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return db_vehicle

@router.put("/{vehicle_id}", response_model=Vehicle)
def update_vehicle(
    vehicle_id: int, 
    vehicle_in: VehicleUpdate, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Actualiza la información técnica de un vehículo.
    """
    db_vehicle = crud_vehicle.get_vehicle(db, vehicle_id=vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return crud_vehicle.update_vehicle(db=db, db_vehicle=db_vehicle, vehicle_in=vehicle_in)

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int, 
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(deps.get_current_active_user)
):
    """
    Baja de un vehículo del sistema.
    """
    db_vehicle = crud_vehicle.get_vehicle(db, vehicle_id=vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    crud_vehicle.delete_vehicle(db=db, vehicle_id=vehicle_id)
    return None
