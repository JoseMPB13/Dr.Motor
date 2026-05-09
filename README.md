# 🏎️ Dr. Motor - Sistema de Gestión de Taller Mecánico

<div align="center">
  <img src="https://img.shields.io/badge/Estado-Producci%C3%B3n-success?style=for-the-badge" alt="Estado">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Database-SQL%20Server%202022-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white" alt="SQL Server">
</div>

---

**Dr. Motor** es una solución integral y moderna de grado empresarial diseñada para optimizar la gestión operativa, administrativa y financiera de talleres mecánicos. Desarrollado con una arquitectura robusta, permite el control total de clientes, vehículos, órdenes de trabajo, inventario y facturación, garantizando la seguridad e integridad de los datos desde la interfaz de usuario hasta la base de datos.

---

## ✨ Características Principales

### 👨‍🔧 Gestión Operativa

- **Registro de Clientes y Vehículos:** Control detallado de los propietarios y su parque automotor, incluyendo el historial clínico de reparaciones de cada vehículo.
- **Órdenes de Trabajo Inteligentes:** Seguimiento en tiempo real del ciclo de vida de las reparaciones (Pendiente, En Progreso, Completada) con sincronización Frontend-Backend.
- **Control de Servicios y Mecánicos:** Catálogo dinámico de servicios ofrecidos por el taller con asignación directa y evaluación de rendimiento de los mecánicos responsables.

### 📊 Administración y Finanzas

- **Dashboard de Métricas Financieras:** Panel de control interactivo con métricas vitales: ingresos reales (Pagados) vs. Cuentas por Cobrar (Pendientes), volumen de órdenes activas y servicios más demandados.
- **Facturación Integrada:** Generación de facturas y recibos asegurando la integridad de precios históricos, incluso si los costos de los servicios cambian en el futuro.
- **Exportación a PDF:** Generación de copias físicas formales de Órdenes de Trabajo y Facturas con la marca corporativa del negocio.

### 🛡️ Seguridad y Auditoría (Nivel Empresarial)

- **Control de Acceso Basado en Roles (RBAC):** Permisos estrictos adaptados para perfiles de `Administrador` (acceso total) y `Recepcionista` (acceso operativo).
- **Auditoría Nativa inalterable:** Innovador sistema de _Triggers_ implementado directamente en SQL Server que captura el 100% de los cambios (INSERT, UPDATE, DELETE) en formato JSON, manteniendo un historial con contexto del usuario responsable, evitando manipulaciones externas.
- **Protección de Datos:** Cifrado robusto de contraseñas mediante Bcrypt y sistema de autenticación segura utilizando JWT (JSON Web Tokens).

---

## 🛠️ Stack Tecnológico

El proyecto está construido utilizando un stack moderno, priorizando el rendimiento, la escalabilidad y una mantenibilidad excepcional.

### ⚙️ Backend (API REST)

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+) - Proporciona alta velocidad de respuesta y autogeneración de documentación (Swagger UI).
- **ORM:** SQLAlchemy 2.0 para un mapeo relacional seguro y eficiente.
- **Seguridad:** JWT y Bcrypt.
- **Base de Datos:** Microsoft SQL Server 2022 (Soporte nativo para JSON y drivers ODBC v17/18).

### 🖥️ Frontend (SPA)

- **Librería Core:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) - Garantiza un renderizado ultrarrápido y una experiencia de usuario fluida.
- **Estilos:** CSS Vanilla con una arquitectura de diseño "Premium", enfocada en una excelente Experiencia de Usuario (UX) sin depender de pesados frameworks CSS.
- **Comunicación HTTP:** Axios integrado con interceptores avanzados para el manejo automático de tokens de autorización.
- **Enrutamiento:** React Router DOM para una navegación ágil y protección de rutas según el rol del usuario.

---

## 🚀 Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu entorno local para poder ejecutar el proyecto:

- **Python** (v3.11 o superior).
- **Node.js** (v18+) junto con npm o yarn.
- **Microsoft SQL Server 2022** (o versión compatible) accesible local o remotamente, junto con SQL Server Management Studio (SSMS) o Azure Data Studio.
- ODBC Driver 17 (o 18) for SQL Server instalado en tu sistema.

