from sqlalchemy.orm import Session
from app.models.client import Client as ModelClient
from app.schemas.client import ClientCreate, ClientUpdate

def get_client(db: Session, client_id: int):
    """
    Busca un cliente específico por su identificador único (ID).
    
    Args:
        db (Session): La sesión activa de la base de datos.
        client_id (int): El identificador del cliente a buscar.
        
    Returns:
        ModelClient: El objeto del modelo Cliente si se encuentra, de lo contrario None.
    """
    return db.query(ModelClient).filter(ModelClient.id == client_id).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100):
    """
    Obtiene una lista paginada de clientes.
    
    Args:
        db (Session): La sesión activa de la base de datos.
        skip (int): Número de registros a saltar (offset).
        limit (int): Número máximo de registros a devolver.
        
    Returns:
        List[ModelClient]: Una lista de objetos Cliente.
    """
    return db.query(ModelClient).order_by(ModelClient.id).offset(skip).limit(limit).all()

def create_client(db: Session, client: ClientCreate):
    """
    Registra un nuevo cliente en la base de datos.
    
    Args:
        db (Session): La sesión activa de la base de datos.
        client (ClientCreate): Datos del cliente validados por Pydantic.
        
    Returns:
        ModelClient: El objeto Cliente recién creado y guardado.
    """
    # Creamos la instancia del modelo SQLAlchemy a partir del schema Pydantic
    db_client = ModelClient(
        first_name=client.first_name,
        last_name=client.last_name,
        phone_number=client.phone_number,
        email=client.email if client.email != "" else None,
        address=client.address
    )
    db.add(db_client)
    db.commit() # Guardamos los cambios permanentemente
    db.refresh(db_client) # Actualizamos el objeto con datos generados por la BD (como el ID)
    return db_client

def update_client(db: Session, db_client: ModelClient, client_in: ClientUpdate):
    """
    Actualiza la información de un cliente existente.
    
    Args:
        db (Session): La sesión activa de la base de datos.
        db_client (ModelClient): El objeto de la base de datos ya cargado.
        client_in (ClientUpdate): Los nuevos datos a aplicar.
        
    Returns:
        ModelClient: El objeto Cliente actualizado.
    """
    # Convertimos el schema a diccionario, excluyendo valores no enviados
    update_data = client_in.model_dump(exclude_unset=True)
    
    # Aplicamos los cambios dinámicamente a los atributos del modelo
    for field, value in update_data.items():
        if field == "email" and value == "":
            value = None
        setattr(db_client, field, value)
    
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int):
    """
    Elimina físicamente a un cliente del sistema.
    
    Args:
        db (Session): La sesión activa de la base de datos.
        client_id (int): El identificador del cliente a borrar.
        
    Returns:
        ModelClient: El objeto Cliente que fue eliminado (si existía).
    """
    db_client = db.query(ModelClient).filter(ModelClient.id == client_id).first()
    if db_client:
        db.delete(db_client)
        db.commit()
    return db_client
