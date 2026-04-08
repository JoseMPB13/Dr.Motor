/**
 * Definiciones de tipos de TypeScript para el sistema de gestión de taller.
 * Reflejan fielmente los esquemas de Pydantic del backend.
 */

// --- Autenticación ---

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface UserLogin {
  username: string; // FastAPI usa 'username' para el esquema OAuth2
  password: string;
}

// --- Usuario ---

export type UserRole = 'admin' | 'recepcionista';

export interface UserBase {
  email: string;
  is_active?: boolean;
  role?: UserRole;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserUpdate extends Partial<UserBase> {
  password?: string;
}

export interface User extends UserBase {
  id: number;
}

// --- Cliente ---

export interface ClientBase {
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string | null;
  address?: string | null;
}

export interface ClientCreate extends ClientBase {}

export interface ClientUpdate extends Partial<ClientBase> {}

export interface Client extends ClientBase {
  id: number;
}

// --- Vehículo ---

export interface VehicleBase {
  client_id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string | null;
}

export interface VehicleCreate extends VehicleBase {}

export interface VehicleUpdate extends Partial<VehicleBase> {}

export interface Vehicle extends VehicleBase {
  id: number;
}

// --- Mecánico ---

export interface MechanicBase {
  first_name: string;
  last_name: string;
  specialty?: string | null;
  phone_number?: string | null;
}

export interface MechanicCreate extends MechanicBase {}

export interface MechanicUpdate extends Partial<MechanicBase> {}

export interface Mechanic extends MechanicBase {
  id: number;
}

// --- Servicio (Catálogo) ---

export interface ServiceBase {
  name: string;
  description?: string | null;
  price: number;
  estimated_duration_minutes?: number | null;
}

export interface ServiceCreate extends ServiceBase {}

export interface ServiceUpdate extends Partial<ServiceBase> {}

export interface Service extends ServiceBase {
  id: number;
}

// --- Orden de Trabajo (Work Order) ---

export type WorkOrderStatus = 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada';

export interface WorkOrderBase {
  client_id: number;
  vehicle_id: number;
  mechanic_id?: number | null;
  issue_description: string;
  status: WorkOrderStatus;
}

export interface WorkOrderCreate extends WorkOrderBase {
  created_by_user_id: number;
}

export interface WorkOrderUpdate {
  mechanic_id?: number | null;
  issue_description?: string;
  status?: WorkOrderStatus;
  completion_date?: string | null; // ISO datetime
}

export interface WorkOrder extends WorkOrderBase {
  id: number;
  created_by_user_id: number;
  start_date: string; // ISO datetime
  completion_date?: string | null; // ISO datetime
  total_amount: number;
  services_performed: WorkOrderService[];
}

// --- Servicio Realizado en Orden ---

export interface WorkOrderService {
  work_order_id: number;
  service_id: number;
  quantity: number;
  price_at_time: number;
  notes?: string | null;
}

export interface WorkOrderServiceCreate {
  service_id: number;
  quantity?: number;
  notes?: string | null;
}

// --- Factura (Invoice) ---

export type PaymentStatus = 'Pendiente' | 'Pagada' | 'Anulada';

export interface InvoiceBase {
  work_order_id: number;
  payment_status: PaymentStatus;
}

export interface InvoiceCreate extends InvoiceBase {
  generated_by_user_id: number;
}

export interface InvoiceUpdate {
  payment_status?: PaymentStatus;
}

export interface Invoice extends InvoiceBase {
  id: number;
  invoice_date: string; // ISO datetime
  total_amount: number;
  generated_by_user_id: number;
}

// --- Auditoría (Audit Log) ---

export interface AuditLog {
  id: number;
  table_name: string;
  record_id: number;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
  old_value?: string | null; // JSON string
  new_value?: string | null; // JSON string
  changed_by_user_id?: number | null;
  timestamp: string; // ISO datetime
}
