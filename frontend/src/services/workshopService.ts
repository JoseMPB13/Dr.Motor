import apiClient from '../api/client';
import type { 
  AuthToken, UserLogin, 
  Client, ClientCreate, ClientUpdate,
  Vehicle, VehicleCreate, VehicleUpdate,
  Mechanic, MechanicCreate, MechanicUpdate,
  Service, ServiceCreate, ServiceUpdate,
  WorkOrder, WorkOrderCreate, WorkOrderUpdate,
  Invoice, InvoiceCreate, InvoiceUpdate,
  User, UserCreate, UserUpdate,
  AuditLog
} from '../types';

/**
 * Servicio Centralizado para la Gestión del Taller Mecánico.
 * 
 * Este servicio encapsula todas las llamadas asíncronas a la API del backend,
 * manejando tipos fuertes (TypeScript) y errores de red.
 */
const workshopService = {
  
  // --- Autenticación ---

  auth: {
    /**
     * Inicia sesión y obtiene el token JWT.
     * FastAPI requiere 'application/x-www-form-urlencoded' para el endpoint /token.
     */
    login: async (credentials: UserLogin): Promise<AuthToken> => {
      try {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await apiClient.post<AuthToken>('/auth/token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error en login:', error);
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
    },

    getCurrentUser: async (): Promise<User> => {
      try {
        const response = await apiClient.get<User>('/users/me');
        return response.data;
      } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        throw error;
      }
    }
  },

  // --- Clientes ---

  clients: {
    getAll: async (skip = 0, limit = 100): Promise<Client[]> => {
      try {
        const response = await apiClient.get<Client[]>('/clients/', { params: { skip, limit } });
        return response.data;
      } catch (error) {
        console.error('Error al obtener clientes:', error);
        throw error;
      }
    },

    getById: async (id: number): Promise<Client> => {
      try {
        const response = await apiClient.get<Client>(`/clients/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error al obtener cliente ${id}:`, error);
        throw error;
      }
    },

    create: async (client: ClientCreate): Promise<Client> => {
      try {
        const response = await apiClient.post<Client>('/clients/', client);
        return response.data;
      } catch (error) {
        console.error('Error al crear cliente:', error);
        throw error;
      }
    },

    update: async (id: number, client: ClientUpdate): Promise<Client> => {
      try {
        const response = await apiClient.put<Client>(`/clients/${id}`, client);
        return response.data;
      } catch (error) {
        console.error(`Error al actualizar cliente ${id}:`, error);
        throw error;
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await apiClient.delete(`/clients/${id}`);
      } catch (error) {
        console.error(`Error al eliminar cliente ${id}:`, error);
        throw error;
      }
    }
  },

  // --- Vehículos ---

  vehicles: {
    getAll: async (skip = 0, limit = 100): Promise<Vehicle[]> => {
      try {
        const response = await apiClient.get<Vehicle[]>('/vehicles/', { params: { skip, limit } });
        return response.data;
      } catch (error) {
        console.error('Error al obtener vehículos:', error);
        throw error;
      }
    },

    getById: async (id: number): Promise<Vehicle> => {
      try {
        const response = await apiClient.get<Vehicle>(`/vehicles/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error al obtener vehículo ${id}:`, error);
        throw error;
      }
    },

    create: async (vehicle: VehicleCreate): Promise<Vehicle> => {
      try {
        const response = await apiClient.post<Vehicle>('/vehicles/', vehicle);
        return response.data;
      } catch (error) {
        console.error('Error al crear vehículo:', error);
        throw error;
      }
    },

    update: async (id: number, vehicle: VehicleUpdate): Promise<Vehicle> => {
      try {
        const response = await apiClient.put<Vehicle>(`/vehicles/${id}`, vehicle);
        return response.data;
      } catch (error) {
        console.error(`Error al actualizar vehículo ${id}:`, error);
        throw error;
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await apiClient.delete(`/vehicles/${id}`);
      } catch (error) {
        console.error(`Error al eliminar vehículo ${id}:`, error);
        throw error;
      }
    }
  },

  // --- Mecánicos ---

  mechanics: {
    getAll: async (skip = 0, limit = 100): Promise<Mechanic[]> => {
      try {
        const response = await apiClient.get<Mechanic[]>('/mechanics/', { params: { skip, limit } });
        return response.data;
      } catch (error) {
        console.error('Error al obtener mecánicos:', error);
        throw error;
      }
    },

    getById: async (id: number): Promise<Mechanic> => {
      try {
        const response = await apiClient.get<Mechanic>(`/mechanics/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error al obtener mecánico ${id}:`, error);
        throw error;
      }
    },

    create: async (mechanic: MechanicCreate): Promise<Mechanic> => {
      try {
        const response = await apiClient.post<Mechanic>('/mechanics/', mechanic);
        return response.data;
      } catch (error) {
        console.error('Error al crear mecánico:', error);
        throw error;
      }
    },

    update: async (id: number, mechanic: MechanicUpdate): Promise<Mechanic> => {
      try {
        const response = await apiClient.put<Mechanic>(`/mechanics/${id}`, mechanic);
        return response.data;
      } catch (error) {
        console.error(`Error al actualizar mecánico ${id}:`, error);
        throw error;
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await apiClient.delete(`/mechanics/${id}`);
      } catch (error) {
        console.error(`Error al eliminar mecánico ${id}:`, error);
        throw error;
      }
    }
  },

  // --- Servicios (Catálogo) ---

  services: {
    getAll: async (skip = 0, limit = 100): Promise<Service[]> => {
      try {
        const response = await apiClient.get<Service[]>('/services/', { params: { skip, limit } });
        return response.data;
      } catch (error) {
        console.error('Error al obtener servicios:', error);
        throw error;
      }
    },

    getById: async (id: number): Promise<Service> => {
      try {
        const response = await apiClient.get<Service>(`/services/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error al obtener servicio ${id}:`, error);
        throw error;
      }
    },

    create: async (service: ServiceCreate): Promise<Service> => {
      try {
        const response = await apiClient.post<Service>('/services/', service);
        return response.data;
      } catch (error) {
        console.error('Error al crear servicio:', error);
        throw error;
      }
    },

    update: async (id: number, service: ServiceUpdate): Promise<Service> => {
      try {
        const response = await apiClient.put<Service>(`/services/${id}`, service);
        return response.data;
      } catch (error) {
        console.error(`Error al actualizar servicio ${id}:`, error);
        throw error;
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await apiClient.delete(`/services/${id}`);
      } catch (error) {
        console.error(`Error al eliminar servicio ${id}:`, error);
        throw error;
      }
    }
  },

  // --- Órdenes de Trabajo ---

  workOrders: {
    getAll: async (skip = 0, limit = 100): Promise<WorkOrder[]> => {
      try {
        const response = await apiClient.get<WorkOrder[]>('/work-orders/', { params: { skip, limit } });
        return response.data;
      } catch (error) {
        console.error('Error al obtener órdenes de trabajo:', error);
        throw error;
      }
    },

    getById: async (id: number): Promise<WorkOrder> => {
      try {
        const response = await apiClient.get<WorkOrder>(`/work-orders/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error al obtener orden de trabajo ${id}:`, error);
        throw error;
      }
    },

    create: async (workOrder: WorkOrderCreate): Promise<WorkOrder> => {
      try {
        const response = await apiClient.post<WorkOrder>('/work-orders/', workOrder);
        return response.data;
      } catch (error) {
        console.error('Error al crear orden de trabajo:', error);
        throw error;
      }
    },

    update: async (id: number, workOrder: WorkOrderUpdate): Promise<WorkOrder> => {
      try {
        const response = await apiClient.put<WorkOrder>(`/work-orders/${id}`, workOrder);
        return response.data;
      } catch (error) {
        console.error(`Error al actualizar orden de trabajo ${id}:`, error);
        throw error;
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await apiClient.delete(`/work-orders/${id}`);
      } catch (error) {
        console.error(`Error al eliminar orden de trabajo ${id}:`, error);
        throw error;
      }
    },

    addService: async (workOrderId: number, serviceData: { service_id: number, quantity: number, notes?: string }): Promise<any> => {
      try {
        const response = await apiClient.post(`/work-orders/${workOrderId}/services`, serviceData);
        return response.data;
      } catch (error) {
        console.error(`Error al añadir servicio a OT ${workOrderId}:`, error);
        throw error;
      }
    }
  },

  // --- Facturación ---

  invoices: {
    getAll: async (skip = 0, limit = 100): Promise<Invoice[]> => {
      try {
        const response = await apiClient.get<Invoice[]>('/invoices/', { params: { skip, limit } });
        return response.data;
      } catch (error) {
        console.error('Error al obtener facturas:', error);
        throw error;
      }
    },

    getById: async (id: number): Promise<Invoice> => {
      try {
        const response = await apiClient.get<Invoice>(`/invoices/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error al obtener factura ${id}:`, error);
        throw error;
      }
    },

    create: async (invoice: InvoiceCreate): Promise<Invoice> => {
      try {
        const response = await apiClient.post<Invoice>('/invoices/', invoice);
        return response.data;
      } catch (error) {
        console.error('Error al crear factura:', error);
        throw error;
      }
    },

    update: async (id: number, invoice: InvoiceUpdate): Promise<Invoice> => {
      try {
        const response = await apiClient.patch<Invoice>(`/invoices/${id}`, invoice);
        return response.data;
      } catch (error) {
        console.error(`Error al actualizar factura ${id}:`, error);
        throw error;
      }
    }
  },

  // --- Gestión de Usuarios (Admin) ---

  users: {
    getAll: async (skip = 0, limit = 100): Promise<User[]> => {
      try {
        const response = await apiClient.get<User[]>('/users/', { params: { skip, limit } });
        return response.data;
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
      }
    },

    create: async (user: UserCreate): Promise<User> => {
      try {
        const response = await apiClient.post<User>('/users/', user);
        return response.data;
      } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
      }
    },

    update: async (id: number, user: UserUpdate): Promise<User> => {
      try {
        const response = await apiClient.put<User>(`/users/${id}`, user);
        return response.data;
      } catch (error) {
        console.error(`Error al actualizar usuario ${id}:`, error);
        throw error;
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await apiClient.delete(`/users/${id}`);
      } catch (error) {
        console.error(`Error al eliminar usuario ${id}:`, error);
        throw error;
      }
    }
  },

  // --- Auditoría (Admin) ---

  auditLogs: {
    getAll: async (skip = 0, limit = 100): Promise<AuditLog[]> => {
      try {
        const response = await apiClient.get<AuditLog[]>('/audit-logs/', { params: { skip, limit } });
        return response.data;
      } catch (error) {
        console.error('Error al obtener logs de auditoría:', error);
        throw error;
      }
    }
  },
  
  // --- Dashboard ---
  dashboard: {
    getSummary: async (): Promise<{ stats: any, distribution: any }> => {
      try {
        const response = await apiClient.get('/dashboard/');
        return response.data;
      } catch (error) {
        console.error('Error al obtener resumen de dashboard:', error);
        throw error;
      }
    }
  }
};

export default workshopService;
