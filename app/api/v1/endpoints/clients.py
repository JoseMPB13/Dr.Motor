from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.client import Client, ClientCreate, ClientUpdate
from app.crud import client as crud_client

# Definición del enrutador de la API para clientes
router = APIRouter()

@router.get("/", response_model=List[Client])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Punto de acceso (Endpoint) para listar todos los clientes.
    """
    clients = crud_client.get_clients(db, skip=skip, limit=limit)
    return clients

@router.post("/", response_model=Client, status_code=status.HTTP_201_CREATED)
def create_client(client_in: ClientCreate, db: Session = Depends(get_db)):
    """
    Punto de acceso para registrar un nuevo cliente.
    
    Lanza un error 400 si se intenta duplicar un email ya registrado.
    """
    return crud_client.create_client(db=db, client=client_in)

@router.get("/{client_id}", response_model=Client)
def read_client(client_id: int, db: Session = Depends(get_db)):
    """
    Punto de acceso para obtener un cliente por su ID.
    
    Lanza un error 404 si el cliente no existe en la base de datos.
    """
    db_client = crud_client.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Cliente no encontrado"
        )
    return db_client

@router.put("/{client_id}", response_model=Client)
def update_client(client_id: int, client_in: ClientUpdate, db: Session = Depends(get_db)):
    """
    Punto de acceso para actualizar los datos de un cliente.
    """
    db_client = crud_client.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Cliente no encontrado para actualizar"
        )
    return crud_client.update_client(db=db, db_client=db_client, client_in=client_in)

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """
    Punto de acceso para eliminar un cliente de forma definitiva.
    """
    db_client = crud_client.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Cliente no encontrado"
        )
    crud_client.delete_client(db=db, client_id=client_id)
    return None
