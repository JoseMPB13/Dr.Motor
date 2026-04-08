# Diseño de la Interfaz de Usuario (UI) del Frontend - Dashboard React

Este documento describe el diseño de la interfaz de usuario para el Dashboard de gestión de taller mecánico, implementado con React. Se detallan la estructura de componentes, el manejo de rutas, las secciones de la barra lateral, las métricas clave del inicio y la conexión con el backend.

## 1. Jerarquía de Componentes

La aplicación React seguirá una estructura modular y jerárquica para facilitar el desarrollo, mantenimiento y escalabilidad.

```
src/
├── App.tsx                      # Componente principal, maneja la autenticación y el ruteo general
├── main.tsx                     # Punto de entrada de la aplicación
├── assets/                      # Recursos estáticos (imágenes, iconos, etc.)
├── components/                  # Componentes reutilizables generales
│   ├── Layout/                  # Componentes de layout principal
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── MainContent.tsx
│   ├── UI/                      # Elementos UI básicos (Botones, Inputs, Modals, Loaders)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── Charts/                  # Componentes para visualización de gráficos
│       ├── BarChart.tsx
│       ├── LineChart.tsx
│       └── PieChart.tsx
├── contexts/                    # Contextos de React para estado global (ej. autenticación, tema)
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/                       # Custom Hooks para lógica reutilizable
│   ├── useAuth.ts
│   └── useApi.ts
├── pages/                       # Componentes de página (rutas principales)
│   ├── Auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── Dashboard/               # Página de inicio del Dashboard
│   │   └── DashboardPage.tsx
│   ├── Users/
│   │   ├── UsersListPage.tsx
│   │   └── UserFormPage.tsx
│   ├── Clients/
│   │   ├── ClientsListPage.tsx
│   │   └── ClientFormPage.tsx
│   ├── Vehicles/
│   │   ├── VehiclesListPage.tsx
│   │   └── VehicleFormPage.tsx
│   ├── Mechanics/
│   │   ├── MechanicsListPage.tsx
│   │   └── MechanicFormPage.tsx
│   ├── WorkOrders/
│   │   ├── WorkOrdersListPage.tsx
│   │   └── WorkOrderFormPage.tsx
│   ├── Services/
│   │   ├── ServicesListPage.tsx
│   │   └── ServiceFormPage.tsx
│   ├── Invoices/
│   │   ├── InvoicesListPage.tsx
│   │   └── InvoiceDetailPage.tsx
│   └── Reports/                 # Página para informes avanzados (si aplica)
│       └── ReportsPage.tsx
├── services/                    # Funciones para interactuar con el backend (API RESTful)
│   ├── auth.ts
│   ├── users.ts
│   ├── clients.ts
│   └── ...
├── utils/                       # Utilidades generales (formateadores, validadores)
├── styles/                      # Archivos de estilos globales o variables CSS
└── router/                      # Definición de rutas (ej. usando react-router-dom)
    └── index.tsx
```

## 2. Manejo de Rutas

Se utilizará `react-router-dom` para la gestión de rutas en la aplicación. Las rutas estarán protegidas según los roles de usuario (Administrador, Recepcionista).

*   **Rutas Públicas:** `Login`, `Register`.
*   **Rutas Protegidas:** Todas las rutas del Dashboard, accesibles solo después de la autenticación.
*   **Rutas con Control de Acceso por Rol:** Ciertas rutas (ej. gestión de usuarios) solo serán accesibles para administradores.

**Ejemplo de Definición de Rutas (`src/router/index.js`):**

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Páginas
import LoginPage from '../pages/Auth/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import UsersListPage from '../pages/Users/UsersListPage';
import ClientsListPage from '../pages/Clients/ClientsListPage';
// ... importar otras páginas

const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, userRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" />; // O una página de error 403
    }

    return children;
};

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                {/* <Route path="/register" element={<RegisterPage />} /> */}
                <Route path="/" element={<Navigate to="/dashboard" />} />

                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'recepcionista']}>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <UsersListPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/clients"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'recepcionista']}>
                            <ClientsListPage />
                        </PrivateRoute>
                    }
                />
                {/* ... Definir rutas para Vehicles, Mechanics, WorkOrders, Services, Invoices */}
                <Route path="*" element={<h1>404 Not Found</h1>} /> {/* Página de error genérica */}
            </Routes>
        </Router>
    );
};

