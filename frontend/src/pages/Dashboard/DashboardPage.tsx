import React, { useEffect, useState } from 'react';
import workshopService from '../../services/workshopService';
import StatCard from '../../components/UI/StatCard';
import { 
  Users, 
  ClipboardList, 
  DollarSign,
  AlertCircle,
  RefreshCw,
  Clock,
  PlayCircle
} from 'lucide-react';
import type { WorkOrder } from '../../types';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeOrders: 0,
    totalRevenue: 0,
    pendingRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<(WorkOrder & { payment_status?: string })[]>([]);
  const [clientsMap, setClientsMap] = useState<Record<number, string>>({});
  const [orderDistribution, setOrderDistribution] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Obtener datos agregados por el servidor (Stored Procedure)
      const [dashboardData, clients, orders, invoices] = await Promise.all([
        workshopService.dashboard.getSummary(),
        workshopService.clients.getAll(0, 15), // Solo los más recientes para mapeo
        workshopService.workOrders.getAll(0, 15),
        workshopService.invoices.getAll(0, 15)
      ]);

      setStats(dashboardData.stats);
      setOrderDistribution(dashboardData.distribution);

      // 2. Mapear clientes para búsqueda rápida (en actividad reciente)
      const cMap: Record<number, string> = {};
      clients.forEach(c => {
        cMap[c.id] = `${c.first_name} ${c.last_name}`;
      });
      setClientsMap(cMap);

      // 3. Mapa de pagos por orden (para actividad reciente)
      const paymentMap: Record<number, string> = {};
      invoices.forEach(inv => {
        paymentMap[inv.work_order_id] = inv.payment_status;
      });

      // 4. Procesar órdenes recientes
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      ).slice(0, 5).map(o => ({
        ...o,
        payment_status: paymentMap[o.id] || 'N/A'
      }));
      setRecentOrders(sortedOrders);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('No se pudo cargar la información del dashboard. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pagada': 
      case 'Completada': return 'bg-green-100 text-green-700 border-green-200';
      case 'En Progreso': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pendiente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Cancelada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
          <p className="text-gray-500 mt-1">Resumen general y métricas del taller basadas en datos reales.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refrescar Datos
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Clientes"
          value={stats.totalClients}
          icon={Users}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard 
          title="Órdenes Activas"
          value={stats.activeOrders}
          icon={ClipboardList}
          color="orange"
          isLoading={isLoading}
        />
        <StatCard 
          title="Ingresos Reales"
          value={`Bs. ${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          isLoading={isLoading}
        />
        <StatCard 
          title="Por Cobrar"
          value={`Bs. ${stats.pendingRevenue.toLocaleString()}`}
          icon={Clock}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribución de Estados */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <PlayCircle size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Distribución Operativa</h3>
          </div>
          
          <div className="space-y-6 flex-1">
            {Object.entries(orderDistribution).map(([status, count]) => {
              const total = Object.values(orderDistribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-600">{status}</span>
                    <span className="text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        status === 'Pagada' ? 'bg-emerald-500' :
                        status === 'Completada' ? 'bg-green-500' :
                        status === 'En Progreso' ? 'bg-blue-500' :
                        status === 'Pendiente' ? 'bg-amber-500' :
                        status === 'Cancelada' ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Órdenes Recientes */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Clock size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Actividad Reciente</h3>
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Flujo de Trabajo</span>
          </div>

          <div className="flex-1">
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-4">
                      <th className="pb-3 text-center">ID</th>
                      <th className="pb-3">Cliente</th>
                      <th className="pb-3 text-center">Estado Técnico</th>
                      <th className="pb-3 text-center">Pago</th>
                      <th className="pb-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-gray-400 text-center">#{order.id}</td>
                        <td className="py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {clientsMap[order.client_id] || `Cliente #${order.client_id}`}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          {order.payment_status === 'Pagada' ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-green-50 text-green-700 border border-green-100">
                              Pagada
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-gray-50 text-gray-400 border border-gray-100">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-sm font-bold text-gray-900">
                            Bs. {order.total_amount.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <AlertCircle size={48} className="mb-4 opacity-10" />
                <p className="font-medium">No hay órdenes registradas aún.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
