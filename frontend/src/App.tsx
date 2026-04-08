import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import WorkOrderList from './pages/WorkOrders/WorkOrderList';
import WorkOrderForm from './pages/WorkOrders/WorkOrderForm';
import AuditLogs from './pages/Admin/AuditLogs';
import UserManagement from './pages/Admin/UserManagement';
import ClientList from './pages/Clients/ClientList';
import VehicleList from './pages/Vehicles/VehicleList';
import MechanicList from './pages/Mechanics/MechanicList';
import ServiceList from './pages/Services/ServiceList';

/**
 * Componente Principal de la Aplicación.
 */
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas Protegidas envueltas por el Layout Principal */}
          <Route 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Gestión de Órdenes de Trabajo */}
            <Route path="/work-orders" element={<WorkOrderList />} />
            <Route path="/work-orders/new" element={<WorkOrderForm />} />
            <Route path="/work-orders/:id" element={<WorkOrderForm />} />
            
            {/* Rutas exclusivas para Administradores */}
            <Route 
              path="/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/audit-logs" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogs />
                </ProtectedRoute>
              } 
            />
            
            {/* Módulos de gestión del taller */}
            <Route path="/clients" element={<ClientList />} />
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/mechanics" element={<MechanicList />} />
            <Route path="/services" element={<ServiceList />} />
          </Route>

          {/* Redirecciones por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
