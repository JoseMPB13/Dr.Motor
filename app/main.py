from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import engine

# --- Inicialización de la Aplicación FastAPI ---

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend para el sistema de gestión de taller mecánico.",
    version="1.0.0",
    # Documentación automática disponible en /docs (Swagger) y /redoc (ReDoc)
)

# --- Configuración de CORS (Cross-Origin Resource Sharing) ---
# Esto permite que el Frontend (React/Vite) se comunique con la API
# aunque estén en diferentes puertos o dominios.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000", # Por si acaso Vite cambia de puerto
        "http://127.0.0.1:3000",
        "*", # Permitir temporalmente todos para resolver el bloqueo de CORS
    ],
    allow_credentials=True,
    allow_methods=["*"], # Permitir todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Permitir todos los encabezados
)

# --- Inclusión de Rutas ---

# Registramos el enrutador de la API v1 bajo el prefijo configurado (por defecto /api/v1)
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    """
    Ruta raíz para verificar que el servidor está en línea.
    """
    return {
        "message": "Bienvenido a la API del Taller Mecánico",
        "docs": "/docs",
        "version": "1.0.0"
    }

# Nota: El servidor se debe ejecutar con:
# uvicorn app.main:app --reload
