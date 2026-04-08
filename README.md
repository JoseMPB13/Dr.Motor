# 🏁 Dr. Motor - Sistema de Gestión de Taller Mecánico

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-green)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![SQL Server](https://img.shields.io/badge/Database-SQL%20Server%202022-CC2927?logo=microsoft-sql-server&logoColor=white)

**Dr. Motor** es una solución integral diseñada para optimizar la gestión operativa de talleres mecánicos. El sistema permite el control total de clientes, vehículos, órdenes de trabajo, servicios y facturación, todo bajo una arquitectura moderna y segura.

---

## 🚀 Características Principales

- **Gestión de Clientes y Vehículos:** Registro detallado de propietarios y su parque automotor.
- **Órdenes de Trabajo Inteligentes:** Seguimiento en tiempo real del estado de las reparaciones (Pendiente, En Progreso, Completada).
- **Auditoría Nativa:** Registro automático de todos los cambios en la base de datos mediante Triggers (formato JSON).
- **Dashboard de Métricas:** Visualización de ingresos, órdenes activas y rendimiento operativo.
- **Facturación Integrada:** Generación de recibos con integridad de precios históricos.

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy 2.0
- **Seguridad:** JWT (JSON Web Tokens) y Bcrypt para hashing de contraseñas.
- **Base de Datos:** Microsoft SQL Server 2022.

### Frontend
- **Librería:** React + Vite
- **Estilos:** CSS Vanilla (Diseño Premium)
- **Comunicación:** Axios para consumo de API REST.

---

## 📋 Requisitos Previos

- Python 3.11+
- Node.js (para el frontend)
- Microsoft SQL Server 2022 (o superior)

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/JoseMPB13/Dr.Motor.git
cd Dr.Motor
```

### 2. Configurar el Backend
```bash
# Crear entorno virtual
python -m venv venv
source venv/Scripts/activate  # En Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (.env)
# DATABASE_URL=mssql+pyodbc://usuario:password@localhost/DrMotorDB?driver=ODBC+Driver+17+for+SQL+Server
```

### 3. Configurar la Base de Datos
Ejecutar el script `/sql/master_bootstrap.sql` en su instancia de SQL Server para crear el esquema, los triggers y los procedimientos almacenados.

### 4. Configurar el Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Documentación de Defensa (Académico)

Si estás revisando este proyecto para una defensa de la materia de **Base de Datos**, consulta los siguientes archivos detallados:
- [Guía de Defensa de Base de Datos](DEFENSA_PROYECTO_DB.md)
- [Diseño del Modelo Relacional](DATABASE_DESIGN.md)

---

## 🖋️ Autor
- **Jose Manuel PB** - [@JoseMPB13](https://github.com/JoseMPB13)

---
*Desarrollado con ❤️ para la eficiencia automotriz.*
