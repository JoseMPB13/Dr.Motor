# 📖 Guía de Instalación y Configuración - Dr. Motor

Esta guía proporciona instrucciones detalladas para configurar el entorno de desarrollo y poner en marcha el sistema **Dr. Motor** desde cero.

---

## 🛠️ 1. Requisitos Previos

Antes de comenzar, asegúrese de tener instalados los siguientes componentes en su sistema:

- **Python 3.10 o superior**: [Descargar Python](https://www.python.org/downloads/)
- **Node.js v18 o superior**: [Descargar Node.js](https://nodejs.org/)
- **SQL Server Express 2022**: [Descargar SQL Server](https://www.microsoft.com/es-es/sql-server/sql-server-downloads)
- **ODBC Driver 17 para SQL Server**: [Descargar Driver](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
- **Git** (Opcional): Para control de versiones.

---

## 🐍 2. Configuración del Backend

1.  **Crear Entorno Virtual**:
    Abra una terminal en la raíz del proyecto y ejecute:
    ```bash
    python -m venv venv
    ```

2.  **Activar Entorno Virtual**:
    - **Windows**: `.\venv\Scripts\activate`
    - **Linux/Mac**: `source venv/bin/activate`

3.  **Instalar Dependencias**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configurar Variables de Entorno**:
    Cree un archivo `.env` en la raíz del proyecto (o edite el existente) con el siguiente contenido:
    ```env
    DATABASE_URL="mssql+pyodbc:///?odbc_connect=DRIVER%3D%7BODBC+Driver+17+for+SQL+Server%7D%3BSERVER%3D<TU_SERVIDOR>%5CSQLEXPRESS%3BDATABASE%3DDrMotorDB%3BTrusted_Connection%3Dyes%3B"
    SECRET_KEY=tu-llave-secreta-muy-larga
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=1440
    ```
    > [!IMPORTANT]
    > Reemplace `<TU_SERVIDOR>` por el nombre de su instancia de SQL Server (ej: `DESKTOP-ABC1234`).

---

## 🗄️ 3. Configuración de la Base de Datos (SQL Server)

1.  **Crear la Base de Datos**:
    Abra *SQL Server Management Studio (SSMS)* y ejecute:
    ```sql
    CREATE DATABASE DrMotorDB;
    GO
    ```

2.  **Habilitar Conexiones TCP/IP**:
    - Abra el *SQL Server Configuration Manager*.
    - Vaya a `SQL Server Network Configuration` > `Protocols for SQLEXPRESS`.
    - Habilite `TCP/IP`.
    - Reinicie el servicio de SQL Server.

3.  **Inicializar Esquema (Seeding Admin)**:
    Una vez configurado el `.env`, ejecute el script de seeding para crear las tablas y el primer administrador:
    ```bash
    python app/seed_admin.py
    ```

---

## ⚛️ 4. Configuración del Frontend

1.  **Instalar Dependencias**:
    ```bash
    cd frontend
    npm install
    ```

2.  **Verificar Cliente API**:
    Asegúrese de que `frontend/src/api/client.ts` apunta a `http://localhost:8000/api/v1`.

---

## 🚀 5. Ejecución del Sistema

### Iniciar Backend (Puerto 8000)
```bash
# Desde la raíz con el venv activo
uvicorn app.main:app --reload
```

### Iniciar Frontend (Puerto 5173)
```bash
# Desde la carpeta /frontend
npm run dev
```

---

## 🛠️ 6. Solución de Problemas Comunes

- **Error de Conexión ODBC**: Verifique que el nombre del servidor en el `.env` sea idéntico al que usa en SSMS. Asegúrese de que el Driver 17 esté instalado.
- **Error de CORS**: Si el frontend no puede comunicarse, verifique la configuración de `allow_origins` en `app/main.py`.
- **Error de Bcrypt**: Si hay errores al hacer login, verifique que la versión de `bcrypt` en el venv sea la `3.2.2` (según `requirements.txt`).

---

*Para más detalles técnicos, consulte la [Referencia de la API](file:///c:/Users/josem/Desktop/c/API_REFERENCE.md).*
