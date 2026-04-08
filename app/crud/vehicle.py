from sqlalchemy.orm import Session
from app.models.vehicle import Vehicle as ModelVehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate

def get_vehicle(db: Session, vehicle_id: int):
    """
    Busca un vehículo por ID.
    """
    return db.query(ModelVehicle).filter(ModelVehicle.id == vehicle_id).first()

def get_vehicle_by_plate(db: Session, license_plate: str):
    """
    Busca un vehículo por su placa única.
    """
    return db.query(ModelVehicle).filter(ModelVehicle.license_plate == license_plate).first()

def get_vehicles_by_client(db: Session, client_id: int):
    """
    Obtiene todos los vehículos asociados a un cliente específico.
    """
    return db.query(ModelVehicle).filter(ModelVehicle.client_id == client_id).all()

def get_vehicles(db: Session, skip: int = 0, limit: int = 100):
    """
    Lista todos los vehículos registrados.
    """
    return db.query(ModelVehicle).order_by(ModelVehicle.id).offset(skip).limit(limit).all()

def create_vehicle(db: Session, vehicle: VehicleCreate):
    """
    Registra un nuevo vehículo y lo asocia a un cliente.
    """
    db_vehicle = ModelVehicle(
        client_id=vehicle.client_id,
        make=vehicle.make,
        model=vehicle.model,
        year=vehicle.year,
        license_plate=vehicle.license_plate,
        vin=vehicle.vin if vehicle.vin != "" else None
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def update_vehicle(db: Session, db_vehicle: ModelVehicle, vehicle_in: VehicleUpdate):
    """
    Actualiza datos técnicos de un vehículo.
    """
    update_data = vehicle_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "vin" and value == "":
            value = None
        setattr(db_vehicle, field, value)
    
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def delete_vehicle(db: Session, vehicle_id: int):
    """
    Elimina físicamente un vehículo.
    """
    db_vehicle = db.query(ModelVehicle).filter(ModelVehicle.id == vehicle_id).first()
    if db_vehicle:
        db.delete(db_vehicle)
        db.commit()
    return db_vehicle
