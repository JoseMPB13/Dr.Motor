/*
=============================================================================
DR. MOTOR - MASTER BOOTSTRAP SCRIPT (SQL Server Express 2022)
=============================================================================
Este script construye la base de datos completa: Esquema, Triggers y SPs.
*/

USE [master];
GO

-- 1. CREACIÓN DE LA BASE DE DATOS
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'DrMotorDB')
BEGIN
    CREATE DATABASE [DrMotorDB];
    PRINT 'Base de datos DrMotorDB creada.';
END
GO

USE [DrMotorDB];
GO

-- 2. ELIMINACIÓN DE TABLAS EXISTENTES (PARA REINICIO LIMPIO)
-- (Omitido por seguridad, pero se asume base de datos nueva)

-- 3. CREACIÓN DE TABLAS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE [users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [email] NVARCHAR(255) NOT NULL UNIQUE,
        [hashed_password] NVARCHAR(MAX) NOT NULL,
        [is_active] BIT DEFAULT 1,
        [role] NVARCHAR(50) DEFAULT 'recepcionista' NOT NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'clients')
BEGIN
    CREATE TABLE [clients] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [phone_number] NVARCHAR(50) NOT NULL,
        [email] NVARCHAR(255) NULL,
        [address] NVARCHAR(MAX) NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'vehicles')
BEGIN
    CREATE TABLE [vehicles] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [client_id] INT NOT NULL FOREIGN KEY REFERENCES [clients](id),
        [make] NVARCHAR(100) NOT NULL,
        [model] NVARCHAR(100) NOT NULL,
        [year] INT NOT NULL,
        [license_plate] NVARCHAR(20) NOT NULL UNIQUE,
        [vin] NVARCHAR(50) NULL UNIQUE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'mechanics')
BEGIN
    CREATE TABLE [mechanics] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [specialty] NVARCHAR(100) NULL,
        [phone_number] NVARCHAR(50) NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'services')
BEGIN
    CREATE TABLE [services] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL UNIQUE,
        [description] NVARCHAR(MAX) NULL,
        [price] FLOAT NOT NULL,
        [estimated_duration_minutes] INT NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'work_orders')
BEGIN
    CREATE TABLE [work_orders] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [client_id] INT NOT NULL FOREIGN KEY REFERENCES [clients](id),
        [vehicle_id] INT NOT NULL FOREIGN KEY REFERENCES [vehicles](id),
        [mechanic_id] INT NULL FOREIGN KEY REFERENCES [mechanics](id),
        [created_by_user_id] INT NOT NULL FOREIGN KEY REFERENCES [users](id),
        [issue_description] NVARCHAR(MAX) NOT NULL,
        [status] NVARCHAR(50) DEFAULT 'Pendiente' NOT NULL,
        [start_date] DATETIME DEFAULT GETDATE() NOT NULL,
        [completion_date] DATETIME NULL,
        [total_amount] FLOAT DEFAULT 0.0 NOT NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'work_order_services')
BEGIN
    CREATE TABLE [work_order_services] (
        [work_order_id] INT NOT NULL FOREIGN KEY REFERENCES [work_orders](id),
        [service_id] INT NOT NULL FOREIGN KEY REFERENCES [services](id),
        [quantity] INT DEFAULT 1 NOT NULL,
        [price_at_time] FLOAT NOT NULL,
        [notes] NVARCHAR(MAX) NULL,
        PRIMARY KEY ([work_order_id], [service_id])
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'invoices')
BEGIN
    CREATE TABLE [invoices] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [work_order_id] INT NOT NULL UNIQUE FOREIGN KEY REFERENCES [work_orders](id),
        [invoice_date] DATETIME DEFAULT GETDATE() NOT NULL,
        [total_amount] FLOAT NOT NULL,
        [payment_status] NVARCHAR(50) DEFAULT 'Pendiente' NOT NULL,
        [generated_by_user_id] INT NOT NULL FOREIGN KEY REFERENCES [users](id)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_logs')
BEGIN
    CREATE TABLE [audit_logs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [table_name] NVARCHAR(100) NOT NULL,
        [record_id] INT NOT NULL,
        [operation_type] NVARCHAR(50) NOT NULL,
        [old_value] NVARCHAR(MAX) NULL,
        [new_value] NVARCHAR(MAX) NULL,
        [changed_by_user_id] INT NULL,
        [timestamp] DATETIME DEFAULT GETDATE() NOT NULL
    );
END
GO

-- 4. PROCEDIMIENTOS ALMACENADOS (SP_)

-- 4.1. Estadísticas del Dashboard (Métrica central operativa)
CREATE OR ALTER PROCEDURE SP_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Resultado 1: Estadísticas generales
    SELECT 
        (SELECT COUNT(*) FROM clients) as totalClients,
        (SELECT COUNT(*) FROM work_orders WHERE status IN ('Pendiente', 'En Proceso', 'En Progreso')) as activeOrders,
        (SELECT ISNULL(SUM(total_amount), 0) FROM invoices WHERE payment_status = 'Pagada') as totalRevenue,
        (SELECT ISNULL(SUM(total_amount), 0) FROM invoices WHERE payment_status = 'Pendiente') as pendingRevenue;

    -- Resultado 2: Distribución de estados para gráficos/barras
    SELECT status, COUNT(*) as count
    FROM work_orders
    GROUP BY status;
END
GO

