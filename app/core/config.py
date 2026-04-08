from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Configuración centralizada de la aplicación utilizando Pydantic Settings.
    
    Esta clase lee las variables de entorno definidas en el archivo .env,
    permitiendo una gestión segura y flexible de las configuraciones entre
    entornos (desarrollo, producción, etc.).
    """
    PROJECT_NAME: str = "Taller Mecánico Management System"
    API_V1_STR: str = "/api/v1"
    
    # URL de conexión a la base de datos
    # Por defecto usa SQLite si no hay una variable DATABASE_URL definida
    DATABASE_URL: str = "sqlite:///./workshop.db"
    
    # Seguridad (JWT)
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 días

    # Configuración del archivo .env
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

# Instancia global de configuración para ser utilizada en toda la aplicación
settings = Settings()
