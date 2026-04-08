from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_active_user, get_current_active_admin_user
from app.schemas.user import User, UserCreate, UserUpdate
from app.crud import user as crud_user
from app.models.user import User as ModelUser

# --- Enrutador para usuarios ---
router = APIRouter()

@router.get("/me", response_model=User)
def read_current_user(current_user: ModelUser = Depends(get_current_active_user)):
    """
    Retorna el perfil del usuario autenticado actualmente.
    """
    return current_user

@router.get("/", response_model=List[User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(get_current_active_admin_user)
):
    """
    Lista todos los usuarios del sistema. Solo para administradores.
    """
    return crud_user.get_users(db, skip=skip, limit=limit)

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(get_current_active_admin_user)
):
    """
    Registra un nuevo usuario administrativo. Solo admins.
    """
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este email ya está en uso"
        )
    return crud_user.create_user(db=db, user=user_in)

@router.get("/{user_id}", response_model=User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(get_current_active_user)
):
    """
    Obtiene el perfil de un usuario por su ID.
    """
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(get_current_active_admin_user)
):
    """
    Actualiza la información de un usuario.
    """
    db_user = crud_user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return crud_user.update_user(db=db, db_user=db_user, user_in=user_in)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: ModelUser = Depends(get_current_active_admin_user)
):
    """
    Elimina a un usuario.
    """
    db_user = crud_user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    crud_user.delete_user(db=db, user_id=user_id)
    return None
