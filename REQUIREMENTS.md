# 📋 Especificación de Requerimientos de Software (ERS) - Dr. Motor

## 1. Introducción y Propósito

El sistema **Dr. Motor** es una solución de software empresarial diseñada para centralizar, automatizar y profesionalizar la gestión técnica y financiera de un taller mecánico. Este documento define los requerimientos funcionales y no funcionales que garantizan la operatividad, seguridad y escalabilidad del sistema en un entorno de producción real.

---

## 2. Requerimientos Funcionales (Clasificación MoSCoW)

### 2.1. Must Have (Críticos)
- **RF-01: Autenticación y RBAC**: Sistema de login seguro con roles de Administrador y Recepcionista.
- **RF-02: Gestión de Clientes y Vehículos**: CRUD completo de propietarios vinculados a su parque automotor por placa/VIN.
- **RF-03: Ciclo de Vida de OT**: Creación y seguimiento de Órdenes de Trabajo en 4 estados: *Pendiente, En Progreso, Completada, Cancelada*.
- **RF-04: Facturación Automática**: Generación de facturas comerciales al finalizar una OT, con cálculos de impuestos y totales en Bolvianos (Bs.).
- **RF-05: Auditoría Nativa**: Registro inalterable de cada inserción, modificación o eliminación mediante triggers de base de datos.
- **RF-06: Bloqueo de Integridad**: Impedir la edición de órdenes de trabajo cuyas facturas ya han sido marcadas como "Pagadas".

### 2.2. Should Have (Importantes)
- **RF-07: Catálogo de Servicios**: Gestión maestra de precios y tiempos estimados por tipo de labor mecánica.
- **RF-08: Gestión de Personal**: Administración de empleados (Mecánicos) y sus especialidades técnicas.
- **RF-09: Exportación PDF**: Generación de copias físicas/digitales de OTs y Facturas con diseño corporativo.
- **RF-10: Dashboard Financiero**: Visualización de Ingresos Reales vs. Cuentas por Cobrar.

### 2.3. Could Have (Deseables/Futuros)
- **RF-11: Control de Inventario**: Gestión de stock de repuestos y piezas.
- **RF-12: Notificaciones**: Envío automático de estados de reparación vía Email o WhatsApp.
- **RF-13: Citas Online**: Módulo de reserva de turnos por parte de los clientes.

### 2.4. Won't Have (Fuera de Alcance Inicial)
- **RF-14: Contabilidad Integrada**: El sistema no realiza balances contables complejos, solo gestión de ingresos.

---

## 3. Historias de Usuario (HU)

### 👤 Administrador (Gestión Estratégica)
- **HU-A1**: Como administrador, quiero **gestionar los usuarios del sistema**, para controlar quién tiene acceso a la información sensible.
- **HU-A2**: Como administrador, quiero **auditar los logs de cambios**, para identificar responsables de errores o modificaciones manuales en los datos.
- **HU-A3**: Como administrador, quiero **re-iniciar contraseñas de empleados**, para garantizar la continuidad operativa en caso de olvido.

### 👤 Recepcionista (Operación Diaria)
- **HU-R1**: Como recepcionista, quiero **registrar vehículos por placa**, para agilizar la identificación de clientes recurrentes.
- **HU-R2**: Como recepcionista, quiero **generar una OT técnica**, para que el mecánico sepa exactamente qué trabajo realizar.
- **HU-R3**: Como recepcionista, quiero **cobrar servicios**, para liquidar deudas y cerrar el ciclo financiero de la reparación.

---

## 4. Requerimientos No Funcionales (RNF)

| Categoría | Requerimiento | Descripción |
| :--- | :--- | :--- |
| **Seguridad** | Autenticación JWT | Uso de tokens con expiración y payload enriquecido (ID, Rol, Email). |
| **Rendimiento** | Tiempo de Respuesta | Carga de dashboard y listas en menos de 1.5 segundos. |
| **Integridad** | Triggers SQL | La auditoría debe ejecutarse a nivel de motor de BD para evitar bypass desde la App. |
| **Usabilidad** | Diseño Responsive | Interfaz funcional en monitores Full HD y Tablets. |
| **Disponibilidad** | SQL Server 2022 | Soporte nativo para alta disponibilidad y backups transaccionales. |

---

## 5. Auditoría y Trazabilidad

El sistema cumple con estándares de auditoría técnica:
1.  **Captura de Identidad**: Cada cambio en la BD registra el ID del usuario autenticado en la sesión.
2.  **Snapshot de Datos**: Se almacena el estado anterior (`OLD`) y el nuevo (`NEW`) en formato JSON.
3.  **Inalterabilidad**: La tabla de auditoría solo permite inserciones (`INSERT ONLY`), prohibiendo la edición del historial.

---

*Proyecto Dr. Motor - Documento de Especificación de Software v1.2*
