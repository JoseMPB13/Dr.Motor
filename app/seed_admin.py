import sys
import os

# Añadir el directorio raíz al path para poder importar módulos de 'app'
sys.path.append(os.getcwd())

from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.crud import user as crud_user
from app.schemas.user import UserCreate
from app.models.base import Base

def seed_initial_admin():
    """
    Crea un usuario administrador inicial si no existe ninguno.
    Útil para el primer inicio del sistema y pruebas.
    """
    print("Iniciando proceso de seeding...")
    
    # Asegurar que las tablas existan (útil si no se usa Alembic primero)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Verificar si ya existe el admin por email
        admin_email = "admin@workshop.com"
        db_user = crud_user.get_user_by_email(db, email=admin_email)
        
        if db_user:
            print(f"El usuario {admin_email} ya existe. Actualizando contraseña a '123456'...")
            db_user.hashed_password = get_password_hash("123456")
            db.add(db_user)
            db.commit()
            print("Contraseña del administrador actualizada.")
        else:
            # Crear el admin inicial
            admin_in = UserCreate(
                email=admin_email,
                password="123456",
                role="admin",
                is_active=True
            )
            crud_user.create_user(db=db, user=admin_in)
            print("=========================================")
            print(f"ADMIN CREADO EXITOSAMENTE")
            print(f"Email: {admin_email}")
            print(f"Password: admin-password-123")
            print("=========================================")
    except Exception as e:
        print(f"ERROR DURANTE EL SEEDING: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_initial_admin()