---

## ⚙️ Guía de Instalación y Configuración

Sigue estos pasos para desplegar el proyecto en tu entorno de desarrollo.

### 1. Clonar el repositorio

```bash
git clone https://github.com/JoseMPB13/Dr.Motor.git
cd Dr.Motor
```

### 2. Configuración de la Base de Datos

1. Abre tu gestor de base de datos preferido conectado a tu instancia de SQL Server.
2. Ejecuta el contenido del script de inicialización ubicado en `sql/master_bootstrap.sql`. Este script construirá automáticamente el esquema completo: base de datos, tablas, relaciones foráneas, procedimientos almacenados y los triggers de auditoría vitales para el funcionamiento del sistema.

### 3. Configuración del Backend

```bash
# Crear un entorno virtual aislado
python -m venv venv

# Activar el entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Instalar todas las dependencias requeridas
pip install -r requirements.txt

# Configurar variables de entorno (.env)
# Crea un archivo .env en la raíz del proyecto basándote en este formato:
# DATABASE_URL=mssql+pyodbc://tu_usuario:tu_password@localhost/DrMotorDB?driver=ODBC+Driver+17+for+SQL+Server
# SECRET_KEY=tu_super_secreto_para_jwt

# Iniciar el servidor de desarrollo de FastAPI
uvicorn app.main:app --reload
```

La API estará operativa en `http://localhost:8000`. Puedes probar los endpoints e inspeccionar los modelos a través de la interfaz Swagger generada automáticamente en `http://localhost:8000/docs`.

### 4. Configuración del Frontend

```bash
# Navegar al directorio de la aplicación cliente
cd frontend

# Instalar las dependencias de Node
npm install

# Iniciar el servidor de desarrollo de Vite
npm run dev
```

La aplicación web estará disponible en tu navegador en `http://localhost:5173`.

---

## 📚 Documentación Técnica Detallada

Para desarrolladores, evaluadores técnicos o académicos que deseen profundizar en la ingeniería del proyecto, **Dr. Motor** cuenta con documentación exhaustiva:

- 🏗️ **Arquitectura y Diseño:**
  - [Diseño del Modelo Relacional](DATABASE_DESIGN.md) - Estructura de la base de datos.
  - [Arquitectura Backend MVC](BACKEND_MVC.md) - Patrones de diseño de la API.
  - [Estructura Frontend UI](FRONTEND_UI.md) - Jerarquía y flujo de React.
- 📝 **Ingeniería y Análisis:**
  - [Análisis y Roadmap del Proyecto](PROJECT_ANALYSIS.md) - Estado técnico y próximos hitos.
  - [Estándares de Código](CODE_STANDARDS.md) - Reglas de contribución.
  - [Referencia de la API REST](API_REFERENCE.md) - Documentación manual de endpoints.
- 🎓 **Ámbito Académico:**
  - [Guía de Defensa de Base de Datos](DEFENSA_PROYECTO_DB.md) - Documento clave que justifica las decisiones técnicas en la capa de datos (Triggers, Procedimientos, Bloqueos de concurrencia).

---

## 🎯 Roadmap (Próximos Pasos)

- [ ] **UX Enhancements:** Implementación de un sistema robusto de notificaciones tipo "Toast" para feedback inmediato.
- [ ] **Expansión Modular:** Desarrollo del módulo avanzado de Gestión de Inventario (Repuestos y Consumibles vinculados a las OTs).
- [ ] **Portal del Cliente:** Creación de un portal público y seguro para que los clientes puedan consultar el estado de reparación de sus vehículos introduciendo su placa.

---

## 🖋️ Autor

Diseñado y desarrollado por **Jose MPB**

[![GitHub](https://img.shields.io/badge/GitHub-JoseMPB13-181717?style=for-the-badge&logo=github)](https://github.com/JoseMPB13)

---

<div align="center">
  <i>Desarrollado con ❤️ para impulsar la eficiencia tecnológica en el sector automotriz.</i>
</div>
