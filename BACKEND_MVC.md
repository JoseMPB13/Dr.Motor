# ⚙️ Arquitectura Backend MVC - Dr. Motor

El backend de **Dr. Motor** está construido sobre **FastAPI**, utilizando un patrón **Modelo-Vista-Controlador (MVC)** desacoplado para garantizar la mantenibilidad y la escalabilidad. Este documento detalla la lógica interna y el flujo de datos del servidor.

---

## 1. Capas del Sistema (MVC Adaptado)

### 1.1. El Modelo (`app/models`)

Representa la estructura de datos persistente en **SQL Server**.

- **SQLAlchemy 2.0**: Utilizamos la sintaxis moderna de `Mapped` y `mapped_column` para un tipado fuerte.
- **Relaciones**: Definidas mediante `relationship()` con carga diferida (`lazy='select'`) para optimizar el rendimiento.

### 1.2. La Vista / DTO (`app/schemas`)

En FastAPI, las "vistas" son los esquemas de **Pydantic**.

- **Validación**: Aseguran que los datos de entrada cumplan con los formatos técnicos (email, longitudes, tipos).
- **Serialización**: Transforman los objetos de base de datos en JSON limpio, excluyendo campos sensibles como `hashed_password`.

### 1.3. El Controlador (`app/api/v1/endpoints`)

Orquestan la lógica de los recursos.

- **Inyección de Dependencias**: Uso sistemático de `Depends(get_db)` y `Depends(get_current_user)`.
- **Enrutamiento**: División lógica por módulos (Clients, Vehicles, WorkOrders) para facilitar la navegación del código.

---

## 2. Flujo de una Solicitud (Request Lifecycle)

1.  **Middleware de CORS**: Verifica el origen de la petición (`http://localhost:5173`).
2.  **Dependencia de Seguridad**: Decodifica el JWT, valida la expiración y recupera el usuario de la BD.
3.  **Inyección de Contexto**: El ID del usuario se inyecta en el `SESSION_CONTEXT` de SQL Server para la auditoría.
4.  **Lógica CRUD**: Se invoca la función específica en `app/crud/` para interactuar con el motor de base de datos.
5.  **Trigger de Auditoría**: El motor de BD detecta el cambio y registra el log automáticamente.
6.  **Respuesta Pydantic**: Los datos se validan contra el schema de salida y se envían al frontend.

---

## 3. Gestión de Seguridad y JWT

Implementamos un flujo de autenticación robusto:

- **Hashing**: `bcrypt` (v3.2.2) para almacenamiento seguro de credenciales.
- **Tokens**: JWT con algoritmo `HS256`.
- **RBAC (Role Based Access Control)**:
  - `get_current_active_user`: Acceso general a empleados.
  - `get_current_active_admin_user`: Acceso restringido a módulos de configuración y auditoría.

---

## 4. Manejo Global de Errores

El sistema utiliza excepciones personalizadas de FastAPI para devolver respuestas coherentes:

- `HTTP_404_NOT_FOUND`: Para recursos inexistentes.
- `HTTP_401_UNAUTHORIZED`: Para sesiones expiradas.
- `HTTP_422_UNPROCESSABLE_ENTITY`: Para errores de validación de formulario.
- `HTTP_403_FORBIDDEN`: Para intentos de acceso sin privilegios.

---

## 5. Pruebas y Calidad de Código

- **Pytest**: Suite de pruebas automáticas (en desarrollo).
- **Uvicorn**: Servidor ASGI de alto rendimiento con soporte para recarga en caliente (`--reload`).
- **Swagger**: Documentación auto-generada compatible con el estándar OpenAPI 3.0.

---

_Proyecto Dr. Motor - Documentación de Ingeniería Backend v1.5_