-- 4.2. Detalles enriquecidos de Factura
CREATE OR ALTER PROCEDURE SP_GetInvoiceDetails 
    @InvoiceId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        i.*, 
        c.first_name, c.last_name, 
        v.license_plate, v.make, v.model,
        wo.issue_description
    FROM invoices i
    JOIN work_orders wo ON i.work_order_id = wo.id
    JOIN clients c ON wo.client_id = c.id
    JOIN vehicles v ON wo.vehicle_id = v.id
    WHERE i.id = @InvoiceId;
END
GO

-- 5. SEMILLA INICIAL (ADMIN)
IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@workshop.com')
BEGIN
    -- Contraseña 'admin123' (bcrypt)
    INSERT INTO [users] (email, hashed_password, is_active, role)
    VALUES ('admin@workshop.com', '$2b$12$Pxhz.DJGtk5GpeLxv33h/.ripXKMkJKh76YMda6ZeDL1XYoHz09wC', 1, 'admin');
    PRINT 'Usuario Administrador creado.';
END
GO

-- 6. TRIGGERS DE AUDITORÍA COMPLETOS

-- 6.1 USERS
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'audit_insert_users') DROP TRIGGER audit_insert_users;
GO
CREATE TRIGGER audit_insert_users ON [users] AFTER INSERT AS
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation_type, new_value, changed_by_user_id)
    SELECT 'users', id, 'INSERT', 
           (SELECT id, email, is_active, role FROM INSERTED i WHERE i.id = INSERTED.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           CAST(SESSION_CONTEXT(N'user_id') AS INT) FROM INSERTED;
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'audit_update_users') DROP TRIGGER audit_update_users;
GO
CREATE TRIGGER audit_update_users ON [users] AFTER UPDATE AS
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation_type, old_value, new_value, changed_by_user_id)
    SELECT 'users', i.id, 'UPDATE', 
           (SELECT id, email, is_active, role FROM DELETED d WHERE d.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           (SELECT id, email, is_active, role FROM INSERTED ins WHERE ins.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           CAST(SESSION_CONTEXT(N'user_id') AS INT) FROM INSERTED i;
END
GO

-- 6.2 CLIENTS
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'audit_insert_clients') DROP TRIGGER audit_insert_clients;
GO
CREATE TRIGGER audit_insert_clients ON [clients] AFTER INSERT AS
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation_type, new_value, changed_by_user_id)
    SELECT 'clients', id, 'INSERT', (SELECT * FROM INSERTED i WHERE i.id = INSERTED.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
    CAST(SESSION_CONTEXT(N'user_id') AS INT) FROM INSERTED;
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'audit_update_clients') DROP TRIGGER audit_update_clients;
GO
CREATE TRIGGER audit_update_clients ON [clients] AFTER UPDATE AS
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation_type, old_value, new_value, changed_by_user_id)
    SELECT 'clients', i.id, 'UPDATE', 
           (SELECT * FROM DELETED d WHERE d.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           (SELECT * FROM INSERTED ins WHERE ins.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           CAST(SESSION_CONTEXT(N'user_id') AS INT) FROM INSERTED i;
END
GO

-- 6.3 VEHICLES
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'audit_insert_vehicles') DROP TRIGGER audit_insert_vehicles;
GO
CREATE TRIGGER audit_insert_vehicles ON [vehicles] AFTER INSERT AS
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation_type, new_value, changed_by_user_id)
    SELECT 'vehicles', id, 'INSERT', (SELECT * FROM INSERTED i WHERE i.id = INSERTED.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
    CAST(SESSION_CONTEXT(N'user_id') AS INT) FROM INSERTED;
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'audit_update_vehicles') DROP TRIGGER audit_update_vehicles;
GO
CREATE TRIGGER audit_update_vehicles ON [vehicles] AFTER UPDATE AS
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation_type, old_value, new_value, changed_by_user_id)
    SELECT 'vehicles', i.id, 'UPDATE', 
           (SELECT * FROM DELETED d WHERE d.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           (SELECT * FROM INSERTED ins WHERE ins.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           CAST(SESSION_CONTEXT(N'user_id') AS INT) FROM INSERTED i;
END
GO

-- 6.4 WORK_ORDERS
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'audit_insert_work_orders') DROP TRIGGER audit_insert_work_orders;
GO
CREATE TRIGGER audit_insert_work_orders ON [work_orders] AFTER INSERT AS
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation_type, new_value, changed_by_user_id)
    SELECT 'work_orders', id, 'INSERT', (SELECT * FROM INSERTED i WHERE i.id = INSERTED.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
    CAST(SESSION_CONTEXT(N'user_id') AS INT) FROM INSERTED;
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'audit_update_work_orders') DROP TRIGGER audit_update_work_orders;
GO
CREATE TRIGGER audit_update_work_orders ON [work_orders] AFTER UPDATE AS
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation_type, old_value, new_value, changed_by_user_id)
    SELECT 'work_orders', i.id, 'UPDATE', 
           (SELECT * FROM DELETED d WHERE d.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           (SELECT * FROM INSERTED ins WHERE ins.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           CAST(SESSION_CONTEXT(N'user_id') AS INT) FROM INSERTED i;
END
GO

-- 6.5 INVOICES
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'audit_insert_invoices') DROP TRIGGER audit_insert_invoices;
GO
CREATE TRIGGER audit_insert_invoices ON [invoices] AFTER INSERT AS
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation_type, new_value, changed_by_user_id)
    SELECT 'invoices', id, 'INSERT', (SELECT * FROM INSERTED i WHERE i.id = INSERTED.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
    CAST(SESSION_CONTEXT(N'user_id') AS INT) FROM INSERTED;
END
GO
