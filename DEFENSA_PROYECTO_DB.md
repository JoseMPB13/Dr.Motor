# 🛡️ Guía Maestra de Defensa: Proyecto Dr. Motor
## Especialidad: Ingeniería de Datos y Backend

Este documento es una guía exhaustiva para defender el proyecto ante un tribunal de la materia de **Base de Datos**. Incluye la estructura, flujos de datos, lógica de negocio y un análisis profundo del código SQL y Backend.

---

## 1. Estructura Integral del Proyecto
El proyecto está organizado bajo una arquitectura **Limpia y Desacoplada**, facilitando la escalabilidad y el mantenimiento.

### 1.1. Backend (FastAPI + SQLAlchemy)
-   **`/app/models`**: Definición de tablas y relaciones usando el ORM (SQLAlchemy 2.0).
-   **`/app/schemas`**: Clases de Pydantic para validación de datos (Input/Output).
-   **`/app/crud`**: Lógica de acceso a datos (Separación de intereses: el endpoint no conoce los SQL).
-   **`/app/api`**: Controladores que exponen los recursos vía HTTP/REST.

### 1.2. Base de Datos (SQL Server 2022)
-   **`/sql/master_bootstrap.sql`**: Script único de creación de esquema, triggers, procedimientos y datos semilla.

### 1.3. Frontend (React + Vite)
-   **`/src/pages`**: Vistas modulares (Clientes, Órdenes, Dashboard).
-   **`/src/services`**: Capa de comunicación que consume la API del Backend.

---

## 2. Flujo Operativo del Proyecto (Data Flow)

Para impresionar al tribunal, explica el recorrido de un dato (ej. Crear una Orden de Trabajo):

1.  **Captura (UI):** El usuario completa un formulario en React.
2.  **Validación (Middleware):** El Backend recibe el JSON y **Pydantic** verifica que los campos sean correctos (ej. que un email sea email).
3.  **Persistencia (Backend):** La capa CRUD utiliza SQLAlchemy para traducir el objeto Python a un comando `INSERT` de SQL Server.
4.  **Seguridad de Auditoría (DB):** El motor de SQL detecta el cambio y dispara un **Trigger**. Este trigger guarda el estado del registro antes y después del cambio en una tabla de auditoría.
5.  **Visualización (Dashboard):** El sistema consulta un **Stored Procedure** que agrega los datos de todas las tablas para mostrar métricas en tiempo real en la interfaz.

---

## 3. Análisis Profundo del Código SQL

### 3.1. Diseño de Tablas y Relaciones
El sistema implementa una **Normalización avanzada**. Un ejemplo clave es la tabla de servicios en órdenes de trabajo:

```sql
CREATE TABLE [work_order_services] (
    [work_order_id] INT NOT NULL FOREIGN KEY REFERENCES [work_orders](id),
    [service_id] INT NOT NULL FOREIGN KEY REFERENCES [services](id),
    [quantity] INT DEFAULT 1 NOT NULL,
    [price_at_time] FLOAT NOT NULL, -- INTEGRIDAD HISTÓRICA
    PRIMARY KEY ([work_order_id], [service_id])
);
```

> [!IMPORTANT]
> **Punto de Defensa:** Nota el campo `price_at_time`. Es vital porque si el taller sube los precios en el catálogo de `services`, las facturas antiguas **no deben cambiar**. Capturamos el "snapshot" del precio en el momento de la venta.

### 3.2. Automatización con Triggers (Auditoría JSON)
Este es el "Plus" técnico del proyecto. Usamos Triggers para supervisar cambios sin intervención del programa:

```sql
CREATE TRIGGER audit_update_work_orders ON [work_orders] AFTER UPDATE AS
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation_type, old_value, new_value, changed_by_user_id)
    SELECT 'work_orders', i.id, 'UPDATE', 
           (SELECT * FROM DELETED d WHERE d.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), -- Estado anterior
           (SELECT * FROM INSERTED ins WHERE ins.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), -- Estado nuevo
           CAST(SESSION_CONTEXT(N'user_id') AS INT) FROM INSERTED i;
END
```
**Explicación del código:**
-   `DELETED`: Tabla interna de SQL Server con los datos antes del cambio.
-   `INSERTED`: Tabla interna con los datos nuevos.
-   `FOR JSON PATH`: Convierte las filas en objetos JSON automáticamente.
-   `SESSION_CONTEXT`: Permite pasar variables desde FastAPI (Python) al motor de SQL para saber qué usuario logueado en la web hizo el cambio.

### 3.3. Lógica de Reportes en Stored Procedures
Centralizamos la lógica compleja en la DB para no sobrecargar el servidor de apps:

```sql
CREATE OR ALTER PROCEDURE SP_GetDashboardStats
AS
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM clients) as totalClients,
        (SELECT COUNT(*) FROM work_orders WHERE status IN ('Pendiente', 'En Progreso')) as activeOrders,
        (SELECT ISNULL(SUM(total_amount), 0) FROM invoices WHERE payment_status = 'Pagada') as totalRevenue;
END
```

---

## 4. Funciones Críticas del Backend

### 4.1. Inyección de Contexto de Usuario (Controlador)
Para que los Triggers funcionen, cada transacción inyecta el ID del usuario:

```python
# app/api/deps.py (Simplificado)
def get_db(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    # Inyectamos el ID del usuario en la sesión de SQL Server
    db.execute(text("EXEC sp_set_session_context @key = N'user_id', @value = :id"), {"id": current_user.id})
    try:
        yield db
    finally:
        db.close()
```

### 4.2. Lógica de Negocio en el CRUD
Ejemplo de cómo manejamos la integridad al añadir un servicio:

```python
# app/crud/work_order.py
def add_service_to_work_order(db: Session, work_order_id: int, service_in: WorkOrderServiceCreate):
    # 1. Buscamos el servicio en el catálogo
    service_catalog = db.query(ModelService).get(service_in.service_id)
    
    # 2. Creamos el registro intermedio CAPTURANDO el precio actual
    db_wo_service = ModelWOService(
        work_order_id=work_order_id,
        service_id=service_in.service_id,
        price_at_time=service_catalog.price, # Snapshot de precio
        quantity=service_in.quantity
    )
    db.add(db_wo_service)
    
    # 3. Actualizamos el total de la orden automáticamente
    db_wo = db.query(ModelWorkOrder).get(work_order_id)
    db_wo.total_amount += (service_catalog.price * service_in.quantity)
    
    db.commit()
    return db_wo_service
```

---

## 5. Justificación de Tecnologías (Defensa Teórica)

1.  **¿Por qué SQL Server?** Por su robustez empresarial, soporte nativo de JSON y herramientas de auditoría avanzadas como `SESSION_CONTEXT`.
2.  **¿Por qué FastAPI?** Por su velocidad y el uso de tipos estáticos que minimizan errores de tipo en tiempo de ejecución.
3.  **¿Por qué SQLAlchemy?** Nos permite manipular la base de datos de forma orientada a objetos sin perder el control sobre el SQL generado.
4.  **¿Por qué Normalización?** Hemos seguido hasta la 3era Forma Normal (3NF) para evitar redundancia de datos (ej. los datos del cliente no se repiten en cada orden, solo su ID).

---
*Este proyecto demuestra que la Base de Datos no es solo un almacén, sino un motor activo que gestiona la integridad, la auditoría y el rendimiento de forma autónoma.*
