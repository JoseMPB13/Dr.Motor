from sqlalchemy.orm import Session
from app.models.service import Service as ModelService
from app.schemas.service import ServiceCreate, ServiceUpdate

def get_service(db: Session, service_id: int):
    """
    Busca un servicio por ID.
    """
    return db.query(ModelService).filter(ModelService.id == service_id).first()

def get_service_by_name(db: Session, name: str):
    """
    Busca un servicio por su nombre único.
    """
    return db.query(ModelService).filter(ModelService.name == name).first()

def get_services(db: Session, skip: int = 0, limit: int = 100):
    """
    Lista el catálogo completo de servicios.
    """
    return db.query(ModelService).order_by(ModelService.id).offset(skip).limit(limit).all()

def create_service(db: Session, service: ServiceCreate):
    """
    Añade un nuevo servicio al catálogo maestro.
    """
    db_service = ModelService(
        name=service.name,
        description=service.description,
        price=service.price,
        estimated_duration_minutes=service.estimated_duration_minutes
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, db_service: ModelService, service_in: ServiceUpdate):
    """
    Actualiza la información de un servicio (ej. ajuste de precios).
    """
    update_data = service_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_service, field, value)
    
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def delete_service(db: Session, service_id: int):
    """
    Quita un servicio del catálogo.
    """
    db_service = db.query(ModelService).filter(ModelService.id == service_id).first()
    if db_service:
        db.delete(db_service)
        db.commit()
    return db_service