export default AppRouter;
```

## 3. Secciones de la Barra Lateral (Sidebar)

La barra lateral será dinámica según el rol del usuario autenticado, mostrando las secciones relevantes para Administradores y Recepcionistas.

### Para Administradores y Recepcionistas:

*   **Dashboard:**
    *   Inicio (Resumen general)
*   **Gestión de Clientes:**
    *   Ver Clientes
    *   Añadir Cliente
*   **Gestión de Vehículos:**
    *   Ver Vehículos
    *   Añadir Vehículo
*   **Gestión de Órdenes de Trabajo:**
    *   Ver Órdenes
    *   Crear Nueva Orden
*   **Facturación:**
    *   Ver Facturas
    *   Generar Factura (desde orden de trabajo)

### Adicional para Administradores:

*   **Gestión de Usuarios:**
    *   Ver Usuarios
    *   Añadir Usuario
*   **Gestión de Mecánicos:**
    *   Ver Mecánicos
    *   Añadir Mecánico
*   **Gestión de Servicios:**
    *   Ver Servicios
    *   Añadir Servicio
*   **Informes y Analíticas:**
    *   Rendimiento Mecánicos
    *   Rentabilidad Servicios
    *   Uso de Repuestos
    *   Facturación (Detalle)

## 4. Métricas y Gráficos Vitales en el Inicio (Dashboard Homepage)

La página de inicio (`DashboardPage`) ofrecerá una visión general rápida del estado del taller, con métricas y gráficos clave.

### Para Administradores (Prioridad Alta):

1.  **Ingresos Totales (Mensual/Semanal):** Gráfico de línea o barra que muestre la evolución de la facturación en un período.
2.  **Órdenes de Trabajo por Estado:** Gráfico de pastel o barra que muestre el porcentaje de órdenes en progreso, completadas, pendientes, etc.
3.  **Rendimiento de Mecánicos (Top 3):** Un gráfico de barras que muestre los mecánicos con más órdenes completadas o mayor facturación en un período.
4.  **Servicios más Demandados:** Gráfico de barras o tabla mostrando los servicios que generan más volumen o ingresos.

### Para Recepcionistas (Prioridad Alta):

1.  **Órdenes de Trabajo Abiertas (Resumen):** Número total de órdenes activas y su estado más crítico (ej. "Urgente", "Pendiente de Repuestos").
2.  **Próximas Entregas/Citas:** Una lista o calendario de los vehículos cuya orden de trabajo está próxima a finalizar o que tienen una cita programada.
3.  **Nuevos Clientes Registrados (Mensual/Semanal):** Métrica simple o gráfico de línea para el crecimiento de la base de clientes.

## 5. Conexión con el Controlador del Backend

La comunicación entre el frontend de React y el backend de FastAPI (controladores/endpoints) se realizará a través de solicitudes HTTP utilizando el estilo RESTful.

*   **Librería:** Se empleará `axios` o la API `fetch` nativa de JavaScript para realizar las solicitudes HTTP.
*   **Servicios:** Se crearán módulos de servicios (`src/services/`) para cada recurso (usuarios, clientes, etc.) que encapsulen la lógica de las llamadas a la API. Esto mantendrá los componentes limpios y reutilizables.
*   **Autenticación JWT:**
    1.  Al iniciar sesión (`LoginPage`), el frontend enviará las credenciales al endpoint `/token` del backend.
    2.  El backend devolverá un token JWT si las credenciales son válidas.
    3.  El frontend almacenará este token (ej. en `localStorage` o `sessionStorage`).
    4.  Para todas las solicitudes posteriores a endpoints protegidos, el token JWT se incluirá en el encabezado `Authorization` como un `Bearer Token`.
    5.  El backend validará el token antes de procesar la solicitud.
*   **Manejo de Errores:** Las funciones de servicio gestionarán los errores de la API (ej. códigos de estado 4xx, 5xx) y propagarán mensajes de error al componente para su visualización al usuario.
*   **Contexto de Autenticación:** Se utilizará un `AuthContext` en React para manejar el estado de autenticación global, el token JWT y la información del usuario (`userRole`), permitiendo que cualquier componente acceda a esta información y proteja rutas o funcionalidades.

**Ejemplo de Servicio (`src/services/auth.js`):**

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/auth'; // Reemplazar con la URL real del backend

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/token`, {
            username: email, // FastAPI por defecto usa 'username' para el form-data
            password: password,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // FastAPI espera form-data para /token
            }
        });
        const { access_token, token_type } = response.data;
        // Decodificar el token para obtener el rol, o hacer otra llamada si el rol no está en el token
        const payload = JSON.parse(atob(access_token.split('.')[1]));
        const userRole = payload.role; // Asumiendo que el rol está en el payload del JWT

        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('userRole', userRole);

        return { access_token, userRole };
    } catch (error) {
        console.error('Error durante el login:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
};

export const getAccessToken = () => {
    return localStorage.getItem('accessToken');
};

export const getUserRole = () => {
    return localStorage.getItem('userRole');
};

// Configurar interceptores de Axios para añadir el token automáticamente
axios.interceptors.request.use(
    config => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);
```