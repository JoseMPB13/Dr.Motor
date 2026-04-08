from sqlalchemy.orm import Session
from app.models.mechanic import Mechanic as ModelMechanic
from app.schemas.mechanic import MechanicCreate, MechanicUpdate

def get_mechanic(db: Session, mechanic_id: int):
    """
    Busca un mecánico por ID.
    """
    return db.query(ModelMechanic).filter(ModelMechanic.id == mechanic_id).first()

def get_mechanics(db: Session, skip: int = 0, limit: int = 100):
    """
    Lista todos los mecánicos.
    """
    return db.query(ModelMechanic).order_by(ModelMechanic.id).offset(skip).limit(limit).all()

def create_mechanic(db: Session, mechanic: MechanicCreate):
    """
    Registra un nuevo mecánico en la base de datos.
    """
    db_mechanic = ModelMechanic(
        first_name=mechanic.first_name,
        last_name=mechanic.last_name,
        specialty=mechanic.specialty,
        phone_number=mechanic.phone_number
    )
    db.add(db_mechanic)
    db.commit()
    db.refresh(db_mechanic)
    return db_mechanic

def update_mechanic(db: Session, db_mechanic: ModelMechanic, mechanic_in: MechanicUpdate):
    """
    Actualiza datos técnicos o de contacto de un mecánico.
    """
    update_data = mechanic_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_mechanic, field, value)
    
    db.add(db_mechanic)
    db.commit()
    db.refresh(db_mechanic)
    return db_mechanic

def delete_mechanic(db: Session, mechanic_id: int):
    """
    Elimina a un mecánico.
    """
    db_mechanic = db.query(ModelMechanic).filter(ModelMechanic.id == mechanic_id).first()
    if db_mechanic:
        db.delete(db_mechanic)
        db.commit()
    return db_mechanic
