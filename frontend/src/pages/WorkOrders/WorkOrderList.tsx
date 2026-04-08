import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import workshopService from '../../services/workshopService';
import { useAuth } from '../../hooks/useAuth';
import type { WorkOrder, Client, Vehicle, WorkOrderStatus, Invoice } from '../../types';
import { pdfGenerator } from '../../utils/pdf/pdfGenerator';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight,
  Play,
  XCircle,
  DollarSign,
  FileText,
  Receipt,
  Lock
} from 'lucide-react';

import SkeletonTable from '../../components/UI/SkeletonTable';

const WorkOrderList: React.FC = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [services, setServices] = useState<any[]>([]); // Catálogo para nombres
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchPlate, setSearchPlate] = useState('');

  const navigate = useNavigate();
  const { userId, userRole } = useAuth();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [o, c, v, i, s] = await Promise.all([
        workshopService.workOrders.getAll(),
        workshopService.clients.getAll(),
        workshopService.vehicles.getAll(),
        workshopService.invoices.getAll(),
        workshopService.services.getAll()
      ]);
      setOrders(o);
      setClients(c);
      setVehicles(v);
      setInvoices(i);
      setServices(s);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getClientName = (id: number) => {
    const client = clients.find(c => c.id === id);
    return client ? `${client.first_name} ${client.last_name}` : 'Desconocido';
  };

  const getVehiclePlate = (id: number) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.license_plate : 'N/A';
  };

  const getOrderInvoice = (orderId: number) => {
    return invoices.find(inv => inv.work_order_id === orderId);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const plate = getVehiclePlate(order.vehicle_id).toLowerCase();
      const matchesPlate = plate.includes(searchPlate.toLowerCase());
      return matchesStatus && matchesPlate;
    });
  }, [orders, filterStatus, searchPlate, vehicles]);

  const handleFinalize = async (order: WorkOrder) => {
    if (!window.confirm('¿Estás seguro de finalizar esta orden? Se generará la factura automáticamente.')) return;

    try {
      await workshopService.workOrders.update(order.id, {
        status: 'Completada',
        completion_date: new Date().toISOString()
      });

      const generatedById = userId || 1;
      await workshopService.invoices.create({
        work_order_id: order.id,
        payment_status: 'Pendiente',
        generated_by_user_id: generatedById
      });

      alert('Orden finalizada y factura generada con éxito.');
      fetchData();
    } catch (error) {
      console.error('Error finalizando la orden:', error);
      alert('Ocurrió un error al procesar la factura.');
    }
  };

  const handlePay = async (invoice: Invoice) => {
    if (!window.confirm('¿Confirmar registro de pago por el total? Esto bloqueará la edición de la orden.')) return;
    try {
      await workshopService.invoices.update(invoice.id, {
        payment_status: 'Pagada'
      });
      alert('Pago registrado correctamente.');
      fetchData();
    } catch (error) {
      alert('Error al registrar el pago.');
    }
  };

  const handleDownloadOT = (order: WorkOrder) => {
    const client = clients.find(c => c.id === order.client_id);
    const vehicle = vehicles.find(v => v.id === order.vehicle_id);
    if (!client || !vehicle) return alert('Error al cargar datos para el PDF');
    pdfGenerator.generateWorkOrder(order, client, vehicle, services);
  };

  const handleDownloadInvoice = (order: WorkOrder) => {
    const invoice = getOrderInvoice(order.id);
    const client = clients.find(c => c.id === order.client_id);
    const vehicle = vehicles.find(v => v.id === order.vehicle_id);
    if (!invoice || !client || !vehicle) return alert('La factura no está disponible');
    pdfGenerator.generateInvoice(invoice, order, client, vehicle, services);
  };

  const getStatusBadge = (status: string, invoice?: Invoice) => {
    if (invoice?.payment_status === 'Pagada') {
      return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"><Lock size={12}/> PAGADA</span>;
    }

    switch (status) {
      case 'Pendiente':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold ring-1 ring-yellow-200"><Clock size={14}/> Pendiente</span>;
      case 'En Progreso':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold ring-1 ring-blue-200"><Loader2 size={14} className="animate-spin" /> En Progreso</span>;
      case 'Completada':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold ring-1 ring-green-200"><CheckCircle2 size={14}/> Finalizado</span>;
      case 'Cancelada':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold ring-1 ring-red-200"><XCircle size={14}/> Cancelada</span>;
      default:
        return <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: WorkOrderStatus) => {
    const actionLabel = newStatus === 'En Progreso' ? 'iniciar' : 'cancelar';
    if (!window.confirm(`¿Estás seguro de ${actionLabel} esta orden?`)) return;

    try {
      await workshopService.workOrders.update(orderId, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error(`Error al actualizar estado a ${newStatus}:`, error);
      alert('Error al actualizar el estado de la orden.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonTable rows={10} columns={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Órdenes de Trabajo</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión integral del flujo de taller y facturación.</p>
        </div>
        <button
          onClick={() => navigate('/work-orders/new')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} />
          Nueva Orden
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        {/* Barra de Filtros */}
        <div className="p-5 bg-gray-50/30 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por placa..."
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all text-sm outline-none"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-400" />
            <select
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
               <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completada">Finalizado</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">OT ID</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Cliente / Placa</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Estado de Orden</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Total</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                const invoice = getOrderInvoice(order.id);
                const isLocked = invoice?.payment_status === 'Pagada' && userRole !== 'admin';

                return (
                  <tr key={order.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-6 font-mono text-sm text-blue-600 font-black">#{order.id.toString().padStart(4, '0')}</td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">{getClientName(order.client_id)}</p>
                      <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase">{getVehiclePlate(order.vehicle_id)}</span>
                    </td>
                    <td className="px-8 py-6 flex flex-col items-center gap-1.5">
                      {getStatusBadge(order.status, invoice)}
                      {invoice && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          invoice.payment_status === 'Pagada' ? 'text-emerald-500' : 'text-orange-500 bg-orange-50'
                        }`}>
                          {invoice.payment_status === 'Pagada' ? 'PAGO CONFIRMADO' : 'COBRO PENDIENTE'}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-gray-900">Bs. {order.total_amount.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-1">
                      <div className="flex items-center justify-end gap-1">
                        {/* Botón Cobrar */}
                        {order.status === 'Completada' && invoice?.payment_status === 'Pendiente' && (
                          <button
                            onClick={() => handlePay(invoice)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Registrar Pago"
                          >
                            <DollarSign size={18} />
                          </button>
                        )}

                        {/* Botones PDF */}
                        <button
                          onClick={() => handleDownloadOT(order)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                          title="Descargar OT Técnica"
                        >
                          <FileText size={18} />
                        </button>

                        {invoice && (
                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            className="p-2 text-purple-500 hover:bg-purple-50 rounded-xl transition-all"
                            title="Descargar Factura"
                          >
                            <Receipt size={18} />
                          </button>
                        )}

                        {/* Workflow Actions */}
                        {!isLocked && order.status === 'Pendiente' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'En Progreso')}
                            className="p-2 text-blue-400 hover:bg-blue-50 rounded-xl transition-all"
                            title="Iniciar Trabajo"
                          >
                            <Play size={18} />
                          </button>
                        )}
                        {!isLocked && order.status !== 'Completada' && order.status !== 'Cancelada' && (
                          <button
                            onClick={() => handleFinalize(order)}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-all"
                            title="Finalizar y Facturar"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}

                        {/* Acceso a edición */}
                        <button
                          onClick={() => navigate(`/work-orders/${order.id}`)}
                          className={`p-2 rounded-xl transition-all ${
                            isLocked ? 'text-gray-300' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title={isLocked ? "Orden Bloqueada" : "Editar/Ver Detalles"}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-gray-400 italic">
                    <AlertCircle size={40} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium text-sm">No se encontraron órdenes de trabajo.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderList;
