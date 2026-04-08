from sqlalchemy.orm import Session
from app.models.user import User as ModelUser
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

def get_user(db: Session, user_id: int):
    """
    Obtiene un usuario por su identificador único.
    """
    return db.query(ModelUser).filter(ModelUser.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """
    Busca un usuario en la base de datos por su email.
    """
    return db.query(ModelUser).filter(ModelUser.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Lista todos los usuarios con paginación.
    """
    return db.query(ModelUser).order_by(ModelUser.id).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    """
    Crea un nuevo usuario hasheando su contraseña antes de guardarla.
    """
    # Importante: No guardamos la contraseña en texto plano
    hashed_password = get_password_hash(user.password)
    db_user = ModelUser(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        is_active=user.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: ModelUser, user_in: UserUpdate):
    """
    Actualiza la información de un usuario, incluyendo su contraseña si se provee.
    """
    update_data = user_in.model_dump(exclude_unset=True)
    
    # Si se envía una nueva contraseña, la hasheamos antes de actualizar
    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        db_user.hashed_password = hashed_password
        del update_data["password"] # Ya la actualizamos manualmente arriba
    
    # Actualizar el resto de campos
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    """
    Elimina físicamente a un usuario.
    """
    db_user = db.query(ModelUser).filter(ModelUser.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user
