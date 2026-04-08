# 📡 Referencia de la API - Dr. Motor

Esta documentación detalla los puntos de acceso (endpoints) disponibles en la API de **Dr. Motor**. La API sigue los principios REST y utiliza JSON como formato de intercambio de datos.

---

## 🔒 Autenticación y Seguridad

Todas las solicitudes a la API (excepto el inicio de sesión) requieren un token **JWT** en el encabezado de autorización.

- **Header**: `Authorization: Bearer <TOKEN>`
- **Endpoint de Login**: `POST /api/v1/auth/token`
- **Cuerpo (Form Data)**:
  - `username`: Email del usuario.
  - `password`: Contraseña.

---

## 🏗️ Módulos de la API

### 1. Clientes (`/api/v1/clients`)
Gestiona la base de datos de propietarios de vehículos.
- `GET /`: Listar clientes (con paginación `skip`/`limit`).
- `POST /`: Registrar nuevo cliente.
- `GET /{id}`: Obtener detalles de un cliente.
- `PUT /{id}`: Actualizar información de contacto.
- `DELETE /{id}`: Eliminar registro.

### 2. Vehículos (`/api/v1/vehicles`)
Vinculación de autos con sus respectivos dueños.
- `GET /`: Listar todos los vehículos.
- `POST /`: Registrar vehículo (requiere `client_id`).
- `GET /{id}`: Detalles técnicos del vehículo.
- `PUT /{id}`: Editar modelo/placa/año.
- `DELETE /{id}`: Eliminar registro.

### 3. Órdenes de Trabajo (`/api/v1/work-orders`)
El núcleo operativo del sistema.
- `GET /`: Listar órdenes activas e históricas.
- `POST /`: Crear nueva orden (Estado inicial: `Pendiente`).
- `GET /{id}`: Consultar servicios y diagnóstico de una OT.
- `PATCH /{id}`: Actualizar estado (`Pendiente` -> `En Progreso` -> `Completada`).
- `POST /{id}/services`: Añadir un servicio del catálogo a la orden.

### 4. Facturación (`/api/v1/invoices`)
Gestión financiera y cierre de ventas.
- `GET /`: Listar facturas generadas.
- `GET /{id}`: Ver desglose de una factura.
- `PATCH /{id}`: Actualizar estado de pago (`Pendiente` -> `Pagada`).
- **Bloqueo**: Una factura `Pagada` bloquea automáticamente la edición de la OT vinculada.

### 5. Mecánicos y Servicios (`/api/v1/mechanics` | `/api/v1/services`)
- `/mechanics`: CRUD de personal técnico y especialidades.
- `/services`: Catálogo maestro de servicios con precios base en Bs.

### 6. Auditoría (`/api/v1/audit-logs`)
- `GET /`: Ver historial de cambios (Solo para rol `admin`).
- Muestra: Tabla afectada, acción (INS/UPD/DEL), valores antiguos, valores nuevos y usuario responsable.

---

## 📊 Códigos de Respuesta

| Código | Significado | Descripción |
| :--- | :--- | :--- |
| **200** | OK | Solicitud exitosa. |
| **201** | Created | Recurso creado correctamente. |
| **401** | Unauthorized | Token inválido o expirado. |
| **403** | Forbidden | Permisos insuficientes (Rol incorrecto). |
| **404** | Not Found | El recurso solicitado no existe. |
| **422** | Validation Error | Error en los datos enviados (Pydantic). |
| **500** | Server Error | Error inesperado en el servidor. |

---

## 🛠️ Documentación Interactiva (Swagger)

Para probar la API en vivo, acceda a:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

*© 2026 Dr. Motor - Documentación Técnica de API.*
